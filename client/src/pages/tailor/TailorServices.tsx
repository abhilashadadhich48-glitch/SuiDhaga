import React, { useState, useEffect } from 'react';
import { tailorAPI, categoryAPI } from '../../services/api';
import { CheckCircle2, ShieldAlert, Plus, Edit3, Trash2, Scissors } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  baseTimeDays: number;
  category: {
    _id: string;
    name: string;
  };
}

interface Category {
  _id: string;
  name: string;
}

const TailorServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [baseTimeDays, setBaseTimeDays] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await tailorAPI.getMyServices();
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        setCategories(res.data);
        if (res.data.length > 0) setCategoryId(res.data[0]._id);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setPrice('');
    setBaseTimeDays('');
    if (categories.length > 0) setCategoryId(categories[0]._id);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (svc: Service) => {
    setEditingService(svc);
    setName(svc.name);
    setDescription(svc.description);
    setPrice(svc.price.toString());
    setBaseTimeDays(svc.baseTimeDays.toString());
    setCategoryId(svc.category?._id || '');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const payload = {
      name,
      description,
      price: parseFloat(price),
      baseTimeDays: parseInt(baseTimeDays),
      categoryId,
    };

    try {
      if (editingService) {
        await tailorAPI.updateService(editingService._id, payload);
        setSuccess('Service option updated successfully.');
      } else {
        await tailorAPI.createService(payload);
        setSuccess('New catalog service published.');
      }
      await fetchServices();
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update catalog option.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to retract this service from your published catalog?')) return;
    try {
      await tailorAPI.deleteService(serviceId);
      setSuccess('Service option removed.');
      await fetchServices();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to retract service option.');
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
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e8e4de] pb-6 mb-12">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-widest text-[#2c2c2c] uppercase">
            Artisan Catalog <span className="text-[#2f5d50] italic font-normal">Manager</span>
          </h1>
          <p className="mt-1.5 text-xs text-[#6b7280]">
            Manage bespoke service listings, pricing tiers, and delivery turnaround dates.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#2f5d50] hover:bg-[#204037] text-white px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors rounded-none shadow-md shadow-[#2f5d50]/10"
        >
          <Plus className="h-4 w-4" />
          Publish Service
        </button>
      </div>

      <div className="mx-auto max-w-5xl">
        {success && !showModal && (
          <div className="flex items-center gap-2 border border-[#a3b18a]/20 bg-[#a3b18a]/10 p-3.5 text-xs text-[#2f5d50] mb-6 rounded-md">
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span>{success}</span>
          </div>
        )}

        {services.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#e8e4de] rounded-lg">
            <Scissors className="h-10 w-10 text-[#d4a373]/40 mx-auto mb-4" />
            <h3 className="font-serif text-lg text-[#2c2c2c] tracking-wider uppercase">
              Your Catalog is Empty
            </h3>
            <p className="mt-1 text-xs text-[#6b7280]">
              Create custom design categories and publish sizing rates to connect with clients.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((svc) => (
              <div
                key={svc._id}
                className="bg-white border border-[#e8e4de] p-6 flex flex-col justify-between hover:border-[#2f5d50]/40 transition-all rounded-lg"
              >
                <div className="space-y-3">
                  <span className="bg-[#a3b18a]/10 text-[#2f5d50] text-[9px] font-bold tracking-widest uppercase border border-[#a3b18a]/20 px-2.5 py-0.5 rounded-sm">
                    {svc.category?.name}
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#2c2c2c] tracking-wider uppercase">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-[#6b7280] leading-relaxed">
                    {svc.description}
                  </p>
                  <div className="flex gap-4 text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">
                    <span>Rate: <span className="text-[#2c2c2c] font-mono">${svc.price}</span></span>
                    <span>•</span>
                    <span>Turnaround: <span className="text-[#2c2c2c]">{svc.baseTimeDays} Days</span></span>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#e8e4de] pt-4 flex justify-end gap-3">
                  <button
                    onClick={() => openEditModal(svc)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-[#e8e4de] hover:border-[#2f5d50] text-[10px] font-bold uppercase tracking-widest text-[#2c2c2c] transition-colors rounded-none bg-[#faf8f5]"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-[#d4a373]" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(svc._id)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-red-100 hover:bg-red-500 hover:text-white text-[10px] font-bold uppercase tracking-widest text-red-500 transition-all rounded-none"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Retract
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PUBLISH / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#e8e4de] p-6 sm:p-8 space-y-6 relative rounded-lg shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e8e4de] pb-4">
              <h3 className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase">
                {editingService ? 'Edit Published Service' : 'Publish New Service'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs font-bold text-[#6b7280] hover:text-[#2c2c2c] uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            {success ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-[#2f5d50] mx-auto animate-pulse" />
                <h4 className="font-serif text-lg text-[#2c2c2c] uppercase tracking-wider">Catalog Updated</h4>
                <p className="text-xs text-[#6b7280]">{success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-500">
                    <ShieldAlert className="h-4.5 w-4.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Service Name */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Raw Silk Lehenga Stitch"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
                  />
                </div>

                {/* Category Select */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Design Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2.5 px-3 font-sans text-xs text-[#2c2c2c] outline-none focus:border-[#2f5d50]"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid for Price and Days */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                      Rate / Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 350"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                      Turnaround (Days)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 14"
                      value={baseTimeDays}
                      onChange={(e) => setBaseTimeDays(e.target.value)}
                      className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Service Description
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide description outlining textile selections, linings, pads, fitting adjustability options, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center items-center gap-2 border border-[#2f5d50] bg-[#2f5d50] py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-transparent hover:text-[#2f5d50] transition-colors rounded-none"
                  >
                    {submitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      editingService ? 'Save Changes' : 'Publish Catalog Item'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TailorServices;
