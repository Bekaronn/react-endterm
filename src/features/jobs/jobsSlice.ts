import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchJobs, fetchJobBySlug, type Job, type PaginatedJobs } from '../../services/jobsService';

interface JobsState {
  list: Job[];
  total: number;
  selectedJob: Job | null;
  loadingList: boolean;
  loadingJob: boolean;
  errorList: string | null;
  errorJob: string | null;
  query: string;
}

const initialState: JobsState = {
  list: [],
  total: 0,
  selectedJob: null,
  loadingList: false,
  loadingJob: false,
  errorList: null,
  errorJob: null,
  query: '',
};

export const fetchJobsThunk = createAsyncThunk<
  PaginatedJobs,
  {
    query: string;
    page: number;
    pageSize: number;
    typeFilter: string;
    companyFilter: string;
    remoteFilter: 'All' | 'true' | 'false';
    tagFilter: string;
  },
  { rejectValue: string }
>('jobs/fetchJobs', async (params, { rejectWithValue }) => {
  try {
    return await fetchJobs(params);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return rejectWithValue(message);
  }
});

export const fetchJobBySlugThunk = createAsyncThunk<
  Job | null,
  string,
  { rejectValue: string }
>('jobs/fetchJobBySlug', async (slug, { rejectWithValue }) => {
  try {
    return await fetchJobBySlug(slug);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return rejectWithValue(message);
  }
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobsThunk.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchJobsThunk.fulfilled, (state, action) => {
        state.loadingList = false;
        state.list = action.payload.jobs;
        state.total = action.payload.total;
      })
      .addCase(fetchJobsThunk.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload ?? 'Failed to fetch jobs';
      })
      .addCase(fetchJobBySlugThunk.pending, (state) => {
        state.loadingJob = true;
        state.errorJob = null;
        state.selectedJob = null;
      })
      .addCase(fetchJobBySlugThunk.fulfilled, (state, action) => {
        state.loadingJob = false;
        state.selectedJob = action.payload;
      })
      .addCase(fetchJobBySlugThunk.rejected, (state, action) => {
        state.loadingJob = false;
        state.errorJob = action.payload ?? 'Failed to fetch job';
      });
  },
});

export const { setQuery } = jobsSlice.actions;

export default jobsSlice.reducer;

