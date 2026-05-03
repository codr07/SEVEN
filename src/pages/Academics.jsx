import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import { supabase, withTimeout, filterVisible } from '../lib/supabase';
import { Loader2, GraduationCap, Search, Share2, BookText, ArrowRight, Award, Star, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MergedShape from '../components/MergedShape';
import SignatureButton from '../components/SignatureButton';
import SignatureShareButton from '../components/SignatureShareButton';

const Academics = () => {
  const { showAlert } = useAlert();
  const [academics, setAcademics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAcademics = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await withTimeout(
        supabase.from('academics').select('*').order('created_at', { ascending: false }),
        10000,
        'Database connection timed out.'
      );
      if (error) throw error;
      setAcademics(filterVisible(data));
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  const filteredAcademics = academics.filter(item => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      String(item.title || '').toLowerCase().includes(searchLower) ||
      String(item.description || '').toLowerCase().includes(searchLower)
    );
  });

  // Group academics by category
  const groupedAcademics = filteredAcademics.reduce((acc, item) => {
    const cat = item.category || 'Foundation';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="pt-32 pb-32 px-6 max-w-7xl mx-auto min-h-screen relative z-10">
      <div className="flex flex-col gap-8 mb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.4em] text-[8px] mb-4"
          >
            <Award size={12} className="text-accent" />
            Institutional Tracks
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 leading-none">
            Selected <span className="text-animate-gradient">Curriculum</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed max-w-xl opacity-80">
            Structured learning pathways and high-fidelity institutional support systems.
          </p>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={16} />
          <input
            type="text"
            placeholder="Explore tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-8 py-4 bg-white/5 border border-white/10 rounded-[24px] outline-none focus:border-primary/50 transition-all text-sm backdrop-blur-xl shadow-2xl"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex justify-center">
              <div className="w-[410px] h-[500px] bg-white/5 animate-pulse rounded-[32px] border border-white/10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-32">
          {Object.entries(groupedAcademics).map(([category, items]) => (
            <div key={category} className="space-y-12">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black uppercase tracking-[0.3em] text-accent drop-shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]">
                  {category}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-accent/30 to-transparent" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
                {items.map((item, idx) => {
                  const details = Array.isArray(item.extra_details?.details) 
                    ? item.extra_details.details 
                    : (item.description ? [item.description] : []);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className="flex justify-center"
                    >
                      <Link to={`/academics/${item.id}`} className="group relative block transition-all duration-500 hover:scale-[1.02]">
                        <MergedShape height={500}>
                           {/* Category Vertical Indicator (Left Side) */}
                           <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center py-8 bg-accent/5 border-r border-white/10 z-10 rounded-l-[32px]">
                              <div className="flex-1 w-px bg-gradient-to-b from-accent/50 to-transparent mb-4" />
                              <div className="text-[8px] font-black text-accent rotate-180 uppercase tracking-[0.4em] [writing-mode:vertical-lr] whitespace-nowrap drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)] opacity-80 group-hover:opacity-100 group-hover:text-primary transition-all">
                                 {category}
                              </div>
                              <div className="flex-1 w-px bg-gradient-to-t from-accent/20 to-transparent mt-4" />
                           </div>

                           <div className="absolute left-0 top-0 w-[390px] h-[500px] p-10 pl-16 flex flex-col pointer-events-auto">
                              <div className="relative h-[180px] rounded-[24px] overflow-hidden mb-8 bg-primary/10 border border-white/5">
                                {item.cover_image ? (
                                  <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><GraduationCap size={40} className="text-primary opacity-20" /></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                                   <GraduationCap size={14} className="text-accent drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
                                   <span className="text-[7px] font-black uppercase tracking-widest text-white">Elite Path</span>
                                </div>
                              </div>
                              
                              <h3 className="text-2xl font-black mb-6 leading-tight tracking-tighter uppercase group-hover:text-primary transition-colors line-clamp-1">
                                {item.title}
                              </h3>

                              {/* Pointwise Details */}
                              <div className="space-y-3 mb-8">
                                {details.slice(0, 3).map((detail, dIdx) => (
                                  <div key={dIdx} className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-125 transition-transform" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest line-clamp-1">{detail}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-auto pt-8 border-t border-white/5 flex items-end justify-between">
                                <div className="flex flex-col">
                                  <span className="text-[8px] font-black text-accent uppercase tracking-widest mb-1 opacity-60">Program Scale</span>
                                  <span className="text-xl font-black text-white">{item.price || "Institutional"}</span>
                                </div>
                                <SignatureButton label="Enter" />
                              </div>
                           </div>

                           <div className="absolute left-[390px] top-[60px] w-[70px] h-[50px] flex items-center justify-center pointer-events-auto">
                              <SignatureShareButton
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(`${window.location.origin}/academics/${item.id}`);
                                  showAlert("Link copied!", "success");
                                }}
                              />
                           </div>
                        </MergedShape>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Academics;
