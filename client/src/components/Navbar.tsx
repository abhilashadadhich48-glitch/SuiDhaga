import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, User as UserIcon, LogOut, Menu, X, Bell, Heart } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const getNavLinks = () => {
    if (!user) {
      return [
        { label: 'Home', path: '/' },
        { label: 'Login', path: '/login' },
        { label: 'Register', path: '/register', highlight: true },
      ];
    }

    switch (user.role) {
      case 'customer':
        return [
          { label: 'Home', path: '/' },
          { label: 'Measurements', path: '/measurements' },
          { label: 'Orders', path: '/orders' },
          { label: 'Appointments', path: '/appointments' },
        ];
      case 'tailor':
        return [
          { label: 'Orders', path: '/orders' },
          { label: 'Services', path: '/tailor/services' },
          { label: 'Appointments', path: '/appointments' },
          { label: 'Profile', path: '/tailor/profile' },
        ];
      case 'admin':
        return [
          { label: 'Admin Dashboard', path: '/admin' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#e8e4de] bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Scissors className="h-5 w-5 text-[#c5a880] transform rotate-45" />
            <span className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase">
              SUI<span className="text-[#c5a880]">DHAGA</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-sans text-xs tracking-widest uppercase transition-all duration-300 ${
                    link.highlight
                      ? 'bg-[#2f5d50] text-white px-5 py-2 hover:bg-[#204037]'
                      : isActive
                      ? 'text-[#d4a373] font-bold border-b-2 border-[#d4a373] pb-1'
                      : 'text-[#6b7280] hover:text-[#2f5d50]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {user && (
              <div className="flex items-center gap-6 border-l border-[#e8e4de] pl-6">
                {/* Heart & Bell Icons for Client */}
                {user.role === 'customer' && (
                  <div className="flex items-center gap-4 text-[#6b7280]">
                    <button className="hover:text-[#2f5d50] transition-colors">
                      <Heart className="h-4.5 w-4.5" />
                    </button>
                    <button className="relative hover:text-[#2f5d50] transition-colors">
                      <Bell className="h-4.5 w-4.5" />
                      <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#d4a373] text-[8px] font-bold text-white">
                        3
                      </span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="h-8 w-8 rounded-full border border-[#e8e4de] object-cover"
                    />
                  ) : (
                    <UserIcon className="h-5 w-5 text-[#6b7280]" />
                  )}
                  <div className="text-left">
                    <p className="text-xs text-[#2c2c2c] font-semibold leading-none">{user.name}</p>
                    <p className="text-[9px] text-[#6b7280] uppercase tracking-wider mt-0.5 leading-none">
                      {user.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[#6b7280] hover:text-red-500 transition-colors"
                  title="Log out"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#2c2c2c] hover:text-[#2f5d50]"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e8e4de] bg-white px-4 py-6 space-y-4 shadow-lg">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-xs font-semibold tracking-widest uppercase py-2 ${
                  link.highlight
                    ? 'bg-[#2f5d50] text-white text-center py-2.5'
                    : isActive
                    ? 'text-[#d4a373]'
                    : 'text-[#6b7280] hover:text-[#2f5d50]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {user && (
            <div className="pt-4 border-t border-[#e8e4de] space-y-4">
              <div className="flex items-center gap-3">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border border-[#e8e4de] object-cover"
                  />
                ) : (
                  <UserIcon className="h-6 w-6 text-[#6b7280]" />
                )}
                <div>
                  <p className="text-sm text-[#2c2c2c] font-semibold">{user.name}</p>
                  <p className="text-xs text-[#6b7280] uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-[#2f5d50] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#204037] transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
