import {
  collection,
  getDocs,
  getDoc,
  doc,
  type Firestore,
  query,
  orderBy,
  limit as fsLimit,
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
  created_at?: unknown;
  updated_at?: unknown;
};

function jobsCollection(firestore: Firestore) {
  return collection(firestore, 'jobs');
}

export async function fetchJobs(search: string) {
  const col = jobsCollection(db);
  const q = query(col, orderBy('created_at', 'desc'), fsLimit(100));
  const snap = await getDocs(q);

  const searchLower = search.trim().toLowerCase();

  return snap.docs
    .map((d) => d.data() as Job)
    .filter((job) => {
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
}

export async function fetchJobBySlug(slug: string) {
  if (!slug) return null;
  const ref = doc(db, 'jobs', slug);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as Job;
}

