import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

function RequestBooking() {
  const [searchParams] = useSearchParams();
  const toolId = searchParams.get('tool');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tool, setTool] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [returnTime, setReturnTime] = useState('18:00');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [costDetails, setCostDetails] = useState({ days: 0, rent: 0, total: 0 });

  useEffect(() => {
    if (user && !user.phoneNumber) {
      alert('Please configure your phone number in your profile settings before requesting bookings.');
      navigate('/profile');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!toolId) {
      setError('No tool specified for booking');
      setLoading(false);
      return;
    }

    async function fetchTool() {
      try {
        const res = await api.get(`/tools/${toolId}`);
        setTool(res.data.tool);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch tool specifications.');
      } finally {
        setLoading(false);
      }
    }
    fetchTool();
  }, [toolId]);

  // Recalculate duration and rental amount dynamically
  useEffect(() => {
    if (!startDate || !endDate || !tool) {
      setCostDetails({ days: 0, rent: 0, total: 0 });
      return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (end < start) {
      setCostDetails({ days: 0, rent: 0, total: 0 });
      return;
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const rentAmount = diffDays * tool.rentPerDay;

    setCostDetails({
      days: diffDays,
      rent: rentAmount,
      total: rentAmount + tool.depositAmount,
    });
  }, [startDate, endDate, tool]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    try {
      await api.post('/bookings', {
        toolId,
        startDate,
        endDate,
        returnTime,
      });
      // Redirect to borrower's rental tracking list
      navigate('/bookings/my');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request booking.');
    } finally {
      setSubmitLoading(false);
    }
  }

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
          <p className="text-slate-600 text-sm mb-6">{error || 'Tool specifications could not be loaded.'}</p>
          <Link to="/tools" className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-800">Request Rental</span>
          <Link to={`/tools/${tool._id}`} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Cancel
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">Request Rental</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Input fields */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="start-date" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                  <input
                    id="start-date"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="end-date" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
                  <input
                    id="end-date"
                    type="date"
                    required
                    min={startDate || new Date().toISOString().split('T')[0]}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="return-time" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Return Time</label>
                  <input
                    id="return-time"
                    type="time"
                    required
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white text-xs"
                  />
                </div>
              </div>

              {/* Cost summary table */}
              {costDetails.days > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pricing Breakdown</h3>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Daily Rent ({costDetails.days} days)</span>
                    <span className="text-slate-800 font-semibold">₹{tool.rentPerDay} × {costDetails.days} = ₹{costDetails.rent}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Security Deposit (fully refundable)</span>
                    <span className="text-slate-800 font-semibold">₹{tool.depositAmount}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-sm text-amber-600">
                    <span>Total Due Now</span>
                    <span>₹{costDetails.total}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitLoading || costDetails.days === 0}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                {submitLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting Request…
                  </span>
                ) : (
                  'Send Rental Request'
                )}
              </button>
            </form>
          </div>

          {/* Right: Tool preview summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-fit space-y-4">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tool Summary</span>
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={tool.images?.[0]} alt={tool.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">{tool.name}</h2>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mt-1">{tool.category}</span>
            </div>
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Daily Rate</span>
                <span className="font-bold text-slate-800">₹{tool.rentPerDay}</span>
              </div>
              <div className="flex justify-between">
                <span>Condition</span>
                <span className="font-bold capitalize text-slate-800">{tool.condition}</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default RequestBooking;
