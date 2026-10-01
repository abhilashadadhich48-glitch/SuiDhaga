import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { Star, ShieldAlert, CheckCircle2, Eye } from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  tailor: {
    _id: string;
    name: string;
    city?: string;
  };
  service: {
    name: string;
    price: number;
  };
  price: number;
  status: string;
  designReferences: string[];
  notes?: string;
  createdAt: string;
  milestoneTimeline: {
    status: string;
    note: string;
    timestamp: string;
    mediaUrl?: string;
  }[];
}

const CustomerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Review state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Detail Modal state
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setReviewError('');
    setReviewSubmitting(true);

    try {
      await orderAPI.createReview(selectedOrder._id, {
        rating,
        comment,
      });
      setReviewSuccess(true);
      setComment('');
      setRating(5);
      // reload
      await fetchOrders();
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
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
      {/* Page Header */}
      <div className="mx-auto max-w-6xl text-center mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-widest text-[#2c2c2c] uppercase">
          Your Stitching <span className="text-[#2f5d50] italic font-normal">Orders</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xs text-[#6b7280] font-sans tracking-wide">
          Track production milestones, view textile sourcing updates, and upload styling blueprints.
        </p>
        <div className="mt-4 h-[1px] w-20 bg-[#e8e4de] mx-auto"></div>
      </div>

      <div className="mx-auto max-w-5xl">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#e8e4de] rounded-lg">
            <ShieldAlert className="h-10 w-10 text-[#d4a373]/40 mx-auto mb-4" />
            <h3 className="font-serif text-lg text-[#2c2c2c] tracking-wider uppercase">
              No active stitching requests
            </h3>
            <p className="mt-1 text-xs text-[#6b7280]">
              Browse expert tailors to request customized fittings.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const activeMilestone = order.milestoneTimeline[order.milestoneTimeline.length - 1];

              return (
                <div
                  key={order._id}
                  className="bg-white border border-[#e8e4de] p-6 hover:shadow-md transition-all rounded-lg"
                >
                  {/* Top Bar Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8e4de] pb-4 mb-4">
                    <div>
                      <span className="text-[9px] bg-[#faf8f5] border border-[#e8e4de] px-2 py-0.5 font-mono text-[#6b7280] rounded-sm">
                        ID: {order._id.substring(18).toUpperCase()}
                      </span>
                      <h3 className="font-serif text-base font-bold text-[#2c2c2c] tracking-wider uppercase mt-1">
                        {order.service?.name}
                      </h3>
                      <p className="text-[10px] text-[#6b7280] mt-0.5">
                        Atelier: <span className="text-[#2f5d50] font-semibold">{order.tailor.name}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-[#6b7280] uppercase tracking-widest">Order Total</p>
                        <p className="font-serif text-base font-bold text-[#2c2c2c]">${order.price}</p>
                      </div>
                      <span className="bg-[#2f5d50]/10 text-[#2f5d50] border border-[#2f5d50]/20 text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-sm">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Latest Milestone / Status Progress */}
                  {activeMilestone && (
                    <div className="bg-[#faf8f5] p-4 border border-[#e8e4de] mb-6 rounded-md">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-[10px] text-[#d4a373] uppercase tracking-widest font-extrabold">
                            Latest Progress
                          </p>
                          <p className="text-xs text-[#2c2c2c] font-semibold mt-0.5">
                            {activeMilestone.status}
                          </p>
                          <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">
                            {activeMilestone.note}
                          </p>
                        </div>
                        {activeMilestone.mediaUrl && (
                          <div className="shrink-0">
                            <img
                              src={activeMilestone.mediaUrl}
                              alt="Fabric Sourcing Proof"
                              className="h-12 w-12 object-cover border border-[#e8e4de] rounded-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 items-center justify-between border-t border-[#e8e4de] pt-4">
                    <p className="text-[10px] text-[#6b7280]/60">
                      Placed:{' '}
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-[#e8e4de] hover:border-[#2f5d50] hover:text-[#2f5d50] text-[10px] font-bold uppercase tracking-widest text-[#2c2c2c] transition-colors rounded-none"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Full Timeline
                      </button>

                      {order.status === 'Delivered' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowReviewModal(true);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 border border-[#d4a373] bg-[#d4a373] hover:bg-[#b88a5c] text-[10px] font-bold uppercase tracking-widest text-white transition-colors rounded-none"
                        >
                          <Star className="h-3.5 w-3.5 fill-white" />
                          Review Atelier
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: Full Production Timeline Detail */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-[#e8e4de] p-6 sm:p-8 space-y-6 relative overflow-y-auto max-h-[90vh] rounded-lg shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e8e4de] pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase">
                  Production Log
                </h3>
                <p className="text-[10px] text-[#6b7280] uppercase tracking-wider mt-0.5">
                  Atelier: {viewingOrder.tailor.name}
                </p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-xs font-bold text-[#6b7280] hover:text-[#2c2c2c] uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            {/* Timeline nodes */}
            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e8e4de]">
              {viewingOrder.milestoneTimeline.map((stone, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {/* Indicator Dot */}
                  <div className="h-7 w-7 rounded-full bg-white border-2 border-[#2f5d50] flex items-center justify-center shrink-0 z-10">
                    <div className="h-2 w-2 rounded-full bg-[#d4a373]"></div>
                  </div>

                  <div className="space-y-1 bg-[#faf8f5] p-3.5 border border-[#e8e4de] rounded-md w-full">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#2c2c2c] tracking-wider uppercase">
                        {stone.status}
                      </h4>
                      <span className="text-[9px] text-[#6b7280]">
                        {new Date(stone.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#6b7280] leading-relaxed">
                      {stone.note}
                    </p>

                    {stone.mediaUrl && (
                      <div className="mt-2.5">
                        <p className="text-[9px] text-[#2f5d50] font-bold uppercase tracking-widest mb-1">
                          Media Proof Attachments
                        </p>
                        <a
                          href={stone.mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block relative group"
                        >
                          <img
                            src={stone.mediaUrl}
                            alt="Stitch update verification"
                            className="h-24 w-auto object-cover border border-[#e8e4de] hover:opacity-90 transition-opacity"
                          />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Review Submission */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#e8e4de] p-6 sm:p-8 space-y-6 relative rounded-lg shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e8e4de] pb-4">
              <h3 className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase">
                Submit Atelier Review
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-xs font-bold text-[#6b7280] hover:text-[#2c2c2c] uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            {reviewSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-[#2f5d50] mx-auto" />
                <h4 className="font-serif text-lg text-[#2c2c2c] uppercase tracking-wider">Review Submitted</h4>
                <p className="text-xs text-[#6b7280]">Thank you for your valuable craftsmanship feedback!</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewError && (
                  <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-500">
                    <ShieldAlert className="h-4.5 w-4.5" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {/* Star rating selection */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Quality Rating
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-[#d4a373] hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating ? 'fill-[#d4a373]' : 'text-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Describe fitting & design experience
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Comment on sleeve fittings, raw materials quality, fabric comfort and artisan hand-stitching..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full flex justify-center items-center gap-2 border border-[#2f5d50] bg-[#2f5d50] py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-transparent hover:text-[#2f5d50] transition-colors rounded-none"
                  >
                    {reviewSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      'Publish Review'
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

export default CustomerOrders;
