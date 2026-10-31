import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChevronDown,
  Menu,
  X,
  UserCircle,
  LogIn,
  Settings,
  Mail,
  BookOpen,
  GraduationCap,
  FileText,
  Briefcase,
  Star,
  Layers,
  ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import logoMain from '../assets/seven.svg';
import GlassSelect from './GlassSelect';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const { user, profile, logout, login, signup, role, signInWithGoogle } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth modal states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupGender, setSignupGender] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginBusy, setIsLoginBusy] = useState(false);
  const [showVerificationSent, setShowVerificationSent] = useState(false);

  const servicesTimeoutRef = useRef(null);
  const avatarMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 30);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsAvatarMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsServicesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleServicesEnter = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    setIsServicesOpen(true);
  };

  const handleServicesLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 200);
  };

  const handleSignOut = async () => {
    try {
      setIsAvatarMenuOpen(false);
      setIsMobileMenuOpen(false);
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleWebsiteAuth = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginBusy(true);
    try {
      await login(loginEmail, loginPassword);
      setIsLoginOpen(false);
    } catch (error) {
      setLoginError(error.message || 'Auth failed');
    } finally {
      setIsLoginBusy(false);
    }
  };

  const handleManualSignUp = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginBusy(true);
    try {
      const data = await signup(loginEmail, loginPassword, {
        username: signupUsername,
        fullName: signupFullName,
        phone: signupPhone,
        gender: signupGender
      });
      if (data?.session) {
        setIsLoginOpen(false);
      } else {
        setShowVerificationSent(true);
      }
    } catch (error) {
      setLoginError(error.message || 'Signup failed');
    } finally {
      setIsLoginBusy(false);
    }
  };

  return (
    <>
      {/* Top Floating macOS Pill Navbar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-500 ease-out px-4 pointer-events-none",
          isScrolled ? "pt-2" : "pt-4"
        )}
      >
        <div
          className={cn(
            "pointer-events-auto liquid-nav-pill flex items-center justify-between w-full max-w-5xl transition-all duration-500",
            isScrolled ? "h-14 px-4 sm:px-6 shadow-[0_15px_35px_rgba(0,0,0,0.8)]" : "h-16 px-5 sm:px-8 shadow-[0_20px_45px_rgba(0,0,0,0.85)]"
          )}
        >
          {/* Brand Logo with Monospace 5EVEN */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-lg bg-[#d4af37]/30 blur-sm opacity-0 group-hover:opacity-100 transition duration-300" />
              <img src={logoMain} alt="5EVEN Logo" className="h-8 w-auto relative z-10" />
            </div>
            <span className="font-mono font-bold text-lg tracking-[0.2em] uppercase text-[#fcf6ba]">
              5EVEN
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {/* Home */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase transition-all duration-300",
                  isActive
                    ? "bg-[#d4af37]/15 text-[#fcf6ba] border border-[#d4af37]/40 shadow-[inset_0_1px_1px_rgba(254,240,138,0.3)]"
                    : "text-[#bba782] hover:text-[#fcf6ba] hover:bg-[#d4af37]/5"
                )
              }
            >
              Home
            </NavLink>

            {/* Services with Hover Dropdown & Tooltip */}
            <div
              className="relative"
              onMouseEnter={handleServicesEnter}
              onMouseLeave={handleServicesLeave}
            >
              <div className="group relative">
                <button
                  type="button"
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase transition-all duration-300 inline-flex items-center gap-1.5",
                    location.pathname.startsWith('/services') ||
                    location.pathname.startsWith('/academics') ||
                    location.pathname.startsWith('/courses') ||
                    location.pathname.startsWith('/notes')
                      ? "bg-[#d4af37]/15 text-[#fcf6ba] border border-[#d4af37]/40"
                      : "text-[#bba782] hover:text-[#fcf6ba] hover:bg-[#d4af37]/5"
                  )}
                >
                  <span>Services</span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-300 opacity-70",
                      isServicesOpen ? "rotate-180 text-[#d4af37]" : ""
                    )}
                  />
                </button>

                {/* macOS Tooltip with Monospace 5EVEN */}
                <div className="liquid-tooltip -bottom-10 left-1/2 -translate-x-1/2 font-mono">
                  <span className="font-mono font-bold">5EVEN</span> Core services
                </div>
              </div>

              {/* Sub-menu Dropdown */}
              <AnimatePresence>
                {isServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-2 w-56 liquid-glass-menu p-2 z-[60]"
                  >
                    <Link
                      to="/academics"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium uppercase tracking-wider text-[#bba782] hover:text-[#fcf6ba] hover:bg-[#d4af37]/10 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center">
                        <BookOpen size={14} />
                      </div>
                      <span>Academics</span>
                    </Link>

                    <Link
                      to="/courses"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium uppercase tracking-wider text-[#bba782] hover:text-[#fcf6ba] hover:bg-[#d4af37]/10 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center">
                        <GraduationCap size={14} />
                      </div>
                      <span>Courses</span>
                    </Link>

                    <Link
                      to="/notes"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium uppercase tracking-wider text-[#bba782] hover:text-[#fcf6ba] hover:bg-[#d4af37]/10 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center">
                        <FileText size={14} />
                      </div>
                      <span>Notes</span>
                    </Link>

                    <div className="h-px bg-[rgba(212,175,55,0.2)] my-1 mx-2" />

                    <Link
                      to="/services"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-mono font-bold text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
                    >
                      <span>Explore All Services</span>
                      <ArrowRight size={12} />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* IT */}
            <div className="group relative">
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase transition-all duration-300",
                    isActive
                      ? "bg-[#d4af37]/15 text-[#fcf6ba] border border-[#d4af37]/40 shadow-[inset_0_1px_1px_rgba(254,240,138,0.3)]"
                      : "text-[#bba782] hover:text-[#fcf6ba] hover:bg-[#d4af37]/5"
                  )
                }
              >
                IT
              </NavLink>
              <div className="liquid-tooltip -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono">
                All the IT Services we provide
              </div>
            </div>

            {/* Stars */}
            <div className="group relative">
              <NavLink
                to="/stars"
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase transition-all duration-300",
                    isActive
                      ? "bg-[#d4af37]/15 text-[#fcf6ba] border border-[#d4af37]/40 shadow-[inset_0_1px_1px_rgba(254,240,138,0.3)]"
                      : "text-[#bba782] hover:text-[#fcf6ba] hover:bg-[#d4af37]/5"
                  )
                }
              >
                Stars
              </NavLink>
              <div className="liquid-tooltip -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono">
                How others are benefited from us ?
              </div>
            </div>
          </nav>

          {/* Right Action: Account Avatar / Sign In + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={avatarMenuRef}>
                <button
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  className="liquid-avatar-container p-0.5 rounded-lg transition-transform active:scale-95"
                  aria-label="Account menu"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-mono font-bold text-xs overflow-hidden border border-[#d4af37]/40">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (profile?.full_name || user.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                </button>

                {/* Avatar Menu Dropdown */}
                <AnimatePresence>
                  {isAvatarMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 liquid-glass-menu p-2 z-[70]"
                    >
                      <div className="px-3 py-2 border-b border-[rgba(212,175,55,0.2)] mb-1">
                        <p className="text-xs font-heading text-[#fcf6ba] truncate">
                          {profile?.full_name || 'Member'}
                        </p>
                        <p className="text-[10px] font-mono text-[#bba782] truncate">
                          {user.email}
                        </p>
                      </div>

                      {profile?.username ? (
                        <button
                          onClick={() => {
                            setIsAvatarMenuOpen(false);
                            navigate(`/profile/${profile.username}`);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors flex items-center gap-2.5"
                        >
                          <UserCircle size={15} /> View My Profile
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setIsAvatarMenuOpen(false);
                            navigate('/student-zone?tab=settings');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider text-[#f5d061] hover:bg-[#f5d061]/10 rounded-lg transition-colors flex items-center gap-2.5"
                        >
                          <Settings size={15} /> Setup Profile
                        </button>
                      )}

                      <Link
                        to="/student-zone"
                        onClick={() => setIsAvatarMenuOpen(false)}
                        className="w-full text-left px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider text-[#bba782] hover:text-[#fcf6ba] hover:bg-[#d4af37]/10 rounded-lg transition-colors flex items-center gap-2.5"
                      >
                        <Layers size={15} /> Student Zone
                      </Link>

                      {role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsAvatarMenuOpen(false);
                            navigate('/seven-mod');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider text-[#fef08a] hover:bg-[#fef08a]/10 rounded-lg transition-colors flex items-center gap-2.5"
                        >
                          <Settings size={15} /> Admin Control
                        </button>
                      )}

                      <div className="h-px bg-[rgba(212,175,55,0.2)] my-1 mx-1" />

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-2.5"
                      >
                        <LogIn size={15} className="rotate-180" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="liquid-btn-primary px-5 py-2 text-xs text-[#fcf6ba] active:scale-95"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-lg liquid-glass flex items-center justify-center text-[#d4af37] hover:text-[#fcf6ba]"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dynamic Glass Sheet Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-x-4 top-24 z-[90] md:hidden liquid-glass-card rounded-[14px] p-6 shadow-2xl border border-[rgba(212,175,55,0.4)]"
          >
            <div className="flex flex-col gap-2">
              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 rounded-lg text-sm font-mono font-medium uppercase tracking-wider flex items-center justify-between",
                    isActive ? "bg-[#d4af37]/20 text-[#fcf6ba]" : "text-[#bba782] hover:bg-[#d4af37]/5"
                  )
                }
              >
                <span>Home</span>
              </NavLink>

              <NavLink
                to="/services"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 rounded-lg text-sm font-mono font-medium uppercase tracking-wider flex items-center justify-between",
                    isActive ? "bg-[#d4af37]/20 text-[#fcf6ba]" : "text-[#bba782] hover:bg-[#d4af37]/5"
                  )
                }
              >
                <span>Services & IT</span>
              </NavLink>

              <div className="pl-4 flex flex-col gap-1 border-l border-[rgba(212,175,55,0.3)] my-1">
                <Link
                  to="/academics"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs font-mono text-[#bba782] hover:text-[#fcf6ba]"
                >
                  • Academics
                </Link>
                <Link
                  to="/courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs font-mono text-[#bba782] hover:text-[#fcf6ba]"
                >
                  • Courses
                </Link>
                <Link
                  to="/notes"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs font-mono text-[#bba782] hover:text-[#fcf6ba]"
                >
                  • Notes
                </Link>
              </div>

              <NavLink
                to="/stars"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 rounded-lg text-sm font-mono font-medium uppercase tracking-wider flex items-center justify-between",
                    isActive ? "bg-[#d4af37]/20 text-[#fcf6ba]" : "text-[#bba782] hover:bg-[#d4af37]/5"
                  )
                }
              >
                <span>Stars</span>
              </NavLink>

              <NavLink
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 rounded-lg text-sm font-mono font-medium uppercase tracking-wider flex items-center justify-between",
                    isActive ? "bg-[#d4af37]/20 text-[#fcf6ba]" : "text-[#bba782] hover:bg-[#d4af37]/5"
                  )
                }
              >
                <span>Contact</span>
              </NavLink>

              <NavLink
                to="/student-zone"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 rounded-lg text-sm font-mono font-medium uppercase tracking-wider flex items-center justify-between",
                    isActive ? "bg-[#d4af37]/20 text-[#fcf6ba]" : "text-[#bba782] hover:bg-[#d4af37]/5"
                  )
                }
              >
                <span>Student Zone</span>
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal with Royal Liquid Glass Styling */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="liquid-glass-card w-full max-w-md rounded-[16px] p-8 shadow-2xl relative border border-[rgba(212,175,55,0.45)]">
            <button
              onClick={() => {
                setIsLoginOpen(false);
                setShowVerificationSent(false);
              }}
              className="absolute top-5 right-5 p-2 hover:bg-white/10 rounded-lg text-[#d4af37] transition"
            >
              <X size={20} />
            </button>

            {showVerificationSent ? (
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <div className="w-16 h-16 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center mb-2 border border-[#d4af37]/35">
                  <Mail size={32} />
                </div>
                <h3 className="text-xl font-heading text-[#fcf6ba]">
                  Check Your Email
                </h3>
                <p className="text-sm font-serif-body text-[#bba782] leading-relaxed">
                  We've sent a verification link to{' '}
                  <span className="font-mono text-[#fcf6ba]">{loginEmail}</span>. Please verify your email to complete registration.
                </p>
                <button
                  onClick={() => {
                    setIsLoginOpen(false);
                    setShowVerificationSent(false);
                  }}
                  className="w-full py-3.5 mt-4 liquid-glass text-[#fcf6ba] rounded-lg font-mono font-medium uppercase tracking-wider text-xs hover:bg-[#d4af37]/10 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-heading text-[#fcf6ba] mb-6">
                  {isSignUpMode ? 'Create Royal Account' : 'Welcome to 5EVEN'}
                </h2>
                <form
                  onSubmit={isSignUpMode ? handleManualSignUp : handleWebsiteAuth}
                  className="flex flex-col gap-3.5"
                >
                  {isSignUpMode && (
                    <>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-[rgba(212,175,55,0.3)] bg-black/60 text-[#fbf5e6] placeholder-[#bba782]/60 outline-none focus:border-[#d4af37] transition font-sans text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Username"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-[rgba(212,175,55,0.3)] bg-black/60 text-[#fbf5e6] placeholder-[#bba782]/60 outline-none focus:border-[#d4af37] transition font-mono text-sm"
                      />
                      <GlassSelect
                        value={signupGender}
                        onChange={(val) => setSignupGender(val)}
                        options={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'others', label: 'Others' },
                        ]}
                        placeholder="Select Gender"
                        className="w-full"
                      />
                    </>
                  )}
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[rgba(212,175,55,0.3)] bg-black/60 text-[#fbf5e6] placeholder-[#bba782]/60 outline-none focus:border-[#d4af37] transition font-mono text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[rgba(212,175,55,0.3)] bg-black/60 text-[#fbf5e6] placeholder-[#bba782]/60 outline-none focus:border-[#d4af37] transition font-mono text-sm"
                  />

                  {loginError && (
                    <p className="text-rose-400 text-xs font-mono">{loginError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoginBusy}
                    className="w-full py-3.5 liquid-btn-primary text-xs disabled:opacity-50 mt-2"
                  >
                    {isLoginBusy ? 'Processing...' : isSignUpMode ? 'Register' : 'Login'}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[rgba(212,175,55,0.2)]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-mono uppercase">
                    <span className="bg-[#050507] px-4 text-[#bba782] tracking-[0.25em]">
                      Or Secure Access
                    </span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setLoginError('');
                    setIsLoginBusy(true);
                    try {
                      await signInWithGoogle();
                    } catch (error) {
                      setLoginError(error.message || 'Google login failed');
                    } finally {
                      setIsLoginBusy(false);
                    }
                  }}
                  disabled={isLoginBusy}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-[rgba(212,175,55,0.35)] bg-black/50 hover:bg-[#d4af37]/10 text-[#fcf6ba] transition-all font-mono uppercase tracking-wider text-xs disabled:opacity-50"
                >
                  <i className="ri-google-fill text-base text-[#d4af37]" />
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => setIsSignUpMode(!isSignUpMode)}
                  className="w-full mt-5 text-xs font-mono tracking-wider text-[#bba782] hover:text-[#d4af37] transition-colors text-center"
                >
                  {isSignUpMode
                    ? 'Already have an account? Login'
                    : 'New here? Create account'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
