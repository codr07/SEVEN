import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, withTimeout } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { updateMetadata } from '../lib/seo';
import { motion, AnimatePresence } from 'framer-motion';
import { CommunityBadge, VerifyBadge } from '@/components/ui/SocialBadges';

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
    <div className="relative group px-5 py-3 rounded-xl border border-[#d4af37]/30 bg-[#050507]/90 backdrop-blur-xl overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-10 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
      {/* Gold Ambient Backing */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />
      
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#d4af37]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#d4af37]" />

      {/* 1. Status Indicator */}
      <div className="flex items-center gap-2 shrink-0 border-r border-[#d4af37]/20 pr-6 hidden md:flex">
        <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#d4af37]">NODE_ONLINE</span>
      </div>

      {/* 2. Initialization Date */}
      <div className="flex flex-col border-r border-white/10 pr-8">
        <p className="text-[8px] font-mono font-bold uppercase tracking-[0.25em] text-[#a1a1aa] mb-0.5">INITIALIZED</p>
        <p className="text-[11px] font-mono font-bold text-[#fcf6ba] tracking-wider leading-none">{formatDate(createdAt)}</p>
      </div>

      {/* 3. Live Uptime Counter */}
      <div className="flex items-center gap-4">
        <p className="text-[8px] font-mono font-bold uppercase tracking-[0.25em] text-[#d4af37] hidden lg:block">ACTIVE_UPTIME</p>
        <div className="flex items-baseline gap-2 font-mono text-xs md:text-sm font-bold tracking-tight text-white tabular-nums">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[#fcf6ba]">{String(uptime.days).padStart(2, '0')}</span><span className="text-[8px] text-[#d4af37]/60 uppercase font-mono">D</span>
          </div>
          <span className="text-[#d4af37]/50">:</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[#fcf6ba]">{String(uptime.hours).padStart(2, '0')}</span><span className="text-[8px] text-[#d4af37]/60 uppercase font-mono">H</span>
          </div>
          <span className="text-[#d4af37]/50">:</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[#fcf6ba]">{String(uptime.mins).padStart(2, '0')}</span><span className="text-[8px] text-[#d4af37]/60 uppercase font-mono">M</span>
          </div>
          <span className="text-[#d4af37]/50">:</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[#d4af37] animate-pulse">{String(uptime.secs).padStart(2, '0')}</span><span className="text-[8px] text-[#d4af37] uppercase font-mono">S</span>
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
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const IdentityCard = ({ profile, type }) => {
  const idNumber = profile.extra_details?.id_number || profile.extra_details?.manifesto_id || "70326-0001";
  const userRole = profile.role?.toLowerCase() || '';
  const isFaculty = type === 'faculty' || userRole === 'faculty';
  const isAdmin = userRole === 'admin' || userRole === 'founder' || userRole === 'visionary' || type === 'admin' || type === 'founder';
  const cardTitle = isFaculty ? 'Faculty ID' : isAdmin ? 'Admin ID' : 'Scholar ID';

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-[#0e0e13] to-[#050507] border border-[#d4af37]/40 rounded-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden group">
      {/* Subtle Gold Ambient Overlay */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h4 className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#d4af37] mb-1">Official {cardTitle}</h4>
            <p className="text-xl font-serif font-bold text-[#fcf6ba] tracking-tight">
              <span className="font-mono text-[#d4af37]">5EVEN</span> Institution
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="w-10 h-10 rounded-lg bg-black/60 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] backdrop-blur-md shadow-inner">
              <i className="ri-fingerprint-line text-xl text-[#d4af37]"></i>
            </div>
            <VerifyBadge tier="official" />
          </div>
        </div>

        <div className="flex gap-5 mb-6">
          <div className="w-20 h-20 rounded-lg border border-[#d4af37]/40 overflow-hidden bg-black/70 shadow-lg relative shrink-0">
            <img 
              src={profile.avatar_url || profile.cover_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (profile.username || profile.name)} 
              alt={profile.full_name || profile.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-base font-serif font-bold text-white uppercase leading-snug">{profile.full_name || profile.name || profile.username}</h3>
            {profile.gender && (
              <p className="text-[9px] font-mono text-[#a1a1aa] uppercase tracking-wider mt-0.5">Gender: {profile.gender}</p>
            )}
            <div className="mt-2.5">
               <CommunityBadge role={getBadgeRole(profile.role)} />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#d4af37]/20 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-[#a1a1aa] mb-1">ID Number</span>
            <span className="text-base font-mono font-bold text-[#fcf6ba] tracking-widest">{idNumber}</span>
          </div>
          <div className="text-[8px] font-mono uppercase tracking-wider text-[#d4af37] text-right leading-tight">
            Authorized by <br /> <span className="font-mono font-bold text-[#fcf6ba]">5EVEN</span> Council
          </div>
        </div>
      </div>
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
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg select-none z-50"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 flex items-center gap-2 text-[#a1a1aa] hover:text-[#fcf6ba] transition-all group"
        >
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#d4af37]">Close Dossier</span>
          <div className="p-2 rounded-lg bg-black/60 border border-[#d4af37]/30 group-hover:border-[#d4af37] transition-all">
            <i className="ri-close-line text-lg text-white"></i>
          </div>
        </button>

        <div className="relative p-2 rounded-xl bg-black/70 border border-[#d4af37]/40 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
          <IdentityCard profile={profile} type={profile.role?.toLowerCase() || 'student'} />
        </div>
      </motion.div>
    </div>
  );
};

const renderGameData = (entry) => {
  if (entry.game === 'Call of Duty Mobile') {
    return (
      <div className="space-y-1.5 font-mono text-xs text-[#a1a1aa]">
        <div className="flex flex-wrap items-center gap-2">
          MP Rank: <span className="font-bold text-[#fcf6ba]">{entry.data.mpRankCurrent}</span>
        </div>
        <div>MP Legendaries: <span className="font-bold text-[#fcf6ba]">{entry.data.mpLegendaries}</span></div>
        <div className="flex flex-wrap items-center gap-2">
          BR Rank: <span className="font-bold text-[#fcf6ba]">{entry.data.brRankCurrent}</span>
        </div>
        <div>BR Legendaries: <span className="font-bold text-[#fcf6ba]">{entry.data.brLegendaries}</span></div>
      </div>
    );
  }

  if (entry.game === 'Valorant') {
    return (
      <div className="space-y-1.5 font-mono text-xs text-[#a1a1aa]">
        <div>Server: <span className="font-bold text-[#fcf6ba]">{entry.data.serverName}</span></div>
        <div>Peak Rank: <span className="font-bold text-[#fcf6ba]">{entry.data.peakRankActSeason}</span></div>
        <div>Current Rank: <span className="font-bold text-[#fcf6ba]">{entry.data.currentRank}</span></div>
      </div>
    );
  }

  if (entry.game === 'Counter-Strike 2') {
    return (
      <div className="space-y-1.5 font-mono text-xs text-[#a1a1aa]">
        <div>Server: <span className="font-bold text-[#fcf6ba]">{entry.data.serverName}</span></div>
        <div>Peak Rank: <span className="font-bold text-[#fcf6ba]">{entry.data.peakRankActSeason}</span></div>
        <div>Current Rank: <span className="font-bold text-[#fcf6ba]">{entry.data.currentRank}</span></div>
      </div>
    );
  }

  if (entry.game === 'FIFA') {
    return (
      <div className="space-y-1.5 font-mono text-xs text-[#a1a1aa]">
        <div>Peak OVR: <span className="font-bold text-[#fcf6ba]">{entry.data.peakOVR} - {entry.data.peakOvrSeasonYear}</span></div>
        <div>Current OVR: <span className="font-bold text-[#fcf6ba]">{entry.data.currentOvr}</span></div>
      </div>
    );
  }

  if (entry.game === 'Chess') {
    return (
      <div className="space-y-1.5 font-mono text-xs text-[#a1a1aa]">
        <div>Peak Rating: <span className="font-bold text-[#fcf6ba]">{entry.data.peakRating}</span></div>
        <div>Current Rating: <span className="font-bold text-[#fcf6ba]">{entry.data.currentRating}</span></div>
      </div>
    );
  }

  return null;
};

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showID, setShowID] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const query = supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        const { data, error: dbError } = await withTimeout(query, 10000, 'Request took too long to complete. Please try again.');

        if (dbError) throw dbError;
        if (!data) throw new Error('Profile not found.');

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

        data.name = data.full_name || data.username;
        data.description = data.bio;
        data.cover_image = data.avatar_url;
        if (!data.extra_details) data.extra_details = {};

        data.extra_details.education = data.education || data.extra_details.education || [];
        data.extra_details.social_links = data.social_links || data.extra_details.social_links || [];

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

  const handleApplyIdCard = async () => {
    try {
      const newExtraDetails = { ...profile.extra_details, id_card_status: 'applied' };
      const { error } = await supabase
        .from('profiles')
        .update({ extra_details: newExtraDetails })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      setProfile({ ...profile, extra_details: newExtraDetails });
      showAlert('Success', 'Application for Digital ID submitted successfully!');
    } catch (err) {
      console.error('Failed to apply for ID', err);
      showAlert('Error', 'Failed to apply for ID. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center bg-[#050507]">
        <i className="ri-loader-4-line text-4xl animate-spin text-[#d4af37]"></i>
        <span className="ml-3 font-mono font-bold tracking-[0.3em] uppercase text-xs text-[#d4af37]">Accessing Dossier</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center bg-[#050507] px-4 text-center">
        <h2 className="text-3xl font-serif font-bold text-[#fcf6ba] mb-3">Record Unavailable</h2>
        <p className="text-[#a1a1aa] mb-8 max-w-md text-sm">{error || `The user record '${username}' could not be located.`}</p>
        <div className="flex items-center gap-4">
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-lg border border-[#d4af37]/40 hover:bg-[#d4af37]/10 text-[#fcf6ba] font-mono font-bold uppercase tracking-wider text-xs transition-colors">
            Retry
          </button>
          <button onClick={() => navigate('/')} className="btn-primary text-xs">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === profile.id;

  const eduArr = getArray(profile.education || profile.extra_details?.education);
  const expertiseArr = getArray(profile.expertise || profile.extra_details?.expertise);
  const gamesArr = getArray(profile.extra_details?.gamesPlayed);
  const researchArr = getArray(profile.extra_details?.research);
  const booksArr = getArray(profile.extra_details?.books);
  const projectsArr = getArray(profile.extra_details?.projects);

  const courses = profile.extra_details?.enrolled_courses || [];
  const services = profile.extra_details?.services || [];
  const notes = profile.extra_details?.purchased_notes || [];
  const academics = profile.extra_details?.academics || {
    attendance: null,
    avgGrade: null,
    tasks: []
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#e6e6e6] pt-28 pb-20 px-4 md:px-8 flex justify-center">

      {/* Profile Container */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative w-full max-w-6xl flex flex-col bg-[#0c0d12]/90 backdrop-blur-2xl border border-[#d4af37]/30 rounded-xl shadow-[0_20px_80px_rgba(0,0,0,0.95)] z-10 overflow-hidden"
      >
        {/* Subtle Imperial Gold Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

        {/* Main Content Area */}
        <div className="relative z-10 w-full p-6 md:p-10 lg:p-12">
          {/* Top Bar: System Stats */}
          <div className="flex justify-center md:justify-start mb-8 overflow-x-auto no-scrollbar">
            <AccountStats createdAt={profile.created_at} />
          </div>

          {/* Profile Header Dossier */}
          <div className="relative z-10 mb-10 flex flex-col md:flex-row items-center gap-6">
            {/* Identity Photo Node */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 md:w-40 md:h-40 rounded-xl border-2 border-[#d4af37]/40 bg-black/80 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative group">
                <img 
                  src={profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (profile.username || profile.name)} 
                  alt={profile.full_name || profile.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
              <div className="absolute -bottom-2 -right-2 z-20">
                <VerifyBadge tier="official" />
              </div>
            </div>

            {/* Main Header Box */}
            <div className="flex-1 w-full flex flex-col lg:flex-row items-center justify-between gap-6 px-6 py-6 lg:px-8 rounded-xl bg-black/60 border border-[#d4af37]/20 shadow-xl relative overflow-hidden">
              <div className="flex-1 min-w-0 text-center lg:text-left space-y-2 relative z-10 w-full">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#fcf6ba] tracking-tight">
                    {profile.full_name || profile.name || profile.username}
                  </h1>
                  <CommunityBadge role={getBadgeRole(profile.role)} />
                </div>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#d4af37]">
                    {profile.role || 'Member'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#d4af37]/40" />
                  <span className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider">
                    {profile.gender || 'Scholar'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-3">
                  <span className="px-3 py-1 rounded-lg bg-black/80 border border-[#d4af37]/30 text-[9px] font-mono text-[#fcf6ba] flex items-center gap-2">
                    <i className="ri-fingerprint-line text-[#d4af37]"></i> {profile.extra_details?.id_number || '70326-0001'}
                  </span>
                  {profile.email && (
                    <span className="px-3 py-1 rounded-lg bg-black/80 border border-[#d4af37]/20 text-[9px] font-mono text-[#a1a1aa] flex items-center gap-2">
                      <i className="ri-mail-send-line text-[#d4af37]"></i> {profile.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
                <button 
                  onClick={() => setShowID(true)}
                  className="px-5 py-2.5 rounded-lg bg-black/70 border border-[#d4af37]/40 hover:border-[#d4af37] hover:bg-[#d4af37]/10 text-[#fcf6ba] font-mono font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2"
                >
                  <i className="ri-id-card-line text-[#d4af37]"></i>
                  CREDENTIAL_NODE
                </button>
                {isOwner && (
                  <button 
                    onClick={handleApplyIdCard}
                    disabled={profile.extra_details?.id_card_status === 'applied'}
                    className={`px-5 py-2.5 rounded-lg border font-mono font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${profile.extra_details?.id_card_status === 'applied' ? 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#fcf6ba] opacity-80 cursor-not-allowed' : 'bg-black/70 border-[#d4af37]/40 hover:border-[#d4af37] text-white hover:bg-[#d4af37]/10'}`}
                  >
                    {profile.extra_details?.id_card_status === 'applied' ? (
                      <><i className="ri-check-line text-[#d4af37]"></i> APPLIED</>
                    ) : (
                      <><i className="ri-file-add-line text-[#d4af37]"></i> REQUEST ID</>
                    )}
                  </button>
                )}
                {isOwner && (
                  <button 
                    onClick={() => navigate('/student-zone?tab=settings')}
                    className="w-10 h-10 rounded-lg bg-black/70 border border-[#d4af37]/40 text-[#d4af37] hover:text-[#fcf6ba] hover:border-[#d4af37] flex items-center justify-center transition-all shadow-md"
                  >
                    <i className="ri-settings-4-line text-lg"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* KPI Stats Row */}
          {(courses.length > 0 || services.length > 0 || academics.attendance != null) && (
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-black/60 border border-[#d4af37]/20 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                    <i className="ri-book-open-line text-xl"></i>
                  </div>
                  <span className="text-2xl font-mono font-bold text-[#fcf6ba]">{courses.length}</span>
                </div>
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#a1a1aa]">Active Programs</p>
              </div>

              <div className="bg-black/60 border border-[#d4af37]/20 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                    <i className="ri-shield-check-line text-xl"></i>
                  </div>
                  <span className="text-2xl font-mono font-bold text-[#fcf6ba]">{courses.filter(c => c.progress === 100).length}</span>
                </div>
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#a1a1aa]">Mastered Disciplines</p>
              </div>

              <div className="bg-black/60 border border-[#d4af37]/20 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                    <i className="ri-command-line text-xl"></i>
                  </div>
                  <span className="text-2xl font-mono font-bold text-[#fcf6ba]">{services.length}</span>
                </div>
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#a1a1aa]">Directives</p>
              </div>

              <div className="bg-black/60 border border-[#d4af37]/20 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                    <i className="ri-pulse-line text-xl"></i>
                  </div>
                  <span className="text-2xl font-mono font-bold text-[#fcf6ba]">{academics.attendance || 0}%</span>
                </div>
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#a1a1aa]">Execution Index</p>
              </div>
            </motion.div>
          )}

          {/* Bio Strategic Brief */}
          <motion.div 
            variants={itemVariants}
            className="w-full bg-black/60 border border-[#d4af37]/30 rounded-xl p-6 md:p-8 shadow-xl relative overflow-hidden mb-8"
          >
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-4">
              Strategic Treatise & Dossier
            </h3>
            <p className="text-base md:text-xl text-[#fcf6ba] font-serif italic leading-relaxed">
              "{profile.bio || profile.description || 'No strategic brief submitted for this member.'}"
            </p>
            <div className="mt-6 flex flex-wrap gap-6 pt-6 border-t border-[#d4af37]/20">
              {profile.institution && (
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#a1a1aa] mb-1">Base of Operations</span>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                    <i className="ri-building-2-line text-[#d4af37]"></i> {profile.institution}
                  </div>
                </div>
              )}
              {profile.major && (
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#a1a1aa] mb-1">Domain Focus</span>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                    <i className="ri-shield-user-line text-[#d4af37]"></i> {profile.major}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Socials & Education Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          >
            {/* Social & Portfolio Column */}
            <div className="flex flex-col gap-6">
              {profile.portfolio_url && (
                <div className="bg-black/60 border border-[#d4af37]/30 rounded-xl p-6 shadow-lg">
                  <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#d4af37] mb-3">Portfolio Registry</h3>
                  <p className="text-xs text-[#a1a1aa] mb-5 leading-relaxed">Direct connection to creative repository and treatises.</p>
                  <a 
                    href={profile.portfolio_url.startsWith('http') ? profile.portfolio_url : `https://${profile.portfolio_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-black text-[#fcf6ba] font-mono font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 transition-all"
                  >
                    Open Registry <i className="ri-external-link-line"></i>
                  </a>
                </div>
              )}

              {profile.social_links && (Array.isArray(profile.social_links) ? profile.social_links.length > 0 : Object.keys(profile.social_links).length > 0) && (
                <div className="bg-black/60 border border-[#d4af37]/20 rounded-xl p-6 shadow-lg">
                  <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#d4af37] mb-4">Network Coordinates</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.isArray(profile.social_links) ? (
                      profile.social_links.map((link, sIdx) => (
                        <a
                          key={sIdx}
                          href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-black/50 border border-[#d4af37]/20 hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-all group"
                        >
                          <div className="text-2xl text-[#d4af37] group-hover:scale-110 transition-transform">
                            {getSocialIcon(link.platform)}
                          </div>
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#a1a1aa] group-hover:text-[#fcf6ba]">
                            {link.platform}
                          </span>
                        </a>
                      ))
                    ) : (
                      Object.entries(profile.social_links).map(([platform, url], sIdx) => {
                        if (!url) return null;
                        return (
                          <a
                            key={sIdx}
                            href={url.startsWith('http') ? url : `https://${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-black/50 border border-[#d4af37]/20 hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-all group"
                          >
                            <div className="text-2xl text-[#d4af37] group-hover:scale-110 transition-transform">
                              {getSocialIcon(platform)}
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#a1a1aa] group-hover:text-[#fcf6ba]">
                              {platform}
                            </span>
                          </a>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Education Timeline */}
            <div className="lg:col-span-2">
              {eduArr.length > 0 && (
                <div className="bg-black/60 border border-[#d4af37]/20 rounded-xl p-6 md:p-8 shadow-lg h-full">
                  <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#d4af37] mb-6">
                    Academic Evolution
                  </h3>
                  <div className="space-y-4">
                    {eduArr.map((edu, idx) => {
                      const isObject = typeof edu === 'object';
                      return (
                        <div key={idx} className="p-4 rounded-lg bg-black/40 border border-[#d4af37]/15 hover:border-[#d4af37]/40 transition-all">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-mono font-bold text-[#d4af37]">STAGE 0{idx + 1}</span>
                            {isObject && edu.year && (
                              <span className="text-[10px] font-mono text-[#a1a1aa]">{edu.year}</span>
                            )}
                          </div>
                          <h4 className="text-sm font-serif font-bold text-white">
                            {isObject ? edu.school : edu}
                          </h4>
                          {isObject && edu.degree && (
                            <p className="text-[11px] font-mono text-[#a1a1aa] uppercase tracking-wide mt-1">{edu.degree}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Specializations & Services */}
          {(services.length > 0 || notes.length > 0 || expertiseArr.length > 0) && (
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {services.length > 0 && (
                <div className="bg-black/60 border border-[#d4af37]/20 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#d4af37] mb-4">Engaged Services</h3>
                  <div className="space-y-2.5">
                    {services.map((service, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-black/40 border border-[#d4af37]/15 flex items-center gap-3">
                        <i className="ri-vip-diamond-line text-[#d4af37]"></i>
                        <span className="text-xs font-mono text-[#fcf6ba]">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notes.length > 0 && (
                <div className="bg-black/60 border border-[#d4af37]/20 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#d4af37] mb-4">Library Access</h3>
                  <div className="space-y-2.5">
                    {notes.map((note, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-black/40 border border-[#d4af37]/15 flex items-center gap-3">
                        <i className="ri-file-text-line text-[#d4af37]"></i>
                        <span className="text-xs font-mono text-[#fcf6ba]">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expertiseArr.length > 0 && (
                <div className="bg-black/60 border border-[#d4af37]/20 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#d4af37] mb-4">Competency Core</h3>
                  <div className="flex flex-wrap gap-2">
                    {expertiseArr.map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-black/60 border border-[#d4af37]/30 text-[#fcf6ba] uppercase tracking-wider">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Combat & Recreational History */}
          {gamesArr.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8">
              <div className="bg-black/60 border border-[#d4af37]/20 rounded-xl p-6 md:p-8 shadow-lg">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#d4af37] mb-6">Strategic Gaming Arena</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gamesArr.map((entry, idx) => (
                    <div key={idx} className="bg-black/40 border border-[#d4af37]/15 rounded-xl p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-black border border-[#d4af37]/30 flex items-center justify-center p-2">
                          <img src={entry.logoUrl || '/assets/images/img/thumb.png'} alt={entry.game} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-serif font-bold text-base text-white">{entry.game}</p>
                          <span className="text-[9px] font-mono text-[#d4af37] uppercase tracking-wider">{entry.category}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-[#d4af37]/15">
                        {renderGameData(entry)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Published Works & Submissions */}
          {(researchArr.length > 0 || booksArr.length > 0 || projectsArr.length > 0) && (
            <motion.div 
              variants={itemVariants}
              className="mt-8 border-t border-[#d4af37]/20 pt-8"
            >
              <h2 className="text-xl font-serif font-bold text-[#fcf6ba] tracking-tight mb-6 flex items-center gap-3">
                <i className="ri-flask-line text-[#d4af37]"></i> Treatises & Scholarly Artifacts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...researchArr, ...projectsArr].map((paper, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-black/60 border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shrink-0">
                        <i className={paper.submission_type === 'research_paper' ? "ri-microscope-line text-lg" : "ri-code-box-line text-lg"}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-[#d4af37] block mb-1">
                          {paper.submission_type?.replace('_', ' ')}
                        </span>
                        <p className="text-sm font-serif font-bold text-white mb-1.5 leading-snug">{paper.title}</p>
                        <p className="text-xs text-[#a1a1aa] line-clamp-2 mb-3 leading-relaxed">{paper.summary}</p>
                        {paper.content_url && (
                          <a href={paper.content_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#d4af37]/10 text-[#fcf6ba] border border-[#d4af37]/30 text-[9px] font-mono uppercase tracking-wider hover:bg-[#d4af37] hover:text-black transition-all">
                            Review Manuscript <i className="ri-external-link-line text-xs"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Secure Contact Node */}
          {(isOwner || profile.role?.toLowerCase() === 'admin' || profile.role?.toLowerCase() === 'faculty') && profile.phone && (
            <div className="mt-8 p-5 rounded-xl bg-black/60 border border-[#d4af37]/20 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                  <i className="ri-shield-user-line text-base"></i>
                </div>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-[#a1a1aa] leading-none mb-1">Direct Secure Line</p>
                  <p className="text-xs font-mono font-bold text-[#fcf6ba]">{profile.phone}</p>
                </div>
              </div>
              <p className="text-[8px] font-mono text-[#d4af37] uppercase tracking-[0.25em]">Authenticated by <span className="font-mono font-bold">5EVEN</span> Network</p>
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
