import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import Home from './pages/Home';
import Items from './pages/Items';
import ItemDetails from './pages/ItemDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import Offline from './pages/Offline';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import OfflineBanner from './components/OfflineBanner';
import './App.css';
import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from 'sonner';
import { clearMergedMessage } from './features/favorites/favoritesSlice';
import type { RootState, AppDispatch } from './store';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { mergedMessage } = useSelector((state: RootState) => state.favorites);

  useEffect(() => {
    if (mergedMessage) {
      toast.success(mergedMessage);
      dispatch(clearMergedMessage());
    }
  }, [mergedMessage, dispatch]);

  return (
    <>
      <NavBar />
      <OfflineBanner />
      <Routes>
        <Route index element={<Home />} />
        <Route path="jobs" element={<Items />} />
        <Route path="jobs/:id" element={<ItemDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="profile" element={<Profile />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="offline" element={<Offline />} />
      </Routes>
      <Footer />
      <Toaster position="top-center" richColors />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

