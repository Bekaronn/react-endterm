import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  addLocalApplication,
  getLocalApplications,
  removeLocalApplication,
  type ApplicationEntry,
} from '@/services/applicationsService';

interface ApplicationsState {
  items: ApplicationEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  items: [],
  loading: false,
  error: null,
};

export const loadApplicationsThunk = createAsyncThunk<ApplicationEntry[], void, { rejectValue: string }>(
  'applications/load',
  async (_, { rejectWithValue }) => {
    try {
      return getLocalApplications();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load applications');
    }
  },
);

export const addApplicationThunk = createAsyncThunk<
  ApplicationEntry[],
  ApplicationEntry,
  { rejectValue: string }
>('applications/add', async (entry, { rejectWithValue }) => {
  try {
    return addLocalApplication(entry);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to save application');
  }
});

export const removeApplicationThunk = createAsyncThunk<
  ApplicationEntry[],
  { jobId: string },
  { rejectValue: string }
>('applications/remove', async ({ jobId }, { rejectWithValue }) => {
  try {
    return removeLocalApplication(jobId);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to remove application');
  }
});

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadApplicationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadApplicationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadApplicationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load applications';
      })
      .addCase(addApplicationThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addApplicationThunk.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to save application';
      })
      .addCase(removeApplicationThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeApplicationThunk.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to remove application';
      });
  },
});

export default applicationsSlice.reducer;

