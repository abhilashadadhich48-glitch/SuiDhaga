import React from 'react';
import { Scissors, Facebook, Instagram, Youtube, Compass } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#e8e4de] pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12">
          {/* Logo & Intro */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-[#c5a880] transform rotate-45" />
              <span className="font-serif text-lg font-bold tracking-widest text-[#2c2c2c] uppercase">
                SUI<span className="text-[#c5a880]">DHAGA</span>
              </span>
            </div>
            <p className="text-xs text-[#6b7280] leading-relaxed max-w-xs">
              Your trusted platform to connect with expert tailors, explore designs, and get custom outfits stitched with perfection.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="text-[#6b7280] hover:text-[#2f5d50] transition-colors"><Facebook className="h-4.5 w-4.5" /></a>
              <a href="#" className="text-[#6b7280] hover:text-[#2f5d50] transition-colors"><Instagram className="h-4.5 w-4.5" /></a>
              <a href="#" className="text-[#6b7280] hover:text-[#2f5d50] transition-colors"><Compass className="h-4.5 w-4.5" /></a>
              <a href="#" className="text-[#6b7280] hover:text-[#2f5d50] transition-colors"><Youtube className="h-4.5 w-4.5" /></a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-serif text-xs font-bold tracking-widest text-[#2c2c2c] uppercase mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-[#6b7280]">
              <li><a href="#" className="hover:text-[#2f5d50] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#2f5d50] transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-[#2f5d50] transition-colors">Our Tailors</a></li>
              <li><a href="#" className="hover:text-[#2f5d50] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#2f5d50] transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="font-serif text-xs font-bold tracking-widest text-[#2c2c2c] uppercase mb-4">
              Help
            </h4>
            <ul className="space-y-2.5 text-xs text-[#6b7280]">
              <li><a href="#" className="hover:text-[#2f5d50] transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-[#2f5d50] transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-[#2f5d50] transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-[#2f5d50] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#2f5d50] transition-colors">Refund Policy</a></li>
            </ul>
          </div>

          {/* Newsletter signup */}
          <div className="space-y-4">
            <h4 className="font-serif text-xs font-bold tracking-widest text-[#2c2c2c] uppercase mb-4">
              Newsletter
            </h4>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Subscribe to get updates, styling sheets and exclusive offers.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-[#faf8f5] border border-[#e8e4de] py-2 px-3 text-xs text-[#2c2c2c] placeholder-[#6b7280]/60 outline-none focus:border-[#2f5d50] rounded-none transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-[#2f5d50] hover:bg-[#204037] text-white py-2 text-xs font-bold uppercase tracking-widest transition-colors rounded-none"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#2f5d50] py-4 text-center">
        <p className="text-[10px] text-white/80 uppercase tracking-widest font-semibold">
          &copy; {new Date().getFullYear()} SuiDhaga. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
