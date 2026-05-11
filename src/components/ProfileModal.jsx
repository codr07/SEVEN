import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Fingerprint, CheckCircle2, ShieldCheck, GraduationCap, CircleUser, UserCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const IdentityCard = ({ profile, type }) => {
  const idNumber = profile.extra_details?.id_number || profile.extra_details?.manifesto_id || "70326-0001";
  const userRole = profile.role?.toLowerCase() || '';
  const isFaculty = type === 'faculty' || userRole === 'faculty';
  const isAdmin = userRole === 'admin' || type === 'admin' || type === 'founder';

  const roleLabel = isFaculty ? 'Faculty Expert' : isAdmin ? 'Administrative Lead' : 'Student';
  const cardTitle = isFaculty ? 'Faculty ID' : isAdmin ? 'Admin ID' : 'Student ID';

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-card to-background border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group mb-10">
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

const ProfileModal = ({ profile, type, onClose }) => {
  const [showID, setShowID] = useState(false);

  const IDCardWindow = ({ profile, onClose }) => {
    return (
      <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 md:p-8">
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

          {/* Close Button - Tactical */}
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
            <IdentityCard profile={profile} type={type} />

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

  useEffect(() => {
    if (!profile) return;

    // Prevent scrolling behind modal
    document.body.style.overflow = 'hidden';
    if (window.lenis) {
      window.lenis.stop();
    }
    return () => {
      document.body.style.overflow = '';
      if (window.lenis) {
        window.lenis.start();
      }
    };
  }, [profile]);

  if (!profile) return null;

  const headingLabel = type === 'faculty' ? 'Faculty Profile' : `${profile.role || 'Founder'} Profile`;
  const secondaryLabel = type === 'faculty' ? 'Department' : 'Role';
  const secondaryValue = type === 'faculty' ? profile.topic : profile.role;

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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Blur Backdrop */}
      <div
        className="absolute inset-0 bg-background/90 md:bg-background/80 md:backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container: The Dossier Array */}
      <div
        className="relative w-full h-[100dvh] md:h-auto max-w-7xl md:max-h-[90vh] flex flex-col bg-background md:bg-card/90 backdrop-blur-3xl border-0 md:border border-white/10 rounded-none md:rounded-[40px] shadow-none md:shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500 transform-gpu"
        role="dialog"
        aria-modal="true"
        data-lenis-prevent="true"
      >
        {/* Background Grid Pattern Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Global Close Button */}
        <button
          onClick={onClose}
          className="fixed md:absolute top-4 right-4 md:top-6 md:right-6 z-50 p-3 md:p-4 rounded-full md:rounded-2xl bg-black/60 md:bg-white/10 hover:bg-primary hover:text-white text-white/70 backdrop-blur-xl transition-all border border-white/20 group/close shadow-2xl"
        >
          <X className="w-6 h-6 md:w-5 md:h-5 group-hover/close:rotate-90 transition-transform duration-300" />
        </button>

        {/* Scrolling Canvas */}
        <div className="w-full h-full overflow-y-auto custom-scrollbar relative z-10 flex flex-col pb-24 md:pb-0">

          {/* Panoramic Hero Header */}
          <div className="w-full h-64 md:h-80 relative shrink-0">
            {/* Cover Image */}
            <div className="absolute inset-0 bg-muted overflow-hidden">
              {profile.cover_image || profile.avatar_url ? (
                <img src={profile.cover_image || profile.avatar_url} alt="Cover" className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
            </div>

            {/* Hero Content (Avatar & Name) */}
            <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 flex flex-col md:flex-row md:items-end gap-6 translate-y-12 md:translate-y-16">
              <div className="w-28 h-28 md:w-48 md:h-48 shrink-0 rounded-full md:rounded-[2rem] border-4 md:border-[6px] border-background shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] overflow-hidden relative group bg-muted">
                {profile.cover_image || profile.avatar_url ? (
                  <img src={profile.avatar_url || profile.cover_image} alt={profile.name} className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-primary/10 text-primary">
                    <span className="text-5xl md:text-7xl font-black italic">{profile.name?.charAt(0) || profile.username?.charAt(0)}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 pb-2 md:pb-4">
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md">
                    <CheckCircle2 size={14} className="text-primary" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-primary">{secondaryValue} Verified</span>
                  </div>
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.9] drop-shadow-2xl break-words">
                  {profile.name || profile.full_name}
                </h2>
              </div>
            </div>
          </div>

          {/* Spacer for Hero overlap */}
          <div className="h-20 md:h-28 shrink-0" />

          {/* Bento Box Content Grid */}
          <div className="p-4 md:p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-[1400px] mx-auto">

            {/* Box 1: Identity Card Trigger */}
            <div className="col-span-1 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                <Fingerprint className="w-full h-full" />
              </div>
              <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground mb-4">System Identity</h3>

              <div className="mb-8">
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] text-primary/50 block mb-1">Record Reference</span>
                <span className="text-lg md:text-xl font-mono text-primary font-black tracking-tighter bg-primary/10 px-3 py-1 rounded-md border border-primary/20 inline-block">
                  {profile.extra_details?.id_number || profile.extra_details?.manifesto_id || '70326-0001'}
                </span>
              </div>

              <div className="mt-auto">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-green-500">Active Dossier</span>
                </div>
                <button
                  onClick={() => setShowID(!showID)}
                  className="w-full flex items-center justify-between px-6 py-4 md:px-8 md:py-5 bg-primary text-white rounded-2xl font-black tracking-widest uppercase text-[10px] md:text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  <span>View Security Card</span>
                  <Fingerprint size={18} />
                </button>
              </div>
            </div>

            {/* Box 2: Strategic Brief (Spans 2 cols on Desktop) */}
            <div className="col-span-1 md:col-span-2 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-white/5 border border-white/10 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <i className="ri-folder-user-line text-8xl md:text-9xl"></i>
              </div>
              <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground mb-4 md:mb-6">Strategic Intelligence Brief</h3>
              <p className="text-sm md:text-lg lg:text-2xl text-foreground/90 leading-relaxed font-medium italic pl-4 md:pl-6 border-l-2 md:border-l-4 border-primary/40 relative z-10">
                "{profile.bio || profile.description}"
              </p>
            </div>

            {/* Specializations */}
            {expertiseArr.length > 0 && (
              <div className="col-span-1 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-white/5 border border-white/10 relative overflow-hidden">
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground mb-6">Specializations</h3>
                <div className="flex flex-wrap gap-2 md:gap-3 relative z-10">
                  {expertiseArr.map((skill, idx) => (
                    <span key={idx} className="text-[10px] md:text-xs font-black px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 uppercase tracking-widest hover:bg-primary hover:border-primary transition-all shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Educational Walkthrough */}
            {eduArr.length > 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-1 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-white/5 border border-white/10 relative overflow-hidden">
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground mb-8">Educational Walkthrough</h3>
                <div className="relative pl-6 space-y-6 md:space-y-8">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-accent via-accent/20 to-transparent" />
                  {eduArr.map((edu, idx) => (
                    <div key={idx} className="relative group/edu">
                      <div className="absolute -left-[20px] top-1.5 w-3 h-3 rounded-full bg-background border-[3px] border-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)] group-hover:scale-125 transition-transform" />
                      <div className="p-4 md:p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all">
                        <div className="flex items-center justify-between mb-1 md:mb-2">
                          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-accent/60">Phase {idx + 1}</span>
                          <ChevronRight size={14} className="text-accent/20 group-hover/edu:translate-x-1 transition-transform" />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-foreground/90 leading-tight block">{edu}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Combat History */}
            {gamesArr.length > 0 && (
              <div className="col-span-1 md:col-span-2 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-white/5 border border-white/10 relative overflow-hidden">
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground mb-6 md:mb-8">Combat History</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                  {gamesArr.map((entry, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-6 transition-all relative overflow-hidden group"
                    >
                      <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <i className="ri-game-line text-6xl"></i>
                      </div>
                      <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center p-2 md:p-3 shadow-xl">
                          <img src={entry.logoUrl || '/assets/images/img/thumb.png'} alt={entry.game} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-black text-lg md:text-xl text-white tracking-tight leading-none mb-1 md:mb-2">{entry.game}</p>
                          <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em]">{entry.category}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:gap-3 pt-3 md:pt-4 border-t border-white/5">
                        {renderGameData(entry)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Publications / Links */}
            {(researchArr.length > 0 || booksArr.length > 0 || (profile.linkedin_url && profile.linkedin_url !== '#') || (profile.portfolio_url && profile.portfolio_url !== '#')) && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">

                {/* Reports & Pubs */}
                {(researchArr.length > 0 || booksArr.length > 0) && (
                  <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-white/5 border border-white/10">
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground mb-6">Publications & Reports</h3>
                    <div className="space-y-3 md:space-y-4">
                      {[...researchArr, ...booksArr].map((item, idx) => (
                        <div key={idx} className="p-4 md:p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-secondary/30 transition-colors">
                          <span className="text-sm md:text-base font-bold text-foreground/80 leading-relaxed block">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links */}
                {((profile.linkedin_url && profile.linkedin_url !== '#') || (profile.portfolio_url && profile.portfolio_url !== '#')) && (
                  <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-white/5 border border-white/10 flex flex-col justify-center gap-4">
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground mb-2 md:mb-4">External Links</h3>
                    {profile.linkedin_url && profile.linkedin_url !== '#' && (
                      <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between px-6 py-5 md:py-6 bg-[#0077b5]/20 border border-[#0077b5]/40 text-white rounded-2xl font-black tracking-widest uppercase text-[10px] md:text-xs hover:bg-[#0077b5]/40 transition-all">
                        <span>LinkedIn Network</span>
                        <i className="ri-linkedin-box-fill text-xl md:text-2xl text-[#0077b5]"></i>
                      </a>
                    )}
                    {profile.portfolio_url && profile.portfolio_url !== '#' && (
                      <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between px-6 py-5 md:py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black tracking-widest uppercase text-[10px] md:text-xs hover:bg-white hover:text-black transition-all">
                        <span>Operational Portfolio</span>
                        <i className="ri-global-line text-xl md:text-2xl"></i>
                      </a>
                    )}
                  </div>
                )}

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

    </div>,
    document.body
  );
};

export default ProfileModal;
