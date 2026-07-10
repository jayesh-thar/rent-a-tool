import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Trash2, Edit, Plus, AlertCircle } from 'lucide-react';

function MyTools() {
  const { user } = useAuth();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMyTools = useCallback(async () => {
    try {
      const res = await api.get('/tools', {
        params: { ownerId: user.userId },
      });
      setTools(res.data.tools);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your tools.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMyTools();
    }
  }, [user, fetchMyTools]);

  async function handleDelete(toolId) {
    if (!window.confirm('Are you sure you want to delete this tool listing? This action cannot be undone.')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api.delete(`/tools/${toolId}`);
      setSuccess('Tool listing deleted successfully.');
      // Refresh tool list
      await fetchMyTools();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete tool listing.');
    }
  }

  const badgeColors = {
    available: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    booked: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    maintenance: 'bg-red-500/10 text-red-700 border-red-500/20',
  };

  const conditionLabels = {
    new: 'New / Pristine',
    good: 'Good / Well kept',
    fair: 'Fair / Functional',
    worn: 'Worn / Heavily used',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-slate-800 mr-2">Lender Center</span>
            <Link
              to="/tools/add"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> List a Tool
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Listed Tools</h1>
            <p className="text-slate-500 text-sm mt-1">Manage, update specs, or delete tools you listed for rental.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-700 mb-6 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-650 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-700 mb-6 text-sm">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
              <span>Fetching your listings…</span>
            </div>
          </div>
        ) : tools.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
            <p className="text-lg font-bold text-slate-800">You haven't listed any tools yet.</p>
            <p className="text-xs text-slate-400 mt-1 mb-6">List your power tools, garden equipment, or hand tools for the community.</p>
            <Link
              to="/tools/add"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Tool Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div key={tool._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group h-full">
                {/* Tool Image */}
                <div className="h-48 overflow-hidden bg-slate-100 relative">
                  <img
                    src={tool.images?.[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=60'}
                    alt={tool.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Status Badge */}
                  <span className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md ${badgeColors[tool.status]}`}>
                    {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                  </span>
                  {/* Ownership Type Badge */}
                  <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-white border border-white/10">
                    {tool.ownershipType}
                  </span>
                </div>

                {/* Tool Details */}
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">{tool.category}</span>
                  <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">{tool.name}</h3>
                  <div className="text-[11px] text-slate-400 mb-3 font-semibold uppercase">Condition: {conditionLabels[tool.condition] || tool.condition}</div>
                  <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-1">{tool.description || 'No description provided.'}</p>

                  {/* Pricing Info */}
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between mb-5">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Rent Rate</span>
                      <span className="text-base font-extrabold text-slate-800">₹{tool.rentPerDay}<span className="text-xs text-slate-500 font-normal"> /day</span></span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Deposit</span>
                      <span className="text-sm font-bold text-slate-700">₹{tool.depositAmount}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <Link
                      to={`/tools/${tool._id}/edit`}
                      className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Specs
                    </Link>
                    <button
                      onClick={() => handleDelete(tool._id)}
                      className="py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyTools;
