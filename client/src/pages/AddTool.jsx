import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { CATEGORIES } from './BrowseTools';
import { ArrowLeft, Camera, X, AlertTriangle } from 'lucide-react';

function AddTool() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('good');
  const [rentPerDay, setRentPerDay] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [customLateFeePerDay, setCustomLateFeePerDay] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large (max 5MB)');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Require tool photo/image file strictly
    if (!imageFile) {
      setError('Tool image photo is required. Please upload a photo.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category === 'Other' ? customCategory : category);
      formData.append('description', description);
      formData.append('condition', condition);
      formData.append('rentPerDay', rentPerDay);
      formData.append('depositAmount', depositAmount);
      formData.append('customLateFeePerDay', customLateFeePerDay);
      formData.append('image', imageFile);

      await api.post('/tools', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list the tool.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
              </svg>
            </div>
            <span className="font-bold text-sm text-slate-900">Rent-a-Tool</span>
          </Link>
          <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>
        </div>
      </header>

      {/* Form Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">List a Tool</h1>
        <p className="text-slate-600 text-sm mb-8">Share your tools with the community or list library catalog items.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Form Fields */}
          <div className="md:col-span-2 space-y-6 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium animate-fade-in">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tool-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tool Name</label>
                <input
                  id="tool-name"
                  type="text"
                  required
                  placeholder="e.g. Cordless Hammer Drill"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white text-sm"
                />
              </div>

              <div>
                <label htmlFor="category-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500/30 text-sm font-semibold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {category === 'Other' && (
                  <div className="mt-3 animate-fade-in">
                    <input
                      type="text"
                      required
                      placeholder="Type custom category..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white text-xs"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="tool-desc" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <textarea
                id="tool-desc"
                rows={4}
                required
                placeholder="Describe features, size, specs, power source or user tips..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="condition-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Condition</label>
                <select
                  id="condition-select"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none text-sm font-semibold"
                >
                  <option value="new">New / Pristine</option>
                  <option value="good">Good / Well kept</option>
                  <option value="fair">Fair / Functional</option>
                  <option value="worn">Worn / Heavily used</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="rent-rate" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rent per day (₹)</label>
                <input
                  id="rent-rate"
                  type="number"
                  required
                  min="0"
                  placeholder="50"
                  value={rentPerDay}
                  onChange={(e) => setRentPerDay(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white text-sm"
                />
              </div>

              <div>
                <label htmlFor="deposit-amt" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Security Deposit (₹)</label>
                <input
                  id="deposit-amt"
                  type="number"
                  required
                  min="0"
                  placeholder="500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white text-sm"
                />
              </div>

              <div>
                <label htmlFor="late-fee-rate" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Add. Late Fee/Day (₹)</label>
                <input
                  id="late-fee-rate"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={customLateFeePerDay}
                  onChange={(e) => setCustomLateFeePerDay(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-white text-sm"
                />
              </div>
            </div>

            {/* Alert Terms Section */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-1">Return Policy Terms & Conditions</strong>
                <p>If this tool is not returned on time, the borrower will be charged 1.5x the daily rental fee (₹{(Number(rentPerDay) || 0) * 1.5}) plus your custom late fee (₹{Number(customLateFeePerDay) || 0}) for each overdue day, assessed automatically against their security deposit hold.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Listing tool…
                </span>
              ) : (
                'Publish Listing'
              )}
            </button>
          </div>

          {/* Right Column: Image Upload / Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center h-fit">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 self-start">Tool Photo *</span>
            
            {imagePreview ? (
              <div className="w-full space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/85 text-white w-7 h-7 rounded-full flex items-center justify-center border border-white/10 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400">Photo selected successfully.</p>
              </div>
            ) : (
              <div className="w-full">
                <label className="border-2 border-dashed border-slate-200 rounded-xl aspect-video flex flex-col items-center justify-center p-6 hover:border-amber-500/50 hover:bg-slate-50 transition-all cursor-pointer">
                  <Camera className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-700">Upload Image *</span>
                  <span className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddTool;
