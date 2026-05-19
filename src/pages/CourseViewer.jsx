import React, { useState, useEffect, useRef } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Lock, Play, FileText, ChevronRight, CheckCircle2, Award, Download, X } from 'lucide-react';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';
import PdfViewer from '../components/PdfViewer';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import CertificateGenerator from '../components/CertificateGenerator';

const CourseViewer = () => {
  const { id } = useParams(); // id is the course name (e.g. React Mastery)
  const { user, role, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [hasCertAccess, setHasCertAccess] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const [contents, setContents] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  
  // Progress tracking
  const [progress, setProgress] = useState({ highest_unlocked_index: 0, is_completed: false });
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Email state
  const [emailSent, setEmailSent] = useState(false);

  // Certificate state
  const [showCertificate, setShowCertificate] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const certRef = useRef(null);

  // Reference for the Plyr instance to listen to events
  const playerRef = useRef(null);

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

  const loadProgress = async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching progress:', error);
      return null;
    }

    if (data) {
      return data;
    } else {
      // Create initial progress if it doesn't exist
      const newProgress = { user_id: user.id, product_id: id, product_type: 'course', highest_unlocked_index: 0 };
      const { data: inserted, error: insertError } = await supabase
        .from('user_progress')
        .insert([newProgress])
        .select()
        .single();
      
      if (!insertError) return inserted;
      return newProgress;
    }
  };

  useEffect(() => {
    const checkAccessAndFetchContent = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load course details first
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();
        if (courseData) {
          setCourseDetails(courseData);
        }

        // 1. Verify Payment
        const { data: payments, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'paid');

        if (paymentError) throw paymentError;

        const isPrivileged = role === 'admin' || role === 'faculty' || role === 'visionary' || role === 'founder';
        const name = courseData?.name;
        const targetPurpose = `[Course] ${id}`;
        const targetCertPurpose = `[Course] [Cert] ${id}`;
        
        const accessGranted = isPrivileged || payments?.some(p => 
          p.purpose === targetPurpose || 
          p.purpose === targetCertPurpose ||
          (name && (p.purpose === `[Course] ${name}` || p.purpose === `[Course] [Cert] ${name}` || p.purpose.includes(name)))
        );
        const hasCert = isPrivileged || payments?.some(p => 
          p.purpose === targetCertPurpose || 
          (name && (p.purpose === `[Course] [Cert] ${name}` || p.purpose.includes(`[Cert] ${name}`)))
        );
        
        if (accessGranted) {
          setHasAccess(true);
          setHasCertAccess(hasCert);
          
          // 2. Fetch Progress
          const currentProgress = await loadProgress();
          if (currentProgress) {
            setProgress(currentProgress);
          }

          // 3. Fetch Content
          const { data: contentData, error: contentError } = await supabase
            .from('product_content')
            .select('*')
            .eq('product_type', 'course')
            .eq('product_id', id)
            .order('order_index', { ascending: true });
            
          if (contentError) throw contentError;
          
          setContents(contentData || []);
          
          if (contentData?.length > 0) {
            // Auto-select the highest unlocked module
            const unlockedIdx = currentProgress?.highest_unlocked_index || 0;
            const targetIdx = Math.min(unlockedIdx, contentData.length - 1);
            setActiveModule(contentData[targetIdx]);
          }
        }
      } catch (err) {
        console.error("Error loading course content:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAccessAndFetchContent();
    }
  }, [id, user, authLoading]);

  // Handle Video Completion -> Unlock Next -> Auto-Play Next
  const handleVideoEnded = async () => {
    if (isUpdatingProgress) return;
    setIsUpdatingProgress(true);

    try {
      const currentIndex = contents.findIndex(c => c.id === activeModule.id);
      
      // If there's a next section to unlock
      if (currentIndex < contents.length - 1) {
        const nextIndex = currentIndex + 1;
        
        if (progress.highest_unlocked_index < nextIndex) {
          const { error } = await supabase
            .from('user_progress')
            .update({ highest_unlocked_index: nextIndex })
            .eq('user_id', user.id)
            .eq('product_id', id);
            
          if (!error) {
            setProgress(p => ({ ...p, highest_unlocked_index: nextIndex }));
          }
        }
        
        // Auto-advance
        setActiveModule(contents[nextIndex]);
        
      } else {
        // Last section completed!
        if (!progress.is_completed) {
          await supabase
            .from('user_progress')
            .update({ is_completed: true })
            .eq('user_id', user.id)
            .eq('product_id', id);
            
          setProgress(p => ({ ...p, is_completed: true }));
          sendCompletionEmail();
        }
      }
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const sendCompletionEmail = async () => {
    if (emailSent) return;
    
    let certificateUrl = '';
    try {
      if (hasCertAccess && certRef.current) {
        // Generate the certificate image silently for the email
        const canvas = await html2canvas(certRef.current, {
          scale: 1.5, // High enough resolution for viewing
          useCORS: true,
          backgroundColor: '#000000',
        });
        
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        const fileName = `certificates/${user.id}_${id.replace(/\s+/g, '_')}_${Date.now()}.png`;
        
        const { error: uploadError } = await supabase.storage
          .from('product_assets')
          .upload(fileName, blob, {
            contentType: 'image/png',
            upsert: true
          });
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('product_assets')
          .getPublicUrl(fileName);
          
        certificateUrl = publicUrlData.publicUrl;
      }
    } catch (err) {
      console.error("Failed to upload certificate for email link:", err);
    }

    supabase.functions.invoke('send-email', {
      body: {
        type: 'course_completion',
        email: user.email,
        name: user.user_metadata?.full_name || 'Student',
        course_name: id,
        has_certificate: hasCertAccess,
        certificate_url: hasCertAccess ? certificateUrl : undefined,
        origin: window.location.origin
      }
    })
    .then((res) => {
      if (res.error) throw res.error;
      console.log('Completion email sent successfully via Supabase!', res.data);
      setEmailSent(true);
    })
    .catch((err) => {
      console.error('Failed to send completion email via Supabase:', err);
    });
  };

  const handleDownloadCertificate = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2, // High resolution for PDF
        useCORS: true,
        backgroundColor: '#000000',
        windowWidth: 1123,
        windowHeight: 794
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'px', [1123, 794]);
      
      pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);
      pdf.save(`${id.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Attach Plymouth events manually
  useEffect(() => {
    if (playerRef.current && playerRef.current.plyr) {
      const player = playerRef.current.plyr;
      player.on('ended', handleVideoEnded);
      return () => {
        player.off('ended', handleVideoEnded);
      };
    }
  }, [activeModule, playerRef.current]);

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
          You do not have active access to this course. Please ensure you are logged in and have successfully purchased the product.
        </p>
        <Link to="/student-zone" className="px-6 py-3 rounded-full bg-primary text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-10 px-4 select-none relative">
      <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar - Curriculum */}
        <div className="w-full md:w-80 flex flex-col bg-card border border-border rounded-3xl overflow-hidden shrink-0 h-1/3 md:h-full shadow-2xl">
          <div className="p-6 border-b border-border bg-background">
            <Link to="/student-zone?tab=dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-4">
              <ArrowLeft size={14} /> Back
            </Link>
            <h2 className="text-xl font-black italic tracking-tighter">{id}</h2>
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                {contents.length} Modules
              </p>
              {progress.is_completed && (
                <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-widest">
                  <CheckCircle2 size={12}/> Completed
                </span>
              )}
            </div>

            {/* Certificate Button */}
            {progress.is_completed && (
              hasCertAccess ? (
                <button 
                  onClick={() => setShowCertificate(true)}
                  className="w-full mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                >
                  <Award size={16} /> View Certificate
                </button>
              ) : (
                <Link 
                  to={`/payment?amount=${courseDetails?.certification_cost || 499}&purpose=${encodeURIComponent(`[Course] [Cert] ${id}`)}`}
                  className="w-full mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-destructive/20 to-destructive/5 border border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-destructive/10 text-center"
                >
                  <Award size={16} /> Claim Verified Certificate 🔒
                </Link>
              )
            )}

          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
            {contents.map((mod, idx) => {
              const isExam = mod.title.toLowerCase().includes('exam');
              const isLocked = idx > progress.highest_unlocked_index;
              const isActive = activeModule?.id === mod.id;
              const showCertLock = isExam && !hasCertAccess;
              
              return (
                <button
                  key={mod.id}
                  onClick={() => !isLocked && setActiveModule(mod)}
                  disabled={isLocked}
                  className={`w-full text-left p-4 rounded-xl transition-all border relative overflow-hidden ${
                    isActive 
                      ? 'bg-primary/20 border-primary/50 text-white' 
                      : isLocked 
                        ? 'bg-black/50 border-white/5 text-muted-foreground/30 cursor-not-allowed'
                        : 'bg-background/50 border-border text-muted-foreground hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-primary text-white shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' 
                      : isLocked ? 'bg-white/5 text-muted-foreground/30'
                      : showCertLock ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-muted text-muted-foreground'
                    }`}>
                      {isLocked ? <Lock size={12} /> : showCertLock ? <Lock size={12} className="text-primary" /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{mod.title}</p>
                      <div className="flex gap-2 mt-1">
                        {showCertLock && <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded font-black uppercase tracking-widest">Upgrade Track</span>}
                        {mod.video_url && !isExam && <Play size={12} className={isLocked ? 'opacity-30' : 'opacity-70'} />}
                        {mod.pdf_url && <FileText size={12} className={isLocked ? 'opacity-30' : 'opacity-70'} />}
                      </div>
                    </div>
                  </div>
                  {isLocked && <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>}
                </button>
              );
            })}
          </div>
        </div>
        {/* Right Content Area */}
        <div className="flex-1 flex flex-col bg-black border border-white/5 rounded-3xl overflow-hidden h-2/3 md:h-full relative shadow-2xl">
          {/* Invisible Watermark overlay to deter screen recording */}
          <div className="pointer-events-none absolute inset-0 z-[100] flex items-center justify-center opacity-[0.03] overflow-hidden mix-blend-overlay">
            <span className="text-[10vw] font-black uppercase rotate-[-30deg] whitespace-nowrap text-white">
              {user.id.substring(0,8)} - 5EVEN
            </span>
          </div>

          {!activeModule ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a module from the curriculum to begin.
            </div>
          ) : (() => {
            const isExam = activeModule.title.toLowerCase().includes('exam');
            return isExam && !hasCertAccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-3xl relative overflow-hidden select-none">
                {/* Visual backdrop highlight */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 max-w-md mx-auto space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-tr from-primary to-accent rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] mx-auto relative overflow-hidden group">
                    <Lock size={36} className="text-white relative z-10" />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-3xl font-black italic tracking-tighter text-white">Certification Required</h2>
                    <p className="text-xs text-primary font-black uppercase tracking-widest">Final Examination Locked</p>
                  </div>

                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    This official exam leads to your verified certificate. Since you purchased the course-only track, you must upgrade your enrollment to unlock the exam, certificate generator, and professional verification records.
                  </p>

                  <div className="pt-4 flex flex-col gap-3">
                    <Link
                      to={`/payment?amount=${courseDetails?.certification_cost || 499}&purpose=${encodeURIComponent(`[Course] [Cert] ${id}`)}`}
                      className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 rounded-2xl"
                    >
                      Proceed to Payment (₹{courseDetails?.certification_cost || 499})
                    </Link>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      Secured Admin Verified Transaction
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Media Player Area */}
                <div className="flex-1 bg-black relative overflow-hidden flex flex-col">
                  {activeModule.video_url && !isExam && (
                    <div className="w-full h-1/2 md:h-2/3 bg-black relative z-10 flex flex-col shrink-0 border-b border-white/10" onContextMenu={e => e.preventDefault()}>
                      <Plyr
                        ref={playerRef}
                        source={{
                          type: 'video',
                          sources: [{ src: activeModule.video_url, type: 'video/mp4' }],
                          tracks: activeModule.subtitle_url ? [{ kind: 'captions', label: 'English', src: activeModule.subtitle_url, default: true }] : []
                        }}
                        options={{
                          controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
                          settings: ['captions', 'quality', 'speed', 'loop']
                        }}
                        className="plyr-custom w-full h-full"
                      />
                    </div>
                  )}
                  {activeModule.pdf_url && (
                    <div className={`w-full ${activeModule.video_url && !isExam ? 'h-1/2 md:h-1/3' : 'h-full'} relative bg-black p-4 md:p-6`}>
                       <PdfViewer url={activeModule.pdf_url} />
                    </div>
                  )}
                  {isExam ? (
                    <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground bg-black/40 relative z-10">
                      <div className="max-w-md space-y-6">
                         <Award size={64} className="mx-auto text-primary animate-pulse" />
                         <div className="space-y-2">
                           <h3 className="text-2xl font-black text-white">{activeModule.title}</h3>
                           <p className="text-xs text-secondary font-black uppercase tracking-widest">Official Verified Track</p>
                         </div>
                         <p className="text-sm leading-relaxed">{activeModule.description}</p>
                         <div className="pt-4 space-y-4">
                           <a 
                             href={activeModule.video_url || 'https://forms.google.com'} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30"
                           >
                             Start Verified Exam
                           </a>
                           <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                             Opens in a secure new browser tab
                           </p>
                         </div>
                      </div>
                    </div>
                  ) : !activeModule.video_url && !activeModule.pdf_url && (
                    <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
                      <div>
                         <FileText size={48} className="mx-auto mb-4 opacity-20" />
                         <p className="text-xl font-bold text-white">{activeModule.title}</p>
                         <p className="mt-2 text-sm">{activeModule.description || 'Read the description below.'}</p>
                         {/* Auto-advance button for non-video sections */}
                         <button onClick={handleVideoEnded} className="mt-6 px-6 py-3 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                           Mark Complete & Next
                         </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Module Header */}
                <div className="p-6 bg-card border-t border-white/5 shrink-0 relative z-50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black">{activeModule.title}</h3>
                      {activeModule.description && (
                        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{activeModule.description}</p>
                      )}
                    </div>
                    
                    {activeModule.video_url && !isExam && (
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/70 text-right">
                        Watch completely to unlock next module
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Hidden Certificate for html2canvas rendering */}
      {/* We render it off-screen at its native resolution so html2canvas captures it perfectly */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <CertificateGenerator 
          ref={certRef}
          studentName={user?.user_metadata?.full_name || 'Student'}
          courseName={id}
          date={progress.updated_at || new Date().toISOString()}
          isDemo={!hasCertAccess}
        />
      </div>

      {/* Certificate Preview Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-screen">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
                  <Award size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Your Certificate</h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Official 5EVEN Document</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleDownloadCertificate}
                  disabled={isDownloading}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
                >
                  {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                </button>
                <button onClick={() => setShowCertificate(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body: Scaled Preview */}
            <div className="flex-1 overflow-hidden p-4 flex items-center justify-center bg-[#050505] min-h-[50vh]">
               <div className="w-full h-full flex justify-center items-center">
                 <div 
                   style={{ 
                     transform: 'scale(min(1, calc((100vw - 2rem) / 1123), calc((100vh - 12rem) / 794)))', 
                     transformOrigin: 'center center' 
                   }}
                 >
                    <CertificateGenerator 
                      studentName={user?.user_metadata?.full_name || 'Student'}
                      courseName={id}
                      date={progress.updated_at || new Date().toISOString()}
                      isDemo={!hasCertAccess}
                    />
                 </div>
               </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CourseViewer;
