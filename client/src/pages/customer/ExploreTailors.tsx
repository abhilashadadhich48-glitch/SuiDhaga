import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tailorAPI, categoryAPI } from '../../services/api';
import { Search, MapPin, Star, Sparkles, SlidersHorizontal, Heart, Users, Scissors, Award, ChevronRight } from 'lucide-react';

interface Tailor {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  city?: string;
  bio?: string;
  rating?: number;
  numReviews?: number;
  isVerified?: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

const ExploreTailors: React.FC = () => {
  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [styleFilter, setStyleFilter] = useState('');

  // Wishlist local toggle for UX polish
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  const loadTailors = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (city) params.city = city;
      if (category) params.category = category;

      const res = await tailorAPI.getTailors(params);
      setTailors(res.data);
    } catch (err) {
      console.error('Failed to load tailors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadTailors();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, city, category]);

  const toggleWishlist = (id: string) => {
    setWishlistedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Mock avatar array for customer trusted badge
  const avatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-24 pb-20">
      
      {/* 1. Header Search & Navigation Bar (Styled exactly like mockup) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white border border-[#e8e4de] px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm rounded-lg">
          {/* Logo T */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="h-10 w-10 flex items-center justify-center border border-[#e8e4de] rounded-md bg-[#faf8f5]">
              <span className="font-serif text-xl font-bold text-[#2f5d50]">T</span>
            </div>
            {/* Search Input field */}
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
              <input
                type="text"
                placeholder="Search tailors, bios, styles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 pl-10 pr-12 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50] rounded-md transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[#6b7280]/50 border border-[#e8e4de] px-1 rounded-sm hidden sm:inline">
                ⌘ K
              </span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                setCategory('');
                setCity('');
                setSearch('');
              }}
              className="bg-[#2f5d50] hover:bg-[#204037] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors rounded-md flex items-center gap-1.5"
            >
              All Ateliers
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('filters-sidebar');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#e8e4de] bg-[#faf8f5] text-[10px] font-bold uppercase tracking-widest text-[#2c2c2c] rounded-md hover:border-[#2f5d50] transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#d4a373]" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* 2. Premium Image-Fade Hero Banner (Styled exactly like mockup) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative bg-white border border-[#e8e4de] rounded-xl overflow-hidden shadow-sm flex flex-col lg:flex-row min-h-[460px]">
          {/* Content Block (Left Column) */}
          <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-between z-10 space-y-8">
            <div className="space-y-5">
              <div className="flex items-center gap-1 text-[10px] text-[#d4a373] uppercase tracking-widest font-extrabold">
                <span>Find your perfect stitch</span>
                <span>✨</span>
              </div>
              
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2c2c2c] leading-[1.15]">
                Discover Exceptional<br />
                <span className="text-[#d4a373] italic font-normal font-serif">Tailors & Ateliers</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#6b7280] leading-relaxed max-w-md">
                Connect with skilled artisans who bring your vision to life with precision and style. Link your measurements dynamically.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('ateliers-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#2f5d50] hover:bg-[#204037] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-md flex items-center gap-2 shadow-md shadow-[#2f5d50]/15"
                >
                  Explore Ateliers
                  <span className="text-sm font-semibold">→</span>
                </button>
              </div>
            </div>

            {/* Social Trusted Proof */}
            <div className="flex items-center gap-3 pt-6 border-t border-[#e8e4de]/60">
              <div className="flex -space-x-2">
                {avatars.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Happy customer"
                    className="h-7 w-7 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ))}
              </div>
              <p className="text-[11px] text-[#6b7280] font-sans">
                Trusted by <span className="text-[#2f5d50] font-bold">2K+ happy customers</span>
              </p>
            </div>
          </div>

          {/* Visual Block with Transparent Fade (Right Column) */}
          <div className="w-full lg:w-1/2 bg-[#eae6df] flex items-center justify-center p-8 lg:p-12 relative min-h-[350px] lg:min-h-auto border-l border-[#e8e4de]">
            {/* Elegant Lookbook Picture Card */}
            <div className="relative w-full max-w-sm aspect-[4/3] bg-white p-4 shadow-xl border border-[#e8e4de] transform -rotate-1 hover:rotate-0 transition-transform duration-500 rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&q=80"
                alt="Bespoke Atelier Workspace"
                className="w-full h-full object-cover rounded filter brightness-[0.98] contrast-[1.02]"
              />
            </div>

            {/* Premium Quality Overlay Badge Card */}
            <div className="absolute bottom-6 right-6 bg-[#2f5d50] border border-[#c5a880]/30 p-4 max-w-[240px] text-white shadow-xl rounded-lg z-10 flex gap-3 items-start">
              <Sparkles className="h-5 w-5 text-[#c5a880] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#c5a880]">Premium Quality</h4>
                <p className="text-[10px] text-white/90 leading-relaxed mt-1">
                  Handpicked ateliers verified for excellence and custom stitching craftsmanship.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Statistics Dashboard Panel (Styled exactly like mockup) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white border border-[#e8e4de] p-6 sm:py-8 shadow-sm rounded-xl grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Stat 1 */}
          <div className="flex items-center gap-4 justify-center border-r border-[#e8e4de]/60 last:border-r-0">
            <div className="h-10 w-10 rounded-full bg-[#faf8f5] border border-[#e8e4de] flex items-center justify-center text-[#2f5d50] shrink-0">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-serif text-lg sm:text-xl font-bold text-[#2c2c2c]">500+</p>
              <p className="text-[10px] text-[#6b7280] uppercase tracking-wider mt-0.5 leading-none">Verified Ateliers</p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-4 justify-center md:border-r border-[#e8e4de]/60">
            <div className="h-10 w-10 rounded-full bg-[#faf8f5] border border-[#e8e4de] flex items-center justify-center text-[#d4a373] shrink-0">
              <Star className="h-4.5 w-4.5 fill-[#d4a373] text-[#d4a373]" />
            </div>
            <div>
              <p className="font-serif text-lg sm:text-xl font-bold text-[#2c2c2c]">4.9 ★</p>
              <p className="text-[10px] text-[#6b7280] uppercase tracking-wider mt-0.5 leading-none">Average Rating</p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-4 justify-center border-r border-[#e8e4de]/60 last:border-r-0">
            <div className="h-10 w-10 rounded-full bg-[#faf8f5] border border-[#e8e4de] flex items-center justify-center text-[#2f5d50] shrink-0">
              <Scissors className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-serif text-lg sm:text-xl font-bold text-[#2c2c2c]">50+</p>
              <p className="text-[10px] text-[#6b7280] uppercase tracking-wider mt-0.5 leading-none">Styles & Specialties</p>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="flex items-center gap-4 justify-center">
            <div className="h-10 w-10 rounded-full bg-[#faf8f5] border border-[#e8e4de] flex items-center justify-center text-[#2f5d50] shrink-0">
              <Award className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-serif text-lg sm:text-xl font-bold text-[#2c2c2c]">25+</p>
              <p className="text-[10px] text-[#6b7280] uppercase tracking-wider mt-0.5 leading-none">Cities Covered</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Split Layout: Featured Ateliers & Sidebar Refinement (Styled exactly like mockup) */}
      <div id="ateliers-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Featured Ateliers Grid (Width: 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-[#e8e4de] pb-3.5">
              <div>
                <h2 className="font-serif text-xl font-bold tracking-wider text-[#2c2c2c] uppercase flex items-center gap-2">
                  Featured Ateliers
                  <span className="text-sm font-semibold">✨</span>
                </h2>
                <p className="text-xs text-[#6b7280] mt-1">
                  Handpicked ateliers known for their craftsmanship and client satisfaction.
                </p>
              </div>
              <button
                onClick={() => {
                  setCategory('');
                  setCity('');
                  setSearch('');
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-[#2f5d50] hover:text-[#d4a373] transition-colors flex items-center gap-1"
              >
                View all ateliers
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-[#2f5d50]"></div>
              </div>
            ) : tailors.length === 0 ? (
              <div className="frame-double max-w-xl mx-auto shadow-sm">
                <div className="text-center py-16 px-8 bg-white rounded-lg space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#faf8f5] border border-[#e8e4de]">
                    <Sparkles className="h-5 w-5 text-[#d4a373] animate-pulse" />
                  </div>
                  <h3 className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase">
                    No Ateliers Found
                  </h3>
                  <p className="max-w-md mx-auto text-xs text-[#6b7280] leading-relaxed">
                    We couldn't find matching tailoring studios. Try adjusting your search queries or clearing your city filters.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setCategory('');
                        setCity('');
                        setSearch('');
                      }}
                      className="px-6 py-2 border border-[#2f5d50] text-[#2f5d50] hover:bg-[#2f5d50] hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded-md"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {tailors.map((tailor) => {
                  const isWishlisted = wishlistedIds.includes(tailor._id);
                  
                  const coverImg = tailor.profilePicture || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&fit=crop';

                  return (
                    <div
                      key={tailor._id}
                      className="group relative bg-white border border-[#e8e4de] hover:border-[#2f5d50]/30 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#e8e4de]/30 rounded-xl transition-all duration-500 flex flex-col justify-between"
                    >
                      <Link to={`/tailor/${tailor._id}`} className="block flex-grow flex flex-col justify-between">
                        {/* Photo Header */}
                        <div className="relative overflow-hidden h-48 bg-[#faf8f5]">
                          <img
                            src={coverImg}
                            alt={tailor.name}
                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                          />
                          {/* Rating overlay badge top left */}
                          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-[#e8e4de] px-2.5 py-1 flex items-center gap-1 rounded-full shadow-sm text-xs font-bold text-[#2c2c2c] z-10">
                            <Star className="h-3 w-3 text-[#d4a373] fill-[#d4a373]" />
                            <span>{tailor.rating ? tailor.rating.toFixed(1) : '4.9'}</span>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="font-serif text-base font-bold text-[#2c2c2c] tracking-wider group-hover:text-[#2f5d50] transition-colors">
                              {tailor.name}
                            </h3>
                            <p className="text-[10px] text-[#6b7280] uppercase tracking-widest mt-1 font-semibold">
                              {tailor.name.includes('Sabyasachi')
                                ? 'Bespoke • Bridal • Couture'
                                : tailor.name.includes('Raymond')
                                ? 'Suits • Menswear • Custom'
                                : 'Ethnic • Indo-Western • Custom'}
                            </p>
                          </div>

                          {/* Location Bottom */}
                          <div className="border-t border-[#e8e4de]/60 pt-4 flex items-center text-[11px] text-[#6b7280]">
                            <MapPin className="h-3.5 w-3.5 text-[#d4a373] mr-1.5" />
                            <span>{tailor.city || 'Mumbai'}</span>
                          </div>
                        </div>
                      </Link>

                      {/* Heart wishlist top right (Ignored from link block) */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(tailor._id);
                        }}
                        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm border border-[#e8e4de] text-[#6b7280] hover:text-red-500 transition-colors shadow-sm z-20"
                      >
                        <Heart
                          className={`h-4.5 w-4.5 ${
                            isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#6b7280]'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Column: Refine Your Search (Width: 1/3) */}
          <div id="filters-sidebar" className="lg:col-span-1">
            <div className="bg-white border border-[#e8e4de] p-6 shadow-sm rounded-xl space-y-6 sticky top-28">
              <div className="flex items-center justify-between border-b border-[#e8e4de] pb-3.5">
                <h3 className="font-serif text-base font-bold tracking-wider text-[#2c2c2c] uppercase">
                  Refine Your Search
                </h3>
                <SlidersHorizontal className="h-4 w-4 text-[#d4a373]" />
              </div>

              <div className="space-y-4">
                {/* 1. Location selection */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter city or area"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2.5 pl-3 pr-10 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50] rounded-md transition-colors"
                    />
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4a373]" />
                  </div>
                </div>

                {/* 2. Specialty selection */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Specialty Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2.5 px-3 font-sans text-xs text-[#2c2c2c] outline-none focus:border-[#2f5d50] rounded-md"
                  >
                    <option value="">Select specialty</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Style selection */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Style Preference
                  </label>
                  <select
                    value={styleFilter}
                    onChange={(e) => setStyleFilter(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2.5 px-3 font-sans text-xs text-[#2c2c2c] outline-none focus:border-[#2f5d50] rounded-md"
                  >
                    <option value="">Select style</option>
                    <option value="royal">Royal Bespoke</option>
                    <option value="contemporary">Contemporary Modern</option>
                    <option value="minimalist">Minimalist / Formal</option>
                    <option value="traditional">Traditional Craft</option>
                  </select>
                </div>

                {/* 4. Price range selection */}
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    Price Range
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2.5 px-3 font-sans text-xs text-[#2c2c2c] outline-none focus:border-[#2f5d50] rounded-md"
                  >
                    <option value="">Select price range</option>
                    <option value="under500">Under $500</option>
                    <option value="500to1500">$500 - $1,500</option>
                    <option value="over1500">Above $1,500</option>
                  </select>
                </div>
              </div>

              {/* Apply / Clear Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => loadTailors()}
                  className="w-full flex justify-center items-center gap-2 bg-[#2f5d50] hover:bg-[#204037] text-white py-3 text-xs font-bold uppercase tracking-widest transition-colors rounded-md"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    setCategory('');
                    setCity('');
                    setSearch('');
                    setPriceRange('');
                    setStyleFilter('');
                  }}
                  className="w-full py-2.5 border border-[#e8e4de] hover:border-red-400 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] hover:text-red-500 transition-colors rounded-md bg-[#faf8f5]"
                >
                  Reset Parameters
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ExploreTailors;
