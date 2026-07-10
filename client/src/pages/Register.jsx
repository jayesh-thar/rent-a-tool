import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState('individual');
  const [communityName, setCommunityName] = useState('');
  const [communityAddress, setCommunityAddress] = useState('');
  const [communityRegistrationId, setCommunityRegistrationId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);

    try {
      const communityDetails = userType === 'community' 
        ? { name: communityName, address: communityAddress, registrationId: communityRegistrationId } 
        : null;

      await register(fullName, email, password, phoneNumber, userType, communityDetails);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md my-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4 shadow-md shadow-amber-500/10">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your account</h1>
          <p className="text-slate-500 mt-1 text-sm">Join the community tool library</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="register-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="register-phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                id="register-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="e.g. +91 98765 43210"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="register-usertype" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Account Type
              </label>
              <select
                id="register-usertype"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500/30 font-semibold"
              >
                <option value="individual">Individual Member</option>
                <option value="community">Community Library / Organization</option>
              </select>
            </div>

            {/* Community Additional Fields */}
            {userType === 'community' && (
              <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fade-in">
                <span className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider">Community Specifications</span>
                
                <div>
                  <label htmlFor="comm-name" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Library / Group Name</label>
                  <input
                    id="comm-name"
                    type="text"
                    required
                    placeholder="e.g. Metro Tool Co-Op"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label htmlFor="comm-address" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Library Address</label>
                  <input
                    id="comm-address"
                    type="text"
                    required
                    placeholder="e.g. 12 Baker St, London"
                    value={communityAddress}
                    onChange={(e) => setCommunityAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label htmlFor="comm-reg" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Registration ID</label>
                  <input
                    id="comm-reg"
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

            <div>
              <label htmlFor="register-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="register-confirm" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input
                id="register-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Google Sign-In */}
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/google`}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-350 text-slate-700 font-bold text-sm transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </a>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-600 hover:text-amber-700 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
