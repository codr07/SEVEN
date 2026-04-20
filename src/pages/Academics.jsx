import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, withTimeout, filterVisible } from '../lib/supabase';
import { Loader2, GraduationCap, Search } from 'lucide-react';

const Academics = () => {
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
        'Database connection timed out. Please check your network or try again.'
      );
      if (error) throw error;
      setAcademics(filterVisible(data));
    } catch (err) {
      console.error("Error fetching academics:", err);
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  return (
    <div className="min-h-screen w-full bg-background pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col gap-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
        <div className="flex flex-col gap-4 text-left">
           <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-animate-gradient">Academics Support</h1>
           <p className="text-lg text-muted-foreground font-medium max-w-2xl">Structured academic support designed for measurable learning outcomes across school grades and university programs.</p>
        </div>
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search academic programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-full outline-none focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center w-full">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6 text-destructive">
          <div className="text-xl font-bold uppercase tracking-widest text-animate-gradient">Connection Issue</div>
          <div className="text-sm opacity-80 max-w-xl text-center px-4 mb-4">{errorMsg}</div>
          <button 
            onClick={fetchAcademics}
            className="px-8 py-3 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {academics.filter(item => {
            if (!searchQuery) return true;
            const searchLower = searchQuery.toLowerCase();
            return (
              String(item.title || '').toLowerCase().includes(searchLower) ||
              String(item.description || '').toLowerCase().includes(searchLower)
            );
          }).map((item) => (
            <div key={item.id} className="flex flex-col bg-card/60 backdrop-blur-md rounded-3xl border border-border overflow-hidden hover-glow transition-all duration-300">
               <div className="h-48 w-full bg-muted relative flex items-center justify-center">
                  {item.cover_image ? (
                    <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap size={64} className="text-primary opacity-20" />
                  )}
                  <div className="absolute top-4 left-4 bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground rounded-full shadow-md">
                     Academic
                  </div>
               </div>
               
               <div className="p-6 md:p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-grow line-clamp-3">
                     {item.description}
                  </p>
                  
                  <div className="border-t border-border mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <span className="text-lg font-black text-foreground">{item.price || "Contact Us"}</span>
                     <Link to={`/academics/${item.id}`} className="px-5 py-2 rounded-xl bg-foreground text-background font-bold text-sm tracking-wide hover:bg-primary transition-colors text-center">
                        View Details
                     </Link>
                  </div>
               </div>
            </div>
          ))}
          {academics.length === 0 && (
            <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-3xl">
              <GraduationCap size={48} className="mb-4 opacity-20" />
              <p className="font-bold">No academic programs found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Academics;
