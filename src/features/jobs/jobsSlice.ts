import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
// Убедитесь, что путь к сервису верный. Если файл в другой папке, скорректируйте путь.
import { fetchJobs, fetchJobBySlug, type Job, type PaginatedJobs } from '../../services/jobsService';

// Интерфейс состояния
interface JobsState {
  list: Job[];
  total: number;
  selectedJob: Job | null;
  loadingList: boolean;
  loadingJob: boolean;
  errorList: string | null;
  errorJob: string | null;
  query: string;
  currentQueryKey: string | null;
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
  currentQueryKey: null,
};

// Параметры для запроса вакансий
interface FetchJobsParams {
  query: string;
  page: number;
  pageSize: number;
  typeFilter: string;
  companyFilter: string;
  remoteFilter: 'All' | 'true' | 'false';
  tagFilter: string;
  sortBy: 'newest' | 'oldest' | 'company' | 'title';
}

function getQueryKey(params: FetchJobsParams) {
  // Строковый ключ для distinct + switchLatest
  return JSON.stringify(params);
}

export const fetchJobsThunk = createAsyncThunk<
  PaginatedJobs, // Ожидаемый ответ: { jobs: Job[], total: number }
  FetchJobsParams, // Аргументы функции
  { rejectValue: string }
>('jobs/fetchJobs', async (params, { rejectWithValue }) => {
  try {
    const response = await fetchJobs(params);
    
    // Проверка структуры ответа (на случай, если API вернет что-то неожиданное)
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response from server');
    }
    
    return response;
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
    const data = await fetchJobBySlug(slug);
    return data;
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
    // Можно добавить экшен для очистки списка, если нужно
    clearList(state) {
      state.list = [];
      state.total = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Jobs ---
      .addCase(fetchJobsThunk.pending, (state, action) => {
        state.loadingList = true;
        state.errorList = null;
        state.currentQueryKey = getQueryKey(action.meta.arg);
        // Не очищаем list здесь, чтобы избежать мигания контента при переключении страниц
      })
      .addCase(fetchJobsThunk.fulfilled, (state, action) => {
        const key = getQueryKey(action.meta.arg);
        if (state.currentQueryKey && key !== state.currentQueryKey) {
          // Старая гонка запросов — игнорируем
          return;
        }
        state.loadingList = false;
        // Защита: если jobs придет undefined, используем пустой массив
        state.list = action.payload.jobs ?? [];
        // Защита: если total придет undefined, используем 0 (важно для пагинации)
        state.total = action.payload.total ?? 0;
      })
      .addCase(fetchJobsThunk.rejected, (state, action) => {
        const key = getQueryKey(action.meta.arg);
        if (state.currentQueryKey && key !== state.currentQueryKey) {
          // Старая гонка запросов — игнорируем
          return;
        }
        state.loadingList = false;
        state.errorList = action.payload ?? 'Failed to fetch jobs';
        // При ошибке можно обнулить список или оставить старый (на ваше усмотрение)
        // state.list = []; 
        // state.total = 0;
      })

      // --- Fetch Job By Slug ---
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

export const { setQuery, clearList } = jobsSlice.actions;

export default jobsSlice.reducer;