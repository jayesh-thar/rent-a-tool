import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Users, Wrench, ClipboardList, AlertTriangle, ArrowLeft, Search } from 'lucide-react';

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Safeguard: Redirect if user is loaded but not admin
  useEffect(() => {
    if (user && !user.roles.includes('admin')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data.stats);
      setUsersList(usersRes.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch administration data.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleBlock(targetUserId) {
    setError('');
    try {
      await api.patch(`/admin/users/${targetUserId}/status`);
      // Update local state instead of full refetch
      setUsersList((prevUsers) =>
        prevUsers.map((u) => (u._id === targetUserId ? { ...u, isBlocked: !u.isBlocked } : u))
      );
      // Re-run stats fetch in case active overdue counts changed or user status affects summary
      const statsRes = await api.get('/admin/dashboard');
      setStats(statsRes.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user block status.');
    }
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
          <span>Fetching administration console data…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-45">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="font-bold text-sm text-slate-800 tracking-wider uppercase">Admin Portal</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Platform Administration</h1>
          <p className="text-slate-600 text-sm mt-1">Monitor statistics and manage user access policies.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-700 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-5 h-5 text-blue-600" />} color="text-blue-700" />
            <StatsCard title="Tools Catalog" value={stats.totalTools} icon={<Wrench className="w-5 h-5 text-amber-600" />} color="text-amber-700" />
            <StatsCard title="Active Rentals" value={stats.activeRentals} icon={<ClipboardList className="w-5 h-5 text-emerald-600" />} color="text-emerald-700" />
            <StatsCard
              title="Overdue Rentals"
              value={stats.overdueRentals}
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
              color={stats.overdueRentals > 0 ? 'text-red-700' : 'text-slate-500'}
              alert={stats.overdueRentals > 0}
            />
          </div>
        )}

        {/* User Management Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-base font-bold text-slate-800">User Access Controls</h2>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white"
              />
              <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Roles</th>
                  <th className="pb-3 pr-4">Auth</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="py-4 pr-4 font-bold text-slate-800">{u.fullName}</td>
                    <td className="py-4 pr-4 text-slate-600">{u.email}</td>
                    <td className="py-4 pr-4 text-xs font-semibold text-slate-700">
                      {u.roles.map((r) => (
                        <span key={r} className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded mr-1">
                          {r}
                        </span>
                      ))}
                    </td>
                    <td className="py-4 pr-4 text-xs text-slate-500 uppercase font-semibold">{u.authProvider}</td>
                    <td className="py-4 pr-4">
                      {u.isBlocked ? (
                        <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                          Blocked
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {u._id === user?.userId ? (
                        <span className="text-xs text-slate-400 font-semibold">Admin Account</span>
                      ) : (
                        <button
                          onClick={() => toggleBlock(u._id)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            u.isBlocked
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block User'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-sm">
                No users found matching your search.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

function StatsCard({ title, value, icon, color, alert = false }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden ${
      alert ? 'border-red-200 bg-red-50/50' : ''
    }`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className={`text-3xl font-extrabold tracking-tight ${color} ${alert ? 'animate-pulse' : ''}`}>
        {value}
      </div>
    </div>
  );
}

export default AdminDashboard;
