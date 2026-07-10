import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft, User, Phone, Mail, Building, Key } from 'lucide-react';

function Profile() {
  const { user, refreshAccessToken } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState('individual');
  const [communityName, setCommunityName] = useState('');
  const [communityAddress, setCommunityAddress] = useState('');
  const [communityRegistrationId, setCommunityRegistrationId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setUserType(user.userType || 'individual');
      if (user.communityDetails) {
        setCommunityName(user.communityDetails.name || '');
        setCommunityAddress(user.communityDetails.address || '');
        setCommunityRegistrationId(user.communityDetails.registrationId || '');
      }
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const communityDetails = userType === 'community'
        ? { name: communityName, address: communityAddress, registrationId: communityRegistrationId }
        : null;

      await api.put('/auth/profile', {
        fullName,
        email,
        phoneNumber,
        userType,
        communityDetails,
        password: password || undefined,
      });

      // Refresh AuthContext user details
      await refreshAccessToken();
      
      setMessage('Profile updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="font-bold text-sm text-slate-800">My Profile Settings</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">Account Configuration</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-fit space-y-4 text-center">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-600 font-extrabold text-2xl">
              {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">{fullName}</h2>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mt-1">
                {userType === 'community' ? 'Community Library Account' : 'Individual Account'}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-4 space-y-2 text-left text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{phoneNumber || 'No phone set'}</span>
              </div>
            </div>
          </div>

          {/* Right Editing Form */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}
              {message && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
                  {message}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prof-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <input
                      id="prof-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white"
                    />
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="prof-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      id="prof-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white"
                    />
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prof-phone" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <input
                      id="prof-phone"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white"
                    />
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="prof-type" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Account Type</label>
                  <div className="relative">
                    <select
                      id="prof-type"
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500/30 text-sm font-semibold"
                    >
                      <option value="individual">Individual Member</option>
                      <option value="community">Community Library / Organization</option>
                    </select>
                    <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Conditional Community Fields */}
              {userType === 'community' && (
                <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fade-in">
                  <span className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider">Community Specifications</span>
                  
                  <div>
                    <label htmlFor="prof-comm-name" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Library / Group Name</label>
                    <input
                      id="prof-comm-name"
                      type="text"
                      required
                      placeholder="e.g. Metro Tool Co-Op"
                      value={communityName}
                      onChange={(e) => setCommunityName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="prof-comm-addr" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Library Address</label>
                    <input
                      id="prof-comm-addr"
                      type="text"
                      required
                      placeholder="e.g. 12 Baker St, London"
                      value={communityAddress}
                      onChange={(e) => setCommunityAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="prof-comm-reg" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Registration ID</label>
                    <input
                      id="prof-comm-reg"
                      type="text"
                      required
                      placeholder="e.g. REG-109283-X"
                      value={communityRegistrationId}
                      onChange={(e) => setCommunityRegistrationId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>
                </div>
              )}

              {/* Password Updates */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Password (Optional)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prof-pass" className="block text-[10px] font-bold text-slate-500 uppercase mb-2">New Password</label>
                    <div className="relative">
                      <input
                        id="prof-pass"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white"
                      />
                      <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="prof-conf" className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        id="prof-conf"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white"
                      />
                      <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                {loading ? 'Saving adjustments…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
