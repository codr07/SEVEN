import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, withTimeout } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { updateMetadata } from '../lib/seo';
import { motion, AnimatePresence } from 'framer-motion';
import { CommunityBadge, VerifyBadge, AccountBadge, CreatorBadge, AchievementBadge, ActivityBadge } from '@/components/ui/SocialBadges';

const AccountStats = ({ createdAt }) => {
  const [uptime, setUptime] = useState({ years: 0, days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const calculateUptime = () => {
      const start = new Date(createdAt);
      const now = new Date();
      let diff = Math.floor((now - start) / 1000);

      const years = Math.floor(diff / (365 * 24 * 3600));
      diff %= (365 * 24 * 3600);
      const days = Math.floor(diff / (24 * 3600));
      diff %= (24 * 3600);
      const hours = Math.floor(diff / 3600);
      diff %= 3600;
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;

      setUptime({ years, days, hours, mins, secs });
    };

    calculateUptime();
    const timer = setInterval(calculateUptime, 1000);
    return () => clearInterval(timer);
  }, [createdAt]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  };

  return (
    <div className="relative group px-5 py-3 rounded-xl border border-primary/20 bg-black/40 backdrop-blur-xl overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-10">
      {/* Techno Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.05),transparent)] pointer-events-none" />
      
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary" />

      {/* 1. Status Indicator */}
      <div className="flex items-center gap-2 shrink-0 border-r border-white/5 pr-6 hidden md:flex">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),1)]" />
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">Live_Node</span>
      </div>

      {/* 2. Initialization Date */}
      <div className="flex flex-col border-r border-white/5 pr-10">
        <p className="text-[7px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5">Initialize_TS</p>
        <p className="text-[10px] font-mono font-black text-white tracking-widest leading-none">{formatDate(createdAt)}</p>
      </div>

      {/* 3. Live Uptime Counter */}
      <div className="flex items-center gap-4">
        <p className="text-[7px] font-black uppercase tracking-[0.3em] text-accent hidden lg:block">Active_Uptime</p>
        <div className="flex items-baseline gap-2 font-mono text-xs md:text-sm font-black tracking-tighter text-white tabular-nums">
          <div className="flex items-baseline gap-0.5">
            <span>{String(uptime.days).padStart(2, '0')}</span><span className="text-[7px] text-white/20 uppercase font-bold">D</span>
          </div>
          <span className="text-primary/30">:</span>
          <div className="flex items-baseline gap-0.5">
            <span>{String(uptime.hours).padStart(2, '0')}</span><span className="text-[7px] text-white/20 uppercase font-bold">H</span>
          </div>
          <span className="text-primary/30">:</span>
          <div className="flex items-baseline gap-0.5">
            <span>{String(uptime.mins).padStart(2, '0')}</span><span className="text-[7px] text-white/20 uppercase font-bold">M</span>
          </div>
          <span className="text-primary/30">:</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-primary animate-pulse">{String(uptime.secs).padStart(2, '0')}</span><span className="text-[7px] text-primary/40 uppercase font-bold">S</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getBadgeRole = (role) => {
  const r = role?.toLowerCase();
  if (r === 'admin' || r === 'founder' || r === 'visionary') return 'admin';
  if (r === 'faculty') return 'faculty';
  if (r === 'student') return 'student';
  return 'newcomer';
};

const getSocialIcon = (platform) => {
  const p = platform?.toLowerCase();
  if (p.includes('linkedin')) return <i className="ri-linkedin-box-fill text-lg"></i>;
  if (p.includes('github')) return <i className="ri-github-fill text-lg"></i>;
  if (p.includes('twitter') || p.includes('x.com')) return <i className="ri-twitter-x-fill text-lg"></i>;
  if (p.includes('instagram')) return <i className="ri-instagram-line text-lg"></i>;
  if (p.includes('discord')) return <i className="ri-discord-fill text-lg"></i>;
  return <i className="ri-links-line text-lg"></i>;
};

const getArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [String(val)];
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

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
          <div className="flex flex-col items-end gap-2">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary backdrop-blur-md">
              <i className="ri-fingerprint-line text-2xl text-primary"></i>
            </div>
            <VerifyBadge tier="official" />
          </div>
        </div>

        <div className="flex gap-6 mb-8">
          <div className="w-24 h-24 rounded-2xl border-2 border-primary/30 overflow-hidden bg-muted shadow-inner relative">
            <img src={profile.avatar_url || profile.cover_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (profile.username || profile.name)} alt={profile.full_name || profile.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-lg font-black text-foreground uppercase leading-tight">{profile.full_name || profile.name || profile.username}</h3>
            {profile.gender && (
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Gender: {profile.gender}</p>
            )}
            <div className="mt-4">
               <CommunityBadge role={getBadgeRole(profile.role)} />
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
            <i className="ri-close-line text-2xl"></i>
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
      <div className="space-y-2">
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
      </div>
    );
  }

  if (entry.game === 'Valorant') {
    return (
      <div className="space-y-2">
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
      </div>
    );
  }

  if (entry.game === 'Counter-Strike 2') {
    return (
      <div className="space-y-2">
        <div className="text-xs md:text-sm text-muted-foreground break-words">Server: <span className="font-semibold text-foreground">{entry.data.serverName}</span></div>
        <div className="text-xs md:text-sm text-muted-foreground break-words">Peak Rank: <span className="font-semibold text-foreground">{entry.data.peakRankActSeason}</span></div>
        <div className="text-xs md:text-sm text-muted-foreground break-words">Current Rank: <span className="font-semibold text-foreground">{entry.data.currentRank}</span></div>
      </div>
    );
  }

  if (entry.game === 'FIFA') {
    return (
      <div className="space-y-2">
        <div className="text-xs md:text-sm text-muted-foreground break-words">Peak OVR: <span className="font-semibold text-foreground">{entry.data.peakOVR} - {entry.data.peakOvrSeasonYear}</span></div>
        <div className="text-xs md:text-sm text-muted-foreground break-words">Current OVR: <span className="font-semibold text-foreground">{entry.data.currentOvr}</span></div>
      </div>
    );
  }

  if (entry.game === 'Chess') {
    return (
      <div className="space-y-2">
        <div className="text-xs md:text-sm text-muted-foreground break-words">Peak Rating: <span className="font-semibold text-foreground">{entry.data.peakRating}</span></div>
        <div className="text-xs md:text-sm text-muted-foreground break-words">Current Rating: <span className="font-semibold text-foreground">{entry.data.currentRating}</span></div>
      </div>
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
        if (!data.extra_details) data.extra_details = {};

        // Ensure arrays are merged or prioritized from top-level
        data.extra_details.education = data.education || data.extra_details.education || [];
        data.extra_details.social_links = data.social_links || data.extra_details.social_links || [];

        // Fetch Submissions (Research/Projects)
        const { data: submissions, error: subError } = await supabase
          .from('student_submissions')
          .select('*')
          .eq('author_id', data.id)
          .eq('is_pushed', true);

        if (!subError && submissions) {
          data.extra_details.research = submissions.filter(s => s.submission_type === 'research_paper');
          data.extra_details.projects = submissions.filter(s => s.submission_type === 'project');
        } else {
          data.extra_details.research = data.extra_details.research || [];
          data.extra_details.projects = data.extra_details.projects || [];
        }

        // Fetch Payments for Products
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', data.id)
          .eq('status', 'paid');

        if (paymentsData) {
          const courses = paymentsData
            .filter(p => p.purpose.includes('[Course]'))
            .map(p => ({
              name: p.purpose.replace(/\[.*?\]\s*/g, ''),
              progress: 0
            }));
          
          if (courses.length > 0) {
            data.extra_details.enrolled_courses = courses;
          }

          const services = paymentsData
            .filter(p => p.purpose.includes('[Service]'))
            .map(p => p.purpose.replace(/\[.*?\]\s*/g, ''));

          if (services.length > 0) {
            data.extra_details.services = services;
          }

          const academicsData = paymentsData.filter(p => p.purpose.includes('[Academic]'));
          if (academicsData.length > 0) {
              data.extra_details.academics = { 
                ...(data.extra_details.academics || {}), 
                attendance: data.extra_details.academics?.attendance ?? 100 
              };
          }
        }

        setProfile(data);

        // Update Metadata
        updateMetadata({
          title: data.full_name || data.username,
          description: data.bio || `View the official institutional profile of ${data.full_name || data.username} at 5EVEN.`,
          image: data.avatar_url || 'https://5even.netlify.app/assets/images/img/banner.png'
        });
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
        <i className="ri-loader-4-line text-5xl animate-spin text-primary"></i>
        <span className="ml-3 text-muted-foreground font-black tracking-[0.5em] uppercase text-[10px]">Syncing Data</span>
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
    if (r === 'admin') return <i className="ri-shield-star-fill text-primary"></i>;
    if (r === 'faculty') return <i className="ri-graduation-cap-fill text-primary"></i>;
    if (r === 'student') return <i className="ri-user-smile-fill text-primary"></i>;
    return <i className="ri-user-received-2-line text-primary"></i>;
  };

  const eduArr = getArray(profile.education || profile.extra_details?.education);
  const expertiseArr = getArray(profile.expertise || profile.extra_details?.expertise);
  const gamesArr = getArray(profile.extra_details?.gamesPlayed);
  const researchArr = getArray(profile.extra_details?.research);
  const booksArr = getArray(profile.extra_details?.books);
  const projectsArr = getArray(profile.extra_details?.projects);

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

  const research = researchArr;
  const books = booksArr;
  const projects = projectsArr;

  return (
    <div className="min-h-screen bg-background md:bg-[#0a0a0a] pt-28 pb-20 px-4 md:px-8 flex justify-center">

      {/* Profile Container */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative w-full max-w-6xl flex flex-col bg-background md:bg-white/[0.03] backdrop-blur-3xl border-0 md:border border-white/10 rounded-none md:rounded-[40px] md:shadow-[0_0_100px_rgba(0,0,0,0.8)] z-10 overflow-x-hidden"
      >
        {/* Soft Background Gradient for Liquid Glass feel */}
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen rounded-[40px] overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [-20, 20, -20],
              y: [-20, 20, -20]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[50%] -right-[50%] w-full h-full bg-primary/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
              x: [20, -20, 20],
              y: [20, -20, 20]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[50%] -left-[50%] w-full h-full bg-accent/20 rounded-full blur-[120px]" 
          />
          <div className="absolute inset-0 bg-[#0a0a0a]/40" />
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 w-full p-4 md:p-10 lg:p-12">
          {/* Top Bar: System Stats */}
          <div className="flex justify-center md:justify-start mb-6 overflow-x-auto no-scrollbar">
            <AccountStats createdAt={profile.created_at} />
          </div>          <div className="relative z-10 mb-12 flex flex-col md:flex-row items-center gap-6">
            {/* Grouped Floating Identity Node */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              whileHover="hover"
              className="relative shrink-0 z-50 -mb-8 md:mb-0 md:-mr-12 group/idnode"
            >
              {/* Purple Glow Ring (Parent level) */}
              <motion.div 
                variants={{
                  hover: { opacity: 1, scale: 1.1 }
                }}
                className="absolute inset-[-4px] bg-purple-600/30 rounded-full blur-xl opacity-0 transition-opacity" 
              />
              
              {/* Photo Container */}
              <motion.div 
                variants={{
                  hover: { scale: 1.05 }
                }}
                transition={{ duration: 0.3 }}
                className="w-28 h-28 md:w-48 md:h-48 rounded-full border border-purple-500/40 bg-background/80 backdrop-blur-md relative overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.2)]"
              >
                <img 
                  src={profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (profile.username || profile.name)} 
                  alt={profile.full_name || profile.name} 
                  className="w-full h-full object-cover rounded-full transition-transform duration-700 group-hover/idnode:scale-110"
                />
                <div className="absolute inset-0 border border-purple-500/20 rounded-full pointer-events-none" />
              </motion.div>

              {/* Detached Badge */}
              <motion.div 
                variants={{
                  hover: { x: 10, y: 10, scale: 1.1 }
                }}
                transition={{ duration: 0.3 }}
                className="absolute -bottom-2 -right-2 md:bottom-2 md:right-2 z-20 scale-75 md:scale-100"
              >
                <VerifyBadge tier="official" />
              </motion.div>
            </motion.div>

            {/* Main Header Box (Reduced Height) */}
            <div className="flex-1 w-full flex flex-col lg:flex-row items-center justify-between gap-6 px-6 py-6 lg:pl-20 lg:pr-12 rounded-[2rem] md:rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              {/* Background Glows */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse" />
              
              <div className="flex-1 min-w-0 text-center lg:text-left space-y-2 relative z-10 w-full">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white italic tracking-tighter leading-tight bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent break-words max-w-full">
                    {profile.full_name || profile.name || profile.username}
                  </h1>
                  <CommunityBadge role={getBadgeRole(profile.role)} />
                </div>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none">{profile.gender || 'Agent'}</p>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{profile.role || 'Member'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-2">
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <i className="ri-fingerprint-line"></i> {profile.extra_details?.id_number || '70326-0001'}
                  </span>
                  {profile.email && (
                    <span className="px-3 py-1 rounded-lg bg-primary/5 border border-primary/10 text-[8px] font-black lowercase tracking-widest text-primary/50 flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                      <i className="ri-mail-send-line"></i> {profile.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
                <button 
                  onClick={() => setShowID(true)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-black uppercase tracking-widest text-[9px] transition-all flex items-center gap-2 group/btn"
                >
                  <i className="ri-id-card-line text-lg group-hover/btn:rotate-12 transition-transform"></i>
                  ID_NODE
                </button>
                {isOwner && (
                  <button 
                    onClick={() => navigate('/student-zone?tab=settings')}
                    className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-primary/20"
                  >
                    <i className="ri-settings-4-line text-lg"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* KPI Stats Row (Liquid Glass Cards) */}
          {(courses.length > 0 || services.length > 0 || academics.attendance != null) && (
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
            >
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-lg shadow-blue-500/20">
                    <i className="ri-book-open-line text-2xl"></i>
                  </div>
                  <span className="text-3xl font-black text-white italic">{courses.length}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Active Programs</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all shadow-lg shadow-green-500/20">
                    <i className="ri-shield-check-line text-2xl"></i>
                  </div>
                  <span className="text-3xl font-black text-white italic">{courses.filter(c => c.progress === 100).length}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Mastered Skills</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-lg shadow-purple-500/20">
                    <i className="ri-command-line text-2xl"></i>
                  </div>
                  <span className="text-3xl font-black text-white italic">{services.length}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Active Directives</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-all shadow-lg shadow-yellow-500/20">
                    <i className="ri-pulse-line text-2xl"></i>
                  </div>
                  <span className="text-3xl font-black text-white italic">{academics.attendance || 0}%</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Operational Status</p>
              </motion.div>
            </motion.div>
          )}

          {/* Main Content Row 1: Courses & Tasks */}
          {(courses.length > 0 || academics.tasks.length > 0) && (
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
            >
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
            </motion.div>
          )}

          {/* Content Row 1: Bio (Full Width) */}
          <motion.div 
            variants={itemVariants}
            className="w-full bg-gradient-to-br from-primary/10 to-white/5 backdrop-blur-2xl border border-primary/20 rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.1)] relative overflow-hidden mb-8"
          >

            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
              <i className="ri-quill-pen-line text-[12rem]"></i>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-8">Strategic Intelligence Brief</h3>
            <p className="text-lg md:text-2xl text-foreground font-black italic leading-tight tracking-tighter">
              "{profile.bio || profile.description || 'No strategic brief submitted for this operative.'}"
            </p>
            <div className="mt-8 flex flex-wrap gap-6 pt-8 border-t border-white/5">
              {profile.institution && (
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">Base of Operations</span>
                  <div className="flex items-center gap-2 text-xs font-bold text-white/80 uppercase tracking-tight">
                    <i className="ri-building-2-line text-primary"></i> {profile.institution}
                  </div>
                </div>
              )}
              {profile.major && (
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">Sector Expertise</span>
                  <div className="flex items-center gap-2 text-xs font-bold text-white/80 uppercase tracking-tight">
                    <i className="ri-shield-user-line text-primary"></i> {profile.major}
                  </div>
                </div>
              )}
              {academics.attendance != null && (
                <div className="flex flex-col border-l border-white/10 pl-6">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">Activity Index</span>
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-tight">
                    <i className="ri-pulse-line"></i> {academics.attendance}% Operational
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Content Row 3: Socials, Portfolio & Education Side-by-Side */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          >
            {/* Social & Portfolio Column */}
            <div className="flex flex-col gap-6">
              {/* Portfolio Card */}
              {profile.portfolio_url && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-2xl border border-primary/30 rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.15)] group relative overflow-hidden h-fit"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                    <i className="ri-rocket-2-line text-6xl"></i>
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Master Portfolio</h3>
                  <p className="text-sm font-bold text-white/70 mb-6 leading-relaxed uppercase tracking-tight">Access the primary creative & engineering repository matrix.</p>
                  <a 
                    href={profile.portfolio_url.startsWith('http') ? profile.portfolio_url : `https://${profile.portfolio_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
                  >
                    Launch Matrix <i className="ri-external-link-line"></i>
                  </a>
                </motion.div>
              )}

              {/* Social Link Matrix */}
              {profile.social_links && (Array.isArray(profile.social_links) ? profile.social_links.length > 0 : Object.keys(profile.social_links).length > 0) && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                >
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-6">Digital Social Mesh</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.isArray(profile.social_links) ? (
                      profile.social_links.map((link, sIdx) => {
                        const platform = link.platform.toLowerCase();
                        const brandColor = 
                          platform.includes('github') ? 'hover:border-white/40 hover:bg-white/5' :
                          platform.includes('linkedin') ? 'hover:border-blue-500/40 hover:bg-blue-500/5' :
                          platform.includes('twitter') || platform.includes('x') ? 'hover:border-white/40 hover:bg-white/5' :
                          platform.includes('instagram') ? 'hover:border-pink-500/40 hover:bg-pink-500/5' :
                          platform.includes('discord') ? 'hover:border-indigo-500/40 hover:bg-indigo-500/5' :
                          'hover:border-primary/40 hover:bg-primary/5';
                        
                        const iconColor = 
                          platform.includes('linkedin') ? 'group-hover:text-blue-400' :
                          platform.includes('instagram') ? 'group-hover:text-pink-400' :
                          platform.includes('discord') ? 'group-hover:text-indigo-400' :
                          'group-hover:text-primary';

                        return (
                          <motion.a
                            key={sIdx}
                            href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 transition-all group shadow-xl ${brandColor}`}
                          >
                            <div className={`text-3xl transition-all duration-500 group-hover:scale-125 ${iconColor}`}>
                              {getSocialIcon(link.platform)}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">
                              {link.platform}
                            </span>
                          </motion.a>
                        );
                      })
                    ) : (
                      Object.entries(profile.social_links).map(([platform, url], sIdx) => {
                        if (!url) return null;
                        const p = platform.toLowerCase();
                        const brandColor = 
                          p.includes('github') ? 'hover:border-white/40 hover:bg-white/5' :
                          p.includes('linkedin') ? 'hover:border-blue-500/40 hover:bg-blue-500/5' :
                          'hover:border-primary/40 hover:bg-primary/5';
                        
                        return (
                          <motion.a
                            key={sIdx}
                            href={url.startsWith('http') ? url : `https://${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 transition-all group shadow-xl ${brandColor}`}
                          >
                            <div className="text-3xl group-hover:text-primary group-hover:scale-125 transition-all duration-500">
                              {getSocialIcon(platform)}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">
                              {platform}
                            </span>
                          </motion.a>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Education Timeline Column */}
            <div className="lg:col-span-2">
              {eduArr.length > 0 && (
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative h-full">
                  <div className="relative z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-8 flex items-center gap-3">
                      Academic Evolution Timeline
                    </h3>
                    
                    <div className="relative pl-8 space-y-8 mt-10">
                      {/* Precise Connection Header */}
                      <div className="absolute -top-8 left-1.5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                        <span className="text-[7px] font-black uppercase tracking-[0.4em] text-accent">Active Neural Path</span>
                      </div>

                      {/* Base Static Line - Aligned Precisely */}
                      <div className="absolute left-[14px] top-2 bottom-4 w-[2px] bg-white/5" />
                      
                      {/* Liquid Flow Line - Aligned Precisely */}
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 'calc(100% - 24px)' }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="absolute left-[14px] top-2 w-[2px] bg-gradient-to-b from-accent via-primary to-accent bg-[length:100%_200%] animate-gradient-y origin-top z-0" 
                      />

                      {/* Traveling Data Pulse - Aligned Precisely */}
                      <motion.div
                        animate={{ 
                          top: ['-5%', '105%'],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity, 
                          ease: "easeInOut"
                        }}
                        className="absolute left-[11px] w-[8px] h-32 bg-gradient-to-b from-transparent via-accent to-transparent z-10 blur-[3px]"
                      />

                      {eduArr.map((edu, idx) => {
                        const isObject = typeof edu === 'object';
                        return (
                          <motion.div 
                            key={idx} 
                            variants={itemVariants}
                            whileHover={{ x: 10 }}
                            className="relative group/edu"
                          >
                            <motion.div 
                              animate={{ 
                                scale: [1, 1.2, 1],
                                boxShadow: ['0 0 0px rgba(var(--accent-rgb), 0)', '0 0 30px rgba(var(--accent-rgb), 0.8)', '0 0 0px rgba(var(--accent-rgb), 0)']
                              }}
                              transition={{ duration: 3, repeat: Infinity, delay: idx * 0.7 }}
                              className="absolute -left-[23px] top-1.5 w-4 h-4 rounded-full bg-background border-[4px] border-accent z-20 shadow-2xl" 
                            />
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-accent/30 transition-all">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-accent/60">Stage {idx + 1}</span>
                                {isObject && edu.year && (
                                  <span className="text-[9px] font-bold text-white/30">{edu.year}</span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-white">
                                {isObject ? edu.school : edu}
                              </h4>
                              {isObject && edu.degree && (
                                <p className="text-[10px] font-medium text-white/50 uppercase tracking-wide mt-0.5">{edu.degree}</p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Content Row 3: Services & Notes & Specializations */}
          {(services.length > 0 || notes.length > 0 || expertiseArr.length > 0) && (
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
            >

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
            </motion.div>
          )}

          {/* Content Row 4: Combat History & Education */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4"
          >

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



            </motion.div>

          {/* Published Works & Academic Artifacts */}
          {(research.length > 0 || books.length > 0 || projects.length > 0) && (
            <motion.div 
              variants={itemVariants}
              className="mt-8 border-t border-white/10 pt-10"
            >
              <h2 className="text-2xl font-black text-white italic tracking-tighter mb-8 flex items-center gap-4">
                <i className="ri-flask-line text-primary"></i> Published Works & Artifacts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                {(research.length > 0 || projects.length > 0) && (
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] col-span-1 md:col-span-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6">Published Submissions</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {[...research, ...projects].map((paper, idx) => (
                        <motion.div 
                          key={idx} 
                          whileHover={{ y: -5 }}
                          className="p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:border-primary/30 transition-all group overflow-hidden relative"
                        >
                          {paper.cover_image && (
                            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                              <img src={paper.cover_image} className="w-full h-full object-cover grayscale" />
                            </div>
                          )}
                          <div className="relative z-10 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/20">
                              <i className={paper.submission_type === 'research_paper' ? "ri-microscope-line text-xl" : "ri-code-box-line text-xl"}></i>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">{paper.submission_type?.replace('_', ' ')}</span>
                              </div>
                              <p className="text-sm md:text-base font-bold text-white mb-2 leading-tight">{paper.title}</p>
                              <p className="text-[11px] text-white/50 line-clamp-2 mb-4 leading-relaxed">{paper.summary}</p>
                              {paper.content_url && (
                                <a href={paper.content_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                  Access File <i className="ri-external-link-line text-xs"></i>
                                </a>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {books.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6">Authored Manuals</h3>
                    <div className="space-y-4">
                      {books.map((book, idx) => (
                        <motion.div 
                          key={idx} 
                          whileHover={{ x: 5 }}
                          className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/30 transition-all group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform"><i className="ri-book-3-line text-lg"></i></div>
                            <div>
                              <p className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{typeof book === 'object' ? book.title : book}</p>
                              {typeof book === 'object' && book.publisher && (
                                <span className="text-[9px] font-black text-accent/60 uppercase tracking-widest block mt-1">{book.publisher}</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Final Contact Vector (Admin/Faculty/Owner only) */}
          {(isOwner || profile.role?.toLowerCase() === 'admin' || profile.role?.toLowerCase() === 'faculty') && profile.phone && (
            <div className="mt-8 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                  <i className="ri-shield-user-line text-lg"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Direct Secure Line</p>
                  <p className="text-sm font-bold text-white">{profile.phone}</p>
                </div>
              </div>
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Encrypted Data Stream Active</p>
            </div>
          )}

        </div>
      </motion.div>

      <AnimatePresence>
        {showID && (
          <IDCardWindow profile={profile} onClose={() => setShowID(false)} />
        )}
      </AnimatePresence>

    </div>
  );
};

export default PublicProfile;
