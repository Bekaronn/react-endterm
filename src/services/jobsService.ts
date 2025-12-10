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
  created_at?: unknown;
  updated_at?: unknown;
};

function jobsCollection(firestore: Firestore) {
  return collection(firestore, 'jobs');
}

type FetchJobsParams = {
  search?: string | null;
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

type SortOption = 'newest' | 'oldest' | 'company' | 'title';

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

export async function fetchJobs({
  search = '',
  page = 1,
  pageSize = 10,
  typeFilter = 'All',
  companyFilter = '',
  remoteFilter = 'All',
  tagFilter = 'All',
  sortBy = 'newest',
}: FetchJobsParams) {
  const col = jobsCollection(db);
  const constraints: QueryConstraint[] = [orderBy('created_at', 'desc')];

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
  const trimmedTag = (tagFilter ?? '').trim();
  if (trimmedTag && trimmedTag !== 'All') {
    constraints.push(where('tags', 'array-contains', trimmedTag));
  }

  // Pull enough docs to cover requested page without loading everything.
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 8;

  const q = query(col, ...constraints, fsLimit(Math.max(safePageSize * safePage, safePageSize)));
  const snap = await getDocs(q);
  const searchLower = (search ?? '').trim().toLowerCase();

  const allJobs = snap.docs.map((d) => d.data() as Job);

  const filteredBySearch = allJobs.filter((job) => {
    if (!searchLower) return true;
    const haystack = [
      job.title,
      job.company_name,
      job.location,
      ...(job.tags ?? []),
      ...(job.job_types ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(searchLower);
  });

  const sorted = [...filteredBySearch].sort((a, b) => {
    const aDate = getTimestampValue(a.created_at ?? a.updated_at);
    const bDate = getTimestampValue(b.created_at ?? b.updated_at);
    switch (sortBy) {
      case 'oldest':
        return aDate - bDate;
      case 'company':
        return a.company_name.localeCompare(b.company_name);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'newest':
      default:
        return bDate - aDate;
    }
  });

  const pageStart = Math.max(0, (safePage - 1) * safePageSize);
  const jobs = sorted.slice(pageStart, pageStart + safePageSize);

  // Count matches for pagination (exact for filters; approximate for search).
  let total = filteredBySearch.length;
  if (!searchLower) {
    const countSnap = await getCountFromServer(query(col, ...constraints));
    total = countSnap.data().count;
  }

  return { jobs, total };
}

export async function fetchJobBySlug(slug: string) {
  if (!slug) return null;
  const ref = doc(db, 'jobs', slug);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as Job;
}

