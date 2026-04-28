import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, withTimeout } from '../../lib/supabase';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, GraduationCap } from 'lucide-react';

const AcademicsDetail = () => {
  const { id } = useParams();
  const [academic, setAcademic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const { data, error } = await withTimeout(
          supabase.from('academics').select('*').eq('id', id).single(),
          10000,
          'Could not load academic details. Please try again.'
        );
        if (error) throw error;
        setAcademic(data);
      } catch (err) {
        console.error('Error fetching academic detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!academic) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
        <h2 className="text-3xl font-bold text-destructive">Program Not Found</h2>
        <p className="text-muted-foreground">The requested academic program could not be located in our database.</p>
        <Link to="/academics" className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/90">
          <ArrowLeft size={20} /> Back to Academics
        </Link>
      </div>
    );
  }

  const view = academic.extra_details || {};
  const coverUrl = view.cover || academic.cover_image || null;

  return (
    <div className="min-h-screen w-full bg-background pb-20 pt-32 px-4 md:px-8 text-foreground">
      <div className="mx-auto max-w-6xl w-full">
        {/* Header Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/academics" className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-card px-4 py-2 text-sm font-bold shadow-sm transition-colors hover:border-primary hover:text-primary">
            <ArrowLeft size={16} />
            Back to Academics
          </Link>
        </div>

        {/* Hero Card */}
        <section className="overflow-hidden rounded-3xl border-2 border-border bg-card shadow-2xl hover-glow transition-all duration-500">
          <div className="relative h-64 w-full sm:h-80 lg:h-96 bg-muted flex items-center justify-center overflow-hidden">
            {coverUrl ? (
              <img src={coverUrl} alt={academic.title} className="h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-primary/10 flex flex-col items-center justify-center text-primary/20">
                <GraduationCap size={128} className="drop-shadow-2xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute top-6 left-6 z-10">
              <span className="inline-flex items-center rounded-xl bg-white/90 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 shadow-sm">
                Academic Program
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <h1 className="text-3xl font-black sm:text-5xl lg:text-6xl drop-shadow-md text-animate-gradient">
                {academic.title}
              </h1>
              <p className="mt-4 max-w-3xl text-white/90 text-base sm:text-lg font-medium drop-shadow leading-relaxed">
                {academic.description}
              </p>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-3 bg-card">

            {/* Left Content Area */}
            <div className="space-y-8 lg:col-span-2">
              {view.details && Array.isArray(view.details) && (
                <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4 mb-6">Program Highlights</h2>
                  <ul className="grid gap-3">
                    {view.details.map((point, idx) => (
                      <li key={idx} className="flex gap-3 text-muted-foreground font-medium">
                        <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4 mb-6">Course Description</h2>
                <p className="text-base leading-relaxed text-muted-foreground font-medium">
                  {view.detailed_description || academic.description || "Expert solutions tailored to scale with your educational needs."}
                </p>
              </div>

              {view.public_review && (
                <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4 mb-6">Student Review</h2>
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 italic text-muted-foreground relative">
                    "{view.public_review}"
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar Info */}
            <aside className="space-y-6">
              <div className="rounded-2xl border border-primary bg-primary/5 p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <div className="text-6xl font-black">$</div>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Academic Fees</p>
                <p className="mt-2 text-3xl font-black text-foreground">{academic.price || "Contact Us"}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Extra Cost</p>
                  <p className="font-bold text-foreground">{view.certification_cost || "N/A"}</p>
                </div>
              </div>

              <Link
                to="/contact"
                className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-6 py-5 text-base font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Enroll Now
              </Link>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AcademicsDetail;
