import React, { useEffect, useState } from 'react';
import { FileText, Download, Share2, Search, Filter, Loader2, Link } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase.from('notes').select('*');
      if (error) console.error(error);
      else setNotes(data || []);
      setLoading(false);
    };
    fetchNotes();
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter">Notes</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search study materials..."
              className="w-full pl-12 pr-6 py-4 bg-muted/50 border border-border rounded-full outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button className="p-4 bg-muted/50 hover:bg-muted border border-border rounded-full transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary w-12 h-12" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div key={note.id} className="group p-8 glass rounded-[32px] hover-glow border border-primary/20 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="text-sm font-bold uppercase tracking-widest text-primary">
                    {note.category}
                  </div>
                  <div className="flex gap-2">
                    <a href={note.link || '#'} target="_blank" rel="noreferrer" className="p-3 bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground rounded-xl transition-all"><Link size={18} /></a>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold uppercase tracking-widest mb-4 leading-tight min-h-[3rem]">{note.title}</h3>
                <p className="text-sm opacity-70 mb-6">{note.short_desc}</p>
              </div>
              
              <div className="flex items-center justify-between opacity-60 text-sm font-medium mt-auto border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Document Link</span>
                </div>
                <span>{note.date || 'Updated'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
