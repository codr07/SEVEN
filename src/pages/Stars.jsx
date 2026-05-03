import React, { useEffect, useState } from 'react';
import { Star, Loader2, Award, Quote, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, withTimeout, filterVisible } from '../lib/supabase';
import SignatureButton from '../components/SignatureButton';

const Stars = () => {
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStars = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await withTimeout(
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        10000,
        'Database connection timed out.'
      );
      if (error) throw error;
      setStars(filterVisible(data));
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStars();
  }, []);

  return (
    <div className="pt-32 pb-32 px-6 max-w-7xl mx-auto min-h-screen relative z-10">
      <div className="flex flex-col gap-8 mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-4"
        >
          <Award size={40} />
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
          Divine <span className="text-animate-gradient">Stars</span>
        </h1>
        <p className="text-sm text-muted-foreground uppercase tracking-[0.3em] font-black opacity-50">Faculty & Mentors</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[400px] rounded-[32px] bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : errorMsg ? (
        <div className="py-20 text-center text-destructive font-black uppercase tracking-widest text-[10px]">{errorMsg}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {stars.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div className="institution-card p-1 relative h-full overflow-visible">
                <div className="bg-[#0A0A0A] rounded-[28px] p-8 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-primary/20 transition-colors duration-700" />
                  
                  <div className="relative z-10">
                    <Quote className="text-primary/20 mb-6" size={40} />
                    <p className="text-sm md:text-base text-white/80 italic leading-relaxed mb-8 font-medium">
                      "{t.content}"
                    </p>
                  </div>

                  <div className="mt-auto flex items-end justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/10 border border-white/5 group-hover:scale-105 transition-transform duration-500">
                        <img 
                          src={t.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} 
                          alt={t.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tighter group-hover:text-primary transition-colors">
                          {t.name}
                        </h3>
                        <p className="text-[9px] font-bold uppercase text-primary tracking-widest mt-1">
                          {t.topic}
                        </p>
                      </div>
                    </div>

                    {/* Signature Button for Faculty Connect */}
                    <SignatureButton 
                      label="Connect" 
                      size="w-12 h-12" 
                      iconSize={16} 
                      labelSize="text-[5px]" 
                      translateY="translate-y-3"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Stars;
