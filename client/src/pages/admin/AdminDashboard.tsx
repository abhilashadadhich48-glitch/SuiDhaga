import React, { useState, useEffect } from 'react';
import { adminAPI, categoryAPI, getImageUrl } from '../../services/api';
import { CheckCircle2, ShieldAlert, Users, Layers, Award, Coins } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalEarnings: number;
  activeTailors: number;
}

interface Tailor {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImg, setCatImg] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, catsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        categoryAPI.getCategories(),
      ]);
      setStats(statsRes.data);
      // Filter unverified tailors from users list
      const unverified = usersRes.data.filter((u: any) => u.role === 'tailor' && !u.isVerified);
      setTailors(unverified);
      setCategories(catsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleVerifyTailor = async (tailorId: string) => {
    try {
      await adminAPI.toggleTailorVerify(tailorId);
      setSuccess('Atelier credentials verified successfully.');
      await fetchDashboardData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      await adminAPI.toggleUserBlock(userId);
      setSuccess(`User account block status modified.`);
      await fetchDashboardData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCatSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', catName);
      formData.append('slug', catSlug || catName.toLowerCase().replace(/ /g, '-'));
      formData.append('description', catDesc);
      formData.append('image', catImg || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=400&fit=crop');

      await adminAPI.createCategory(formData);
      setSuccess('New catalog design category published.');
      setCatName('');
      setCatSlug('');
      setCatDesc('');
      setCatImg('');
      await fetchDashboardData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setCatSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf8f5]">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-[#2f5d50]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-6xl border-b border-[#e8e4de] pb-6 mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-widest text-[#2c2c2c] uppercase">
          Triage Control <span className="text-[#2f5d50] italic font-normal">Console</span>
        </h1>
        <p className="mt-1.5 text-xs text-[#6b7280]">
          Monitor global earnings, publish taxonomies, and manage designer authentication.
        </p>
      </div>

      <div className="mx-auto max-w-6xl space-y-10">
        {success && (
          <div className="flex items-center gap-2 border border-[#a3b18a]/20 bg-[#a3b18a]/10 p-3.5 text-xs text-[#2f5d50] rounded-md">
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Global Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white border border-[#e8e4de] p-6 shadow-sm rounded-lg flex items-center gap-4">
              <div className="p-3 bg-[#faf8f5] rounded-full border border-[#e8e4de] text-[#2f5d50]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#6b7280] uppercase tracking-widest">Total Users</p>
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#2c2c2c]">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="bg-white border border-[#e8e4de] p-6 shadow-sm rounded-lg flex items-center gap-4">
              <div className="p-3 bg-[#faf8f5] rounded-full border border-[#e8e4de] text-[#2f5d50]">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#6b7280] uppercase tracking-widest">Active Orders</p>
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#2c2c2c]">{stats.totalOrders}</p>
              </div>
            </div>

            <div className="bg-white border border-[#e8e4de] p-6 shadow-sm rounded-lg flex items-center gap-4">
              <div className="p-3 bg-[#faf8f5] rounded-full border border-[#e8e4de] text-[#2f5d50]">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#6b7280] uppercase tracking-widest">Ateliers</p>
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#2c2c2c]">{stats.activeTailors}</p>
              </div>
            </div>

            <div className="bg-white border border-[#e8e4de] p-6 shadow-sm rounded-lg flex items-center gap-4">
              <div className="p-3 bg-[#faf8f5] rounded-full border border-[#e8e4de] text-[#d4a373]">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#6b7280] uppercase tracking-widest">Gross Volume</p>
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#2c2c2c]">${stats.totalEarnings}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Ateliers Verification */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase border-b border-[#e8e4de] pb-3">
              Tailor Verification Requests ({tailors.length})
            </h2>

            {tailors.length === 0 ? (
              <div className="text-center py-12 border border-[#e8e4de] bg-white rounded-lg">
                <p className="text-xs text-[#6b7280]">All tailors are verified or active.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tailors.map((tailor) => (
                  <div
                    key={tailor._id}
                    className="bg-white border border-[#e8e4de] p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#2f5d50]/20 rounded-lg"
                  >
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#2c2c2c] tracking-wider uppercase">
                        {tailor.name}
                      </h4>
                      <p className="text-xs text-[#6b7280] mt-0.5">{tailor.email}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerifyTailor(tailor._id)}
                        className="px-4 py-2 bg-[#2f5d50] hover:bg-[#204037] text-white text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none"
                      >
                        Grant Verification
                      </button>
                      <button
                        onClick={() => handleBlockUser(tailor._id)}
                        className="px-4 py-2 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-none"
                      >
                        Block
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Categories List */}
            <div className="pt-4 space-y-4">
              <h2 className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase border-b border-[#e8e4de] pb-3">
                Active Catalog taxonomies ({categories.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat._id} className="bg-white border border-[#e8e4de] p-4 flex gap-3 items-center rounded-lg">
                    <img
                      src={getImageUrl(cat.image)}
                      alt={cat.name}
                      className="h-10 w-10 object-cover border border-[#e8e4de] rounded-sm shrink-0"
                    />
                    <div>
                      <h4 className="font-serif text-xs font-bold text-[#2c2c2c] uppercase tracking-wider">
                        {cat.name}
                      </h4>
                      <p className="text-[10px] text-[#6b7280] line-clamp-1 mt-0.5">{cat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Taxonomy Builder Form */}
          <div className="space-y-6">
            <h2 className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase border-b border-[#e8e4de] pb-3">
              Taxonomy Creator
            </h2>

            <div className="bg-white border border-[#e8e4de] p-6 rounded-lg shadow-sm">
              <form onSubmit={handleCreateCategory} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-500">
                    <ShieldAlert className="h-4.5 w-4.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Category Name */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Category Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Silk Sarees & Drapes"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Slug identifier (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. silk-sarees"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="Unsplash image link"
                    value={catImg}
                    onChange={(e) => setCatImg(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Taxonomy Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explain category styling limitations, typical raw material requirements..."
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={catSubmitting}
                    className="w-full flex justify-center items-center gap-2 border border-[#2f5d50] bg-[#2f5d50] py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-transparent hover:text-[#2f5d50] transition-colors rounded-none"
                  >
                    {catSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      'Publish Category'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
