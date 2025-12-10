import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthProvider';
import { getUserProfile, saveUserProfile, uploadAvatar } from '../services/profileService';

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) return;
    setPhotoUrl(user.photoURL ?? null);
    void (async () => {
      const profile = await getUserProfile(user.uid);
      if (profile?.photoURL) {
        setPhotoUrl(profile.photoURL);
      }
    })();
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [user]);

  function getWorker() {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker(new URL('../workers/imageCompressor.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;
    return worker;
  }

  async function compressImage(file: File) {
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
        const { success, buffer: compressedBuffer, type, error } = event.data as {
          success: boolean;
          buffer?: ArrayBuffer;
          type?: string;
          error?: string;
        };
        worker.removeEventListener('message', onMessage);
        if (!success || !compressedBuffer || !type) {
          setStatus(error ?? 'Compression failed, uploading original file.');
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

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      setStatus('Пожалуйста, выберите изображение (jpg или png).');
      return;
    }

    setUploading(true);
    setStatus('Сжимаем изображение…');
    try {
      const blob = await compressImage(file);
      setStatus('Загружаем в облако…');
      const downloadUrl = await uploadAvatar(user.uid, blob);
      setStatus('Сохраняем профиль…');
      await saveUserProfile(user.uid, { photoURL: downloadUrl, displayName: user.displayName ?? undefined });
      await updateProfile(user, { photoURL: downloadUrl });
      setPhotoUrl(downloadUrl);
      setStatus('Фото обновлено.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить фото';
      setStatus(message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <Spinner />;

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-gray-200 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={photoUrl ?? undefined} alt={user.displayName ?? user.email ?? 'User'} />
            <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Ваш профиль</h1>
            <p className="text-gray-500 text-sm">Аккаунт: {user.email}</p>
            {photoUrl && (
              <p className="text-xs text-gray-500 break-all">Фото: {photoUrl}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 font-medium">Имя</p>
            <p className="text-lg">{user.displayName || 'Не указано'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 font-medium">UID</p>
            <p className="text-xs text-gray-700 break-all">{user.uid}</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Загрузить новое фото</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-700"
            ref={fileInputRef}
          />
          <Button
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Загрузка...' : 'Выбрать файл'}
          </Button>
          {status && <p className="text-sm text-gray-600">{status}</p>}
        </div>

        <Button
          onClick={() => void logout()}
          className="w-full bg-red-600 text-white hover:bg-red-700"
          disabled={uploading}
        >
          Выйти
        </Button>
      </div>
    </div>
  );
}

