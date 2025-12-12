import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  addApplicationThunk,
  loadApplicationsThunk,
  removeApplicationThunk,
} from '@/features/applications/applicationsSlice';
import type { AppDispatch, RootState } from '@/store';
import type { ApplicationEntry } from '@/services/applicationsService';

export function useApplications() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.applications);

  useEffect(() => {
    dispatch(loadApplicationsThunk());
  }, [dispatch]);

  const isApplied = useCallback(
    (jobId: string) => items.some((entry) => entry.jobId === jobId),
    [items],
  );

  const addApplication = useCallback(
    async (entry: ApplicationEntry) => {
      try {
        await dispatch(addApplicationThunk(entry)).unwrap();
        toast.success('Отклик сохранен');
      } catch {
        toast.error('Не удалось сохранить отклик');
      }
    },
    [dispatch],
  );

  const removeApplication = useCallback(
    async (jobId: string) => {
      try {
        await dispatch(removeApplicationThunk({ jobId })).unwrap();
        toast.success('Отклик удален');
      } catch {
        toast.error('Не удалось удалить отклик');
      }
    },
    [dispatch],
  );

  return {
    applications: items,
    loading,
    error,
    isApplied,
    addApplication,
    removeApplication,
  };
}

