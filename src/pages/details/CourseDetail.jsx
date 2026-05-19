import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, withTimeout } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { updateMetadata } from '../../lib/seo';
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import MarkdownText from '../../components/MarkdownText';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [includeCert, setIncludeCert] = useState(false);
  const { user, role } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState(null);

  const isPrivileged = role === 'admin' || role === 'faculty' || role === 'visionary' || role === 'founder';
  const isPaid = paymentStatus === 'paid' || isPrivileged;

  useEffect(() => {
    if (!loading && course && isPaid) {
      navigate(`/learn/course/${encodeURIComponent(course.id)}`, { replace: true });
    }
  }, [loading, course, isPaid, navigate]);

  useEffect(() => {
    async function fetchCourseAndPayment() {
      try {
        const { data, error } = await withTimeout(
          supabase.from('courses').select('*').eq('id', id).single(),
          10000,
          'Could not load course details. Please try again.'
        );
        if (error) throw error;
        setCourse(data);
        
        // Update Metadata
        updateMetadata({
          title: data.name,
          description: data.extra_details?.short_desc || data.short_desc || 'Enroll in this mastery program at 5EVEN Institution.',
          image: data.extra_details?.cover || data.thumbnail || 'https://5even.netlify.app/assets/images/img/banner.png'
        });

        // Fetch payment status
        if (user && data) {
          const { data: payments, error: paymentError } = await supabase
            .from('payments')
            .select('status, purpose')
            .eq('user_id', user.id);
            
          if (!paymentError && payments) {
            const targetPurpose = `[Course] ${data.name}`;
            const targetCertPurpose = `[Course] [Cert] ${data.name}`;
            
            const match = payments.find(p => p.purpose === targetPurpose || p.purpose === targetCertPurpose || p.purpose.includes(data.name));
            if (match) {
              setPaymentStatus(match.status);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching course detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourseAndPayment();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
        <h2 className="text-3xl font-bold text-destructive">Course Not Found</h2>
        <p className="text-muted-foreground">The requested course could not be located in our database.</p>
        <Link to="/courses" className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/90">
          <ArrowLeft size={20} /> Back to Courses
        </Link>
      </div>
    );
  }

  // Parse extra_details block
  const view = course.extra_details || {};
  const coverUrl = view.cover || course.thumbnail || course.image_url || course.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop';
  
  const basePriceNum = parseFloat(String(course.price || '0').replace(/[^0-9.]/g, '')) || 0;
  const certPriceNum = parseFloat(String(view.certification_cost || '0').replace(/[^0-9.]/g, '')) || 0;
  const finalPrice = includeCert && view.certification_available ? basePriceNum + certPriceNum : basePriceNum;
  const finalPurpose = `[Course] ${includeCert && view.certification_available ? '[Cert] ' : ''}${view.title || course.name}`;

  return (
    <div className="min-h-screen w-full bg-background pb-20 pt-32 px-4 md:px-8 text-foreground">
      <div className="mx-auto max-w-6xl w-full">
        {/* Header Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/courses" className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-card px-4 py-2 text-sm font-bold shadow-sm transition-colors hover:border-primary hover:text-primary">
            <ArrowLeft size={16} />
            Back to Courses
          </Link>
        </div>

        {/* Hero Card */}
        <section className="overflow-hidden rounded-2xl md:rounded-3xl border-2 border-border bg-card shadow-2xl hover-glow transition-all duration-500">
          <div className="relative h-64 w-full sm:h-80 lg:h-96 bg-muted">
            <img
              src={coverUrl}
              alt={course.name}
              className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute top-6 left-6 z-10">
              <span className="badge-glass px-5 py-2 rounded-xl text-[10px]">
                {course.category}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <h1 className="text-3xl font-black sm:text-5xl lg:text-6xl drop-shadow-md text-animate-gradient">
                {view.title || course.name}
              </h1>
              <div className="mt-4 max-w-3xl text-white/90 text-base sm:text-lg font-medium drop-shadow leading-relaxed">
                <MarkdownText text={view.short_desc || course.short_desc} />
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-3 bg-card">

            {/* Left Content Area */}
            <div className="space-y-8 lg:col-span-2">
              <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4 mb-6">Course Syllabus & Details</h2>
                <ul className="grid gap-3">
                  {(view.details || course.details || []).map((point, idx) => (
                    <li key={idx} className="flex gap-3 text-muted-foreground font-medium">
                      <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4 mb-6">Why Choose This Course?</h2>
                <div className="text-base leading-relaxed text-muted-foreground font-medium">
                  <MarkdownText text={view.why_choose_this_course || "Hands-on learning path designed for practical outcomes and career readiness."} />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4 mb-6">Student Review</h2>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 italic text-muted-foreground relative">
                  <MarkdownText text={view.public_review ? `"${view.public_review}"` : '"Learners love the practical structure and expert mentor support."'} />
                </div>
              </div>
            </div>

            {/* Right Sidebar Info */}
            <aside className="space-y-6">
              <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Duration</p>
                <p className="mt-2 text-2xl font-black text-foreground">{course.duration}</p>
              </div>

              <div className="rounded-2xl border border-primary bg-primary/5 p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <div className="text-6xl font-black">₹</div>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Total Price</p>
                <p className="mt-2 text-4xl font-black text-foreground">₹{finalPrice.toFixed(2)}</p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-foreground">Certification</p>
                  {view.certification_available ? (
                    <span className="flex items-center gap-1 text-secondary text-sm font-bold bg-secondary/10 px-2 py-1 rounded-md"><CheckCircle2 size={16} /> YES</span>
                  ) : (
                    <span className="flex items-center gap-1 text-destructive text-sm font-bold bg-destructive/10 px-2 py-1 rounded-md"><XCircle size={16} /> NO</span>
                  )}
                </div>
                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <p className="text-sm font-medium text-muted-foreground">Exam Cost</p>
                  <p className="font-bold text-foreground">{view.certification_cost || "N/A"}</p>
                </div>
                
                {view.certification_available && (
                  <label className="mt-4 pt-4 border-t border-border flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                      <input 
                        type="checkbox" 
                        className="peer appearance-none w-5 h-5 border-2 border-muted-foreground/30 rounded checked:bg-primary checked:border-primary transition-all"
                        checked={includeCert}
                        onChange={(e) => setIncludeCert(e.target.checked)}
                      />
                      <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Include Official Certification</p>
                      <p className="text-[10px] font-medium text-muted-foreground mt-1">Get an official, verifiable certificate upon passing the final exam.</p>
                    </div>
                  </label>
                )}
              </div>

              {isPaid ? (
                <Link
                  to={`/learn/course/${encodeURIComponent(course.id)}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-5 text-base font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Access Course
                </Link>
              ) : paymentStatus === 'pending' ? (
                <button
                  disabled
                  className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 px-6 py-5 text-base font-black uppercase tracking-widest text-amber-500 cursor-not-allowed shadow-none"
                >
                  Payment Pending Approval
                </button>
              ) : (
                <Link
                  to={`/payment?amount=${finalPrice}&purpose=${encodeURIComponent(finalPurpose)}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-6 py-5 text-base font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Enroll Now
                </Link>
              )}
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CourseDetail;
