import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, withTimeout } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Settings, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-8 relative overflow-hidden flex flex-col items-center">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-accent/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-6xl mb-6 flex items-center justify-between z-10 mt-10">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {isOwner && (
          <button 
            onClick={() => navigate('/student-zone?tab=settings')} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 border border-primary/20"
          >
            <Settings size={16} />
            Edit Profile Settings
          </button>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl flex flex-col md:flex-row bg-white/[0.02] backdrop-blur-[40px] border border-white/10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden z-10"
      >
        {/* Left Sidebar */}
        <div className="w-full md:w-[400px] shrink-0 bg-black/20 flex flex-col items-center p-10 md:p-12 border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
          
          <div className="relative w-48 h-48 md:w-56 md:h-56 mb-10 group">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-primary via-accent to-secondary blur-md opacity-60 group-hover:opacity-100 transition duration-700"></div>
            <div className="relative w-full h-full rounded-full border-4 border-background overflow-hidden shadow-2xl bg-card">
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay group-hover:bg-transparent transition-all duration-500 z-10"></div>
              {profile.cover_image ? (
                <img src={profile.cover_image} alt={profile.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-primary/10 text-primary">
                  <span className="text-7xl font-black">{profile.name?.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-center text-foreground mb-2 tracking-tight">{profile.name}</h2>
          {profile.username && <p className="text-sm font-bold text-muted-foreground mb-3">@{profile.username}</p>}
          <p className="text-sm font-black text-primary uppercase tracking-widest text-center mb-6 px-4 py-1.5 bg-primary/10 rounded-full">{secondaryValue}</p>
          
          {(profile.phone) && (
            <div className="flex flex-col items-center gap-2 mb-8 w-full">
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-colors">
                    <i className="ri-phone-fill"></i>
                  </span>
                  {profile.phone}
                </a>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-4 w-full mt-auto relative z-10">
            {profile.social_links?.map((link, idx) => (
                link.url && link.url !== '#' && (
                 <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white py-4 rounded-2xl font-black tracking-widest uppercase text-xs hover:scale-[1.02] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                   {link.platform}
                 </a>
                )
            ))}
            {profile.portfolio_url && profile.portfolio_url !== '#' && (
               <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-4 rounded-2xl font-black tracking-widest uppercase text-xs hover:scale-[1.02] transition-all">
                 <i className="ri-global-line text-lg"></i> Custom Portfolio
               </a>
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 relative bg-transparent">
          <div className="flex items-center gap-3 mb-10">
            <span className="h-10 w-2 rounded-full bg-primary block shadow-[0_0_15px_rgba(var(--primary),0.5)]"></span>
            <p className="text-2xl md:text-3xl font-black tracking-wide text-foreground uppercase">{headingLabel}</p>
          </div>

          <div className="flex flex-col gap-12">
            {(profile.bio || profile.description) && (
              <div className="border-l-4 border-primary/50 pl-6 py-2 bg-gradient-to-r from-primary/5 to-transparent rounded-r-2xl">
                <p className="text-foreground leading-relaxed text-lg md:text-xl font-medium italic whitespace-pre-wrap">
                  "{profile.bio || profile.description}"
                </p>
              </div>
            )}

            {/* Additional custom profile fields injected manually for robust DB display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {(profile.institution || profile.major) && (
                 <div className="p-6 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group hover:bg-white/10 transition-colors">
                   <span className="text-[10px] uppercase font-black text-primary/80 tracking-widest mb-2 block">Education Background</span>
                   {profile.institution && <p className="font-black text-xl text-white group-hover:text-primary transition-colors">{profile.institution}</p>}
                   {profile.major && <p className="text-sm text-muted-foreground font-bold mt-1">{profile.major}</p>}
                 </div>
               )}
               {profile.location && (
                 <div className="p-6 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group hover:bg-white/10 transition-colors">
                   <span className="text-[10px] uppercase font-black text-primary/80 tracking-widest mb-2 block">Based In</span>
                   <p className="font-black text-xl text-white group-hover:text-accent transition-colors">{profile.location}</p>
                 </div>
               )}
            </div>

            {profile.stars && (
              <div>
                <span className="text-xs uppercase font-extrabold text-muted-foreground tracking-widest mb-4 block">Instructor Rating</span>
                <div className="flex items-center gap-3">
                  <span className="font-black text-4xl text-foreground">{profile.stars}</span>
                  <div className="flex gap-1 text-3xl text-yellow-500 drop-shadow-md">
                    <i className="ri-star-fill"></i>
                  </div>
                </div>
              </div>
            )}

            {eduArr.length > 0 && (
              <div>
                <span className="text-xs uppercase font-black text-primary/80 tracking-widest mb-5 block">Detailed Education</span>
                <ul className="flex flex-col gap-4">
                  {eduArr.map((edu, idx) => {
                    const isObject = typeof edu === 'object';
                    return (
                      <li key={idx} className="flex items-start gap-5 p-6 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 hover:border-primary/30 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                          <i className="ri-graduation-cap-fill text-2xl drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></i>
                        </div>
                        <div className="flex flex-col mt-0.5">
                           {isObject ? (
                             <>
                               <span className="text-foreground font-black text-lg">{edu.school || edu.degree}</span>
                               <span className="text-muted-foreground text-sm font-semibold mt-1">{edu.degree && edu.school ? edu.degree : ''} {edu.year ? `• ${edu.year}` : ''}</span>
                             </>
                           ) : (
                              <span className="text-foreground leading-relaxed font-bold mt-2">{edu}</span>
                           )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {expertiseArr.length > 0 && (
              <div>
                <span className="text-xs uppercase font-black text-primary/80 tracking-widest mb-5 block">Domain Expertise</span>
                <div className="flex flex-wrap gap-3">
                  {expertiseArr.map((skill, idx) => (
                    <span key={idx} className="text-xs font-black uppercase tracking-widest px-6 py-4 rounded-[1.5rem] bg-white/5 backdrop-blur-md text-white border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:scale-105 hover:bg-secondary/20 hover:border-secondary/30 transition-all">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {gamesArr.length > 0 && (
              <div>
                <span className="text-xs uppercase font-black text-primary/80 tracking-widest mb-5 block">Gaming Persona & Ranks</span>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {gamesArr.map((entry, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-[2rem] p-6 hover:bg-white/10 hover:border-primary/40 transition-all group">
                      <div className="flex items-start justify-between gap-3 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-[1.25rem] bg-white/10 border border-white/20 flex items-center justify-center p-2 group-hover:scale-110 transition-transform shadow-lg">
                            <img src={entry.logoUrl || '/assets/images/img/thumb.png'} alt={entry.game} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <p className="font-extrabold text-foreground text-xl leading-tight mb-1">{entry.game}</p>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{entry.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                        {renderGameData(entry)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicProfile;
