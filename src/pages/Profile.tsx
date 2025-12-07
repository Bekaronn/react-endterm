import { Navigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthProvider';

export default function Profile() {
  const { user, loading, logout } = useAuth();

  if (loading) return <Spinner />;

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-gray-200 p-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <p className="text-gray-500 text-sm">Account information</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 font-medium">Username</p>
            <p className="text-lg">{user.displayName || 'Not set'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 font-medium">Email</p>
            <p className="text-lg">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 font-medium">UID</p>
            <p className="text-xs text-gray-700 break-all">{user.uid}</p>
          </div>
        </div>

        <button
          onClick={() => void logout()}
          className="w-full mt-6 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

