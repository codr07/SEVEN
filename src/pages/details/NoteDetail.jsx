import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, withTimeout } from '../../lib/supabase';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';

const NoteDetail = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNote() {
      try {
        const { data, error } = await withTimeout(
          supabase.from('notes').select('*').eq('id', id).single(),
          10000,
          'Could not load note details. Please try again.'
        );
        if (error) throw error;
        setNote(data);
      } catch (err) {
        console.error('Error fetching note detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
        <h2 className="text-3xl font-bold text-destructive">Note Not Found</h2>
        <p className="text-muted-foreground">The requested study material could not be located in our database.</p>
        <Link to="/notes" className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/90">
          <ArrowLeft size={20} /> Back to Notes
        </Link>
      </div>
    );
  }

  const view = note.extra_details || {};
  const coverUrl = view.cover || note.thumbnail || note.image_url || note.cover_image || 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1200&auto=format&fit=crop';

  return (
    <div className="min-h-screen w-full bg-background pb-20 pt-32 px-4 md:px-8 text-foreground">
      <div className="mx-auto max-w-6xl w-full">
        {/* Header Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/notes" className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-card px-4 py-2 text-sm font-bold shadow-sm transition-colors hover:border-accent hover:text-accent">
            <ArrowLeft size={16} />
            Back to Notes
          </Link>
        </div>

        {/* Hero Card */}
        <section className="overflow-hidden rounded-3xl border-2 border-border bg-card shadow-2xl hover-glow transition-all duration-500">
          <div className="relative h-64 w-full sm:h-80 lg:h-96 bg-muted flex items-center justify-center">
            {coverUrl === '/assets/seven.svg' ? (
                <div className="absolute inset-0 bg-accent/10 flex flex-col items-center justify-center text-accent/20">
                    <span className="text-9xl font-black">{note.title.charAt(0)}</span>
                </div>
            ) : (
                <>
                  <img 
                    src={coverUrl} 
                    alt={note.title} 
                    className="h-full w-full object-cover" 
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1200&auto=format&fit=crop'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </>
            )}
            
            <div className="absolute top-6 left-6 z-10">
              <span className="inline-flex items-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                {note.category}
              </span>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <h1 className="text-3xl font-black sm:text-5xl lg:text-6xl drop-shadow-md text-animate-gradient">
                {view.title || note.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base text-white/90 sm:text-lg font-medium drop-shadow">
                {view.short_desc || note.short_desc}
              </p>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-3 bg-card">
            
            {/* Left Content Area */}
            <div className="space-y-8 lg:col-span-2">
              <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4 mb-6">Subject Overview</h2>
                <ul className="grid gap-3">
                  {(view.description || [note.short_desc] || []).map((point, idx) => (
                    <li key={idx} className="flex gap-3 text-muted-foreground font-medium">
                      <div className="mt-1 w-2 h-2 rounded-full bg-accent shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4 mb-6">Student Peer Review</h2>
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 italic text-muted-foreground relative">
                   "{view.public_review || "Highly requested notes among the peer circle."}"
                </div>
              </div>
            </div>

            {/* Right Sidebar Info */}
            <aside className="space-y-6">
              <div className="rounded-2xl border border-accent bg-accent/5 p-6 shadow-md relative overflow-hidden">
                <p className="text-xs font-bold uppercase tracking-widest text-accent">Access Method</p>
                <p className="mt-2 text-2xl font-black text-foreground">Topmate Delivery</p>
                <p className="mt-3 text-sm font-medium text-muted-foreground">Digital files will be shared securely via standard Topmate protocol upon clicking Open Resource.</p>
              </div>

              <a 
                href={note.link || "#"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-foreground px-6 py-5 text-base font-black uppercase tracking-widest text-background shadow-lg hover:-translate-y-1 hover:bg-accent transition-all duration-300"
              >
                <ExternalLink size={20} /> Open Resource
              </a>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NoteDetail;
