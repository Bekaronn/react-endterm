import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const LOCAL_STORAGE_KEY = 'career_atlas_favorites';

// Для гостей: работа с localStorage
export function getLocalFavorites(): string[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalFavorites(jobIds: string[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jobIds));
  } catch (err) {
    console.error('Failed to save favorites to localStorage:', err);
  }
}

export function addLocalFavorite(jobId: string): void {
  const current = getLocalFavorites();
  if (!current.includes(jobId)) {
    saveLocalFavorites([...current, jobId]);
  }
}

export function removeLocalFavorite(jobId: string): void {
  const current = getLocalFavorites();
  saveLocalFavorites(current.filter((id) => id !== jobId));
}

// Для авторизованных: работа с Firestore
export async function getUserFavorites(uid: string): Promise<string[]> {
  try {
    const docRef = doc(db, 'userFavorites', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return Array.isArray(data?.jobIds) ? data.jobIds : [];
    }
    return [];
  } catch (err) {
    console.error('Failed to fetch user favorites:', err);
    return [];
  }
}

export async function saveUserFavorites(uid: string, jobIds: string[]): Promise<void> {
  try {
    const docRef = doc(db, 'userFavorites', uid);
    await setDoc(docRef, { jobIds }, { merge: true });
  } catch (err) {
    console.error('Failed to save user favorites:', err);
    throw err;
  }
}

export async function addUserFavorite(uid: string, jobId: string): Promise<void> {
  const current = await getUserFavorites(uid);
  if (!current.includes(jobId)) {
    await saveUserFavorites(uid, [...current, jobId]);
  }
}

export async function removeUserFavorite(uid: string, jobId: string): Promise<void> {
  const current = await getUserFavorites(uid);
  await saveUserFavorites(uid, current.filter((id) => id !== jobId));
}

// Мердж локальных favorites с серверными при логине
export async function mergeFavorites(uid: string): Promise<{ merged: boolean; localCount: number }> {
  const local = getLocalFavorites();
  if (local.length === 0) {
    return { merged: false, localCount: 0 };
  }

  const server = await getUserFavorites(uid);
  const merged = Array.from(new Set([...server, ...local]));
  
  if (merged.length > server.length) {
    await saveUserFavorites(uid, merged);
    saveLocalFavorites([]); // очищаем локальные после мерджа
    return { merged: true, localCount: local.length };
  }

  return { merged: false, localCount: 0 };
}

