import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import BookingLedger from '../components/BookingLedger';
import { ArrowLeft } from 'lucide-react';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await api.get('/bookings/borrower');
      setBookings(res.data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your rentals.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusTransition(bookingId, newStatus) {
    setError('');
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      // Re-fetch list to reflect update
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update rental status.');
    }
  }

  const badgeColors = {
    requested: 'bg-slate-100 text-slate-600 border-slate-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-red-55/10 text-red-700 border-red-100',
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
          <span className="font-bold text-sm text-slate-800">My Rentals</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">My Booked Rentals</h1>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-700 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
              <span>Fetching your booking history…</span>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
            <p className="text-lg font-bold text-slate-800">You haven't requested any rentals yet.</p>
            <Link
              to="/tools"
              className="mt-4 inline-block px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Browse Available Tools
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
                  {/* Tool Info Block */}
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
                        {booking.toolId?.ownershipType === 'community' ? 'Community Library' : 'P2P Lender'}: <span className="font-semibold text-slate-700">
                          {booking.toolId?.ownershipType === 'community' && booking.ownerId?.communityDetails?.name
                            ? booking.ownerId.communityDetails.name
                            : booking.ownerId?.fullName}
                        </span> ({booking.ownerId?.email})
                        {['approved', 'active'].includes(booking.bookingStatus) && booking.ownerId?.phoneNumber && (
                          <span className="block mt-0.5 text-xs text-amber-600 font-bold">📞 Contact Number: {booking.ownerId.phoneNumber}</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Dates: <span className="font-semibold text-slate-600">{new Date(booking.startDate).toLocaleDateString()}</span> to <span className="font-semibold text-slate-600">{new Date(booking.endDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Pricing & State actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Rental Fee</span>
                      <span className="text-base font-extrabold text-slate-800">₹{booking.amount}</span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Security Deposit: ₹{booking.deposit}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeColors[booking.bookingStatus]}`}>
                        {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                      </span>

                      {/* Workflows */}
                      {booking.bookingStatus === 'approved' && (
                        <button
                          onClick={() => handleStatusTransition(booking._id, 'active')}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Pick Up Tool
                        </button>
                      )}

                      {booking.bookingStatus === 'active' && (
                        <button
                          onClick={() => handleStatusTransition(booking._id, 'returned')}
                          className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Return Tool
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ledger log logs */}
                {['approved', 'active', 'returned'].includes(booking.bookingStatus) && (
                  <BookingLedger bookingId={booking._id} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyBookings;
