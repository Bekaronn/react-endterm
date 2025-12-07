import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBGUE7YUpsn2caybMKwVoCxZQ4hHE2aQSw",
  authDomain: "career-atlas-bf773.firebaseapp.com",
  projectId: "career-atlas-bf773",
  storageBucket: "career-atlas-bf773.firebasestorage.app",
  messagingSenderId: "179556560136",
  appId: "1:179556560136:web:2e16dc3d3b0b16b952d0bd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;