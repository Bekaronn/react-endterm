import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthProvider';
import {
  addFavoriteThunk,
  loadFavoritesThunk,
  removeFavoriteThunk,
} from '../features/favorites/favoritesSlice';
import type { AppDispatch, RootState } from '../store';

type ToastMessages = {
  add: string;
  remove: string;
  addFail: string;
  removeFail: string;
};

type ToggleOptions = {
  showToast?: boolean;
  messages?: Partial<ToastMessages>;
};

const DEFAULT_MESSAGES: ToastMessages = {
  add: 'Added to bookmarks',
  remove: 'Removed from bookmarks',
  addFail: 'Could not add to bookmarks',
  removeFail: 'Could not remove from bookmarks',
};

export function useFavoriteJobs() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { jobIds, loading, error } = useSelector((state: RootState) => state.favorites);

  // Keep favorites in sync with auth state
  useEffect(() => {
    dispatch(loadFavoritesThunk({ uid: user?.uid ?? null }));
  }, [dispatch, user?.uid]);

  const messages = useMemo(() => DEFAULT_MESSAGES, []);

  const isFavorite = useCallback(
    (jobId: string) => jobIds?.includes(jobId) ?? false,
    [jobIds],
  );

  const refreshFavorites = useCallback(() => {
    dispatch(loadFavoritesThunk({ uid: user?.uid ?? null }));
  }, [dispatch, user?.uid]);

  const toggleFavorite = useCallback(
    async (jobId: string, opts?: ToggleOptions) => {
      const showToast = opts?.showToast ?? true;
      const mergedMessages = { ...messages, ...opts?.messages };
      const alreadyFavorite = isFavorite(jobId);

      try {
        if (alreadyFavorite) {
          await dispatch(removeFavoriteThunk({ uid: user?.uid ?? null, jobId })).unwrap();
          if (showToast) toast.success(mergedMessages.remove);
        } else {
          await dispatch(addFavoriteThunk({ uid: user?.uid ?? null, jobId })).unwrap();
          if (showToast) toast.success(mergedMessages.add);
        }
      } catch (err) {
        if (showToast) {
          toast.error(alreadyFavorite ? mergedMessages.removeFail : mergedMessages.addFail);
        }
        throw err;
      }
    },
    [dispatch, isFavorite, messages, user?.uid],
  );

  const removeFavorite = useCallback(
    async (jobId: string, opts?: ToggleOptions) => {
      const showToast = opts?.showToast ?? true;
      const mergedMessages = { ...messages, ...opts?.messages };
      try {
        await dispatch(removeFavoriteThunk({ uid: user?.uid ?? null, jobId })).unwrap();
        if (showToast) toast.success(mergedMessages.remove);
      } catch (err) {
        if (showToast) toast.error(mergedMessages.removeFail);
        throw err;
      }
    },
    [dispatch, messages, user?.uid],
  );

  return {
    favoriteIds: jobIds ?? [],
    loading,
    error,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    refreshFavorites,
  };
}

