import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Wrench, Shield, CreditCard, Mail, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

function Home() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    api
      .get('/health')
      .then((res) => {
        setHealth(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to connect to backend');
        setLoading(false);
      });
  }, []);

  // Set default statistics if backend fetch fails or is pending
  const stats = health?.stats || {
    totalTools: 5,
    totalUsers: 3,
    totalTransactions: 2,
  };

  // While auth state is resolving, show a simple spinner to prevent visual flashes
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500/20 selection:text-slate-900 font-sans">
      {/* 🚀 Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/10">
              <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">Rent-a-Tool</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <Link to="/tools" className="hover:text-slate-900 transition-colors">Browse Catalog</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* 🚀 Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-6">
            🛠️ Community-Powered Tool Sharing
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-950">
            Unleash Your Inner Builder. <br />
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Rent the Perfect Tool.
            </span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop buying tools you only use once. Borrow heavy duty drills, saws, ladders, and plumbing tools from neighbors, or list your own to earn extra income.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tools"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] text-center text-sm"
            >
              Browse Available Tools
            </Link>
            <Link
              to="/login?redirect=/tools/add"
              className="px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl transition-all text-center text-sm"
            >
              Lend a Tool
            </Link>
          </div>
        </div>
      </section>

      {/* 🚀 Dynamic Statistics Banner */}
      <section className="max-w-6xl mx-auto px-6 py-6 mb-20">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/2 to-indigo-500/2 pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative z-10 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-6 md:pt-0">
              <span className="text-4xl md:text-5xl font-extrabold text-amber-600 block mb-2">
                {loading ? '...' : `${stats.totalTools}`}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Listed Tools</span>
              <p className="text-xs text-slate-500 mt-2 px-4">From power drills to heavy garden equipment, ready to use</p>
            </div>
            <div className="pt-6 md:pt-0">
              <span className="text-4xl md:text-5xl font-extrabold text-indigo-600 block mb-2">
                {loading ? '...' : `${stats.totalUsers}`}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Members</span>
              <p className="text-xs text-slate-500 mt-2 px-4">Neighbors sharing, borrowing, saving money, and reducing waste</p>
            </div>
            <div className="pt-6 md:pt-0">
              <span className="text-4xl md:text-5xl font-extrabold text-emerald-600 block mb-2">
                {loading ? '...' : `${stats.totalTransactions}`}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transactions Completed</span>
              <p className="text-xs text-slate-500 mt-2 px-4">Successful rental reservations secured with active ledger tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-slate-900">How the Library Works</h2>
          <p className="text-slate-600 text-sm">Renting and lending tools is simple and secure. Here is the step-by-step cycle:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StepCard
            step="01"
            title="Search Catalog"
            description="Explore tool specifications, categories, daily rental rates, and filters to locate what you need."
          />
          <StepCard
            step="02"
            title="Book Dates"
            description="Specify dates and reserve the tool. Security deposit balances are held automatically on approved bookings."
          />
          <StepCard
            step="03"
            title="Coordinate Handover"
            description="Lenders approve requests. Hand over the tool and confirm tool pickup status on the dashboard."
          />
          <StepCard
            step="04"
            title="Return Safely"
            description="Return on time to avoid late fees. Fines or damages are deducted, and deposits are refunded immediately."
          />
        </div>
      </section>

      {/* 🚀 Features / Benefits Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-1 space-y-6">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Premium Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-950">Why Choose Rent-a-Tool?</h2>
            <p className="text-slate-600 leading-relaxed">
              We provide an integrated, community-centered platform designed to offer maximum utility with complete peace of mind.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureItem
              icon={<Wrench className="w-6 h-6 text-amber-600" />}
              title="Stateless JWT & Interceptors"
              description="Safe session controls. Concurrent refresh handlers maintain active login states silently."
            />
            <FeatureItem
              icon={<Shield className="w-6 h-6 text-indigo-600" />}
              title="Double-Booking Protection"
              description="Automated database validations prevent overlapping date approvals for the same tool."
            />
            <FeatureItem
              icon={<CreditCard className="w-6 h-6 text-emerald-600" />}
              title="Payments Ledger tracking"
              description="Transparent transaction ledgers record holds, late fees, and refunds for every booking."
            />
            <FeatureItem
              icon={<Mail className="w-6 h-6 text-blue-600" />}
              title="Instant Email Notices"
              description="Stay informed with automated email updates on confirmations, approvals, and reminders."
            />
          </div>
        </div>
      </section>

      {/* 🚀 CTA Footer Banner */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-slate-100 border border-slate-200 rounded-3xl p-8 md:p-12 text-center shadow-sm relative overflow-hidden">
          <h2 className="text-3xl font-extrabold mb-4 text-slate-950">Ready to start saving and sharing?</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto text-sm">Join your local neighborhood tool library, reduce hardware waste, and build together.</p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-md transition-transform hover:scale-[1.02] cursor-pointer text-sm"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* 🚀 Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-semibold">
            <span>© 2026 Rent-a-Tool. Community Library Platform.</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <span className="hover:text-slate-800 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-800 cursor-pointer transition-colors">Terms of Service</span>
            {health && (
              <span className="text-emerald-600">● Server Connected</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ step, title, description }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 relative hover:shadow-md transition-all">
      <span className="absolute top-4 right-6 text-2xl font-extrabold text-slate-100 font-mono select-none">{step}</span>
      <h3 className="text-base font-bold text-slate-900 mb-2 pt-4">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureItem({ icon, title, description }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex gap-4 hover:border-amber-500/40 transition-all shadow-xs">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default Home;
