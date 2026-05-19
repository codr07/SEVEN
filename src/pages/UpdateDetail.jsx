import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Cpu, BookOpen, Layers, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import MarkdownText from '../components/MarkdownText';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const UpdateDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [update, setUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdate = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('updates')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setUpdate(data);
      } catch (err) {
        console.error('Failed to fetch update:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdate();
  }, [slug]);

  const getIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'system':
      case 'feature':
        return <Cpu size={24} />;
      case 'course':
        return <BookOpen size={24} />;
      case 'academic':
      case 'note':
        return <Layers size={24} />;
      default:
        return <Sparkles size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!update) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-black text-muted-foreground uppercase tracking-widest">Briefing Not Found</h2>
        <Link to="/" className="px-6 py-3 bg-primary text-black font-black rounded-full uppercase text-xs tracking-widest">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-black uppercase tracking-widest">Back to Intelligence Archive</span>
        </button>

        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${update.type === 'patch' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-accent/10 border-accent/20 text-accent'}`}>
              {update.type} Update
            </span>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <Calendar size={12} />
              {update.date}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase italic tracking-tighter leading-none mb-8">
            {update.title}
          </h1>

          <div className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${update.type === 'patch' ? 'bg-primary/10 border-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]' : 'bg-accent/10 border-accent/20 text-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]'}`}>
              {getIcon(update.category)}
            </div>
            <p className="text-lg text-muted-foreground font-medium italic">
              {update.excerpt}
            </p>
          </div>
        </header>

        <div className="prose prose-invert prose-primary max-w-none">
          <MarkdownText text={update.content} />
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Sparkles size={16} className="text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Operational Update</span>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">5EVEN Intelligence Bureau</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Return Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UpdateDetail;
