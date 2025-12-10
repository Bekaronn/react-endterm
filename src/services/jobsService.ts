import {
  collection,
  getDocs,
  getDoc,
  doc,
  type Firestore,
  query,
  orderBy,
  limit as fsLimit,
  where,
  getCountFromServer,
  type QueryConstraint,
  type OrderByDirection,
} from 'firebase/firestore';
import { db } from '../firebase';

export type Job = {
  title: string;
  company_name: string;
  description: string;
  location: string;
  remote: boolean;
  job_types: string[];
  tags: string[];
  url: string;
  slug: string;
  salary?: string;
  created_at?: string | null;
  updated_at?: string | null;
  avatarURL?: string;
};

function jobsCollection(firestore: Firestore) {
  return collection(firestore, 'jobs');
}

type SortOption = 'newest' | 'oldest' | 'company' | 'title';

type FetchJobsParams = {
  search?: string | null;
  query?: string | null; // Alias
  page?: number;
  pageSize?: number;
  typeFilter?: string | null;
  companyFilter?: string | null;
  remoteFilter?: 'All' | 'true' | 'false';
  tagFilter?: string | null;
  sortBy?: SortOption;
};

export type PaginatedJobs = {
  jobs: Job[];
  total: number;
};

function getTimestampValue(dateLike: unknown) {
  if (!dateLike) return 0;
  if (typeof dateLike === 'number') return dateLike;
  if (typeof dateLike === 'string') {
    const t = Date.parse(dateLike);
    return Number.isFinite(t) ? t : 0;
  }
  if (typeof dateLike === 'object' && 'seconds' in (dateLike as Record<string, unknown>)) {
    const seconds = (dateLike as { seconds?: number }).seconds ?? 0;
    const nanos = (dateLike as { nanoseconds?: number }).nanoseconds ?? 0;
    return seconds * 1000 + Math.floor(nanos / 1_000_000);
  }
  return 0;
}

function toIsoString(dateLike: unknown): string | null {
  const ms = getTimestampValue(dateLike);
  if (!ms) return null;
  const d = new Date(ms);
  return Number.isFinite(d.valueOf()) ? d.toISOString() : null;
}

function serializeJob(raw: unknown): Job {
  const job = (raw as Record<string, unknown>) ?? {};
  return {
    ...job,
    created_at: toIsoString(job.created_at),
    updated_at: toIsoString(job.updated_at),
  } as Job;
}

