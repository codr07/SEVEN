import React, { useEffect, useState } from 'react';
import { Star, Quote, Award, TrendingUp, Loader2 } from 'lucide-react';
import { supabase, withTimeout } from '../lib/supabase';

const Stars = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFaculty = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await withTimeout(
        supabase.from('faculty').select('*'),
        10000,
        'Database connection timed out. Please check your network or try again.'
      );
      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div className="flex-1">
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 text-animate-gradient">Our Stars</h1>
          <p className="text-xl font-bold uppercase tracking-widest text-primary">Hall of Fame</p>
        </div>
        <div className="flex gap-4">
          <StatCard label="Graduate Success" value="98%" icon={<TrendingUp size={18} />} />
          <StatCard label="Top Ratings" value="4.9" icon={<Star size={18} fill="currentColor" />} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary w-12 h-12" />
        </div>
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6 text-destructive">
          <div className="text-xl font-bold uppercase tracking-widest">Connection Issue</div>
          <div className="text-sm opacity-80 max-w-xl text-center px-4 mb-4">{errorMsg}</div>
          <button 
            onClick={fetchFaculty}
            className="px-8 py-3 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            Retry Connection
          </button>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <div className="text-xl font-bold uppercase tracking-widest">No Stars Found</div>
          <div className="text-sm opacity-80">We currently have no stars available. Check back soon!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((t) => (
            <div key={t.id} className="relative group">
              <div className="absolute -top-6 -left-6 z-10 p-4 bg-primary text-primary-foreground rounded-2xl shadow-xl group-hover:rotate-12 transition-transform duration-500">
                <Quote size={28} />
              </div>
              <div className="p-12 glass rounded-[60px] h-full flex flex-col justify-between hover-glow border border-primary/20">
                <p className="text-xl font-medium leading-relaxed italic opacity-80 mb-12">"{t.description}"</p>
                
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-primary/20 p-1 bg-muted shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name.split(' ').join('')}`} alt={t.name} className="w-full h-full object-cover rounded-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">{t.name}</h3>
                    <p className="text-sm font-bold uppercase text-primary opacity-70">{t.topic}</p>
                    <div className="flex gap-1 mt-1 text-yellow-500">
                      {[...Array(Math.floor(Number(t.stars) || 5))].map((_, idx) => (
                        <Star key={idx} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="px-8 py-4 glass rounded-3xl border border-white/20 flex items-center gap-4 hover:bg-primary/5 transition-colors">
    <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
    <div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
    </div>
  </div>
);

export default Stars;
