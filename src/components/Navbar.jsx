import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Menu, X, Home, BookOpen, GraduationCap, FileText, Briefcase, Star, Mail, UserCircle, ChevronLeft, ChevronRight, LogIn } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import logoLight from '../assets/seven_dark.svg';
import logoDark from '../assets/seven.svg';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const { theme } = useTheme();
  const { user, profile, logout, login, signup, role, signInWithGoogle } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [signupFullName, setSignupFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginBusy, setIsLoginBusy] = useState(false);
  const avatarMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      setIsLoginOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setSignupFullName('');
      setSignupPhone('');
      setLoginError('');
      setIsLoginBusy(false);
    }
  }, [user]);

  const handleWebsiteAuth = async (event) => {
    event.preventDefault();
    setLoginError('');
    setIsLoginBusy(true);

    try {
      if (isSignUpMode) {
        if (!signupFullName || !loginEmail || !loginPassword) {
           throw new Error("Full Name, Email, and Password are required.");
        }
        await signup(loginEmail, loginPassword, {
          fullName: signupFullName,
          phone: signupPhone
        });
      } else {
        await login(loginEmail, loginPassword);
      }
    } catch (error) {
      setLoginError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoginBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsLoginBusy(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setLoginError(error.message || 'Google Sign In failed.');
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
    { name: 'Home', path: '/', icon: Home },
    { name: 'Academics', path: '/academics', icon: BookOpen },
    { name: 'Courses', path: '/courses', icon: GraduationCap },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Services', path: '/services', icon: Briefcase },
    { name: 'Stars', path: '/stars', icon: Star },
    { name: 'Contact', path: '/contact', icon: Mail },
    { name: 'Student Zone', path: '/student-zone', icon: UserCircle },
  ];

  const SidebarContent = ({ forceExpanded = false }) => {
    const collapsed = !forceExpanded && isDesktopCollapsed;

    return (
      <div className="flex flex-col h-full w-full">
        <div className={cn("flex items-center gap-4 py-8 relative transition-all duration-300", collapsed ? "px-0 justify-center" : "px-6")}>
          <img
            src={theme === 'dark' ? logoDark : logoLight}
            alt="5EVEN Logo"
            className="h-10 w-auto object-contain drop-shadow-xl shrink-0"
          />
          {!collapsed && (
            <span className="font-bold text-2xl uppercase tracking-widest hidden sm:block pointer-events-none mt-1 whitespace-nowrap">
              5EVEN
            </span>
          )}
          
          {/* Toggle Collapse Button (PC Only) */}
          {!forceExpanded && (
            <button
              onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
              className="absolute top-10 -right-3.5 p-1 rounded-full border border-border bg-card shadow-md hover:bg-accent hover:text-primary transition-colors z-[5100]"
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2 overflow-y-auto w-full px-3 lenis-prevent">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-xl text-sm font-bold uppercase tracking-widest transition-colors group overflow-hidden shrink-0",
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    collapsed ? "py-4 justify-center" : "px-4 py-3 gap-3"
                  )
                }
              >
                <Icon size={collapsed ? 22 : 18} className="shrink-0 group-hover:scale-110 transition-transform" />
                {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </NavLink>
            );
          })}
        </div>

        <div className={cn("p-4 mt-auto border-t border-border w-full", collapsed ? "flex justify-center flex-col gap-2 items-center" : "")}>
          {user ? (
            <div className={cn("relative w-full", collapsed ? "flex justify-center" : "")} ref={avatarMenuRef}>
              <button
                type="button"
                onClick={() => setIsAvatarMenuOpen((v) => !v)}
                className={cn(
                  "flex items-center rounded-xl border border-border bg-card hover:bg-accent transition-colors w-full",
                  collapsed ? "p-1.5 justify-center border-none shadow-none bg-transparent" : "p-2 justify-between"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "rounded-full overflow-hidden flex items-center justify-center shrink-0",
                    collapsed ? "w-10 h-10 border border-primary/20 bg-card shadow-sm" : "w-8 h-8 bg-primary/10"
                  )}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className={cn("font-black text-primary", collapsed ? "text-base" : "text-xs")}>
                        {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  {!collapsed && (
                    <span className="truncate text-xs font-bold text-left max-w-[100px]">
                      {profile?.full_name || user?.email || 'User'}
                    </span>
                  )}
                </div>
                {!collapsed && <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
              </button>

              {isAvatarMenuOpen && (
                <div className={cn(
                  "absolute bottom-full mb-4 rounded-2xl border border-border bg-card shadow-2xl p-2 z-50",
                  collapsed ? "left-full ml-4 w-44" : "left-0 w-full"
                )}>
                  {profile?.username && (
                    <NavLink
                      to={`/profile/${profile.username}`}
                      className="block w-full text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/20 mb-1"
                    >
                      My Profile
                    </NavLink>
                  )}
                  <NavLink
                    to="/student-zone?tab=settings"
                    className="block w-full text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent"
                  >
                    Account Settings
                  </NavLink>
                  <NavLink
                    to="/student-zone?tab=dashboard"
                    className="block w-full text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent"
                  >
                    Dashboard
                  </NavLink>
                  {role === 'admin' && (
                    <NavLink
                      to="/seven-mod"
                      className="block w-full text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10"
                    >
                      Admin Panel
                    </NavLink>
                  )}
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
              title={collapsed ? "Sign In" : undefined}
              className={cn(
                "flex items-center justify-center rounded-xl transition-colors w-full",
                collapsed 
                  ? "p-3 hover:bg-primary/20 text-muted-foreground hover:text-primary" 
                  : "px-4 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs"
              )}
            >
              {collapsed ? <LogIn size={20} /> : "Sign In"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex sticky top-0 h-screen border-r border-border bg-card/80 backdrop-blur-3xl shrink-0 z-[5000] shadow-2xl",
          // CSS Transition purely for layout expansion pushing App.jsx content over gracefully
          "transition-[width] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          isDesktopCollapsed ? "w-20" : "w-[260px]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden sticky top-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-md border-b border-border z-[4000] flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={theme === 'dark' ? logoDark : logoLight}
            alt="5EVEN Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="font-bold text-xl uppercase tracking-widest mt-1">
            5EVEN
          </span>
        </div>
        
        <button
          className="p-2 rounded-full border border-border bg-card shadow-sm hover:bg-accent transition-colors relative"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[5400]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="md:hidden fixed top-0 left-0 h-dvh w-[80vw] max-w-[320px] bg-card border-r border-border z-[5500] flex flex-col shadow-2xl"
            >
              <SidebarContent forceExpanded={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      {!user && isLoginOpen && (
        <div className="fixed inset-0 z-[6000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black uppercase tracking-widest">Website Login</h3>
              <button
                type="button"
                onClick={() => {
                  setIsLoginOpen(false);
                  setIsSignUpMode(false);
                }}
                className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border border-border hover:bg-accent"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => setIsSignUpMode(false)}
                className={cn(
                  "flex-1 pb-3 text-sm font-black uppercase tracking-widest text-center border-b-2 transition-colors",
                  !isSignUpMode ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUpMode(true)}
                className={cn(
                  "flex-1 pb-3 text-sm font-black uppercase tracking-widest text-center border-b-2 transition-colors",
                  isSignUpMode ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleWebsiteAuth} className="space-y-4">
              {isSignUpMode && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                  <input
                    type="text"
                    required
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                  />
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="Phone Number (Optional)"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                  />
                </div>
              )}
              
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email Address"
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

              {loginError && <p className="text-sm text-destructive break-words font-medium p-3 bg-destructive/10 rounded-xl">{loginError}</p>}

              <button
                type="submit"
                disabled={isLoginBusy}
                className="w-full py-4 mt-2 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isLoginBusy 
                  ? (isSignUpMode ? 'Creating Account...' : 'Signing In...') 
                  : (isSignUpMode ? 'Create Account' : 'Sign In')}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-card px-3 text-muted-foreground">OR</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isLoginBusy}
                onClick={handleGoogleLogin}
                className="w-full py-4 flex items-center justify-center gap-3 rounded-xl border border-border bg-background hover:bg-accent transition-all group shadow-sm active:scale-[0.98]"
              >
                <i className="ri-google-fill text-xl text-primary group-hover:scale-110 transition-transform"></i>
                <span className="text-xs font-black uppercase tracking-widest">Continue with Google</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
