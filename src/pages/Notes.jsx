import React, { useEffect, useState } from 'react';
import { FileText, Download, Share2, Search, Filter, Loader2, Link as LinkIcon } from 'lucide-react';
import { supabase, withTimeout } from '../lib/supabase';
import { Link } from 'react-router-dom';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await withTimeout(
        supabase.from('notes').select('*').order('created_at', { ascending: false }),
        10000,
        'Database connection timed out. Please check your network or try again.'
      );
      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const uniqueCategories = [...new Set(notes.map(n => n.category))].filter(Boolean);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.short_desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? note.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-animate-gradient">Notes</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search study materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-full outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-4 border rounded-full transition-colors shadow-sm ${selectedCategory ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent border-border"}`}
            >
              <Filter size={20} />
            </button>
            
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground opacity-70 mb-1">Filter by Category</div>
                  <button 
                    onClick={() => { setSelectedCategory(''); setIsFilterOpen(false); }} 
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${!selectedCategory ? "bg-primary/10 text-primary" : "hover:bg-accent"}`}
                  >
                    All Notes
                  </button>
                  {uniqueCategories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }} 
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${selectedCategory === cat ? "bg-primary/10 text-primary" : "hover:bg-accent"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary w-12 h-12" />
        </div>
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-destructive">
          <div className="text-xl font-bold uppercase tracking-widest">Failed to load notes</div>
          <div className="text-sm opacity-80 max-w-xl text-center px-4">{errorMsg}</div>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <div className="text-xl font-bold uppercase tracking-widest">No Notes Found</div>
          <div className="text-sm opacity-80">We currently have no notes available. Check back soon!</div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <div className="text-xl font-bold uppercase tracking-widest">No Results Found</div>
          <div className="text-sm opacity-80">Try adjusting your search query or filter category.</div>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
            className="mt-4 px-6 py-2 rounded-xl border border-primary text-primary text-xs font-black tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNotes.map((note) => (
            <Link 
              to={`/notes/${note.id}`} 
              key={note.id} 
              className="group relative overflow-hidden backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/10 hover:border-primary/30 hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(var(--primary),0.2)] transition-all duration-500 flex flex-col justify-between min-h-[300px]"
            >
              {/* Liquid Shine Effect */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-20" />
              
              <div className="flex-1 flex flex-col relative z-10">
                <div className="w-full h-40 relative rounded-2xl overflow-hidden mb-6 border border-white/10 group-hover:border-primary/30 transition-colors duration-500">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                  <img 
                    src={note.thumbnail || note.image_url || note.cover_image || 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop'} 
                    alt={note.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 filter grayscale group-hover:grayscale-0" 
                  />
                  <div className="absolute top-3 left-3 z-20">
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/20 shadow-lg">
                      {note.category}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 z-20">
                    <div className="p-2 bg-black/50 backdrop-blur-md border border-white/10 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary/20 rounded-full transition-all duration-300 shadow-lg text-white">
                      <span className="sr-only">Open note link externally if provided</span>
                      <Share2 size={14} />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-black uppercase tracking-widest mb-4 leading-tight text-balance group-hover:text-primary transition-colors duration-300">
                  {note.title}
                </h3>
                <p className="text-sm font-medium opacity-70 mb-6 leading-relaxed line-clamp-3">
                  {note.short_desc}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest mt-auto border-t border-white/5 pt-6 group-hover:border-primary/20 transition-colors duration-300">
                <div className="flex items-center gap-2 text-primary opacity-80 group-hover:opacity-100 bg-primary/10 px-4 py-2 rounded-xl">
                  <FileText size={16} />
                  <span>Read Full Note</span>
                </div>
                <span className="opacity-50">{note.date || 'Updated'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
