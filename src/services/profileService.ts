import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

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
  const API_URL = "http://88.218.170.214:8000/upload/avatar";
  const API_KEY = "SUPER_SECRET_KEY_123";

  const formData = new FormData();

  const ext = file.type === "image/png" ? "png" : "jpg";
  const uploadFile =
    file instanceof File
      ? file
      : new File([file], `avatar.${ext}`, { type: file.type || "image/jpeg" });

  formData.append("file", uploadFile);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  const data = await res.json();

  const fullUrl = `http://88.218.170.214:8000${data.url}`;

  await saveUserProfile(uid, { photoURL: fullUrl });

  return fullUrl;
}


