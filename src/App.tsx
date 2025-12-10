import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Items from './pages/Items';
import ItemDetails from './pages/ItemDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import './App.css';
import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <NavBar />
          <Routes>
            <Route index element={<Home />} />
            <Route path="jobs" element={<Items />} />
            <Route path="jobs/:id" element={<ItemDetails />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
          <Footer />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

