import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Loader2, GraduationCap, Zap } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';
import VisionaryCard from '../components/VisionaryCard';
import HeroSlider from '../components/HeroSlider';

const Home = () => {
  const { 
    faculty: faculties, 
    founders, 
    academics, 
    services, 
    loading, 
    error: loadError,
    refresh: fetchData 
  } = useData();

  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileType, setProfileType] = useState(null);

  // Custom sort for founders
  const sortedFounders = [...founders].sort((a, b) => {
    const rolesOrder = ['ceo', 'cto', 'cfo'];
    const getIndex = (role) => {
      const r = (role || '').toLowerCase();
      if (r.includes('ceo')) return 0;
      if (r.includes('cto')) return 1;
      if (r.includes('cfo')) return 2;
      return 3;
    };
    return getIndex(a.role) - getIndex(b.role);
  });

  return (
    <div className="relative w-full overflow-hidden flex flex-col text-[#fbf5e6]">
      {/* 1. Fullscreen Hero Section */}
      <HeroSlider />

      {/* Main Content Sections (Royal Black & Gold Architecture) */}
      <div className="relative z-10 w-full flex flex-col gap-24 md:gap-32 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto pb-32 pt-16">
        {/* Services & Core Capabilities Showcase */}
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 w-full">
            <div className="liquid-glass-card p-7 md:p-10 h-full flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center mb-6 text-[#d4af37] shadow-[0_0_25px_rgba(212,175,55,0.25)]">
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-3xl md:text-4xl font-heading mb-3 text-[#fbf5e6] tracking-tight">Academic Ecosystem</h3>
                <p className="font-serif-body text-sm md:text-base text-[#bba782] leading-relaxed mb-6 font-normal">Structured learning curricula, conceptual mastery, and intellectual guidance from foundational to advanced studies.</p>
                
                <div className="relative pl-4 border-l-2 border-[#d4af37]/40 flex flex-wrap gap-2">
                  {academics.length > 0 ? (
                    [...new Set(academics.map(aca => aca.title || aca.category))].slice(0, 6).map((topic, idx) => (
                      <span key={idx} className="px-3.5 py-1.5 badge-glass text-[10px] text-[#fcf6ba]">
                        {topic}
                      </span>
                    ))
                  ) : (
                    ['School Prep', 'University Support', 'Skill Mastery'].map((topic, idx) => (
                      <span key={idx} className="px-3.5 py-1.5 badge-glass text-[10px]">{topic}</span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-12">
                <Link to="/academics" className="w-full sm:flex-1 liquid-btn-primary px-6 py-3.5 text-center text-xs text-[#fcf6ba]">
                  Explore Academics
                </Link>
                <Link to="/notes" className="w-full sm:flex-1 liquid-btn-secondary px-6 py-3.5 text-center text-xs text-[#f3e5ab]">
                  Access Study Desk
                </Link>
              </div>
            </div>

            <div className="liquid-glass-card p-7 md:p-10 h-full flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center mb-6 text-[#f5d061] shadow-[0_0_25px_rgba(212,175,55,0.25)]">
                  <Zap size={28} />
                </div>
                <h3 className="text-3xl md:text-4xl font-heading mb-3 text-[#fbf5e6] tracking-tight">Computational & IT Solutions</h3>
                <p className="font-serif-body text-sm md:text-base text-[#bba782] leading-relaxed mb-6 font-normal">Next-gen engineering, modern web applications, scalable cloud architecture, and end-to-end technical execution.</p>
                
                <div className="relative pl-4 border-l-2 border-[#d4af37]/40 flex flex-wrap gap-2">
                  {services.length > 0 ? (
                    [...new Set(services.map(srv => srv.title || srv.category))].slice(0, 6).map((topic, idx) => (
                      <span key={idx} className="px-3.5 py-1.5 badge-glass text-[10px] text-[#fcf6ba]">
                        {topic}
                      </span>
                    ))
                  ) : (
                    ['Web Dev', 'IT Solutions', 'Digital Presence'].map((topic, idx) => (
                      <span key={idx} className="px-3.5 py-1.5 badge-glass text-[10px] text-[#fcf6ba]">{topic}</span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex mt-8 md:mt-12">
                <Link to="/services" className="w-full liquid-btn-primary px-6 py-3.5 text-center text-xs text-[#fcf6ba]">
                  Discover IT Services
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Visionaries & Mentors (Philosophy Section fully removed per user instruction) */}
        <section className="flex flex-col gap-16 md:gap-24 w-full justify-center">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#d4af37]" size={40} /></div>
          ) : loadError ? (
            <div className="text-center py-10 liquid-glass-card p-6">
              <p className="text-xs text-rose-400 font-mono mb-4">{loadError}</p>
              <button onClick={fetchData} className="liquid-btn-primary px-6 py-2.5 text-xs">Retry</button>
            </div>
          ) : (
            <>
              {/* Visionaries */}
              <div>
                <div className="flex flex-col gap-10">
                  <div className="text-center">
                    <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#d4af37] block mb-2">Imperial Leadership</span>
                    <h2 className="text-4xl md:text-6xl font-heading text-[#fbf5e6]">Our Visionaries</h2>
                  </div>
                  <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
                    {sortedFounders.map((founder, idx) => (
                      <VisionaryCard
                        key={founder.id}
                        name={founder.name}
                        role={founder.role}
                        bio={founder.bio}
                        image={founder.cover_image}
                        manifestoId={founder.extra_details?.manifesto_id}
                        onClick={() => { setSelectedProfile(founder); setProfileType('founder'); }}
                        accentColor="#d4af37"
                        mirrored={idx === 1}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Mentors Showcase */}
              <div>
                <div className="flex flex-col gap-8 md:gap-12 w-full overflow-hidden">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#d4af37]">Royal Knowledge Network</span>
                    <h2 className="text-4xl md:text-6xl font-heading text-[#fbf5e6]">Expert Mentors</h2>
                  </div>

                  <div className="relative w-full marquee-container">
                    <div className="overflow-x-auto no-scrollbar scroll-smooth overflow-y-visible py-4">
                      <div className="marquee-track px-4 md:px-12 flex gap-8">
                        {[...faculties, ...faculties].map((fac, idx) => (
                          <div key={`${fac.id}-${idx}`} className="min-w-[280px] md:min-w-[360px]">
                            <div className="liquid-glass-card p-6 md:p-8 flex flex-col items-center text-center h-[420px] group justify-between">
                              <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-lg overflow-hidden border border-[rgba(212,175,55,0.4)] mb-5 group-hover:scale-105 transition-transform duration-500 shadow-lg">
                                  <img src={fac.cover_image || '/assets/images/img/banner.png'} alt={fac.name} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                                <h4 className="text-2xl font-heading text-[#fbf5e6] mb-1">{fac.name}</h4>
                                <p className="text-[10px] font-mono text-[#d4af37] uppercase tracking-widest mb-3">{fac.topic || fac.department}</p>
                                <p className="font-serif-body text-xs text-[#bba782] line-clamp-3 italic opacity-90 leading-relaxed">"{fac.bio || fac.description}"</p>
                              </div>
                              <button 
                                onClick={() => { setSelectedProfile(fac); setProfileType('faculty'); }} 
                                className="w-full py-3 liquid-btn-secondary text-xs text-[#f3e5ab] mt-4"
                              >
                                View Full Profile
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <ProfileModal profile={selectedProfile} type={profileType} onClose={() => { setSelectedProfile(null); setProfileType(null); }} />
    </div>
  );
};

export default Home;
