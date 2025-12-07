import { useState, type FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizeError = (code: string) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Incorrect email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later.';
      default:
        return 'Login failed. Try again.';
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      nav('/profile');
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : 'unknown';
      setError(normalizeError(code));
      setEmail('');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-gray-200 p-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-gray-500 text-sm">Enter your email and password</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 
                ${error ? 'border-red-400 focus:ring-red-300' : 'focus:ring-blue-400'}`}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 
                ${error ? 'border-red-400 focus:ring-red-300' : 'focus:ring-blue-400'}`}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 border border-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            No account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

