import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Lock, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import PdfViewer from '../components/PdfViewer';

const NoteViewer = () => {
  const { id } = useParams(); // id is the Note name
  const { user, role, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [contents, setContents] = useState([]);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    // Anti-Piracy Measures
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'P') ||
        (e.ctrlKey && e.key === 'S') ||
        (e.ctrlKey && e.key === 'C')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const checkAccessAndFetchContent = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load note details first to match by title
        const { data: noteData } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .single();

        // 1. Verify Payment
        const { data: payments, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'paid');

        if (paymentError) throw paymentError;

        const isPrivileged = role === 'admin' || role === 'faculty' || role === 'visionary' || role === 'founder';
        const title = noteData?.title;
        const targetPurpose = `[Note] ${id}`;
        
        const accessGranted = isPrivileged || payments?.some(p => 
          p.purpose === targetPurpose || 
          p.purpose.includes(id) ||
          (title && (p.purpose === `[Note] ${title}` || p.purpose.includes(title)))
        );
        
        if (accessGranted) {
          setHasAccess(true);
          
          // 2. Fetch Content
          const { data: contentData, error: contentError } = await supabase
            .from('product_content')
            .select('*')
            .eq('product_type', 'note')
            .eq('product_id', id)
            .order('order_index', { ascending: true });
            
          if (contentError) throw contentError;
          setContents(contentData || []);
          if (contentData?.length > 0) {
            setActiveModule(contentData[0]);
          }
        }
      } catch (err) {
        console.error("Error loading note content:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAccessAndFetchContent();
    }
  }, [id, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background p-4 text-center">
        <Lock size={64} className="text-destructive mb-6" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Access Denied</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          You do not have active access to these notes. Please ensure you are logged in and have successfully purchased the product.
        </p>
        <Link to="/student-zone" className="px-6 py-3 rounded-full bg-primary text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleNext = () => {
    const currentIndex = contents.findIndex(c => c.id === activeModule.id);
    if (currentIndex < contents.length - 1) {
      setActiveModule(contents[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const currentIndex = contents.findIndex(c => c.id === activeModule.id);
    if (currentIndex > 0) {
      setActiveModule(contents[currentIndex - 1]);
    }
  };

  const showSidebar = contents.length > 1;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-10 px-4 select-none">
      <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar - Curriculum */}
        {showSidebar && (
          <div className="w-full md:w-80 flex flex-col bg-card border border-border rounded-3xl overflow-hidden shrink-0 h-1/3 md:h-full shadow-2xl">
            <div className="p-6 border-b border-border bg-background">
              <Link to="/student-zone?tab=dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-4">
                <ArrowLeft size={14} /> Back
              </Link>
              <h2 className="text-xl font-black italic tracking-tighter">{id}</h2>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">
                {contents.length} Chapters Available
              </p>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
              {contents.map((mod, idx) => (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${
                    activeModule?.id === mod.id 
                      ? 'bg-primary/20 border-primary/50 text-white' 
                      : 'bg-background/50 border-border text-muted-foreground hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeModule?.id === mod.id ? 'bg-primary text-white shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-muted'}`}>
                      <span className="text-[10px] font-black">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{mod.title}</p>
                      <div className="flex gap-2 mt-1">
                        {mod.pdf_url && <FileText size={12} className="opacity-50" />}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right Content Area */}
        <div className={`${showSidebar ? 'flex-1' : 'w-full'} flex flex-col bg-black border border-white/5 rounded-3xl overflow-hidden h-2/3 md:h-full relative shadow-2xl`}>
          {/* Invisible Watermark overlay to deter screen recording */}
          <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center opacity-[0.03] overflow-hidden mix-blend-overlay">
            <span className="text-[10vw] font-black uppercase rotate-[-30deg] whitespace-nowrap text-white">
              {user.id.substring(0,8)} - 5EVEN
            </span>
          </div>

          {!activeModule ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a chapter to begin reading.
            </div>
          ) : (
            <>
              {/* Media Player Area */}
              <div className="flex-1 bg-black relative overflow-hidden flex flex-col p-4 md:p-6">
                {activeModule.pdf_url ? (
                   <PdfViewer url={activeModule.pdf_url} />
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
                    <p className="text-xl font-bold">{showSidebar ? activeModule.title : id}</p>
                    <p className="mt-2">{showSidebar ? activeModule.description : 'Comprehensive reference notes document.'}</p>
                  </div>
                )}
              </div>

              {/* Module Header / Controls */}
              <div className="p-6 bg-card border-t border-white/5 shrink-0 relative z-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    {!showSidebar && (
                      <Link to="/student-zone?tab=dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-3">
                        <ArrowLeft size={14} /> Back to Dashboard
                      </Link>
                    )}
                    <h3 className="text-2xl font-black">{showSidebar ? activeModule.title : id}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {showSidebar ? activeModule.description : 'Comprehensive reference notes document.'}
                    </p>
                  </div>
                  
                  {showSidebar && (
                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={handlePrev}
                        disabled={contents.findIndex(c => c.id === activeModule.id) === 0}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={handleNext}
                        disabled={contents.findIndex(c => c.id === activeModule.id) === contents.length - 1}
                        className="px-6 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-primary/90 disabled:opacity-30 transition-colors shadow-lg shadow-primary/20"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteViewer;
