import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, type UserCredential } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebase';

const loginErrorMessages: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
};

export async function login(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function getAuthErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : 'unknown';
  return loginErrorMessages[code] ?? 'Login failed. Try again.';
}

const signupErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/invalid-email': 'Invalid email format.',
  'auth/weak-password': 'Password is too weak.',
  'auth/missing-email': 'Email is required.',
};

export async function register(name: string, email: string, password: string): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const trimmedName = name.trim();
  if (trimmedName) {
    await updateProfile(credential.user, { displayName: trimmedName });
  }
  return credential;
}

export function getSignupErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : 'unknown';
  return signupErrorMessages[code] ?? 'Registration failed. Try again.';
}

