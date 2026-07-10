import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, SlidersHorizontal } from 'lucide-react';

import NotificationPanel from '../components/NotificationPanel';

const CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Gardening & Outdoor',
  'Ladders & Scaffolding',
  'Plumbing Tools',
  'Electrical Tools',
  'Automotive Tools',
  'Other',
];

function BrowseTools() {
  const { user } = useAuth();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOwnership, setSelectedOwnership] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    fetchTools();
  }, [selectedCategory, selectedOwnership, onlyAvailable]);

  async function fetchTools() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedOwnership) params.ownershipType = selectedOwnership;
      if (onlyAvailable) params.available = 'true';
      if (search) params.search = search;

      const res = await api.get('/tools', { params });
      setTools(res.data.tools);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tools.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchTools();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/10">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">Rent-a-Tool</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Dashboard
                </Link>
                <Link to="/profile" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  My Profile
                </Link>
                <NotificationPanel />
                <Link
                  to="/tools/add"
                  className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-md transition-all cursor-pointer"
                >
                  + Add Tool
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" /> Filters
              </h2>

              {/* Search form */}
              <form onSubmit={handleSearchSubmit} className="mb-6">
                <label htmlFor="tool-search" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Search Tools</label>
                <div className="relative">
                  <input
                    id="tool-search"
                    type="text"
                    placeholder="Drill, hammer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white"
                  />
                  <button type="submit" className="absolute right-2.5 top-2 text-slate-400 hover:text-amber-500 cursor-pointer">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Category selector */}
              <div className="mb-6">
                <label htmlFor="category-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Ownership Type */}
              <div className="mb-6">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Owner Type</span>
                <div className="space-y-2">
                  <label htmlFor="owner-all" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer">
                    <input
                      id="owner-all"
                      type="radio"
                      name="ownership"
                      checked={selectedOwnership === ''}
                      onChange={() => setSelectedOwnership('')}
                      className="accent-amber-500"
                    />
                    <span>All</span>
                  </label>
                  <label htmlFor="owner-personal" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer">
                    <input
                      id="owner-personal"
                      type="radio"
                      name="ownership"
                      checked={selectedOwnership === 'personal'}
                      onChange={() => setSelectedOwnership('personal')}
                      className="accent-amber-500"
                    />
                    <span>Personal Listings</span>
                  </label>
                  <label htmlFor="owner-community" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer">
                    <input
                      id="owner-community"
                      type="radio"
                      name="ownership"
                      checked={selectedOwnership === 'community'}
                      onChange={() => setSelectedOwnership('community')}
                      className="accent-amber-500"
                    />
                    <span>Community Library</span>
                  </label>
                </div>
              </div>

              {/* Available Only Toggle */}
              <div className="pt-4 border-t border-slate-100">
                <label htmlFor="only-avail" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer">
                  <input
                    id="only-avail"
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 accent-amber-500"
                  />
                  <span>Show Available Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Tools Grid */}
          <section className="flex-1">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-700 mb-6 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
                  <span>Loading tools catalog…</span>
                </div>
              </div>
            ) : (() => {
              const displayTools = user ? tools.filter((t) => (t.ownerId?._id || t.ownerId) !== user.userId) : tools;
              if (displayTools.length === 0) {
                return (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
                    <p className="text-lg font-medium text-slate-800">No tools found matching your filters.</p>
                    <button
                      onClick={() => {
                        setSearch('');
                        setSelectedCategory('');
                        setSelectedOwnership('');
                        setOnlyAvailable(false);
                      }}
                      className="mt-4 px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayTools.map((tool) => (
                    <ToolCard key={tool._id} tool={tool} />
                  ))}
                </div>
              );
            })()}
          </section>
        </div>
      </main>
    </div>
  );
}

function ToolCard({ tool }) {
  const badgeColors = {
    available: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    booked: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    maintenance: 'bg-red-500/10 text-red-700 border-red-500/20',
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group h-full">
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
        <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">{tool.name}</h3>
        <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-1">{tool.description || 'No description provided.'}</p>

        {/* Pricing Info */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Rent Rate</span>
            <span className="text-base font-extrabold text-slate-800">₹{tool.rentPerDay}<span className="text-xs text-slate-500 font-normal"> /day</span></span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Deposit</span>
            <span className="text-sm font-bold text-slate-700">₹{tool.depositAmount}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/tools/${tool._id}`}
          className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-center text-xs font-bold transition-all"
        >
          View Specs
        </Link>
      </div>
    </div>
  );
}

export default BrowseTools;
export { CATEGORIES };
