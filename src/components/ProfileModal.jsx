import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

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

const ProfileModal = ({ profile, type, onClose }) => {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-5xl h-auto max-h-[95vh] md:max-h-[85vh] flex flex-col md:flex-row bg-card/60 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transform-gpu ring-1 ring-border/50"
        role="dialog"
        aria-modal="true"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-background/80 hover:bg-primary/20 hover:text-primary text-foreground/70 backdrop-blur-md transition-all border border-border mt-1 mr-1"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Left Sticky Sidebar */}
        <div className="w-full md:w-[35%] shrink-0 bg-gradient-to-b from-muted/30 to-background flex flex-col items-center p-8 md:p-10 border-b md:border-b-0 md:border-r border-border/50 overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-background shadow-2xl overflow-hidden mb-6 relative group">
            <div className="absolute inset-0 bg-primary/20 mix-blend-overlay group-hover:bg-transparent transition-all duration-500"></div>
            {profile.cover_image ? (
              <img src={profile.cover_image} alt={profile.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-primary/10 text-primary">
                <span className="text-7xl font-black">{profile.name?.charAt(0)}</span>
              </div>
            )}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black text-center text-foreground mb-1">{profile.name}</h2>
          <p className="text-sm font-bold text-primary uppercase tracking-widest text-center mb-8">{secondaryValue}</p>
          
          <div className="flex flex-col gap-4 w-full">
            {profile.linkedin_url && profile.linkedin_url !== '#' && (
               <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#0A66C2] text-white py-3.5 rounded-xl font-bold tracking-widest uppercase text-sm hover:bg-[#08488e] transition-all hover:-translate-y-1 shadow-lg shadow-[#0A66C2]/20">
                 <i className="ri-linkedin-fill text-lg"></i> LinkedIn
               </a>
            )}
            {profile.link && profile.link !== '#' && !profile.linkedin_url && (
               <a href={profile.link} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#0A66C2] text-white py-3.5 rounded-xl font-bold tracking-widest uppercase text-sm hover:bg-[#08488e] transition-all hover:-translate-y-1 shadow-lg shadow-[#0A66C2]/20">
                 <i className="ri-linkedin-fill text-lg"></i> LinkedIn
               </a>
            )}
            {profile.portfolio_url && profile.portfolio_url !== '#' && (
               <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 text-foreground border-2 border-foreground py-3 rounded-xl font-bold tracking-widest uppercase text-sm hover:bg-foreground hover:text-background transition-all hover:-translate-y-1">
                 <i className="ri-global-line text-lg"></i> Portfolio
               </a>
            )}
          </div>
        </div>

        {/* Right Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12 relative bg-card/90" data-lenis-prevent="true">
          
          <div className="flex items-center gap-3 mb-8">
            <span className="h-10 w-2 rounded-full bg-primary block"></span>
            <p className="text-xl md:text-2xl font-bold tracking-wide text-foreground uppercase">{headingLabel}</p>
          </div>

          <div className="flex flex-col gap-10">

            <div className="border-l-4 border-muted pl-6 py-2">
              <p className="text-muted-foreground leading-relaxed text-lg italic whitespace-pre-wrap">
                "{profile.bio || profile.description}"
              </p>
            </div>

            {type === 'faculty' && profile.stars && (
              <div>
                <span className="text-xs uppercase font-extrabold text-muted-foreground tracking-widest mb-3 block">Instructor Rating</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-3xl text-foreground">{profile.stars}</span>
                  <div className="flex gap-1 text-2xl text-yellow-500">
                    <i className="ri-star-fill"></i>
                  </div>
                </div>
              </div>
            )}

            {eduArr.length > 0 && (
              <div>
                <span className="text-xs uppercase font-extrabold text-muted-foreground tracking-widest mb-4 block">Education & Alumni</span>
                <ul className="flex flex-col gap-3">
                  {eduArr.map((edu, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                        <i className="ri-graduation-cap-fill text-lg"></i>
                      </div>
                      <span className="text-foreground leading-relaxed font-medium mt-2">{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {expertiseArr.length > 0 && (
              <div>
                <span className="text-xs uppercase font-extrabold text-muted-foreground tracking-widest mb-4 block">Domain Expertise</span>
                <div className="flex flex-wrap gap-2">
                  {expertiseArr.map((skill, idx) => (
                    <span key={idx} className="text-sm font-bold px-5 py-2.5 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {gamesArr.length > 0 && (
              <div>
                <span className="text-xs uppercase font-extrabold text-muted-foreground tracking-widest mb-4 block">Gaming Persona & Ranks</span>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {gamesArr.map((entry, idx) => (
                    <div key={idx} className="bg-background/80 border border-border rounded-2xl p-5 hover:border-primary/50 transition-colors group shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-white border border-border flex items-center justify-center p-2 shadow-sm group-hover:scale-105 transition-transform">
                            <img src={entry.logoUrl || '/assets/images/img/thumb.png'} alt={entry.game} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <p className="font-extrabold text-foreground text-lg leading-tight mb-1">{entry.game}</p>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted px-2 py-1 rounded-md">{entry.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                        {renderGameData(entry)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {researchArr.length > 0 && (
              <div>
                <span className="text-xs uppercase font-extrabold text-muted-foreground tracking-widest mb-4 block">Research Papers</span>
                <div className="flex flex-col gap-3">
                  {researchArr.map((topic, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-colors w-full">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                        <i className="ri-article-fill text-lg"></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-foreground leading-relaxed font-medium mt-1.5 block break-words">{topic}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {booksArr.length > 0 && (
              <div className="w-full overflow-hidden">
                <span className="text-xs uppercase font-extrabold text-muted-foreground tracking-widest mb-4 block">Written Publications</span>
                <div className="flex flex-col gap-3">
                  {booksArr.map((book, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-colors w-full">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                        <i className="ri-book-3-fill text-lg"></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-foreground leading-relaxed font-medium mt-1.5 block break-words">{book}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileModal;
