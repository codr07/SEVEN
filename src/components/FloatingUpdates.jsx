import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Sparkles, Cpu, BookOpen, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const FloatingUpdates = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { updates, loading } = useData();
  const [hasNew, setHasNew] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (updates && updates.length > 0) {
      setHasNew(true);
    }
  }, [updates]);

  useEffect(() => {
    // iPhone-style Assist Ball Timer
    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Floating Button */}
      <motion.div
        animate={{
          x: isMinimized ? '40%' : '0%',
          opacity: isMinimized ? 0.4 : 1
        }}
        onHoverStart={() => setIsMinimized(false)}
        onHoverEnd={() => {
          if (!isOpen) {
            setTimeout(() => setIsMinimized(true), 5000);
          }
        }}
        className="fixed bottom-8 right-8 z-[100] group transition-all duration-500"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl group-hover:bg-primary/40 transition-all animate-pulse" />
        <div className="absolute -inset-1 bg-gradient-to-tr from-primary/50 to-accent/50 rounded-[1.25rem] opacity-50 group-hover:opacity-100 blur-[2px] transition-opacity" />

        <motion.button
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsOpen(true);
            setHasNew(false);
            setIsMinimized(false);
          }}
          className="relative w-14 h-14 rounded-xl bg-black border border-purple-500/50 text-purple-400 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-purple-500/20" />
          <Bell size={24} className="relative z-10 animate-[pulse_2s_infinite] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />

          {/* Notification Badge */}
          {hasNew && (
            <span className="absolute top-4 right-4 w-5 h-5 bg-destructive rounded-full border-2 border-black flex items-center justify-center z-20">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            </span>
          )}

          {/* Decorative Corner */}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary/20 rounded-tl-lg" />
        </motion.button>
      </motion.div>

      {/* Updates Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-2xl z-[101]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-md bg-card border-l border-white/10 shadow-2xl z-[102] flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">Operational Brief</h4>
                  <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">5EVEN Updates</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-destructive transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" data-lenis-prevent="true">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" />
                  </div>
                ) : updates.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <Sparkles size={40} className="text-white/10 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No updates in archive</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {updates.map((update, idx) => (
                      <motion.div
                        key={update.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Link
                          to={`/updates/${update.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="block p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${update.type === 'patch' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-accent/10 border-accent/20 text-accent'}`}>
                              {update.type}
                            </div>
                            <span className="text-[9px] font-black uppercase text-muted-foreground">{update.date}</span>
                          </div>

                          <div className="flex gap-4 items-start">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${update.type === 'patch' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-accent/10 border-accent/20 text-accent'}`}>
                              {update.type === 'patch' ? <Zap size={20} /> : <BookOpen size={20} />}
                            </div>
                            <div>
                              <h3 className="font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors mb-2 leading-tight line-clamp-1">
                                {update.title}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {update.excerpt}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                            <span>View Full Record</span>
                            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-white/5 bg-black/20">
                <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white hover:text-black transition-all">
                  Archive Documentation
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingUpdates;
