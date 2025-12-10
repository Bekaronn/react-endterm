import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  getLocalFavorites,
  addLocalFavorite,
  removeLocalFavorite,
  getUserFavorites,
  addUserFavorite,
  removeUserFavorite,
  mergeFavorites,
} from '../../services/favoritesService';

interface FavoritesState {
  jobIds: string[];
  loading: boolean;
  error: string | null;
  mergedMessage: string | null;
}

const initialState: FavoritesState = {
  jobIds: [],
  loading: false,
  error: null,
  mergedMessage: null,
};

// Загрузка favorites (для гостей из localStorage, для авторизованных из Firestore)
export const loadFavoritesThunk = createAsyncThunk<
  string[],
  { uid: string | null },
  { rejectValue: string }
>('favorites/load', async ({ uid }, { rejectWithValue }) => {
  try {
    if (uid) {
      return await getUserFavorites(uid);
    }
    return getLocalFavorites();
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to load favorites');
  }
});

// Добавление в favorites
export const addFavoriteThunk = createAsyncThunk<
  string[],
  { uid: string | null; jobId: string },
  { rejectValue: string }
>('favorites/add', async ({ uid, jobId }, { rejectWithValue }) => {
  try {
    if (uid) {
      await addUserFavorite(uid, jobId);
      return await getUserFavorites(uid);
    }
    addLocalFavorite(jobId);
    return getLocalFavorites();
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to add favorite');
  }
});

// Удаление из favorites
export const removeFavoriteThunk = createAsyncThunk<
  string[],
  { uid: string | null; jobId: string },
  { rejectValue: string }
>('favorites/remove', async ({ uid, jobId }, { rejectWithValue }) => {
  try {
    if (uid) {
      await removeUserFavorite(uid, jobId);
      return await getUserFavorites(uid);
    }
    removeLocalFavorite(jobId);
    return getLocalFavorites();
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to remove favorite');
  }
});

// Мердж локальных favorites с серверными при логине
export const mergeFavoritesThunk = createAsyncThunk<
  { merged: boolean; localCount: number },
  string,
  { rejectValue: string }
>('favorites/merge', async (uid, { rejectWithValue }) => {
  try {
    return await mergeFavorites(uid);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to merge favorites');
  }
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearMergedMessage(state) {
      state.mergedMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFavoritesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFavoritesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.jobIds = action.payload;
      })
      .addCase(loadFavoritesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load favorites';
      })
      .addCase(addFavoriteThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFavoriteThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.jobIds = action.payload;
      })
      .addCase(addFavoriteThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to add favorite';
      })
      .addCase(removeFavoriteThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFavoriteThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.jobIds = action.payload;
      })
      .addCase(removeFavoriteThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to remove favorite';
      })
      .addCase(mergeFavoritesThunk.fulfilled, (state, action) => {
        if (action.payload.merged && action.payload.localCount > 0) {
          state.mergedMessage = `Your local favorites were merged with your account.`;
        }
      })
      .addCase(mergeFavoritesThunk.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to merge favorites';
      });
  },
});

export const { clearMergedMessage } = favoritesSlice.actions;
export default favoritesSlice.reducer;

