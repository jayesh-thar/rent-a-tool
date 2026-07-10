import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Wrench, ClipboardList, Handshake } from 'lucide-react';
import NotificationPanel from '../components/NotificationPanel';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isProfileIncomplete = !user?.phoneNumber;

  function handleAddToolClick(e) {
    if (isProfileIncomplete) {
      e.preventDefault();
      alert('Please configure your phone number in your profile settings before listing tools.');
      navigate('/profile');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/10">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">Rent-a-Tool</span>
          </Link>

          <div className="flex items-center gap-6">
            {user?.roles?.includes('admin') && (
              <Link to="/admin" className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Admin Portal
              </Link>
            )}
            <Link to="/tools" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Browse Catalog
            </Link>
            <Link to="/profile" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              My Profile
            </Link>
            <NotificationPanel />
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{user?.fullName}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200/60 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Onboarding Notice */}
        {isProfileIncomplete && (
          <div className="p-5 bg-amber-50 border border-amber-250 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 shadow-xs animate-fade-in">
            <div className="space-y-1">
              <strong className="block text-sm font-bold text-amber-900">⚠️ Profile Update Required</strong>
              <p className="text-xs text-amber-700">Please provide a phone number and select your account profile details to enable listings and tool rentals.</p>
            </div>
            <Link
              to="/profile"
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer"
            >
              Complete Profile Setup
            </Link>
          </div>
        )}

        {/* Welcome Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/2 to-orange-500/2 pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
                Welcome back, {user?.fullName?.split(' ')[0]}!
              </h1>
              <p className="text-slate-600 text-sm">
                You're signed in and authenticated. Share tools with the community or borrow what you need.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/tools/add"
                onClick={handleAddToolClick}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                + Add Tool Listing
              </Link>
              <Link
                to="/tools"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
              >
                Explore Catalog
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/tools/add" onClick={handleAddToolClick} className="block group">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs group-hover:shadow-md hover:border-slate-300 transition-all h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Wrench className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">Active</span>
              </div>
              <h3 className="text-slate-900 font-bold mb-1">Add a Tool</h3>
              <p className="text-xs text-slate-500 leading-relaxed">List your tools for others to rent in the community.</p>
            </div>
          </Link>
          <Link to="/bookings/my" className="block group">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs group-hover:shadow-md hover:border-slate-300 transition-all h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">Active</span>
              </div>
              <h3 className="text-slate-900 font-bold mb-1">My Rentals</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Track tools you've requested or active rentals you borrowed.</p>
            </div>
          </Link>
          <Link to="/bookings/requests" className="block group">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs group-hover:shadow-md hover:border-slate-300 transition-all h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Handshake className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">Active</span>
              </div>
              <h3 className="text-slate-900 font-bold mb-1">Lending Requests</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Review, approve, reject, or manage pickup and returns for your listed tools.</p>
            </div>
          </Link>
        </div>

        {/* Account Info */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Account Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DetailRow label="Full Name" value={user?.fullName} />
            <DetailRow label="Email" value={user?.email} />
            <DetailRow label="Phone Number" value={user?.phoneNumber || 'Not Set (Required)'} />
            <DetailRow label="Account Type" value={user?.userType || 'Not Set'} />
            <DetailRow label="Roles" value={user?.roles?.join(', ')} />
            <DetailRow label="Auth Provider" value={user?.authProvider} />
            <DetailRow label="Verification Status" value={user?.verificationStatus} />
            <DetailRow label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} />
            {user?.userType === 'community' && (
              <>
                <DetailRow label="Community Library Name" value={user?.communityDetails?.name} />
                <DetailRow label="Co-Op Pick-Up Address" value={user?.communityDetails?.address} />
                <DetailRow label="Co-Op Registration ID" value={user?.communityDetails?.registrationId} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
      <span className="text-sm text-slate-700 font-semibold">{value || '—'}</span>
    </div>
  );
}

export default Dashboard;
