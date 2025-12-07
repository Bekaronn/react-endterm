import { NavLink } from 'react-router-dom';
import '../styles/NavBar.css';
import { useAuth } from '../context/AuthProvider';

export default function NavBar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="brand">
        <NavLink to="/" className="brand">JobFinder</NavLink>
      </div>

      <div className="nav-right">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/jobs">Jobs</NavLink>
        <NavLink to="/about">About</NavLink>

        {loading ? (
          <span className="loading-mini">...</span>
        ) : user ? (
          <>
            <NavLink to="/profile">Profile</NavLink>
            <button onClick={() => void logout()} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="login-btn">Login</NavLink>
            <NavLink to="/signup" className="signup-btn">Signup</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

