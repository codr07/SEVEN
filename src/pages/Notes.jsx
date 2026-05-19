import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Download, Share2, Search, Filter, Loader2, BookOpen, Clock, ArrowRight, Star, Image as ImageIcon, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, withTimeout, filterVisible, orderedFetch } from '../lib/supabase';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import MergedShape from '../components/MergedShape';
import SignatureButton from '../components/SignatureButton';
import SignatureShareButton from '../components/SignatureShareButton';
import GlassSearch from '../components/GlassSearch';

const Notes = () => {
  const { showAlert } = useAlert();
  const { notes, loading, error: errorMsg } = useData();
  const { user, role } = useAuth();
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('payments').select('status, purpose').eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setPayments(data);
        });
    } else {
      setPayments([]);
    }
  }, [user]);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      String(note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      String(note.short_desc || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(notes.map(n => n.category))].filter(Boolean);

  const groupedNotes = useMemo(() => {
    return filteredNotes.reduce((acc, note) => {
      const cat = note.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(note);
      return acc;
    }, {});
  }, [filteredNotes]);

  return (
    <div className="pt-32 pb-32 px-6 max-w-7xl mx-auto min-h-screen relative z-10">
      <div className="flex flex-col gap-8 mb-16">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.4em] text-[8px] mb-4"
          >
            Digital Archive
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-animate-gradient mb-4 leading-none"
          >
            The Vault
          </motion.h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed max-w-xl opacity-80">
            Selected study materials and high-fidelity research notes for institutional scholars.
          </p>
        </div>

        <div className="flex gap-4 items-center max-w-2xl">
          <GlassSearch
            placeholder="Topic..."
            value={searchQuery}
            onChange={setSearchQuery}
            suggestions={notes.map(n => n.title)}
            className="flex-1"
          />
          
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all backdrop-blur-2xl border ${
                selectedCategory 
                ? "bg-accent border-accent text-white shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)]" 
                : "bg-white/5 border-white/10 text-primary hover:bg-white/10"
              }`}
            >
              <Filter size={20} />
            </motion.button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-4 w-64 bg-white/[0.03] border border-white/10 backdrop-blur-[40px] rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 z-50 overflow-hidden"
                  >
                    <div className="relative z-10 flex flex-col gap-1">
                      <button onClick={() => { setSelectedCategory(''); setIsFilterOpen(false); }} className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${!selectedCategory ? "bg-accent text-white" : "hover:bg-white/5 text-muted-foreground"}`}>All Vaults</button>
                      {categories.map(cat => (
                        <button key={cat} onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }} className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat ? "bg-accent text-white" : "hover:bg-white/5 text-muted-foreground"}`}>{cat}</button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-center">
              <div className="w-[410px] h-[520px] bg-white/5 animate-pulse rounded-[32px] border border-white/10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-32">
          {Object.entries(groupedNotes).map(([category, items]) => (
            <div key={category} className="space-y-12">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black uppercase tracking-[0.3em] text-accent drop-shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]">
                  {category}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-accent/30 to-transparent" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
                {items.map((note, idx) => {
                  const details = Array.isArray(note.extra_details?.details) 
                    ? note.extra_details.details 
                    : (note.short_desc ? [note.short_desc] : []);

                  const isPrivileged = role === 'admin' || role === 'faculty' || role === 'visionary' || role === 'founder';
                  const targetPurpose = `[Note] ${note.title}`;
                  const hasPaid = payments.some(p => p.status === 'paid' && (p.purpose === targetPurpose || p.purpose.includes(note.title)));
                  const linkTarget = (hasPaid || isPrivileged) ? `/learn/note/${encodeURIComponent(note.id)}` : `/notes/${note.id}`;

                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="flex justify-center"
                    >
                      <Link to={linkTarget} className="group relative block transition-all duration-500 hover:scale-[1.02]">
                        <MergedShape height={520}>
                           {/* Category Vertical Indicator (Left Side) */}
                           <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center py-8 bg-accent/5 border-r border-white/10 z-10 rounded-l-[32px]">
                              <div className="flex-1 w-px bg-gradient-to-b from-accent/50 to-transparent mb-4" />
                              <div className="text-[8px] font-black text-accent rotate-180 uppercase tracking-[0.4em] [writing-mode:vertical-lr] whitespace-nowrap drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)] opacity-80 group-hover:opacity-100 group-hover:text-primary transition-all">
                                 {category}
                              </div>
                              <div className="flex-1 w-px bg-gradient-to-t from-accent/20 to-transparent mt-4" />
                           </div>

                           <div className="absolute left-0 top-0 w-[390px] h-[520px] p-8 pl-16 flex flex-col pointer-events-auto">
                              <div className="relative w-full h-[200px] rounded-[24px] overflow-hidden mb-8 bg-white/5 border border-white/10 group-hover:border-primary/20 transition-colors">
                                {note.cover_image ? (
                                  <img src={note.cover_image} alt={note.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><FileText size={40} className="text-primary mb-2" /></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                  <CheckCircle2 size={10} className="text-accent drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
                                  <span className="text-[7px] font-black uppercase tracking-widest text-white/60">Verified Document</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tighter">
                                  {note.title}
                                </h3>
                                {note.extra_details?.id_number && (
                                  <span className="text-[7px] font-black bg-accent/10 text-accent px-2 py-1 rounded-md border border-accent/20 whitespace-nowrap ml-2">
                                    {note.extra_details.id_number}
                                  </span>
                                )}
                              </div>
                              
                              {/* Pointwise Details */}
                              <div className="space-y-3 mb-8">
                                {details.slice(0, 3).map((detail, dIdx) => (
                                  <div key={dIdx} className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-125 transition-transform" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest line-clamp-1">{detail}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-8">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                                    <Clock size={14} />
                                    <span>{note.date || 'Jan 2026'}</span>
                                  </div>
                                  <span className="text-xl font-black text-white">
                                    {note.price && note.price !== 'FREE'
                                      ? (note.price.includes('₹') || note.price.toLowerCase().includes('inr')
                                          ? note.price 
                                          : `₹${note.price}`)
                                      : 'FREE'}
                                  </span>
                                </div>
                                <SignatureButton label="Enter" />
                              </div>
                           </div>

                           <div className="absolute left-[390px] top-[60px] w-[70px] h-[50px] flex items-center justify-center pointer-events-auto">
                              <SignatureShareButton
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(`${window.location.origin}/notes/${note.id}`);
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

export default Notes;
