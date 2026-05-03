import React from 'react';
import { Link } from 'react-router-dom';
import sevenLogo from '../assets/seven.svg';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="w-full bg-card/80 backdrop-blur-md border-t border-border mt-auto h-auto relative overflow-hidden z-20">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">

          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={sevenLogo}
                alt="5EVEN Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="font-bold text-2xl uppercase tracking-widest pointer-events-none mt-1">
                5EVEN
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Boost your academia in a completely new way. Where innovation meets education, and your potential knows no bounds. We are dedicated to bridging the gap between learning and industry excellence.
            </p>
            <div className="flex items-center gap-4 mt-2">
              {[
                { icon: 'ri-linkedin-fill', href: '#', bg: 'bg-[#0A66C2]/10', border: 'border-[#0A66C2]/20', text: 'text-[#0A66C2]', hoverBg: 'hover:bg-[#0A66C2]', shadow: 'shadow-[#0A66C2]/10' },
                { icon: 'ri-twitter-x-line', href: '#', bg: 'bg-foreground/5', border: 'border-foreground/10', text: 'text-foreground', hoverBg: 'hover:bg-foreground', shadow: 'shadow-foreground/5' },
                { icon: 'ri-instagram-line', href: '#', bg: 'bg-[#E1306C]/10', border: 'border-[#E1306C]/20', text: 'text-[#E1306C]', hoverBg: 'hover:bg-[#E1306C]', shadow: 'shadow-[#E1306C]/10' }
              ].map((social, i) => (
                <motion.a
                  key={social.icon}
                  href={social.href}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${social.bg} ${social.border} ${social.text} transition-all ${social.hoverBg} hover:text-white shadow-sm ${social.shadow}`}
                >
                  <i className={`${social.icon} ${social.icon.includes('twitter') ? 'text-lg' : 'text-xl'}`}></i>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg uppercase tracking-wide">Explore</h4>
            <div className="flex flex-col gap-3 text-muted-foreground">
              <Link to="/academics" className="hover:text-foreground hover:translate-x-1 transition-all w-fit">Academics</Link>
              <Link to="/courses" className="hover:text-foreground hover:translate-x-1 transition-all w-fit">Courses</Link>
              <Link to="/services" className="hover:text-foreground hover:translate-x-1 transition-all w-fit">Services</Link>
              <Link to="/notes" className="hover:text-foreground hover:translate-x-1 transition-all w-fit">Notes</Link>
              <Link to="/developers" className="hover:text-foreground hover:translate-x-1 transition-all w-fit text-primary font-bold">Developers</Link>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg uppercase tracking-wide">Contact</h4>
            <div className="flex flex-col gap-3 text-muted-foreground">
              <a href="mailto:hello@5even.com" className="hover:text-primary flex items-center gap-2 transition-colors w-fit">
                <i className="ri-mail-line"></i> espozindia@gmail.com
              </a>
              <p className="flex items-start gap-2">
                <i className="ri-map-pin-line mt-1"></i>
                <span>Masalandapur<br />, West Bengal</span>
              </p>
            </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 5EVEN Institution. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
