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
  resumeURL?: string;
  resumeName?: string;
  updatedAt?: unknown;
};

function profileDoc(uid: string) {
  return doc(db, 'profiles', uid);
}

const API_BASE = "http://88.218.170.214:8000";
const API_KEY = "SUPER_SECRET_KEY_123";

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
  const API_URL = `${API_BASE}/upload/avatar`;
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

export async function uploadResume(uid: string, file: File) {
  const API_URL = `${API_BASE}/upload/resume`;

  const normalizedFile =
    file instanceof File
      ? file
      : new File([file], file.name || "resume.pdf", { type: file.type || "application/pdf" });

  const formData = new FormData();
  formData.append("file", normalizedFile);

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
  const url = data.url ? `${API_BASE}${data.url}` : null;
  if (!url) {
    throw new Error("Upload failed");
  }

  await saveUserProfile(uid, { resumeURL: url, resumeName: normalizedFile.name });
  return { url, name: normalizedFile.name };
}


