import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { db, storage } from '../firebase';

export type UserProfile = {
  displayName?: string;
  photoURL?: string;
  updatedAt?: unknown;
};

function profileDoc(uid: string) {
  return doc(db, 'profiles', uid);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(profileDoc(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function saveUserProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(
    profileDoc(uid),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function uploadAvatar(uid: string, file: Blob) {
  const fileName = `${Date.now()}.jpg`;
  const storageRef = ref(storage, `avatars/${uid}/${fileName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

