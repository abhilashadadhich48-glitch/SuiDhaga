import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, CheckCircle2, ShieldAlert, Image as ImageIcon, MapPin } from 'lucide-react';

const TailorProfile: React.FC = () => {
  const { user } = useAuth();

  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setCity(user.city || '');
      setPreviewUrl(user.profilePicture || '');
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePictureFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('city', city);
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }

      const res = await authAPI.updateProfile(formData);
      setSuccess('Studio profile configuration updated successfully.');

      // Update state in AuthContext using mock token rewrite or local reload
      if (res.data.user) {
        // Wait, authController returns updated user.
        // Let's reload local details since the token contains user info, or just refresh the page
        // to re-fetch profile details or re-sync context.
        // To be safe, we can inform the user that it will update on reload, or we can update local storage
        const token = localStorage.getItem('token');
        if (token) {
          // Re-set user in storage
          localStorage.setItem('user', JSON.stringify(res.data.user));
          // Trigger local react context sync by dispatching event or just updating storage
          window.location.reload();
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update studio profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-4xl border-b border-[#e8e4de] pb-6 mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-widest text-[#2c2c2c] uppercase">
          Studio <span className="text-[#2f5d50] italic font-normal">Profile</span>
        </h1>
        <p className="mt-1.5 text-xs text-[#6b7280]">
          Configure your tailor biography, city coordinates, and studio branding photo.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="bg-white border border-[#e8e4de] p-6 sm:p-10 shadow-sm rounded-lg">
          {error && (
            <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3.5 text-xs text-red-500 mb-6">
              <ShieldAlert className="h-4.5 w-4.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 border border-[#a3b18a]/20 bg-[#a3b18a]/10 p-3.5 text-xs text-[#2f5d50] mb-6">
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Branding Portrait Preview */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#e8e4de]">
              <div className="shrink-0 relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-24 w-24 rounded-full object-cover border border-[#e8e4de]"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-[#faf8f5] border border-[#e8e4de] flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-[#d4a373]/40" />
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <p className="text-xs font-bold text-[#2f5d50] uppercase tracking-wider">Studio Branding Photo</p>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <label className="cursor-pointer bg-[#faf8f5] border border-[#e8e4de] hover:border-[#2f5d50] text-[#2c2c2c] px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none">
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-[9px] text-[#6b7280]">PNG, JPG, JPEG up to 5MB.</p>
              </div>
            </div>

            {/* City Location */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                City / Region
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4a373]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jaipur, Rajasthan"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2.5 pl-10 pr-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
                />
              </div>
            </div>

            {/* Biography */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase mb-1">
                Studio Biography / Heritage
              </label>
              <textarea
                rows={5}
                required
                placeholder="Share your atelier's history, handcrafting techniques, and specialization details..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2.5 px-3 font-sans text-xs text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none focus:border-[#2f5d50]"
              />
            </div>

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
                    Save Studio Settings
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

export default TailorProfile;
