import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, ArrowLeft, Edit } from 'lucide-react';

function ToolDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchToolDetail() {
      try {
        const res = await api.get(`/tools/${id}`);
        setTool(res.data.tool);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tool details.');
      } finally {
        setLoading(false);
      }
    }
    fetchToolDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
          <span>Fetching tool details…</span>
        </div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-slate-600 text-sm mb-6">{error || 'Tool could not be found.'}</p>
          <Link to="/tools" className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl text-sm transition-colors font-semibold">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && tool.ownerId && tool.ownerId._id === user.userId;

  const conditionLabels = {
    new: 'New / Pristine',
    good: 'Good / Well kept',
    fair: 'Fair / Functional',
    worn: 'Worn / Heavily used',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/tools" className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>
          {isOwner && (
            <Link
              to={`/tools/${tool._id}/edit`}
              className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Edit className="w-4 h-4" /> Edit Specs
            </Link>
          )}
        </div>
      </header>

      {/* Detail Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Image Card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md h-[400px]">
            <img
              src={tool.images?.[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=60'}
              alt={tool.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Column: Specs & Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded">
                  {tool.category}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  {tool.ownershipType} Listing
                </span>
              </div>
              
              <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">{tool.name}</h1>
              <p className="text-slate-600 leading-relaxed text-sm mb-6 whitespace-pre-line">
                {tool.description || 'No description provided for this listing.'}
              </p>

              {/* Grid specs */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 py-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Status</span>
                  <span className={`inline-flex items-center gap-1.5 text-sm font-bold capitalize ${
                    tool.status === 'available' ? 'text-emerald-600' : tool.status === 'booked' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      tool.status === 'available' ? 'bg-emerald-500' : tool.status === 'booked' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    {tool.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Condition</span>
                  <span className="text-sm font-semibold text-slate-700">{conditionLabels[tool.condition] || tool.condition}</span>
                </div>
              </div>

              {/* Price Row */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Daily Rent Rate</span>
                  <span className="text-2xl font-extrabold text-slate-900">₹{tool.rentPerDay}<span className="text-xs text-slate-500 font-normal"> / day</span></span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Security Deposit</span>
                  <span className="text-lg font-bold text-slate-700">₹{tool.depositAmount}</span>
                </div>
              </div>
            </div>

            {/* Downward buttons */}
            <div className="pt-6 border-t border-slate-150">
              {isOwner ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800">
                  💡 You own this tool listing. To update rates, description or availability, use the "Edit Specs" button in the header.
                </div>
              ) : (
                <div className="space-y-4">
                  {tool.status === 'available' ? (
                    <button
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                          return;
                        }
                        if (!user.phoneNumber) {
                          alert('Please configure your phone number in your profile settings before renting tools.');
                          navigate('/profile');
                          return;
                        }
                        navigate(`/bookings/new?tool=${tool._id}`);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-md transition-all text-center cursor-pointer"
                    >
                      Book Now
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 bg-slate-200 text-slate-400 font-bold rounded-xl border border-slate-350 cursor-not-allowed text-center"
                    >
                      Currently Unavailable
                    </button>
                  )}
                  
                  {/* Owner info details card */}
                  {tool.ownerId && (
                    <div className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                          {tool.ownerId.profilePicture ? (
                            <img src={tool.ownerId.profilePicture} alt={tool.ownerId.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {tool.ownershipType === 'community' ? 'Community Library' : 'P2P Lender'}
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            {tool.ownershipType === 'community' && tool.ownerId.communityDetails?.name 
                              ? tool.ownerId.communityDetails.name 
                              : tool.ownerId.fullName}
                          </span>
                          <span className="text-xs text-slate-500 block">{tool.ownerId.email}</span>
                          {tool.ownershipType === 'community' && (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase mt-1 inline-block">
                              Community Co-Op
                            </span>
                          )}
                        </div>
                      </div>
                      {tool.ownershipType === 'community' && tool.ownerId.communityDetails?.address && (
                        <div className="text-xs text-slate-600 pt-2 border-t border-slate-150">
                          <strong className="text-slate-700">Co-Op Pickup Address:</strong> {tool.ownerId.communityDetails.address}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default ToolDetail;
