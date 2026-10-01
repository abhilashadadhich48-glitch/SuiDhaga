import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Ruler, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

type ActiveField =
  | 'chest'
  | 'shoulder'
  | 'waist'
  | 'sleeveLength'
  | 'hip'
  | 'inseam'
  | 'outseam'
  | 'neck'
  | 'wrist'
  | 'ankle'
  | null;

const MeasurementProfile: React.FC = () => {
  const { user, updateUserMeasurements } = useAuth();

  const [activeTab, setActiveTab] = useState<'upper' | 'lower' | 'accents'>('upper');
  const [activeField, setActiveField] = useState<ActiveField>(null);

  // Form States
  const [upperBody, setUpperBody] = useState({
    chest: 0,
    shoulder: 0,
    waist: 0,
    sleeveLength: 0,
  });

  const [lowerBody, setLowerBody] = useState({
    hip: 0,
    inseam: 0,
    outseam: 0,
    waist: 0,
  });

  const [accents, setAccents] = useState({
    neck: 0,
    wrist: 0,
    ankle: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Hydrate fields from user context
  useEffect(() => {
    if (user?.measurements) {
      const ms = user.measurements;
      if (ms.upperBody) {
        setUpperBody({
          chest: ms.upperBody.chest || 0,
          shoulder: ms.upperBody.shoulder || 0,
          waist: ms.upperBody.waist || 0,
          sleeveLength: ms.upperBody.sleeveLength || 0,
        });
      }
      if (ms.lowerBody) {
        setLowerBody({
          hip: ms.lowerBody.hip || 0,
          inseam: ms.lowerBody.inseam || 0,
          outseam: ms.lowerBody.outseam || 0,
          waist: ms.lowerBody.waist || 0,
        });
      }
      if (ms.accents) {
        setAccents({
          neck: ms.accents.neck || 0,
          wrist: ms.accents.wrist || 0,
          ankle: ms.accents.ankle || 0,
        });
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError('');

    try {
      await updateUserMeasurements({
        upperBody,
        lowerBody,
        accents,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save measurement profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFocus = (field: ActiveField) => {
    setActiveField(field);
    if (['chest', 'shoulder', 'sleeveLength'].includes(field || '')) {
      setActiveTab('upper');
    } else if (['hip', 'inseam', 'outseam'].includes(field || '')) {
      setActiveTab('lower');
    } else if (['neck', 'wrist', 'ankle'].includes(field || '')) {
      setActiveTab('accents');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mx-auto max-w-7xl text-center mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-widest text-[#2c2c2c] uppercase">
          Anatomical <span className="text-[#2f5d50] italic font-normal">Measurements</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xs text-[#6b7280] font-sans tracking-wide">
          Define your bespoke sizing profile. These dimensions are securely encrypted and automatically attached to couture stitching requests.
        </p>
        <div className="mt-4 h-[1px] w-20 bg-[#e8e4de] mx-auto"></div>
      </div>

      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Interactive Mannequin SVG Panel */}
        <div className="flex flex-col items-center justify-center bg-white border border-[#e8e4de] p-8 min-h-[500px] shadow-sm rounded-lg relative">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#2f5d50] font-bold">
            <Ruler className="h-4 w-4 text-[#d4a373]" />
            Interactive Couture Mannequin
          </div>

          {/* Styled SVG Mannequin */}
          <svg
            viewBox="0 0 200 450"
            className="w-full max-w-[280px] h-auto"
          >
            {/* Mannequin Stand */}
            <line x1="100" y1="360" x2="100" y2="430" stroke="#e8e4de" strokeWidth="2" />
            <path d="M 70 430 L 130 430" stroke="#e8e4de" strokeWidth="3" />

            {/* Mannequin Outline (Body Form) */}
            {/* Head/Neck */}
            <path
              d="M 90 60 C 90 40, 110 40, 110 60 C 110 75, 90 75, 90 60"
              fill="none"
              stroke={activeField === 'neck' ? '#2f5d50' : '#2c2c2c'}
              strokeWidth={activeField === 'neck' ? '3' : '1'}
              opacity={activeField === 'neck' ? '1' : '0.25'}
              className="transition-all duration-300"
            />
            {/* Neck to Shoulders */}
            <path
              d="M 96 74 C 92 84, 75 90, 70 95"
              fill="none"
              stroke="#2c2c2c"
              strokeWidth="1"
              opacity="0.25"
            />
            <path
              d="M 104 74 C 108 84, 125 90, 130 95"
              fill="none"
              stroke="#2c2c2c"
              strokeWidth="1"
              opacity="0.25"
            />

            {/* Shoulder Line */}
            <line
              x1="70"
              y1="95"
              x2="130"
              y2="95"
              stroke={activeField === 'shoulder' ? '#2f5d50' : '#2c2c2c'}
              strokeWidth={activeField === 'shoulder' ? '3' : '1.5'}
              opacity={activeField === 'shoulder' ? '1' : '0.3'}
              className="transition-all duration-300"
            />

            {/* Torso Outline */}
            <path
              d="M 70 95 C 65 140, 70 190, 80 220 C 85 240, 75 270, 70 300 C 65 330, 135 330, 130 300 C 125 270, 115 240, 120 220 C 130 190, 135 140, 130 95 Z"
              fill="#faf8f5"
              fillOpacity="0.8"
              stroke="#2c2c2c"
              strokeWidth="1"
              opacity="0.15"
            />

            {/* Chest Line */}
            <line
              x1="72"
              y1="135"
              x2="128"
              y2="135"
              stroke={activeField === 'chest' ? '#2f5d50' : '#2c2c2c'}
              strokeWidth={activeField === 'chest' ? '3' : '1'}
              opacity={activeField === 'chest' ? '1' : '0.25'}
              className="transition-all duration-300"
            />

            {/* Waist Line */}
            <line
              x1="77"
              y1="220"
              x2="123"
              y2="220"
              stroke={activeField === 'waist' ? '#2f5d50' : '#2c2c2c'}
              strokeWidth={activeField === 'waist' ? '3' : '1'}
              opacity={activeField === 'waist' ? '1' : '0.25'}
              className="transition-all duration-300"
            />

            {/* Hip Line */}
            <line
              x1="71"
              y1="290"
              x2="129"
              y2="290"
              stroke={activeField === 'hip' ? '#2f5d50' : '#2c2c2c'}
              strokeWidth={activeField === 'hip' ? '3' : '1'}
              opacity={activeField === 'hip' ? '1' : '0.25'}
              className="transition-all duration-300"
            />

            {/* Left Arm (Sleeve) */}
            <path
              d="M 70 95 L 50 200 L 40 250"
              fill="none"
              stroke={activeField === 'sleeveLength' ? '#2f5d50' : '#2c2c2c'}
              strokeWidth={activeField === 'sleeveLength' ? '3' : '1'}
              opacity={activeField === 'sleeveLength' ? '1' : '0.25'}
              className="transition-all duration-300"
            />

            {/* Wrist Line */}
            <circle
              cx="40"
              cy="250"
              r={activeField === 'wrist' ? '6' : '3'}
              fill={activeField === 'wrist' ? '#d4a373' : 'transparent'}
              stroke="#d4a373"
              strokeWidth="1.5"
              opacity={activeField === 'wrist' ? '1' : '0.35'}
              className="transition-all duration-300"
            />

            {/* Outseam Line (Leg Outer) */}
            <line
              x1="70"
              y1="300"
              x2="70"
              y2="410"
              stroke={activeField === 'outseam' ? '#2f5d50' : '#2c2c2c'}
              strokeWidth={activeField === 'outseam' ? '3' : '1'}
              opacity={activeField === 'outseam' ? '1' : '0.25'}
              className="transition-all duration-300"
            />

            {/* Inseam Line (Leg Inner) */}
            <line
              x1="90"
              y1="320"
              x2="85"
              y2="410"
              stroke={activeField === 'inseam' ? '#2f5d50' : '#2c2c2c'}
              strokeWidth={activeField === 'inseam' ? '3' : '1'}
              opacity={activeField === 'inseam' ? '1' : '0.25'}
              className="transition-all duration-300"
            />

            {/* Ankle Indicator */}
            <circle
              cx="70"
              cy="410"
              r={activeField === 'ankle' ? '6' : '3'}
              fill={activeField === 'ankle' ? '#d4a373' : 'transparent'}
              stroke="#d4a373"
              strokeWidth="1.5"
              opacity={activeField === 'ankle' ? '1' : '0.35'}
              className="transition-all duration-300"
            />
          </svg>

          {/* Active Field Readout */}
          <div className="mt-8 text-center min-h-[50px]">
            {activeField ? (
              <div>
                <p className="text-[10px] text-[#d4a373] uppercase tracking-widest font-extrabold">Active Region</p>
                <p className="font-serif text-lg text-[#2c2c2c] uppercase tracking-wider mt-0.5 font-bold">
                  {activeField.replace(/([A-Z])/g, ' $1')}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#6b7280] italic">
                Hover or click any input field to trace on the mannequin.
              </p>
            )}
          </div>
        </div>

        {/* Input Form Panel */}
        <div className="bg-white border border-[#e8e4de] p-6 sm:p-8 rounded-lg shadow-sm">
          {/* Tab Selector */}
          <div className="grid grid-cols-3 gap-2 border-b border-[#e8e4de] pb-4 mb-6">
            {(['upper', 'lower', 'accents'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all duration-300 ${
                  activeTab === tab
                    ? 'border-[#2f5d50] text-[#2f5d50]'
                    : 'border-transparent text-[#6b7280] hover:text-[#2c2c2c]'
                }`}
              >
                {tab} Body
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-500 mb-6">
              <AlertCircle className="h-4.5 w-4.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 border border-[#a3b18a]/20 bg-[#a3b18a]/10 p-3 text-xs text-[#2f5d50] mb-6">
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span>Measurement profile updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tab 1: Upper Body */}
            {activeTab === 'upper' && (
              <div className="space-y-4">
                {/* Chest */}
                <div>
                  <div className="flex justify-between text-xs font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    <span>Chest Circ. (inches)</span>
                    <span className="text-[#2c2c2c] font-mono">{upperBody.chest}"</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    step="0.5"
                    value={upperBody.chest}
                    onFocus={() => handleFocus('chest')}
                    onMouseEnter={() => handleFocus('chest')}
                    onChange={(e) => setUpperBody({ ...upperBody, chest: parseFloat(e.target.value) })}
                    className="w-full accent-[#d4a373] bg-[#faf8f5] h-2 rounded-lg cursor-pointer border border-[#e8e4de]"
                  />
                </div>

                {/* Shoulder */}
                <div>
                  <div className="flex justify-between text-xs font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    <span>Shoulder Width (inches)</span>
                    <span className="text-[#2c2c2c] font-mono">{upperBody.shoulder}"</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    step="0.5"
                    value={upperBody.shoulder}
                    onFocus={() => handleFocus('shoulder')}
                    onMouseEnter={() => handleFocus('shoulder')}
                    onChange={(e) => setUpperBody({ ...upperBody, shoulder: parseFloat(e.target.value) })}
                    className="w-full accent-[#d4a373] bg-[#faf8f5] h-2 rounded-lg cursor-pointer border border-[#e8e4de]"
                  />
                </div>

                {/* Waist */}
                <div>
                  <div className="flex justify-between text-xs font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    <span>Waist (inches)</span>
                    <span className="text-[#2c2c2c] font-mono">{upperBody.waist}"</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    step="0.5"
                    value={upperBody.waist}
                    onFocus={() => handleFocus('waist')}
                    onMouseEnter={() => handleFocus('waist')}
                    onChange={(e) => {
                      setUpperBody({ ...upperBody, waist: parseFloat(e.target.value) });
                      setLowerBody({ ...lowerBody, waist: parseFloat(e.target.value) });
                    }}
                    className="w-full accent-[#d4a373] bg-[#faf8f5] h-2 rounded-lg cursor-pointer border border-[#e8e4de]"
                  />
                </div>

                {/* Sleeve Length */}
                <div>
                  <div className="flex justify-between text-xs font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    <span>Sleeve Length (inches)</span>
                    <span className="text-[#2c2c2c] font-mono">{upperBody.sleeveLength}"</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    step="0.5"
                    value={upperBody.sleeveLength}
                    onFocus={() => handleFocus('sleeveLength')}
                    onMouseEnter={() => handleFocus('sleeveLength')}
                    onChange={(e) => setUpperBody({ ...upperBody, sleeveLength: parseFloat(e.target.value) })}
                    className="w-full accent-[#d4a373] bg-[#faf8f5] h-2 rounded-lg cursor-pointer border border-[#e8e4de]"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Lower Body */}
            {activeTab === 'lower' && (
              <div className="space-y-4">
                {/* Hip */}
                <div>
                  <div className="flex justify-between text-xs font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    <span>Hip Circ. (inches)</span>
                    <span className="text-[#2c2c2c] font-mono">{lowerBody.hip}"</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    step="0.5"
                    value={lowerBody.hip}
                    onFocus={() => handleFocus('hip')}
                    onMouseEnter={() => handleFocus('hip')}
                    onChange={(e) => setLowerBody({ ...lowerBody, hip: parseFloat(e.target.value) })}
                    className="w-full accent-[#d4a373] bg-[#faf8f5] h-2 rounded-lg cursor-pointer border border-[#e8e4de]"
                  />
                </div>

                {/* Inseam */}
                <div>
                  <div className="flex justify-between text-xs font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    <span>Inseam (inches)</span>
                    <span className="text-[#2c2c2c] font-mono">{lowerBody.inseam}"</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="45"
                    step="0.5"
                    value={lowerBody.inseam}
                    onFocus={() => handleFocus('inseam')}
                    onMouseEnter={() => handleFocus('inseam')}
                    onChange={(e) => setLowerBody({ ...lowerBody, inseam: parseFloat(e.target.value) })}
                    className="w-full accent-[#d4a373] bg-[#faf8f5] h-2 rounded-lg cursor-pointer border border-[#e8e4de]"
                  />
                </div>

                {/* Outseam */}
                <div>
                  <div className="flex justify-between text-xs font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    <span>Outseam (inches)</span>
                    <span className="text-[#2c2c2c] font-mono">{lowerBody.outseam}"</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="55"
                    step="0.5"
                    value={lowerBody.outseam}
                    onFocus={() => handleFocus('outseam')}
                    onMouseEnter={() => handleFocus('outseam')}
                    onChange={(e) => setLowerBody({ ...lowerBody, outseam: parseFloat(e.target.value) })}
                    className="w-full accent-[#d4a373] bg-[#faf8f5] h-2 rounded-lg cursor-pointer border border-[#e8e4de]"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Accents */}
            {activeTab === 'accents' && (
              <div className="space-y-4">
                {/* Neck */}
                <div>
                  <div className="flex justify-between text-xs font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    <span>Neck Circ. (inches)</span>
                    <span className="text-[#2c2c2c] font-mono">{accents.neck}"</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    step="0.5"
                    value={accents.neck}
                    onFocus={() => handleFocus('neck')}
                    onMouseEnter={() => handleFocus('neck')}
                    onChange={(e) => setAccents({ ...accents, neck: parseFloat(e.target.value) })}
                    className="w-full accent-[#d4a373] bg-[#faf8f5] h-2 rounded-lg cursor-pointer border border-[#e8e4de]"
                  />
                </div>

                {/* Wrist */}
                <div>
                  <div className="flex justify-between text-xs font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    <span>Wrist Circ. (inches)</span>
                    <span className="text-[#2c2c2c] font-mono">{accents.wrist}"</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    step="0.25"
                    value={accents.wrist}
                    onFocus={() => handleFocus('wrist')}
                    onMouseEnter={() => handleFocus('wrist')}
                    onChange={(e) => setAccents({ ...accents, wrist: parseFloat(e.target.value) })}
                    className="w-full accent-[#d4a373] bg-[#faf8f5] h-2 rounded-lg cursor-pointer border border-[#e8e4de]"
                  />
                </div>

                {/* Ankle */}
                <div>
                  <div className="flex justify-between text-xs font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                    <span>Ankle Circ. (inches)</span>
                    <span className="text-[#2c2c2c] font-mono">{accents.ankle}"</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    step="0.25"
                    value={accents.ankle}
                    onFocus={() => handleFocus('ankle')}
                    onMouseEnter={() => handleFocus('ankle')}
                    onChange={(e) => setAccents({ ...accents, ankle: parseFloat(e.target.value) })}
                    className="w-full accent-[#d4a373] bg-[#faf8f5] h-2 rounded-lg cursor-pointer border border-[#e8e4de]"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#e8e4de]">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 border border-[#2f5d50] bg-[#2f5d50] hover:bg-[#204037] py-3.5 text-xs font-bold tracking-widest text-white uppercase transition-all rounded-none"
              >
                {submitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <span className="flex items-center gap-2">
                    Save Sizing Profile
                    <Sparkles className="h-4 w-4 text-[#d4a373]" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeasurementProfile;
