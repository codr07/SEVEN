import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronDown, Menu, X, Home, BookOpen, GraduationCap, FileText, Briefcase, Star, Mail, UserCircle, ChevronLeft, ChevronRight, LogIn, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import logoMain from '../assets/seven.svg';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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

const Navbar = () => {
  const { user, profile, logout, login, signup, role, signInWithGoogle } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginBusy, setIsLoginBusy] = useState(false);
  const [showVerificationSent, setShowVerificationSent] = useState(false);
  
  const avatarMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsAvatarMenuOpen(false);
    setIsMobileMenuOpen(false);
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
      await signup(loginEmail, loginPassword, {
        username: signupUsername,
        fullName: signupFullName,
        phone: signupPhone
      });
      setShowVerificationSent(true);
    } catch (error) {
      setLoginError(error.message || 'Signup failed');
    } finally {
      setIsLoginBusy(false);
    }
  };

  const SidebarContent = ({ collapsed }) => (
    <div className="flex flex-col h-full w-full">
      <div className={cn("flex items-center gap-4 py-8 transition-all duration-300", collapsed ? "px-0 justify-center" : "px-6")}>
        <img src={logoMain} alt="5EVEN" className="h-10 w-auto" />
        {!collapsed && <span className="font-bold text-2xl uppercase tracking-widest mt-1">5EVEN</span>}
      </div>

      <div className="flex-1 flex flex-col gap-1 overflow-y-auto w-full px-3 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                isActive ? "bg-gradient-to-r from-primary to-accent text-white shadow-[0_8px_20px_-6px_rgba(var(--primary-rgb),0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed ? "py-4 justify-center" : "px-4 py-3 gap-3"
              )}
            >
              <Icon size={collapsed ? 24 : 18} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      <div className={cn("p-4 border-t border-border w-full", collapsed ? "flex flex-col items-center" : "")}>
        {user ? (
          <div className="relative w-full" ref={avatarMenuRef}>
            <button onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)} className="flex items-center justify-between w-full p-2 rounded-xl bg-muted/50 hover:bg-muted transition-all">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-[10px] overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (profile?.full_name || user.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                {!collapsed && <span className="text-[10px] font-black uppercase truncate max-w-[100px]">{profile?.full_name || user.email}</span>}
              </div>
              {!collapsed && <ChevronDown size={14} />}
            </button>
            {isAvatarMenuOpen && (
              <div className={cn("absolute bottom-full mb-2 w-48 bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl z-[100] flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200", collapsed ? "left-12 bottom-0" : "left-0")}>
                {profile?.username && (
                  <button onClick={() => { setIsAvatarMenuOpen(false); navigate(`/profile/${profile.username}`); }} className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-2">
                    <UserCircle size={14} /> View My Profile
                  </button>
                )}
                {role === 'admin' && (
                  <button onClick={() => { setIsAvatarMenuOpen(false); navigate('/seven-mod'); }} className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase text-accent hover:bg-accent/5 rounded-lg transition-colors flex items-center gap-2">
                    <Settings size={14} /> Admin Control Panel
                  </button>
                )}
                <div className="h-px bg-border my-1 mx-1" />
                <button onClick={handleSignOut} className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-2">
                  <LogIn size={14} className="rotate-180" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setIsLoginOpen(true)} className="w-full py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px]">
            {collapsed ? <LogIn size={20} /> : "Sign In"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:flex sticky top-0 h-screen border-r border-border bg-card z-50 transition-all duration-300", isDesktopCollapsed ? "w-20" : "w-64")}>
        <SidebarContent collapsed={isDesktopCollapsed} />
        <button onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} className="absolute top-10 -right-4 w-8 h-8 rounded-full border border-border bg-card shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-all">
          {isDesktopCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden sticky top-0 h-20 bg-background/80 backdrop-blur-md border-b border-border z-[100] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src={logoMain} alt="Logo" className="h-8 w-auto" />
          <span className="font-bold text-xl uppercase mt-1">5EVEN</span>
        </div>
        {/* Menu trigger removed from here, now in FAB */}
      </div>

      {/* Floating Mobile Menu Button */}
      <div className="relative">
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed bottom-8 right-8 z-[10000] w-16 h-16 bg-primary text-white rounded-full shadow-[0_15px_35px_hsl(var(--primary)/0.4)] flex items-center justify-center border-4 border-white"
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X size={28} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Menu size={28} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[9000] bg-background/80 backdrop-blur-3xl flex flex-col overflow-hidden"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-20%] w-[70vw] h-[70vw] rounded-full bg-primary/30 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-accent/20 blur-[100px] pointer-events-none" />
            
            <div className="flex flex-col h-full p-6 pt-12 relative z-10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <img src={logoMain} alt="Logo" className="h-8 w-auto" />
                  <span className="font-black text-xl uppercase mt-1">5EVEN</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Profile Section */}
              {user && (
                <div className="mb-6 p-5 rounded-2xl bg-muted/30 border border-border flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-lg border-2 border-border shadow-sm overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (profile?.full_name || user.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-base font-black uppercase truncate">{profile?.full_name || 'User'}</span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                      {role === 'admin' ? 'Administrator' : 'Student Account'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar flex-grow">
                {navItems.map(item => (
                  <NavLink 
                    key={item.name} 
                    to={item.path} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={({ isActive }) => cn(
                      "flex items-center gap-5 p-4 rounded-xl text-lg font-black uppercase tracking-widest transition-all",
                      isActive ? "bg-gradient-to-r from-primary to-accent text-white shadow-[0_10px_30px_-10px_rgba(var(--primary-rgb),0.7),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    )}
                  >
                    <item.icon size={22} />
                    {item.name}
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto border-t border-border pt-6 pb-6">
                {!user ? (
                  <button onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }} className="cool-button w-full py-5 text-sm">
                    Portal Access
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    {profile?.username && (
                      <NavLink 
                        to={`/profile/${profile.username}`} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-4 rounded-xl bg-primary/10 text-primary font-black uppercase tracking-widest text-center text-[10px]"
                      >
                        View My Profile
                      </NavLink>
                    )}
                    {role === 'admin' && (
                      <NavLink 
                        to="/seven-mod" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-4 rounded-xl bg-accent/10 text-accent font-black uppercase tracking-widest text-center text-[10px]"
                      >
                        Admin Control Panel
                      </NavLink>
                    )}
                    <button onClick={handleSignOut} className="w-full py-4 bg-muted rounded-xl font-black uppercase tracking-widest text-destructive text-[10px] hover:bg-destructive/5 transition-colors">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl p-8 shadow-2xl relative border border-border">
            <button onClick={() => setIsLoginOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full"><X size={20} /></button>
            <h2 className="text-2xl font-black uppercase tracking-widest mb-8">{isSignUpMode ? 'Create Account' : 'Welcome Back'}</h2>
            
            <form onSubmit={isSignUpMode ? handleManualSignUp : handleWebsiteAuth} className="flex flex-col gap-4">
              {isSignUpMode && (
                <>
                  <input type="text" placeholder="Full Name" value={signupFullName} onChange={e => setSignupFullName(e.target.value)} className="w-full p-4 rounded-xl border border-border bg-muted/30 outline-none focus:border-primary" />
                  <input type="text" placeholder="Username" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} className="w-full p-4 rounded-xl border border-border bg-muted/30 outline-none focus:border-primary" />
                </>
              )}
              <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-4 rounded-xl border border-border bg-muted/30 outline-none focus:border-primary" />
              <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-4 rounded-xl border border-border bg-muted/30 outline-none focus:border-primary" />
              
              {loginError && <p className="text-destructive text-xs font-bold">{loginError}</p>}
              
              <button type="submit" disabled={isLoginBusy} className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest mt-2 hover:scale-[1.02] transition-all disabled:opacity-50">
                {isLoginBusy ? 'Processing...' : (isSignUpMode ? 'Register' : 'Login')}
              </button>
            </form>
            
            <button onClick={() => setIsSignUpMode(!isSignUpMode)} className="w-full mt-6 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              {isSignUpMode ? 'Already have an account? Login' : 'New here? Create account'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
