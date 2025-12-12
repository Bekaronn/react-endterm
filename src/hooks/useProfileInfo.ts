import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthProvider';
import {
  applyDefaultAvatar,
  getUserProfile,
  updateDisplayName,
  uploadUserAvatar,
  uploadUserResume,
  updatePhone,
} from '../services/profileService';
import { usePhoneValidation } from './usePhoneValidation';
import type { RootState } from '@/store';
import { disposeCompressionWorker } from '../services/imageCompressionService';
import { setProfile } from '../features/profile/profileSlice';
import type { AppDispatch } from '../store';

export type ProfileHandlers = {
  handleSelectDefault: (src: string) => Promise<void>;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleResumeChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSaveName: () => Promise<void>;
  handleSavePhone: () => Promise<void>;
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
  phone: string;
  savingPhone: boolean;
};

export default function useProfileInfo() {
  const { user, loading, logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const cachedProfile = useSelector((state: RootState) => state.profile.data);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [resumeStatus, setResumeStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [phone, setPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const { normalizePhone, isValidPhone } = usePhoneValidation();

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
    setPhone('');
      return;
    }

    const initialPhone = cachedProfile?.phone ?? user.phoneNumber ?? null;
    setPhotoUrl(user.photoURL ?? null);
    setResumeUrl(null);
    setResumeName(null);
    setName(user.displayName ?? '');
    setPhone(initialPhone ?? '');

    dispatch(
      setProfile({
        displayName: user.displayName ?? null,
        email: user.email ?? null,
        photoURL: user.photoURL ?? null,
        resumeURL: null,
        resumeName: null,
        phone: initialPhone,
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
        if (profile.phone) {
          setPhone(profile.phone);
        }
        dispatch(
          setProfile({
            displayName: profile.displayName ?? user.displayName ?? null,
            email: user.email ?? null,
            photoURL: profile.photoURL ?? user.photoURL ?? null,
            resumeURL: profile.resumeURL ?? null,
            resumeName: profile.resumeName ?? null,
            phone: profile.phone ?? null,
            uid: user.uid,
          }),
        );
      }
    })();

    return () => {
      disposeCompressionWorker();
    };
  }, [cachedProfile?.phone, dispatch, user]);

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
            phone,
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
            phone,
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
            phone,
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
          phone,
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

  const handleSavePhone = useCallback(async () => {
    if (!user) return;
    const trimmed = phone.trim();
    if (!trimmed) {
      const message = t('profile.phoneEmpty', { defaultValue: 'Телефон не может быть пустым.' });
      setStatus(message);
      toast.error(message);
      return;
    }

    const normalized = normalizePhone(trimmed);
    if (!isValidPhone(normalized)) {
      const message = t('profile.phoneInvalid', { defaultValue: 'Неверный формат телефона.' });
      setStatus(message);
      toast.error(message);
      return;
    }

    if (user.phoneNumber && normalized === user.phoneNumber) {
      setStatus(t('profile.phoneUnchanged', { defaultValue: 'Телефон без изменений.' }));
      return;
    }

    setSavingPhone(true);
    setStatus(t('profile.saving'));
    try {
      await updatePhone(user, normalized);
      setPhone(normalized);
      dispatch(
        setProfile({
          displayName: user.displayName ?? null,
          email: user.email ?? null,
          photoURL: photoUrl ?? user.photoURL ?? null,
          resumeURL: resumeUrl ?? null,
          resumeName: resumeName ?? null,
          phone: normalized,
          uid: user.uid,
        }),
      );
      setStatus(t('profile.phoneUpdated', { defaultValue: 'Телефон обновлен.' }));
      toast.success(t('profile.phoneUpdated', { defaultValue: 'Телефон обновлен.' }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('profile.uploadFail', { defaultValue: 'Не удалось обновить телефон' });
      setStatus(message);
      toast.error(message);
    } finally {
      setSavingPhone(false);
    }
  }, [dispatch, phone, photoUrl, resumeName, resumeUrl, t, user]);

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
      phone,
      savingPhone,
    } as ProfileState,
    setName,
    setPhone,
    refs: {
      fileInputRef,
      resumeInputRef,
    },
    handlers: {
      handleSelectDefault,
      handleFileChange,
      handleResumeChange,
      handleSaveName,
      handleSavePhone,
    } as ProfileHandlers,
  };
}

