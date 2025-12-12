let workerRef: Worker | null = null;

function getWorker() {
  if (workerRef) return workerRef;
  const worker = new Worker(new URL('../workers/imageCompressor.ts', import.meta.url), {
    type: 'module',
  });
  workerRef = worker;
  return worker;
}

/**
 * Compress image in a web worker. Falls back to the original file on failure.
 */
export async function compressImage(file: File) {
  if (!('OffscreenCanvas' in window)) return file;

  const worker = getWorker();
  const buffer = await file.arrayBuffer();
  const payload = {
    buffer,
    type: 'image/jpeg',
    quality: 0.72,
    maxSide: 1024,
  };

  const compressed = await new Promise<Blob | null>((resolve) => {
    const onMessage = (event: MessageEvent) => {
      const { success, buffer: compressedBuffer, type } = event.data as {
        success: boolean;
        buffer?: ArrayBuffer;
        type?: string;
        error?: string;
      };
      worker.removeEventListener('message', onMessage);
      if (!success || !compressedBuffer || !type) {
        resolve(null);
        return;
      }
      resolve(new Blob([compressedBuffer], { type }));
    };
    worker.addEventListener('message', onMessage);
    worker.postMessage(payload, [buffer]);
  });

  return compressed ?? file;
}

export function disposeCompressionWorker() {
  workerRef?.terminate();
  workerRef = null;
}

