import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logoLight from '../assets/seven_dark.svg';
import logoDark from '../assets/seven.svg';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const { theme } = useTheme();
  const { user, profile, logout, login } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginBusy, setIsLoginBusy] = useState(false);
  const avatarMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!avatarMenuRef.current) return;
      if (!avatarMenuRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsAvatarMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      setIsLoginOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
      setIsLoginBusy(false);
    }
  }, [user]);

  const handleWebsiteLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    setIsLoginBusy(true);

    try {
      await login(loginEmail, loginPassword);
    } catch (error) {
      setLoginError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoginBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setIsAvatarMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Academics', path: '/academics' },
    { name: 'Courses', path: '/courses' },
    { name: 'Notes', path: '/notes' },
    { name: 'Services', path: '/services' },
    { name: 'Stars', path: '/stars' },
    { name: 'Contact', path: '/contact' },
    { name: 'Student Zone', path: '/student-zone' },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[5000] px-6 py-4 flex items-center justify-between transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-lg py-3" : "bg-transparent"
      )}
    >
      <div className="flex items-center gap-4">
        <img
          src={theme === 'dark' ? logoDark : logoLight}
          alt="5EVEN Logo"
          className="h-10 w-auto object-contain drop-shadow-xl"
        />
        <span className="font-bold text-2xl uppercase tracking-widest hidden sm:block pointer-events-none mt-1">
          5EVEN
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "text-sm font-medium tracking-wide transition-colors hover:text-primary",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="hidden md:block relative" ref={avatarMenuRef}>
            <button
              type="button"
              onClick={() => setIsAvatarMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-card hover:bg-accent transition-colors"
              aria-haspopup="menu"
              aria-expanded={isAvatarMenuOpen}
            >
              <span className="w-7 h-7 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-black text-primary">
                    {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>

            {isAvatarMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-border bg-card shadow-2xl p-2 z-50">
                <NavLink
                  to="/student-zone?tab=settings"
                  className="block w-full text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent"
                >
                  Account
                </NavLink>
                <NavLink
                  to="/student-zone?tab=dashboard"
                  className="block w-full text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent"
                >
                  Dashboard
                </NavLink>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-destructive hover:bg-destructive/10"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsLoginOpen(true)}
            className="hidden md:flex items-center justify-center px-4 py-2 rounded-full border border-border bg-card hover:bg-accent transition-colors text-xs font-black uppercase tracking-widest"
          >
            Login
          </button>
        )}

        <button
          className="md:hidden p-2 rounded-full hover:bg-accent transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-[-1] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 transition-transform duration-500 ease-in-out md:hidden",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className="text-2xl font-bold uppercase tracking-widest"
            onClick={() => setIsMenuOpen(false)}
          >
            {item.name}
          </NavLink>
        ))}
        {user ? (
          <NavLink to="/student-zone?tab=dashboard" className="text-2xl font-bold uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>
            Dashboard
          </NavLink>
        ) : (
          <button
            type="button"
            className="text-2xl font-bold uppercase tracking-widest"
            onClick={() => {
              setIsMenuOpen(false);
              setIsLoginOpen(true);
            }}
          >
            Login
          </button>
        )}
      </div>

      {!user && isLoginOpen && (
        <div className="fixed inset-0 z-[6000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black uppercase tracking-widest">Website Login</h3>
              <button
                type="button"
                onClick={() => setIsLoginOpen(false)}
                className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border border-border hover:bg-accent"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleWebsiteLogin} className="space-y-3">
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
              />
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
              />

              {loginError && <p className="text-sm text-destructive break-words">{loginError}</p>}

              <button
                type="submit"
                disabled={isLoginBusy}
                className="w-full py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs"
              >
                {isLoginBusy ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
