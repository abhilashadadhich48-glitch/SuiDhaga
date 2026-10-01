import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] lg:overflow-hidden bg-[#faf8f5] pt-20">
      {/* Left Column: Premium Editorial Visual */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-[#eae6df] p-8 border-r border-[#e8e4de] relative">
        <div className="relative h-full max-h-[45vh] aspect-[4/5] bg-white p-5 shadow-xl border border-[#e8e4de] transform rotate-1 hover:rotate-0 transition-transform duration-500 rounded-lg">
          <img
            src="https://i.pinimg.com/736x/32/94/d1/3294d1331a104cc8250d82bee887a61f.jpg"
            alt="Bespoke Attire"
            className="w-full h-full object-cover rounded filter brightness-[0.95] contrast-[1.02]"
          />
        </div>
        <div className="mt-6 text-center max-w-sm">
          <p className="font-serif text-lg italic tracking-wide text-[#2c2c2c] leading-relaxed">
            "Fit is not just a size. It is a signature of elegance and comfort."
          </p>
          <div className="mx-auto mt-3 h-[2px] w-16 bg-[#d4a373]"></div>
          <p className="font-sans text-[10px] tracking-widest text-[#2f5d50] uppercase mt-3 font-bold">
            SUIDHAGA BESPOKE COUTURE
          </p>
        </div>
      </div>

      {/* Right Column: Premium Form */}
      <div className="flex w-full items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8 lg:overflow-y-auto lg:h-full">
        <div className="w-full max-w-md space-y-8 bg-white border border-[#e8e4de] p-8 sm:p-10 shadow-lg shadow-[#e8e4de]/30 rounded-lg">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold tracking-widest text-[#2c2c2c] uppercase">
              Welcome Back
            </h2>
            <p className="mt-2 text-xs text-[#6b7280] font-sans tracking-wide">
              Sign in to access your customized couture portal.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-3 border border-red-500/20 bg-red-50 p-4 text-xs text-red-500">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-[#6b7280]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full border border-[#e8e4de] bg-[#faf8f5] py-3 pl-10 pr-3 font-sans text-sm text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none transition-all focus:border-[#2f5d50] rounded-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold tracking-wider text-[#2f5d50] uppercase">
                    Password
                  </label>
                </div>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-[#6b7280]" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full border border-[#e8e4de] bg-[#faf8f5] py-3 pl-10 pr-3 font-sans text-sm text-[#2c2c2c] placeholder-[#6b7280]/40 outline-none transition-all focus:border-[#2f5d50] rounded-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="group relative flex w-full justify-center bg-[#2f5d50] hover:bg-[#204037] py-3 text-xs font-bold tracking-widest text-white uppercase transition-all duration-300 disabled:opacity-50 rounded-none"
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <span className="flex items-center gap-2">
                    Enter Portal
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-2 border-t border-[#e8e4de] pt-4">
            <p className="text-xs text-[#6b7280]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#d4a373] hover:text-[#2f5d50] font-bold transition-colors">
                Register as Client / Atelier
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
