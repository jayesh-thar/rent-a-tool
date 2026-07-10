import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import BookingLedger from '../components/BookingLedger';
import { ArrowLeft } from 'lucide-react';

function BookingRequests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State for damage checks during returns
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [damageReported, setDamageReported] = useState(false);
  const [damageNotes, setDamageNotes] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const res = await api.get('/bookings/lender');
      setBookings(res.data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load received requests.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusTransition(bookingId, newStatus) {
    setError('');
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request status.');
    }
  }

  // Opens return modal to ask for damage reports
  function openReturnModal(bookingId) {
    setSelectedBookingId(bookingId);
    setDamageReported(false);
    setDamageNotes('');
    setIsReturnModalOpen(true);
  }

  async function handleReturnSubmit(e) {
    e.preventDefault();
    setModalLoading(true);
    setError('');
    try {
      await api.patch(`/bookings/${selectedBookingId}/status`, {
        status: 'returned',
        damageReported,
        damageNotes,
      });
      setIsReturnModalOpen(false);
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete tool return.');
    } finally {
      setModalLoading(false);
    }
  }

  const badgeColors = {
    requested: 'bg-slate-100 text-slate-600 border-slate-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    returned: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="font-bold text-sm text-slate-800">Lending Requests</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">Received Lending Requests</h1>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-700 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
              <span>Fetching rental requests…</span>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
            <p className="text-lg font-bold text-slate-800">No lending requests received yet.</p>
            <p className="text-sm text-slate-500 mt-1">Make sure you have listed tools in the catalog so others can book them.</p>
            <Link
              to="/tools/add"
              className="mt-4 inline-block px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              + List a New Tool
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Tool and Borrower Info */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                      <img
                        src={booking.toolId?.images?.[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=60'}
                        alt={booking.toolId?.name || 'Tool'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{booking.toolId?.category}</span>
                      <h3 className="text-base font-bold text-slate-900 leading-tight mb-1">{booking.toolId?.name || 'Deleted Tool Listing'}</h3>
                      <p className="text-xs text-slate-500">
                        Borrower: <span className="font-semibold text-slate-700">{booking.borrowerId?.fullName}</span> ({booking.borrowerId?.email})
                        {['approved', 'active'].includes(booking.bookingStatus) && booking.borrowerId?.phoneNumber && (
                          <span className="block mt-0.5 text-xs text-amber-600 font-bold">📞 Contact Number: {booking.borrowerId.phoneNumber}</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Duration: <span className="font-semibold text-slate-600">{new Date(booking.startDate).toLocaleDateString()}</span> to <span className="font-semibold text-slate-600">{new Date(booking.endDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status and Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Estimated Earnings</span>
                      <span className="text-base font-extrabold text-emerald-600">₹{booking.amount}</span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Security Deposit: ₹{booking.deposit}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeColors[booking.bookingStatus]}`}>
                        {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                      </span>

                      {/* Workflows */}
                      {booking.bookingStatus === 'requested' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusTransition(booking._id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusTransition(booking._id, 'rejected')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {booking.bookingStatus === 'approved' && (
                        <button
                          onClick={() => handleStatusTransition(booking._id, 'active')}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Hand Over Tool
                        </button>
                      )}

                      {booking.bookingStatus === 'active' && (
                        <button
                          onClick={() => openReturnModal(booking._id)}
                          className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Mark Returned
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ledger display for approved/active/returned bookings */}
                {['approved', 'active', 'returned'].includes(booking.bookingStatus) && (
                  <BookingLedger bookingId={booking._id} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Return Assessment Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h2 className="text-lg font-bold text-slate-950 mb-4">Assess Return Specs</h2>
            
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <label htmlFor="report-damage" className="flex items-start gap-3 text-slate-600 hover:text-slate-950 cursor-pointer select-none">
                <input
                  id="report-damage"
                  type="checkbox"
                  checked={damageReported}
                  onChange={(e) => setDamageReported(e.target.checked)}
                  className="mt-1 accent-amber-500 rounded"
                />
                <div>
                  <span className="text-sm font-bold text-slate-950 block">Report tool damage</span>
                  <span className="text-xs text-slate-500">Damaged tools will be flagged for maintenance and assess a fine (50% deposit).</span>
                </div>
              </label>

              {damageReported && (
                <div>
                  <label htmlFor="damage-notes" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Damage Details</label>
                  <textarea
                    id="damage-notes"
                    rows={3}
                    placeholder="Describe cracks, broken switches, cord tears..."
                    value={damageNotes}
                    onChange={(e) => setDamageNotes(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white resize-none text-sm animate-fade-in"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-xl text-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {modalLoading ? 'Completing return…' : 'Complete Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default BookingRequests;
