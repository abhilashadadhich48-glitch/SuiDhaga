import React, { useState, useEffect } from 'react';
import { orderAPI, getImageUrl } from '../../services/api';
import { FileText, Upload, CheckCircle2, ShieldAlert, ChevronDown, ChevronUp, Ruler } from 'lucide-react';

interface Order {
  _id: string;
  customer: {
    name: string;
    email: string;
  };
  service: {
    name: string;
    price: number;
  };
  price: number;
  status: string;
  notes?: string;
  createdAt: string;
  selectedMeasurements: {
    upperBody?: {
      chest?: number;
      shoulder?: number;
      waist?: number;
      sleeveLength?: number;
    };
    lowerBody?: {
      hip?: number;
      inseam?: number;
      outseam?: number;
      waist?: number;
    };
    accents?: {
      neck?: number;
      wrist?: number;
      ankle?: number;
    };
  };
  designReferences: string[];
  milestoneTimeline: {
    status: string;
    note: string;
    timestamp: string;
    mediaUrl?: string;
  }[];
}

const TailorOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Expanded card state
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Update modal state
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [timelineStatus, setTimelineStatus] = useState('Fabric Sourcing');
  const [timelineNote, setTimelineNote] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load tailor orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingOrder) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('status', timelineStatus);
      formData.append('note', timelineNote);
      if (proofFile) {
        formData.append('proof', proofFile);
      }

      await orderAPI.updateOrderStatus(updatingOrder._id, formData);
      setSuccess('Production milestone logged successfully.');
      setTimelineNote('');
      setProofFile(null);
      await fetchOrders();
      setTimeout(() => {
        setUpdatingOrder(null);
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to post milestone.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
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
          Studio Active <span className="text-[#2f5d50] italic font-normal">Orders</span>
        </h1>
        <p className="mt-1.5 text-xs text-[#6b7280]">
          Review client anatomical specifications, print patterns, and upload progress milestones.
        </p>
      </div>

      <div className="mx-auto max-w-5xl">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#e8e4de] rounded-lg">
            <Ruler className="h-10 w-10 text-[#d4a373]/40 mx-auto mb-4" />
            <h3 className="font-serif text-lg text-[#2c2c2c] tracking-wider uppercase">
              No Stitching Orders
            </h3>
            <p className="mt-1 text-xs text-[#6b7280]">
              Pending orders will display here when customers request listings from your catalog.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order._id;


              return (
                <div
                  key={order._id}
                  className="bg-white border border-[#e8e4de] hover:border-[#2f5d50]/30 transition-all rounded-lg overflow-hidden"
                >
                  {/* Order Brief Info */}
                  <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] bg-[#faf8f5] border border-[#e8e4de] px-2 py-0.5 font-mono text-[#6b7280] rounded-sm">
                          ID: {order._id.substring(18).toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-[#2f5d50] uppercase tracking-wide">
                          {order.service?.name}
                        </span>
                      </div>
                      <h3 className="font-serif text-base font-bold text-[#2c2c2c] uppercase">
                        Client: {order.customer.name}
                      </h3>
                      <p className="text-[10px] text-[#6b7280]">
                        Placed:{' '}
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-[#6b7280] uppercase tracking-widest">Pricing</p>
                        <p className="font-serif text-base font-bold text-[#2c2c2c]">${order.price}</p>
                      </div>

                      <span className="bg-[#2f5d50]/10 text-[#2f5d50] border border-[#2f5d50]/20 text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-sm">
                        {order.status}
                      </span>

                      <button
                        onClick={() => toggleExpand(order._id)}
                        className="text-[#6b7280] hover:text-[#2c2c2c] transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-[#e8e4de] bg-[#faf8f5]/50 space-y-6 pt-6">
                      {/* Grid for Measurements and Design Notes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Anatomical Details */}
                        <div className="bg-white border border-[#e8e4de] p-4 rounded-md space-y-3 shadow-sm">
                          <h4 className="font-serif text-xs font-bold tracking-widest text-[#2f5d50] uppercase border-b border-[#e8e4de] pb-2 flex items-center gap-1.5">
                            <Ruler className="h-4.5 w-4.5 text-[#d4a373]" />
                            Linked Anatomical Frame
                          </h4>

                          {order.selectedMeasurements ? (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                              {/* Upper Body */}
                              <div>
                                <p className="text-[10px] text-[#6b7280] uppercase tracking-wider font-semibold">Upper Body</p>
                                <ul className="mt-1 space-y-1 text-[#2c2c2c] font-mono">
                                  <li>Chest: {order.selectedMeasurements.upperBody?.chest || '-'}"</li>
                                  <li>Shoulder: {order.selectedMeasurements.upperBody?.shoulder || '-'}"</li>
                                  <li>Waist: {order.selectedMeasurements.upperBody?.waist || '-'}"</li>
                                  <li>Sleeve: {order.selectedMeasurements.upperBody?.sleeveLength || '-'}"</li>
                                </ul>
                              </div>
                              {/* Lower Body */}
                              <div>
                                <p className="text-[10px] text-[#6b7280] uppercase tracking-wider font-semibold">Lower Body</p>
                                <ul className="mt-1 space-y-1 text-[#2c2c2c] font-mono">
                                  <li>Hip: {order.selectedMeasurements.lowerBody?.hip || '-'}"</li>
                                  <li>Inseam: {order.selectedMeasurements.lowerBody?.inseam || '-'}"</li>
                                  <li>Outseam: {order.selectedMeasurements.lowerBody?.outseam || '-'}"</li>
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-red-500 italic">No measurement record attached.</p>
                          )}
                        </div>

                        {/* Customer Notes */}
                        <div className="bg-white border border-[#e8e4de] p-4 rounded-md space-y-3 shadow-sm">
                          <h4 className="font-serif text-xs font-bold tracking-widest text-[#2f5d50] uppercase border-b border-[#e8e4de] pb-2">
                            Design Blueprint Notes
                          </h4>
                          <p className="text-xs text-[#6b7280] leading-relaxed">
                            {order.notes || 'No custom notes provided by client.'}
                          </p>

                          {order.designReferences && order.designReferences.length > 0 && (
                            <div className="pt-2">
                              <p className="text-[10px] text-[#d4a373] uppercase tracking-widest font-extrabold mb-1">
                                Reference Drawings
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {order.designReferences.map((ref, idx) => (
                                  <a
                                    key={idx}
                                    href={getImageUrl(ref)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="border border-[#e8e4de] p-1 bg-[#faf8f5] hover:opacity-90 transition-opacity"
                                  >
                                    <img
                                      src={getImageUrl(ref)}
                                      alt="design reference"
                                      className="h-10 w-10 object-cover"
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Log Action Button */}
                      {order.status !== 'Delivered' && (
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => {
                              setUpdatingOrder(order);
                              setTimelineStatus(order.status);
                            }}
                            className="bg-[#2f5d50] hover:bg-[#204037] text-white text-[10px] font-bold uppercase tracking-widest px-5 py-3 transition-colors rounded-none"
                          >
                            Post Milestone Update
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MILESTONE LOGGER MODAL */}
      {updatingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#e8e4de] p-6 sm:p-8 space-y-6 relative rounded-lg shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e8e4de] pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase">
                  Post Progress Update
                </h3>
                <p className="text-[10px] text-[#6b7280] uppercase tracking-wider mt-0.5">
                  Client: {updatingOrder.customer.name}
                </p>
              </div>
              <button
                onClick={() => setUpdatingOrder(null)}
                className="text-xs font-bold text-[#6b7280] hover:text-[#2c2c2c] uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            {success ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-[#2f5d50] mx-auto animate-pulse" />
                <h4 className="font-serif text-lg text-[#2c2c2c] uppercase tracking-wider">Milestone Posted</h4>
                <p className="text-xs text-[#6b7280]">{success}</p>
              </div>
            ) : (
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-500">
                    <ShieldAlert className="h-4.5 w-4.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Status Dropdown Selection */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Select Milestone Stage
                  </label>
                  <select
                    value={timelineStatus}
                    onChange={(e) => setTimelineStatus(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2.5 px-3 font-sans text-xs text-[#2c2c2c] outline-none focus:border-[#2f5d50]"
                  >
                    <option value="Fabric Sourcing">Fabric Sourcing (Acquired raw materials)</option>
                    <option value="Cutting & Preparation">Cutting & Preparation (Pattern tracing)</option>
                    <option value="Hand-stitching">Hand-stitching (Embroidery/assembly stage)</option>
                    <option value="Final Pressing">Final Pressing (Steamed, ironed, lint rolled)</option>
                    <option value="Delivered">Delivered (Handed to customer / shipped)</option>
                  </select>
                </div>

                {/* Status Note Description */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Progress Description Note
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide specific update details (e.g. Brocades sourced from Banaras. Silk lining finished.)"
                    value={timelineNote}
                    onChange={(e) => setTimelineNote(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
                  />
                </div>

                {/* Media Proof Upload */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Upload Media Proof (Photo)
                  </label>
                  <div className="mt-1 flex justify-center border border-dashed border-[#e8e4de] px-6 py-6 bg-[#faf8f5] hover:border-[#2f5d50]/40 transition-colors">
                    <div className="space-y-2 text-center">
                      <Upload className="mx-auto h-6 w-6 text-[#d4a373]" />
                      <div className="flex text-xs text-[#6b7280] justify-center">
                        <label className="relative cursor-pointer font-bold text-[#2f5d50] hover:text-[#2c2c2c] transition-colors">
                          <span>Upload progress photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files) setProofFile(e.target.files[0]);
                            }}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-[#6b7280]/40">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                  </div>
                  {proofFile && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#2c2c2c]/85">
                      <FileText className="h-3.5 w-3.5 text-[#d4a373]" />
                      <span className="truncate max-w-xs">{proofFile.name}</span>
                    </div>
                  )}
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
                      'Post Milestone Stage'
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

export default TailorOrders;
