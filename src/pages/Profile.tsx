import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { Camera, LogOut, ShieldCheck, User2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthProvider';
import { getUserProfile, saveUserProfile, uploadAvatar } from '../services/profileService';
import { setProfile } from '../features/profile/profileSlice';
import type { AppDispatch } from '../store';

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) {
      dispatch(setProfile(null));
      return;
    }
    setPhotoUrl(user.photoURL ?? null);
    dispatch(
      setProfile({
        displayName: user.displayName ?? null,
        email: user.email ?? null,
        photoURL: user.photoURL ?? null,
        uid: user.uid,
      }),
    );
    void (async () => {
      const profile = await getUserProfile(user.uid);
      if (profile?.photoURL) {
        setPhotoUrl(profile.photoURL);
        dispatch(
          setProfile({
            displayName: profile.displayName ?? user.displayName ?? null,
            email: user.email ?? null,
            photoURL: profile.photoURL ?? user.photoURL ?? null,
            uid: user.uid,
          }),
        );
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
      toast.error('Пожалуйста, выберите изображение (jpg или png).');
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_SIZE) {
      setStatus('Размер файла не должен превышать 2 МБ.');
      toast.error('Размер файла не должен превышать 2 МБ.');
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
      dispatch(
        setProfile({
          displayName: user.displayName ?? null,
          email: user.email ?? null,
          photoURL: downloadUrl ?? null,
          uid: user.uid,
        }),
      );
      toast.success('Фото профиля обновлено');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить фото';
      setStatus(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <Spinner />;

  if (!user) return <Navigate to="/login" />;

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <section className="relative overflow-hidden bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div
              className="relative cursor-pointer group"
              role="button"
              tabIndex={0}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <Avatar className="h-20 w-20 md:h-24 md:w-24 ring-4 ring-background shadow-md transition group-hover:ring-primary/40">
                <AvatarImage src={photoUrl ?? undefined} alt={user.displayName ?? user.email ?? 'User'} />
                <AvatarFallback className="text-xl">{user.email?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                aria-label="Загрузить новое фото"
                className="absolute -bottom-2 -right-2 flex items-center justify-center rounded-full bg-primary text-primary-foreground p-2 shadow-lg hover:bg-primary/90 transition disabled:opacity-60"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold w-fit">
                <ShieldCheck className="h-4 w-4" />
                Аккаунт активен
              </div>
              <h1 className="text-3xl font-bold text-card-foreground">{user.displayName || 'Ваш профиль'}</h1>
              <p className="text-muted-foreground text-sm md:text-base">Аккаунт: {user.email}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2 border-destructive/60 text-destructive hover:bg-destructive/10"
                onClick={() => void logout()}
                disabled={uploading}
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2">
              <User2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-card-foreground">Данные аккаунта</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Имя</p>
                <p className="text-lg font-semibold text-card-foreground">{user.displayName || 'Не указано'}</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Email</p>
                <p className="text-lg font-semibold text-card-foreground">{user.email}</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">UID</p>
                <p className="text-sm text-card-foreground break-all">{user.uid}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-card-foreground">Обновить фото</p>
              <p className="text-sm text-muted-foreground">
                Поддерживаются JPG/PNG, размер до 2 МБ. Изображение будет сжато перед загрузкой.
              </p>
            </div>

            <div
              className="rounded-xl border border-dashed border-border bg-muted/20 p-4 cursor-pointer transition hover:border-primary/60 hover:bg-primary/5"
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="sr-only"
                ref={fileInputRef}
                aria-label="Выбрать новое фото"
              />
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-card-foreground">Перетащите файл или нажмите, чтобы выбрать.</p>
                  <p className="text-xs text-muted-foreground">Максимальный размер 2 МБ.</p>
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Camera className="h-4 w-4" />
                  {uploading ? 'Загрузка...' : 'Выбрать фото'}
                </div>
              </div>
            </div>

            {status && (
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-card-foreground">
                {status}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

