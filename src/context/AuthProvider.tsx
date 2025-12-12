import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { useDispatch } from 'react-redux';
import { mergeFavoritesThunk, loadFavoritesThunk } from '../features/favorites/favoritesSlice';
import type { AppDispatch } from '../store';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Мердж favorites при логине
      if (currentUser) {
        const result = await dispatch(mergeFavoritesThunk(currentUser.uid));
        if (mergeFavoritesThunk.fulfilled.match(result) && result.payload.merged) {
          // Сообщение будет показано через Redux state
        }
        // Загружаем favorites после мерджа
        dispatch(loadFavoritesThunk({ uid: currentUser.uid }));
      } else {
        // Для гостей загружаем из localStorage
        dispatch(loadFavoritesThunk({ uid: null }));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  const logout = () => signOut(auth);

  const value: AuthContextValue = {
    user,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

