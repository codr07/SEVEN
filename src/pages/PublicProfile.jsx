import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, withTimeout } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Settings, ArrowLeft, Fingerprint, CheckCircle2, ShieldCheck, GraduationCap, CircleUser, UserCheck, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IdentityCard = ({ profile, type }) => {
  const idNumber = profile.extra_details?.id_number || profile.extra_details?.manifesto_id || "70326-0001";
  const userRole = profile.role?.toLowerCase() || '';
  const isFaculty = type === 'faculty' || userRole === 'faculty';
  const isAdmin = userRole === 'admin' || userRole === 'founder' || userRole === 'visionary' || type === 'admin' || type === 'founder';

  const roleLabel = isFaculty ? 'Faculty Expert' : isAdmin ? 'Administrative Lead' : 'Student';
  const cardTitle = isFaculty ? 'Faculty ID' : isAdmin ? 'Admin ID' : 'Student ID';

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-card to-background border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
      {/* Glow Effects */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Official {cardTitle}</h4>
            <p className="text-xl font-black text-foreground italic uppercase tracking-tighter">5EVEN Institution</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary backdrop-blur-md">
            <Fingerprint size={24} />
          </div>
        </div>

        <div className="flex gap-6 mb-8">
          <div className="w-24 h-24 rounded-2xl border-2 border-primary/30 overflow-hidden bg-muted shadow-inner relative">
            <img src={profile.avatar_url || profile.cover_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (profile.username || profile.name)} alt={profile.full_name || profile.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 size={10} className="text-green-500" />
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Identity Verified</p>
            </div>
            <h3 className="text-lg font-black text-foreground uppercase leading-tight">{profile.full_name || profile.name || profile.username}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">{roleLabel}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-1">Identification No.</span>
            <span className="text-xl font-mono font-black text-foreground tracking-tighter">{idNumber}</span>
          </div>
          <div className="text-[7px] font-black uppercase tracking-[0.2em] text-primary/40 text-right leading-relaxed">
            Authorized by <br /> 5EVEN Intelligence
          </div>
        </div>
      </div>

      {/* Decorative Scanline */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/40 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] animate-scan-fast opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const IDCardWindow = ({ profile, onClose }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8">
      {/* Intense Blur Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-xl no-print select-none z-50"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Glow behind the card */}
        <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-[100px] animate-pulse pointer-events-none" />

        {/* Close Button - More tactical */}
        <button
          onClick={onClose}
          className="absolute -top-16 right-0 md:-right-12 flex flex-col items-center gap-2 text-white/40 hover:text-white transition-all group"
        >
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-destructive group-hover:border-destructive group-hover:rotate-90 transition-all duration-500 shadow-2xl">
            <X size={24} />
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Terminate Session</span>
        </button>

        <div className="relative p-2 rounded-[3.5rem] bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <IdentityCard profile={profile} type={profile.role?.toLowerCase() || 'student'} />

          {/* Security Overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-[3rem]">
            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] animate-scan-slow" />
            <div className="absolute inset-0 flex items-center justify-center rotate-[-30deg] opacity-[0.03]">
              <span className="text-5xl font-black uppercase tracking-[1.5em] whitespace-nowrap">AUTHENTIC • SEVEN INTEL • AUTHENTIC</span>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-12 py-4 bg-destructive text-white text-[10px] font-black uppercase tracking-[0.6em] rounded-full shadow-2xl border-4 border-background z-30 flex items-center gap-4 whitespace-nowrap">
          <div className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-1 rounded-full bg-white animate-bounce" />
          </div>
          Secure Data Link Active
        </div>
      </motion.div>
    </div>
  );
};

const renderGameData = (entry) => {

  if (entry.game === 'Call of Duty Mobile') {
    return (
      <>
        <div className="text-xs md:text-sm flex flex-wrap items-center gap-2 text-muted-foreground break-words">
          {entry.modeIcons?.mp && <img src={entry.modeIcons.mp} alt="MP" className="w-4 h-4 object-contain shrink-0" />}
          MP Rank:
          {entry.rankIcons?.mpLegendary && <img src={entry.rankIcons.mpLegendary} alt="MP Legendary" className="w-4 h-4 rounded-sm object-cover shrink-0" />}
          <span className="font-semibold text-foreground">{entry.data.mpRankCurrent}</span>
        </div>
        <div className="text-xs md:text-sm text-muted-foreground break-words">MP Legendaries: <span className="font-semibold text-foreground">{entry.data.mpLegendaries}</span></div>
        <div className="text-xs md:text-sm flex flex-wrap items-center gap-2 text-muted-foreground break-words">
          {entry.modeIcons?.br && <img src={entry.modeIcons.br} alt="BR" className="w-4 h-4 object-contain shrink-0" />}
          BR Rank:
          {entry.rankIcons?.brLegendary && <img src={entry.rankIcons.brLegendary} alt="BR Legendary" className="w-4 h-4 rounded-sm object-cover shrink-0" />}
          <span className="font-semibold text-foreground">{entry.data.brRankCurrent}</span>
        </div>
        <div className="text-xs md:text-sm text-muted-foreground break-words">BR Legendaries: <span className="font-semibold text-foreground">{entry.data.brLegendaries}</span></div>
      </>
    );
  }

  if (entry.game === 'Valorant') {
    return (
      <>
        <div className="text-xs md:text-sm text-muted-foreground break-words">Server: <span className="font-semibold text-foreground">{entry.data.serverName}</span></div>
        <div className="text-xs md:text-sm flex flex-wrap items-center gap-2 text-muted-foreground break-words">
          Peak Rank:
          {entry.rankIcons?.peak && <img src={entry.rankIcons.peak} alt="Peak" className="w-4 h-4 object-contain shrink-0" />}
          <span className="font-semibold text-foreground">{entry.data.peakRankActSeason}</span>
        </div>
        <div className="text-xs md:text-sm flex flex-wrap items-center gap-2 text-muted-foreground break-words">
          Current Rank:
          {entry.rankIcons?.current && <img src={entry.rankIcons.current} alt="Current" className="w-4 h-4 object-contain shrink-0" />}
          <span className="font-semibold text-foreground">{entry.data.currentRank}</span>
        </div>
      </>
    );
  }

  if (entry.game === 'Counter-Strike 2') {
    return (
      <>
        <div className="text-xs md:text-sm text-muted-foreground break-words">Server: <span className="font-semibold text-foreground">{entry.data.serverName}</span></div>
        <div className="text-xs md:text-sm text-muted-foreground break-words">Peak Rank: <span className="font-semibold text-foreground">{entry.data.peakRankActSeason}</span></div>
        <div className="text-xs md:text-sm text-muted-foreground break-words">Current Rank: <span className="font-semibold text-foreground">{entry.data.currentRank}</span></div>
      </>
    );
  }

  if (entry.game === 'FIFA') {
    return (
      <>
        <div className="text-xs md:text-sm text-muted-foreground break-words">Peak OVR: <span className="font-semibold text-foreground">{entry.data.peakOVR} - {entry.data.peakOvrSeasonYear}</span></div>
        <div className="text-xs md:text-sm text-muted-foreground break-words">Current OVR: <span className="font-semibold text-foreground">{entry.data.currentOvr}</span></div>
      </>
    );
  }

  if (entry.game === 'Chess') {
    return (
      <>
        <div className="text-xs md:text-sm text-muted-foreground break-words">Peak Rating: <span className="font-semibold text-foreground">{entry.data.peakRating}</span></div>
        <div className="text-xs md:text-sm text-muted-foreground break-words">Current Rating: <span className="font-semibold text-foreground">{entry.data.currentRating}</span></div>
      </>
    );
  }

  return null;
};

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showID, setShowID] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Supabase query to get profile by username
        // Wrap the query in withTimeout to prevent infinite loading if the database hangs
        const query = supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        const { data, error: dbError } = await withTimeout(query, 10000, 'Request took too long to complete. Please try again.');

        if (dbError) throw dbError;
        if (!data) throw new Error('Profile not found.');

        // Normalize social links format if needed
        let socials = data.social_links;
        if (socials && !Array.isArray(socials)) {
          socials = Object.entries(socials)
            .filter(([_, url]) => !!url)
            .map(([platform, url]) => ({
              platform: platform.charAt(0).toUpperCase() + platform.slice(1),
              url
            }));
        }
        data.social_links = socials || [];

        // Alias fields to match ProfileModal structure seamlessly
        data.name = data.full_name || data.username;
        data.description = data.bio;
        data.cover_image = data.avatar_url; // Use avatar for the large circle if no cover
        // Map native fields to extra_details for simpler rendering logic
        if (!data.extra_details) {
          data.extra_details = {
            education: data.education || [],
            expertise: [],
            gamesPlayed: [],
            research: [],
            books: []
          };
        }

        setProfile(data);
      } catch (err) {
        setError(err.message || 'Error fetching profile.');
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfileData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground font-bold tracking-widest uppercase text-xs">Loading Profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center bg-background px-4 text-center">
        <h2 className="text-3xl font-black mb-4">Profile Unavailable</h2>
        <p className="text-muted-foreground mb-8 max-w-md">{error || `The user '${username}' could not be located.`}</p>
        <div className="flex items-center gap-4">
          <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-full border border-border hover:bg-accent text-foreground font-bold uppercase tracking-widest text-sm transition-colors">
            Retry
          </button>
          <button onClick={() => navigate('/')} className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === profile.id;
  const headingLabel = `${profile.role || 'Student'} Profile`;
  const secondaryValue = profile.role || 'Member';

  const getRoleIcon = (role) => {
    const r = role?.toLowerCase();
    if (r === 'admin') return <ShieldCheck size={14} className="text-primary" />;
    if (r === 'faculty') return <GraduationCap size={14} className="text-primary" />;
    if (r === 'student') return <CircleUser size={14} className="text-primary" />;
    return <UserCheck size={14} className="text-primary" />;
  };

  const getArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [String(val)];
  };

  const eduArr = getArray(profile.extra_details?.education);
  const expertiseArr = getArray(profile.extra_details?.expertise);
  const gamesArr = getArray(profile.extra_details?.gamesPlayed);
  const researchArr = getArray(profile.extra_details?.research);
  const booksArr = getArray(profile.extra_details?.books);

  const getCourses = () => profile.extra_details?.enrolled_courses || [];

  const getServices = () => profile.extra_details?.services || [];

  const getNotes = () => profile.extra_details?.purchased_notes || [];

  const getAcademics = () => profile.extra_details?.academics || {
    attendance: null,
    avgGrade: null,
    tasks: []
  };

  const courses = getCourses();
  const services = getServices();
  const notes = getNotes();
  const academics = getAcademics();

  return (
    <div className="min-h-screen bg-background md:bg-[#0a0a0a] pt-28 pb-20 px-4 md:px-8 flex justify-center">

      {/* Profile Container */}
      <div
        className="relative w-full max-w-6xl flex flex-col bg-background md:bg-white/[0.03] backdrop-blur-3xl border-0 md:border border-white/10 rounded-none md:rounded-[40px] md:shadow-[0_0_100px_rgba(0,0,0,0.8)] z-10"
      >
        {/* Soft Background Gradient for Liquid Glass feel */}
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen rounded-[40px]" style={{ background: 'radial-gradient(circle at top right, rgba(var(--primary-rgb),0.3), transparent 40%), radial-gradient(circle at bottom left, rgba(var(--secondary-rgb),0.2), transparent 40%)' }} />

        {/* Main Content Area */}
        <div className="relative z-10 w-full p-0 md:p-10 lg:p-12">

          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-white/10">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter drop-shadow-md">Public Profile</h1>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-green-500">
                  {profile.role?.toLowerCase() === 'admin' ? 'Verified Admin' : profile.role?.toLowerCase() === 'faculty' ? 'Verified Faculty' : 'Verified Student'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowID(!showID)}
                className="flex items-center gap-3 px-5 py-3.5 bg-primary text-white rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(var(--primary-rgb),0.4)]"
              >
                <Fingerprint size={18} /> <span>View ID Card</span>
              </button>
              <div className="flex items-center gap-4 pl-4 md:pl-6 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-base font-bold text-white">{profile.name || profile.username}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-0.5">{secondaryValue}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl border-2 border-primary/30 overflow-hidden bg-muted shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                  <img src={profile.avatar_url || profile.cover_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.name} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* KPI Stats Row (Glass Cards) */}
          {(courses.length > 0 || services.length > 0 || academics.avgGrade) && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <i className="ri-folder-open-line text-xl"></i>
                  </div>
                  <span className="text-2xl md:text-3xl font-black text-white">{courses.length}</span>
                </div>
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enrolled Courses</p>
              </div>

              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:border-green-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                    <i className="ri-check-double-line text-xl"></i>
                  </div>
                  <span className="text-2xl md:text-3xl font-black text-white">{courses.filter(c => c.progress === 100).length}</span>
                </div>
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Courses Completed</p>
              </div>

              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:border-purple-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <i className="ri-shield-flash-line text-xl"></i>
                  </div>
                  <span className="text-2xl md:text-3xl font-black text-white">{services.length}</span>
                </div>
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Services</p>
              </div>

              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                    <i className="ri-bar-chart-box-line text-xl"></i>
                  </div>
                  <span className="text-2xl md:text-3xl font-black text-white">{academics.avgGrade || 'N/A'}</span>
                </div>
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg. Grade</p>
              </div>
            </div>
          )}

          {/* Main Content Row 1: Courses & Tasks */}
          {(courses.length > 0 || academics.tasks.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Course Progress */}
              {courses.length > 0 && (
                <div className="col-span-1 lg:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 md:mb-8">Course Progress</h3>
                  <div className="space-y-6 md:space-y-8">
                    {courses.map((course, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center text-xs md:text-sm font-bold text-white mb-3">
                          <span>{course.name}</span>
                          <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 md:h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
                          <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" style={{ width: `${course.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Checklist */}
              {academics.tasks.length > 0 && (
                <div className={`bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] ${courses.length > 0 ? 'col-span-1' : 'col-span-1 lg:col-span-3'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Tasks</h3>
                    <i className="ri-more-2-fill text-white/40"></i>
                  </div>
                  <div className="space-y-4">
                    {academics.tasks.map((task, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors ${task.done ? 'bg-primary border-primary text-background' : 'border-white/20 group-hover:border-white/40'}`}>
                          {task.done && <i className="ri-check-line text-[10px] font-black"></i>}
                        </div>
                        <span className={`text-sm font-bold transition-colors ${task.done ? 'text-white/30 line-through' : 'text-white/90 group-hover:text-white'}`}>{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Row 2: Attendance, Bio */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Strategic Intelligence Brief (Bio) */}
            <div className={`bg-gradient-to-br from-primary/10 to-white/5 backdrop-blur-2xl border border-primary/20 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_32px_rgba(var(--primary-rgb),0.1)] relative overflow-hidden flex flex-col justify-center ${academics.attendance != null ? 'col-span-1 lg:col-span-2' : 'col-span-1 lg:col-span-3'}`}>
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <i className="ri-folder-user-line text-9xl"></i>
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Strategic Intelligence Brief</h3>
              <p className="text-sm md:text-lg text-foreground/90 leading-relaxed font-medium italic pl-4 border-l-4 border-primary/40 relative z-10">
                "{profile.bio || profile.description || 'No strategic brief submitted.'}"
              </p>
            </div>

            {/* Attendance Donut Chart Mock */}
            {academics.attendance != null && (
              <div className="col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center relative">
                <h3 className="text-xs font-black uppercase tracking-widest text-white w-full text-center mb-6">Attendance</h3>
                <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full border-[16px] border-white/5 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="41%" fill="none" stroke="rgba(var(--primary-rgb), 1)" strokeWidth="16" strokeDasharray="200" strokeDashoffset={200 - (200 * academics.attendance / 100)} strokeLinecap="round" className="transition-all duration-1000" />
                  </svg>
                  <div className="text-center">
                    <span className="text-3xl md:text-5xl font-black text-white">{academics.attendance}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Row 3: Services & Notes & Specializations */}
          {(services.length > 0 || notes.length > 0 || expertiseArr.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

              {services.length > 0 && (
                <div className="col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6">Active Services</h3>
                  <div className="space-y-3">
                    {services.map((service, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform"><i className="ri-vip-diamond-line text-lg"></i></div>
                        <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notes.length > 0 && (
                <div className="col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6">Purchased Notes</h3>
                  <div className="space-y-3">
                    {notes.map((note, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/30 transition-all flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 group-hover:scale-110 transition-transform"><i className="ri-file-lock-line text-lg"></i></div>
                        <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specializations */}
              {expertiseArr.length > 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {expertiseArr.map((skill, idx) => (
                      <span key={idx} className="text-[10px] md:text-xs font-black px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 uppercase tracking-widest hover:bg-primary hover:border-primary transition-all cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Row 4: Combat History & Education */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">

            {/* Combat History */}
            {gamesArr.length > 0 && (
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 md:mb-8">Combat History</h3>
                <div className="grid grid-cols-1 gap-4 md:gap-5">
                  {gamesArr.map((entry, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-6 relative overflow-hidden group hover:border-primary/30 transition-all"
                    >
                      <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-[0.08] transition-opacity">
                        <i className="ri-game-line text-6xl md:text-7xl"></i>
                      </div>
                      <div className="flex items-center gap-4 md:gap-5 mb-5">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center p-2.5 shadow-xl">
                          <img src={entry.logoUrl || '/assets/images/img/thumb.png'} alt={entry.game} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-black text-lg md:text-xl text-white tracking-tight leading-none mb-1 md:mb-2">{entry.game}</p>
                          <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em]">{entry.category}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:gap-3 pt-4 border-t border-white/5">
                        {renderGameData(entry)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Timeline */}
            {eduArr.length > 0 && (
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-8">Educational Walkthrough</h3>
                <div className="relative pl-6 space-y-6 md:space-y-8">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-accent via-accent/20 to-transparent" />
                  {eduArr.map((edu, idx) => {
                    const isObject = typeof edu === 'object';
                    return (
                      <div key={idx} className="relative group/edu">
                        <div className="absolute -left-[20px] top-1.5 w-3 h-3 rounded-full bg-background border-[3px] border-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)] group-hover:scale-125 transition-transform" />
                        <div className="p-4 md:p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/30 transition-all hover:bg-accent/5">
                          <div className="mb-1 md:mb-2">
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-accent/60">Phase {idx + 1}</span>
                          </div>
                          <span className="text-sm font-bold text-white leading-tight block">{isObject ? (edu.school || edu.degree) : edu}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      <AnimatePresence>
        {showID && (
          <IDCardWindow profile={profile} onClose={() => setShowID(false)} />
        )}
      </AnimatePresence>

    </div>
  );
};

export default PublicProfile;
