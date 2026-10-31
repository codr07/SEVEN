import React from 'react';
import { Link } from 'react-router-dom';
import sevenLogo from '../assets/seven.svg';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { role } = useAuth();

  return (
    <footer className="w-full liquid-glass border-t border-white/10 mt-auto relative overflow-hidden z-20">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={sevenLogo}
                alt="5EVEN Logo"
                className="h-9 w-auto object-contain"
              />
              <span className="font-mono font-bold text-2xl uppercase tracking-widest text-[#fcf6ba] mt-1">
                5EVEN
              </span>
            </Link>
            <p className="text-[#a1a1aa] leading-relaxed max-w-sm text-sm">
              Empowering the next generation with divine balance, computational rigor, and transformative innovation. Where education meets enterprise execution.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-mono font-bold text-xs uppercase tracking-[0.2em] text-[#d4af37]">Navigation</h4>
            <div className="flex flex-col gap-2.5 text-sm text-neutral-400">
              <Link to="/academics" className="hover:text-[#fcf6ba] transition-colors w-fit">Academics</Link>
              <Link to="/courses" className="hover:text-[#fcf6ba] transition-colors w-fit">Courses</Link>
              <Link to="/services" className="hover:text-[#fcf6ba] transition-colors w-fit">IT Services</Link>
              <Link to="/notes" className="hover:text-[#fcf6ba] transition-colors w-fit">Notes & Study Desk</Link>
              <Link to="/stars" className="hover:text-[#fcf6ba] transition-colors w-fit">Stars</Link>
              {role === 'admin' && (
                <Link to="/developers" className="hover:text-[#d4af37] transition-colors w-fit font-bold font-mono">Developer Docs</Link>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="font-mono font-bold text-xs uppercase tracking-[0.2em] text-[#d4af37]">Contact & HQ</h4>
            <div className="flex flex-col gap-2.5 text-sm text-neutral-400">
              <a href="mailto:espozindia@gmail.com" className="hover:text-[#d4af37] flex items-center gap-2 transition-colors w-fit">
                <i className="ri-mail-line text-[#d4af37]"></i> espozindia@gmail.com
              </a>
              <p className="flex items-start gap-2">
                <i className="ri-map-pin-line mt-1 text-[#d4af37]"></i>
                <span>Masalandapur, West Bengal</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#d4af37]/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#a1a1aa]">
          <p>&copy; {new Date().getFullYear()} <span className="font-mono text-[#fcf6ba] font-bold">5EVEN</span> Institution. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-neutral-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-neutral-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