export async function fetchJobs(params: FetchJobsParams): Promise<PaginatedJobs> {
  const {
    search,
    query: queryParam,
    page = 1,
    pageSize = 10,
    typeFilter = 'All',
    companyFilter = '',
    remoteFilter = 'All',
    tagFilter = 'All',
    sortBy = 'newest',
  } = params;

  const col = jobsCollection(db);
  const constraints: QueryConstraint[] = [];

  // 1. Применяем жесткие фильтры (Firestore Filters)
  if (typeFilter && typeFilter !== 'All') {
    constraints.push(where('job_types', 'array-contains', typeFilter));
  }
  
  const trimmedCompany = (companyFilter ?? '').trim();
  if (trimmedCompany) {
    constraints.push(where('company_name', '==', trimmedCompany));
  }

  if (remoteFilter === 'true') {
    constraints.push(where('remote', '==', true));
  } else if (remoteFilter === 'false') {
    constraints.push(where('remote', '==', false));
  }

  // Примечание: Firestore не позволяет использовать несколько 'array-contains' в одном запросе.
  // Если typeFilter уже использовал это, tagFilter может вызвать ошибку.
  // Если такое случается, фильтрацию тегов лучше перенести на клиент (JS).
  const trimmedTag = (tagFilter ?? '').trim();
  if (trimmedTag && trimmedTag !== 'All') {
    // Проверяем, не занят ли уже array-contains
    if (typeFilter && typeFilter !== 'All') {
       // Конфликт фильтров: фильтруем теги на клиенте позже
    } else {
       constraints.push(where('tags', 'array-contains', trimmedTag));
    }
  }

  // 2. Определяем режим поиска
  const searchQuery = queryParam ?? search ?? '';
  const searchLower = searchQuery.trim().toLowerCase();
  const isSearching = searchLower.length > 0;

  // 3. Настройка сортировки для Firestore
  // ВАЖНО: Для корректной сортировки в Firestore нужны индексы.
  // Если вы сортируете по title, а фильтруете по remote, Firestore попросит создать индекс.
  if (!isSearching) {
    // Если поиска нет, мы полагаемся на сортировку БД
    let sortField = 'created_at';
    let sortDir: OrderByDirection = 'desc';

    switch (sortBy) {
      case 'oldest': sortField = 'created_at'; sortDir = 'asc'; break;
      case 'company': sortField = 'company_name'; sortDir = 'asc'; break;
      case 'title': sortField = 'title'; sortDir = 'asc'; break;
      case 'newest': default: sortField = 'created_at'; sortDir = 'desc'; break;
    }
    constraints.push(orderBy(sortField, sortDir));
  } else {
    // Если есть поиск, лучше сортировать по дате по умолчанию, чтобы "свежие" результаты были сверху,
    // или вообще не сортировать в БД, а делать все в JS.
    constraints.push(orderBy('created_at', 'desc'));
  }

  // 4. Логика запроса данных
  let docsData: Job[] = [];
  let total = 0;

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  if (isSearching) {
    // --- РЕЖИМ ПОИСКА ---
    // Не используем limit, загружаем все, что подходит под фильтры категорий
    // (В продакшене тут нужен лимит безопасности, например 200-500)
    const q = query(col, ...constraints, fsLimit(500)); 
    const snap = await getDocs(q);
    
    // Сериализация
    const allFetched = snap.docs.map((d) => serializeJob(d.data()));

    // Клиентская фильтрация (Текст + Теги, если был конфликт)
    const filtered = allFetched.filter((job) => {
      // Фильтр тегов (если был конфликт в запросе)
      if (trimmedTag && trimmedTag !== 'All' && typeFilter && typeFilter !== 'All') {
        if (!job.tags?.includes(trimmedTag)) return false;
      }

      // Текстовый поиск
      const haystack = [
        job.title,
        job.company_name,
        job.location,
        ...(job.tags ?? []),
        ...(job.job_types ?? []),
      ].filter(Boolean).join(' ').toLowerCase();
      
      return haystack.includes(searchLower);
    });

    // Клиентская сортировка (так как мы загрузили кучу данных, сортируем их в JS)
    filtered.sort((a, b) => {
      const aDate = getTimestampValue(a.created_at ?? a.updated_at);
      const bDate = getTimestampValue(b.created_at ?? b.updated_at);
      
      if (sortBy === 'oldest') return aDate - bDate;
      if (sortBy === 'company') return a.company_name.localeCompare(b.company_name);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return bDate - aDate; // newest
    });

    total = filtered.length;
    
    // Пагинация (Slice)
    const start = (safePage - 1) * safePageSize;
    docsData = filtered.slice(start, start + safePageSize);

  } else {
    // --- РЕЖИМ БЕЗ ПОИСКА (ОПТИМИЗИРОВАННЫЙ) ---
    // Здесь мы можем использовать лимит базы данных
    
    // Загружаем данные с запасом для текущей страницы
    // (Offset-пагинация в Firestore дорогая, но для малых объемов работает так)
    const limitCount = safePage * safePageSize;
    const q = query(col, ...constraints, fsLimit(limitCount));
    
    // Получаем общее количество (Count Aggregation)
    // Создаем отдельный запрос без limit и orderBy для подсчета
    const countQueryConstraints = constraints.filter(c => c.type !== 'limit' && c.type !== 'orderBy');
    const countSnapshot = await getCountFromServer(query(col, ...countQueryConstraints));
    total = countSnapshot.data().count;

    const snap = await getDocs(q);
    const allFetched = snap.docs.map((d) => serializeJob(d.data()));
    
    // Нам нужны только элементы для ТЕКУЩЕЙ страницы
    // allFetched содержит элементы с 1-й по текущую страницу.
    // Отрезаем хвост.
    const start = (safePage - 1) * safePageSize;
    docsData = allFetched.slice(start, start + safePageSize);
  }

  return { jobs: docsData, total };
}

export async function fetchJobBySlug(slug: string) {
  if (!slug) return null;
  const ref = doc(db, 'jobs', slug);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return serializeJob(snap.data());
}