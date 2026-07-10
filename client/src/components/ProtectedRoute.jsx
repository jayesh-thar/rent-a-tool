import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps routes that require authentication.
// Shows a loading spinner while the session is being restored,
// then either renders the child or redirects to /login.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-amber-400 rounded-full animate-spin" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
