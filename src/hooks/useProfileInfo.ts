import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthProvider';
import {
  applyDefaultAvatar,
  getUserProfile,
  updateDisplayName,
  uploadUserAvatar,
  uploadUserResume,
} from '../services/profileService';
import { disposeCompressionWorker } from '../services/imageCompressionService';
import { setProfile } from '../features/profile/profileSlice';
import type { AppDispatch } from '../store';

export type ProfileHandlers = {
  handleSelectDefault: (src: string) => Promise<void>;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleResumeChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSaveName: () => Promise<void>;
};

export type ProfileState = {
  photoUrl: string | null;
  resumeUrl: string | null;
  resumeName: string | null;
  status: string | null;
  resumeStatus: string | null;
  uploading: boolean;
  resumeUploading: boolean;
  name: string;
  savingName: boolean;
};

export default function useProfileInfo() {
  const { user, loading, logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [resumeStatus, setResumeStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) {
      dispatch(setProfile(null));
      setPhotoUrl(null);
      setResumeUrl(null);
      setResumeName(null);
      setResumeStatus(null);
      setStatus(null);
      setName('');
      return;
    }

    setPhotoUrl(user.photoURL ?? null);
    setResumeUrl(null);
    setResumeName(null);
    setName(user.displayName ?? '');

    dispatch(
      setProfile({
        displayName: user.displayName ?? null,
        email: user.email ?? null,
        photoURL: user.photoURL ?? null,
        resumeURL: null,
        resumeName: null,
        uid: user.uid,
      }),
    );

    void (async () => {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        if (profile.photoURL) {
          setPhotoUrl(profile.photoURL);
        }
        if (profile.displayName) {
          setName(profile.displayName);
        }
        if (profile.resumeURL) {
          setResumeUrl(profile.resumeURL);
        }
        if (profile.resumeName) {
          setResumeName(profile.resumeName);
        }
        dispatch(
          setProfile({
            displayName: profile.displayName ?? user.displayName ?? null,
            email: user.email ?? null,
            photoURL: profile.photoURL ?? user.photoURL ?? null,
            resumeURL: profile.resumeURL ?? null,
            resumeName: profile.resumeName ?? null,
            uid: user.uid,
          }),
        );
      }
    })();

    return () => {
      disposeCompressionWorker();
    };
  }, [dispatch, user]);

  const handleSelectDefault = useCallback(
    async (src: string) => {
      if (!user || uploading) return;
      if (photoUrl === src) return;

      setUploading(true);
      setStatus(t('profile.statusApplyStyle', { defaultValue: 'Applying style…' }));

      try {
        await applyDefaultAvatar(user, src);
        setPhotoUrl(src);
        dispatch(
          setProfile({
            displayName: user.displayName ?? null,
            email: user.email ?? null,
            photoURL: src,
            resumeURL: resumeUrl ?? null,
            resumeName: resumeName ?? null,
            uid: user.uid,
          }),
        );
        setStatus(t('profile.statusPhotoUpdated', { defaultValue: 'Photo updated.' }));
        toast.success(t('profile.styleChanged', { defaultValue: 'Profile style updated' }));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : t('profile.uploadFail', { defaultValue: 'Failed to change avatar' });
        setStatus(message);
        toast.error(message);
      } finally {
        setUploading(false);
      }
    },
    [dispatch, photoUrl, resumeName, resumeUrl, t, uploading, user],
  );

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        const message = t('profile.invalidFileType', {
          defaultValue: 'Please select an image (jpg or png).',
        });
        setStatus(message);
        toast.error(message);
        return;
      }

      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        const message = t('profile.maxSize');
        setStatus(message);
        toast.error(message);
        return;
      }

      setUploading(true);
      setStatus(t('profile.statusCompress', { defaultValue: 'Сжимаем изображение…' }));
      try {
        const downloadUrl = await uploadUserAvatar(user, file);
        setPhotoUrl(downloadUrl);
        setStatus(t('profile.statusPhotoUpdated', { defaultValue: 'Фото обновлено.' }));
        dispatch(
          setProfile({
            displayName: user.displayName ?? null,
            email: user.email ?? null,
            photoURL: downloadUrl ?? null,
            resumeURL: resumeUrl ?? null,
            resumeName: resumeName ?? null,
            uid: user.uid,
          }),
        );
        toast.success(t('profile.statusPhotoUpdated', { defaultValue: 'Фото обновлено.' }));
      } catch (err) {
        const message = err instanceof Error ? err.message : t('profile.uploadFail', { defaultValue: 'Не удалось загрузить фото' });
        setStatus(message);
        toast.error(message);
      } finally {
        setUploading(false);
      }
    },
    [dispatch, resumeName, resumeUrl, t, user],
  );

  const handleResumeChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        const message = t('profile.invalidResumeType', { defaultValue: 'Please upload a PDF.' });
        setResumeStatus(message);
        toast.error(message);
        e.target.value = '';
        return;
      }

      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        const message = t('profile.maxResumeSize', { defaultValue: 'Maximum size 5 MB.' });
        setResumeStatus(message);
        toast.error(message);
        e.target.value = '';
        return;
      }

      setResumeUploading(true);
      setResumeStatus(t('profile.statusResumeUpload', { defaultValue: 'Uploading resume…' }));
      try {
        const { url, name: savedName } = await uploadUserResume(user, file);
        setResumeUrl(url);
        setResumeName(savedName);
        setResumeStatus(t('profile.statusResumeSaved', { defaultValue: 'Resume saved.' }));
        dispatch(
          setProfile({
            displayName: user.displayName ?? null,
            email: user.email ?? null,
            photoURL: photoUrl ?? user.photoURL ?? null,
            resumeURL: url,
            resumeName: savedName,
            uid: user.uid,
          }),
        );
        toast.success(t('profile.statusResumeSaved', { defaultValue: 'Resume saved.' }));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : t('profile.resumeUploadFail', { defaultValue: 'Failed to upload resume.' });
        setResumeStatus(message);
        toast.error(message);
      } finally {
        setResumeUploading(false);
        e.target.value = '';
      }
    },
    [dispatch, photoUrl, t, user],
  );

  const handleSaveName = useCallback(async () => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) {
      const message = t('profile.nameEmpty', { defaultValue: 'Имя не может быть пустым.' });
      setStatus(message);
      toast.error(message);
      return;
    }
    if (trimmed === user.displayName) {
      setStatus(t('profile.nameUnchanged', { defaultValue: 'Имя без изменений.' }));
      return;
    }

    setSavingName(true);
    setStatus(t('profile.saving'));
    try {
      await updateDisplayName(user, trimmed);
      dispatch(
        setProfile({
          displayName: trimmed,
          email: user.email ?? null,
          photoURL: photoUrl ?? user.photoURL ?? null,
          resumeURL: resumeUrl ?? null,
          resumeName: resumeName ?? null,
          uid: user.uid,
        }),
      );
      setStatus(t('profile.nameUpdated', { defaultValue: 'Имя обновлено.' }));
      toast.success(t('profile.nameUpdated', { defaultValue: 'Имя обновлено.' }));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('profile.uploadFail', { defaultValue: 'Не удалось обновить имя' });
      setStatus(message);
      toast.error(message);
    } finally {
      setSavingName(false);
    }
  }, [dispatch, name, photoUrl, resumeName, resumeUrl, t, user]);

  return {
    user,
    loading,
    logout,
    state: {
      photoUrl,
      resumeUrl,
      resumeName,
      status,
      resumeStatus,
      uploading,
      resumeUploading,
      name,
      savingName,
    } as ProfileState,
    setName,
    refs: {
      fileInputRef,
      resumeInputRef,
    },
    handlers: {
      handleSelectDefault,
      handleFileChange,
      handleResumeChange,
      handleSaveName,
    } as ProfileHandlers,
  };
}

