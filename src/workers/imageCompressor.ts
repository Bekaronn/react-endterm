type CompressRequest = {
  buffer: ArrayBuffer;
  type: string;
  quality: number;
  maxSide: number;
};

type CompressResponse =
  | { success: true; buffer: ArrayBuffer; type: string }
  | { success: false; error: string };

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener('message', async (event: MessageEvent<CompressRequest>) => {
  try {
    const { buffer, type, quality, maxSide } = event.data;
    const blob = new Blob([buffer], { type });
    const bitmap = await createImageBitmap(blob);

    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const context = canvas.getContext('2d');
    if (!context) {
      ctx.postMessage({ success: false, error: 'No 2d context' } satisfies CompressResponse);
      return;
    }

    context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    const compressed = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality,
    });
    const compressedBuffer = await compressed.arrayBuffer();
    ctx.postMessage(
      { success: true, buffer: compressedBuffer, type: compressed.type } satisfies CompressResponse,
      [compressedBuffer],
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Compression failed';
    ctx.postMessage({ success: false, error: message } satisfies CompressResponse);
  }
});

