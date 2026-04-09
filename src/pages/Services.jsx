import React, { useEffect, useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase.from('services').select('*');
      if (error) console.error(error);
      else setServices(data || []);
      setLoading(false);
    };
    fetchServices();
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-20 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-8 transform hover:scale-105 transition-transform duration-500">Services</h1>
        <p className="text-lg md:text-xl font-light tracking-widest uppercase opacity-70 leading-relaxed">
          Comprehensive academic support beyond the classroom. We care about your professional success.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary w-12 h-12" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="group p-10 glass rounded-[40px] hover-glow border border-primary/20">
              <div className="text-sm font-bold text-primary mb-4 uppercase tracking-widest leading-relaxed">
                {service.category}
              </div>
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground mb-8 group-hover:rotate-12 transition-transform duration-500 shadow-xl">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-widest mb-4 min-h-[4rem] flex items-center">{service.title}</h3>
              <p className="text-xl font-bold opacity-80 mb-4">{service.price}</p>
              <div className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors space-y-2">
                {service.description?.slice(0, 2).map((point, idx) => (
                  <p key={idx} className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{point}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
