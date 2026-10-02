import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tailorAPI, orderAPI, appointmentAPI, getImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Star, Calendar, Scissors, ChevronLeft, Upload, FileText, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

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

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer: {
    name: string;
    profilePicture?: string;
  };
}

interface TailorDetails {
  tailor: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    city?: string;
    bio?: string;
    rating?: number;
    numReviews?: number;
    isVerified?: boolean;
  };
  services: Service[];
  reviews: Review[];
}

const TailorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [details, setDetails] = useState<TailorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showApptModal, setShowApptModal] = useState(false);

  // Styling Order form states
  const [orderNotes, setOrderNotes] = useState('');
  const [designFiles, setDesignFiles] = useState<File[]>([]);
  const [orderError, setOrderError] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Appointment booking form states
  const [apptDate, setApptDate] = useState('');
  const [apptSlot, setApptSlot] = useState('10:00 AM');
  const [apptNotes, setApptNotes] = useState('');
  const [apptError, setApptError] = useState('');
  const [apptSubmitting, setApptSubmitting] = useState(false);
  const [apptSuccess, setApptSuccess] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const res = await tailorAPI.getTailorDetails(id);
        setDetails(res.data);
      } catch (err) {
        console.error('Failed to load tailor details', err);
        setError('Artisan profile not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeService || !id) return;
    setOrderError('');
    setOrderSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('serviceId', activeService._id);
      formData.append('notes', orderNotes);

      if (user?.measurements) {
        formData.append('selectedMeasurements', JSON.stringify(user.measurements));
      }

      designFiles.forEach((file) => {
        formData.append('designReferences', file);
      });

      await orderAPI.placeOrder(formData);
      setOrderSuccess(true);
      setOrderNotes('');
      setDesignFiles([]);
      setTimeout(() => {
        setShowOrderModal(false);
        setOrderSuccess(false);
        navigate('/orders');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setOrderError(err.response?.data?.message || 'Failed to submit design order.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setApptError('');
    setApptSubmitting(true);

    try {
      await appointmentAPI.bookAppointment({
        tailorId: id,
        date: apptDate,
        timeSlot: apptSlot,
        notes: apptNotes,
      });
      setApptSuccess(true);
      setApptDate('');
      setApptNotes('');
      setTimeout(() => {
        setShowApptModal(false);
        setApptSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setApptError(err.response?.data?.message || 'Failed to request consultation slot.');
    } finally {
      setApptSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDesignFiles(Array.from(e.target.files));
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf8f5]">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-[#2f5d50]"></div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] text-[#2c2c2c] pt-20">
        <div className="text-center p-8 bg-white border border-[#e8e4de] max-w-md shadow-lg rounded-lg">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="font-serif text-xl tracking-wider uppercase mb-2">Error Loading Profile</h3>
          <p className="text-xs text-[#6b7280] mb-6">{error || 'Something went wrong.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-[#2f5d50] text-xs uppercase tracking-widest text-white bg-[#2f5d50] hover:bg-transparent hover:text-[#2f5d50] transition-all rounded-none"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const { tailor, services, reviews } = details;

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Studio Header */}
      <div className="mx-auto max-w-5xl mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#2f5d50] hover:text-[#2c2c2c] transition-colors mb-6 border-b border-[#2f5d50]/20 pb-0.5"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to marketplace
        </button>

        {/* Profile Card */}
        <div className="bg-white border border-[#e8e4de] p-6 sm:p-10 shadow-sm rounded-lg">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={getImageUrl(tailor.profilePicture) || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&fit=crop'}
              alt={tailor.name}
              className="h-28 w-28 sm:h-36 sm:w-36 rounded-full border border-[#e8e4de] object-cover"
            />
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2c2c2c] uppercase">
                      {tailor.name}
                    </h1>
                    {tailor.isVerified && (
                      <span title="Verified Atelier">
                        <CheckCircle2 className="h-5 w-5 text-[#a3b18a]" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 mt-2 text-[#6b7280] text-xs">
                    <MapPin className="h-4 w-4 text-[#d4a373]" />
                    <span>{tailor.city || 'Heritage Studio'}</span>
                  </div>
                </div>

                {user?.role === 'customer' && (
                  <button
                    onClick={() => setShowApptModal(true)}
                    className="self-center sm:self-auto flex items-center gap-2 px-6 py-3 border border-[#2f5d50] bg-[#2f5d50] text-xs font-bold uppercase tracking-widest text-white hover:bg-transparent hover:text-[#2f5d50] transition-all duration-300 rounded-none shadow-md shadow-[#2f5d50]/10"
                  >
                    <Calendar className="h-4 w-4" />
                    Book Consultation
                  </button>
                )}
              </div>

              <div className="h-px bg-[#e8e4de] my-5"></div>

              <p className="text-xs sm:text-sm text-[#6b7280] leading-relaxed italic">
                "{tailor.bio || 'Creating luxury garments customized perfectly for you.'}"
              </p>

              {/* Rating summary */}
              <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
                <div className="flex items-center gap-1 text-[#d4a373]">
                  <Star className="h-4 w-4 fill-[#d4a373]" />
                  <span className="text-xs font-bold text-[#2c2c2c]">
                    {tailor.rating ? tailor.rating.toFixed(1) : '5.0'}
                  </span>
                </div>
                <span className="text-[#e8e4de]">|</span>
                <span className="text-[10px] text-[#6b7280] uppercase tracking-wider font-bold">
                  {tailor.numReviews || 0} client reviews
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Services / Catalog list */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase border-b border-[#e8e4de] pb-3 flex items-center gap-2">
            <Scissors className="h-5 w-5 text-[#2f5d50] transform rotate-45" />
            Bespoke catalog
          </h2>

          {services.length === 0 ? (
            <div className="text-center py-12 border border-[#e8e4de] bg-white rounded-lg">
              <p className="text-xs text-[#6b7280]">This atelier has not published services yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="bg-white border border-[#e8e4de] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#2f5d50]/40 hover:shadow-md transition-all rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <span className="bg-[#a3b18a]/10 text-[#2f5d50] text-[9px] font-bold tracking-widest uppercase border border-[#a3b18a]/20 px-2 py-0.5 rounded-sm">
                      {service.category?.name || 'Couture'}
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#2c2c2c] tracking-wider uppercase pt-1">
                      {service.name}
                    </h3>
                    <p className="text-xs text-[#6b7280] leading-relaxed">
                      {service.description}
                    </p>
                    <p className="text-[10px] text-[#d4a373] uppercase tracking-wider font-bold">
                      Est. Turnaround: <span className="text-[#2c2c2c]">{service.baseTimeDays} Days</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-lg font-serif font-bold text-[#2c2c2c] mb-2 sm:mb-3">
                      ${service.price}
                    </div>
                    {user?.role === 'customer' && (
                      <button
                        onClick={() => {
                          setActiveService(service);
                          setShowOrderModal(true);
                        }}
                        className="px-5 py-2.5 border border-[#2f5d50] bg-[#2f5d50] text-[10px] font-bold uppercase tracking-widest text-white hover:bg-transparent hover:text-[#2f5d50] transition-colors rounded-none"
                      >
                        Request Stitch
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews panel */}
        <div className="space-y-6">
          <h2 className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase border-b border-[#e8e4de] pb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#2f5d50]" />
            Client Reviews
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12 border border-[#e8e4de] bg-white rounded-lg">
              <p className="text-xs text-[#6b7280]">No reviews published yet for this atelier.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white border border-[#e8e4de] p-5 space-y-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(rev.customer.profilePicture) || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&fit=crop'}
                      alt={rev.customer.name}
                      className="h-8 w-8 rounded-full border border-[#e8e4de] object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#2c2c2c]">{rev.customer.name}</h4>
                      <p className="text-[10px] text-[#6b7280]/60">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < rev.rating ? 'text-[#d4a373] fill-[#d4a373]' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#6b7280] leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Styling Stitching Request */}
      {showOrderModal && activeService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-[#e8e4de] p-6 sm:p-8 space-y-6 relative overflow-y-auto max-h-[90vh] rounded-lg shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e8e4de] pb-4">
              <h3 className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase">
                Bespoke Order Request
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-xs font-bold text-[#6b7280] hover:text-[#2c2c2c] uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            {orderSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-[#2f5d50] mx-auto animate-pulse" />
                <h4 className="font-serif text-lg text-[#2c2c2c] uppercase tracking-wider">Order Submitted</h4>
                <p className="text-xs text-[#6b7280]">Your request has been sent to the atelier.</p>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div className="bg-[#faf8f5] p-4 border border-[#e8e4de]">
                  <p className="text-[10px] text-[#2f5d50] uppercase tracking-widest font-bold">Selected Service</p>
                  <p className="font-serif text-base font-bold text-[#2c2c2c] mt-1">{activeService.name}</p>
                  <p className="text-xs text-[#6b7280] mt-1">${activeService.price} • turn-around {activeService.baseTimeDays} Days</p>
                </div>

                {orderError && (
                  <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-500">
                    <AlertCircle className="h-4.5 w-4.5" />
                    <span>{orderError}</span>
                  </div>
                )}

                {/* Measurements note */}
                <div className="bg-[#faf8f5] p-3 border border-[#e8e4de] text-[11px] text-[#2f5d50] leading-relaxed">
                  <strong>Measurement Profile Linked:</strong> Your active measurement records (Upper Body, Lower Body, and Accent indices) will automatically attach to this order so the artisan can tailor to your frame.
                </div>

                {/* Custom styling notes */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Design Notes & Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific notes regarding fabric selection, neck style modifications, cuffs etc."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
                  />
                </div>

                {/* Reference File Uploader */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Design References / Drawings (Max 5 files)
                  </label>
                  <div className="mt-1 flex justify-center border border-dashed border-[#e8e4de] px-6 py-6 bg-[#faf8f5] hover:border-[#2f5d50]/40 transition-colors">
                    <div className="space-y-2 text-center">
                      <Upload className="mx-auto h-6 w-6 text-[#d4a373]" />
                      <div className="flex text-xs text-[#6b7280] justify-center">
                        <label className="relative cursor-pointer font-bold text-[#2f5d50] hover:text-[#2c2c2c] transition-colors">
                          <span>Upload reference files</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-[#6b7280]/40">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                  </div>

                  {designFiles.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] text-[#2f5d50] font-bold uppercase tracking-widest">Uploaded files ({designFiles.length})</p>
                      {designFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-[#2c2c2c]/80">
                          <FileText className="h-3.5 w-3.5 text-[#d4a373]" />
                          <span className="truncate max-w-xs">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    className="w-full flex justify-center items-center gap-2 border border-[#2f5d50] bg-[#2f5d50] py-3.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-transparent hover:text-[#2f5d50] transition-all rounded-none"
                  >
                    {orderSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2f5d50] border-t-transparent"></div>
                    ) : (
                      'Confirm Custom Order'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Appointment Request */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#e8e4de] p-6 sm:p-8 space-y-6 relative rounded-lg shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e8e4de] pb-4">
              <h3 className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase">
                Book Consultation
              </h3>
              <button
                onClick={() => setShowApptModal(false)}
                className="text-xs font-bold text-[#6b7280] hover:text-[#2c2c2c] uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            {apptSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-[#2f5d50] mx-auto" />
                <h4 className="font-serif text-lg text-[#2c2c2c] uppercase tracking-wider">Request Sent</h4>
                <p className="text-xs text-[#6b7280]">Artisan will review your slot availability.</p>
              </div>
            ) : (
              <form onSubmit={handleApptSubmit} className="space-y-4">
                {apptError && (
                  <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-500">
                    <AlertCircle className="h-4.5 w-4.5" />
                    <span>{apptError}</span>
                  </div>
                )}

                {/* Consultation Date */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 font-sans text-xs text-[#2c2c2c] outline-none focus:border-[#2f5d50]"
                  />
                </div>

                {/* Time Slot Select */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={apptSlot}
                    onChange={(e) => setApptSlot(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2.5 px-3 font-sans text-xs text-[#2c2c2c] outline-none focus:border-[#2f5d50]"
                  >
                    <option value="10:00 AM">10:00 AM - Morning Consultation</option>
                    <option value="11:30 AM">11:30 AM - Morning Consultation</option>
                    <option value="02:00 PM">02:00 PM - Afternoon Consultation</option>
                    <option value="03:30 PM">03:30 PM - Afternoon Consultation</option>
                    <option value="05:00 PM">05:00 PM - Evening Consultation</option>
                  </select>
                </div>

                {/* Booking Notes */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Aspiration / Style Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g. looking to design custom bridalwear, discuss suit material preferences, etc."
                    value={apptNotes}
                    onChange={(e) => setApptNotes(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2.5 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={apptSubmitting}
                    className="w-full flex justify-center items-center gap-2 border border-[#2f5d50] bg-[#2f5d50] py-3.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-transparent hover:text-[#2f5d50] transition-all rounded-none"
                  >
                    {apptSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2f5d50] border-t-transparent"></div>
                    ) : (
                      'Schedule Consultation'
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

export default TailorDetail;
