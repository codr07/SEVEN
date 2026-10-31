import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Fingerprint, CheckCircle2, ChevronRight, Award, ShieldCheck, ExternalLink, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IdentityCard = ({ profile, type }) => {
  const idNumber = profile.extra_details?.id_number || profile.extra_details?.manifesto_id || "70326-0001";
  const userRole = profile.role?.toLowerCase() || '';
  const isFaculty = type === 'faculty' || userRole === 'faculty';
  const isAdmin = userRole === 'admin' || type === 'admin' || type === 'founder';

  const roleLabel = isFaculty ? 'Imperial Faculty Expert' : isAdmin ? 'Imperial Governance' : 'Institutional Scholar';
  const cardTitle = isFaculty ? 'Faculty Credential' : isAdmin ? 'Governance Credential' : 'Scholar Credential';

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-[#12131a] via-[#08080c] to-[#040406] border border-[#d4af37]/40 rounded-xl p-6 shadow-2xl relative overflow-hidden group mb-6">
      {/* Gold Ambient Flare */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d4af37]/15 rounded-full blur-3xl group-hover:bg-[#d4af37]/25 transition-all duration-700 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#d4af37] mb-1">Official {cardTitle}</h4>
            <p className="text-xl font-heading text-[#fcf6ba] uppercase tracking-wide">
              <span className="font-mono font-bold text-[#d4af37]">5EVEN</span> Institution
            </p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/35 flex items-center justify-center text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Fingerprint size={22} />
          </div>
        </div>

        <div className="flex gap-5 mb-6">
          <div className="w-20 h-20 rounded-lg border border-[#d4af37]/45 overflow-hidden bg-black/60 shadow-inner relative shrink-0">
            <img 
              src={profile.avatar_url || profile.cover_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (profile.username || profile.name)} 
              alt={profile.full_name || profile.name} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-[#d4af37]/10 mix-blend-overlay" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 size={12} className="text-[#d4af37]" />
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#bba782]">Identity Verified</p>
            </div>
            <h3 className="text-lg font-heading text-[#fbf5e6] leading-tight">{profile.full_name || profile.name || profile.username}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />
              <span className="text-[8px] font-mono font-bold text-[#d4af37] uppercase tracking-widest">{roleLabel}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[rgba(212,175,55,0.25)] flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-[#bba782]/70 mb-0.5">Identification No.</span>
            <span className="text-lg font-mono font-bold text-[#fcf6ba] tracking-wider">{idNumber}</span>
          </div>
          <div className="text-[8px] font-mono uppercase tracking-[0.15em] text-[#d4af37]/60 text-right leading-tight">
            Seal of <br /><span className="font-mono font-bold text-[#d4af37]">5EVEN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileModal = ({ profile, type, onClose }) => {
  const [showID, setShowID] = useState(false);

  useEffect(() => {
    if (!profile) return;
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
    return () => {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    };
  }, [profile]);

  if (!profile) return null;

  const secondaryValue = type === 'faculty' ? profile.topic : (profile.role || 'Scholar');

  const getArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [String(val)];
  };

  const eduArr = getArray(profile.extra_details?.education);
  const expertiseArr = getArray(profile.extra_details?.expertise);
  const researchArr = getArray(profile.extra_details?.research);
  const booksArr = getArray(profile.extra_details?.books);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#050507]/92 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Royal Profile Container with Crisp 14px Corners */}
      <div
        className="relative w-full h-[100dvh] md:h-auto max-w-5xl md:max-h-[92vh] flex flex-col bg-[#08080c] border-0 md:border border-[rgba(212,175,55,0.4)] md:rounded-[14px] shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(212,175,55,0.15)] overflow-hidden animate-in zoom-in-95 duration-400"
        role="dialog"
        aria-modal="true"
        data-lenis-prevent="true"
      >
        {/* Subtle Gold Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed md:absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 rounded-lg bg-black/80 hover:bg-[#d4af37] hover:text-black text-[#d4af37] border border-[#d4af37]/40 transition-all shadow-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Dossier Body */}
        <div className="w-full h-full overflow-y-auto no-scrollbar relative z-10 flex flex-col">
          {/* Panoramic Hero Header */}
          <div className="w-full h-56 md:h-64 relative shrink-0 border-b border-[#d4af37]/25">
            <div className="absolute inset-0 bg-[#0c0d12] overflow-hidden">
              {profile.cover_image || profile.avatar_url ? (
                <img src={profile.cover_image || profile.avatar_url} alt="Cover" className="w-full h-full object-cover object-center opacity-30 filter grayscale" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#d4af37]/20 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/70 to-transparent" />
            </div>

            {/* Profile Avatar & Header Identity */}
            <div className="absolute bottom-0 left-0 w-full px-6 md:px-10 flex flex-col md:flex-row md:items-end gap-5 translate-y-10 md:translate-y-12">
              <div className="w-24 h-24 md:w-36 md:h-36 shrink-0 rounded-xl border-2 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.3)] overflow-hidden relative bg-[#0c0d12]">
                {profile.cover_image || profile.avatar_url ? (
                  <img src={profile.avatar_url || profile.cover_image} alt={profile.name} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#d4af37]/10 text-[#d4af37]">
                    <span className="text-4xl md:text-5xl font-heading">{profile.name?.charAt(0) || profile.username?.charAt(0)}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 pb-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#fcf6ba] text-[10px] font-mono uppercase tracking-wider mb-2">
                  <CheckCircle2 size={12} className="text-[#d4af37]" />
                  <span>{secondaryValue} • Verified</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-heading text-[#fbf5e6] tracking-tight leading-none">
                  {profile.name || profile.full_name}
                </h2>
                <p className="text-xs font-mono text-[#bba782] tracking-wider mt-1">
                  Affiliation: <span className="font-mono font-bold text-[#d4af37]">5EVEN</span> Institutional Authority
                </p>
              </div>
            </div>
          </div>

          <div className="h-16 md:h-18 shrink-0" />

          {/* Dossier Grid Details */}
          <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full mx-auto">
            {/* Column 1: Record ID & Identity Trigger */}
            <div className="col-span-1 p-6 rounded-xl bg-gradient-to-br from-[#12131a] to-[#08080c] border border-[rgba(212,175,55,0.3)] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] block mb-2">Institutional Record</span>
                <div className="p-3 bg-black/60 rounded-lg border border-[rgba(212,175,55,0.25)] mb-6">
                  <span className="text-[8px] font-mono text-[#bba782] uppercase tracking-widest block mb-1">ID Number</span>
                  <span className="text-base font-mono font-bold text-[#fcf6ba] tracking-wider">
                    {profile.extra_details?.id_number || profile.extra_details?.manifesto_id || '70326-0001'}
                  </span>
                </div>
                <p className="text-xs font-serif-body text-[#bba782] leading-relaxed">
                  Official certified portfolio record authenticated by the <span className="font-mono font-bold text-[#d4af37]">5EVEN</span> Academic Registrar.
                </p>
              </div>

              <button
                onClick={() => setShowID(!showID)}
                className="mt-6 w-full py-3 liquid-btn-primary text-xs flex items-center justify-center gap-2"
              >
                <Fingerprint size={16} />
                <span>Security Dossier</span>
              </button>
            </div>

            {/* Column 2 & 3: Strategic Brief & Scholarly Highlights */}
            <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
              {/* Strategic Brief */}
              <div className="p-6 md:p-8 rounded-xl bg-[#0f1017] border border-[rgba(212,175,55,0.3)]">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] block mb-3">Academic & Professional Brief</span>
                <p className="font-serif-body text-base md:text-lg text-[#fbf5e6] leading-relaxed font-light italic pl-4 border-l-2 border-[#d4af37]">
                  "{profile.bio || profile.description || 'Dedicated to advancing scholarship, intellectual rigor, and transformative instruction.'}"
                </p>
              </div>

              {/* Specializations & Tracks */}
              {expertiseArr.length > 0 && (
                <div className="p-6 rounded-xl bg-[#0f1017] border border-[rgba(212,175,55,0.3)]">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] block mb-3">Mastery & Specializations</span>
                  <div className="flex flex-wrap gap-2">
                    {expertiseArr.map((skill, idx) => (
                      <span key={idx} className="text-xs font-mono px-3 py-1.5 rounded-md bg-black/60 text-[#fcf6ba] border border-[rgba(212,175,55,0.3)]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education & Publications */}
              {(eduArr.length > 0 || researchArr.length > 0 || booksArr.length > 0) && (
                <div className="p-6 rounded-xl bg-[#0f1017] border border-[rgba(212,175,55,0.3)] space-y-4">
                  {eduArr.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] block mb-2">Education Milestones</span>
                      <div className="space-y-2">
                        {eduArr.map((edu, idx) => (
                          <div key={idx} className="p-3 bg-black/40 rounded-lg border border-[rgba(212,175,55,0.2)] text-xs font-serif-body text-[#bba782]">
                            • {edu}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(researchArr.length > 0 || booksArr.length > 0) && (
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] block mb-2">Treatises & Publications</span>
                      <div className="space-y-2">
                        {[...researchArr, ...booksArr].map((item, idx) => (
                          <div key={idx} className="p-3 bg-black/40 rounded-lg border border-[rgba(212,175,55,0.2)] text-xs font-serif-body text-[#fbf5e6]">
                            <Bookmark size={12} className="inline mr-2 text-[#d4af37]" /> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* External Links */}
              {((profile.linkedin_url && profile.linkedin_url !== '#') || (profile.portfolio_url && profile.portfolio_url !== '#')) && (
                <div className="flex flex-wrap gap-3">
                  {profile.linkedin_url && profile.linkedin_url !== '#' && (
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex-1 py-3 px-4 bg-black/60 border border-[rgba(212,175,55,0.3)] text-[#fcf6ba] rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-between hover:border-[#d4af37] transition">
                      <span>LinkedIn Profile</span>
                      <ExternalLink size={14} className="text-[#d4af37]" />
                    </a>
                  )}
                  {profile.portfolio_url && profile.portfolio_url !== '#' && (
                    <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="flex-1 py-3 px-4 bg-black/60 border border-[rgba(212,175,55,0.3)] text-[#fcf6ba] rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-between hover:border-[#d4af37] transition">
                      <span>Scholarly Work</span>
                      <ExternalLink size={14} className="text-[#d4af37]" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ID Security Card Window */}
      <AnimatePresence>
        {showID && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowID(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-50 w-full max-w-md p-4"
            >
              <button
                onClick={() => setShowID(false)}
                className="absolute -top-12 right-4 p-2 rounded-lg bg-black text-[#d4af37] border border-[#d4af37]/40"
              >
                <X size={20} />
              </button>
              <IdentityCard profile={profile} type={type} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default ProfileModal;
