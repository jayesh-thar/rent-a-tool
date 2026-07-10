import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GoogleSuccess from './pages/GoogleSuccess';
import BrowseTools from './pages/BrowseTools';
import AddTool from './pages/AddTool';
import ToolDetail from './pages/ToolDetail';
import EditTool from './pages/EditTool';
import MyTools from './pages/MyTools';
import RequestBooking from './pages/RequestBooking';
import MyBookings from './pages/MyBookings';
import BookingRequests from './pages/BookingRequests';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

// Redirects logged-in users away from login/register pages to the dashboard.
function GuestRoute({ children }) {
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

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />
          
          {/* Tool Catalog Routes */}
          <Route path="/tools" element={<BrowseTools />} />
          <Route path="/tools/add" element={<ProtectedRoute><AddTool /></ProtectedRoute>} />
          <Route path="/tools/my" element={<ProtectedRoute><MyTools /></ProtectedRoute>} />
          <Route path="/tools/:id" element={<ToolDetail />} />
          <Route path="/tools/:id/edit" element={<ProtectedRoute><EditTool /></ProtectedRoute>} />
          
          {/* Booking Engine Routes */}
          <Route path="/bookings/new" element={<ProtectedRoute><RequestBooking /></ProtectedRoute>} />
          <Route path="/bookings/my" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/bookings/requests" element={<ProtectedRoute><BookingRequests /></ProtectedRoute>} />
          
          {/* Profile Route */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
