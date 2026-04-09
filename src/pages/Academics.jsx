import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../lib/supabase';
import { Loader2, GraduationCap } from 'lucide-react';

const Academics = () => {
  const [academics, setAcademics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAcademics() {
      try {
        const { data, error } = await supabase.from('academics').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setAcademics(data || []);
      } catch (err) {
        console.error("Error fetching academics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAcademics();
  }, []);

  return (
    <div className="min-h-screen w-full bg-background pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col gap-12">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
         <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-foreground">Academics Support</h1>
         <p className="text-lg text-muted-foreground font-medium max-w-2xl">Structured academic support designed for measurable learning outcomes across school grades and university programs.</p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center w-full">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {academics.map((item) => (
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
