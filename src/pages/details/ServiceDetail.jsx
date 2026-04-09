import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import supabase from '../../lib/supabase';
import { Loader2, ArrowLeft } from 'lucide-react';

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      try {
        const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
        if (error) throw error;
        setService(data);
      } catch (err) {
        console.error('Error fetching service detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
        <h2 className="text-3xl font-bold text-destructive">Service Not Found</h2>
        <p className="text-muted-foreground">The requested service could not be located in our database.</p>
        <Link to="/services" className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/90">
          <ArrowLeft size={20} /> Back to Services
        </Link>
      </div>
    );
  }

  const view = service.extra_details || {};
  const coverUrl = view.cover || service.cover_image || '/assets/seven.svg';

  return (
    <div className="min-h-screen w-full bg-background pb-20 pt-32 px-4 md:px-8 text-foreground">
      <div className="mx-auto max-w-6xl w-full">
        {/* Header Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/services" className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-card px-4 py-2 text-sm font-bold shadow-sm transition-colors hover:border-secondary hover:text-secondary">
            <ArrowLeft size={16} />
            Back to Services
          </Link>
        </div>

        {/* Hero Card */}
        <section className="overflow-hidden rounded-3xl border-2 border-border bg-card shadow-2xl hover-glow transition-all duration-500">
          <div className="relative h-64 w-full sm:h-80 lg:h-96 bg-muted">
            <img src={coverUrl} alt={service.title} className="h-full w-full object-cover mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <span className="mb-4 inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-secondary-foreground shadow-lg">
                {service.category}
              </span>
              <h1 className="text-3xl font-black text-white sm:text-5xl lg:text-6xl drop-shadow-md">
                {view.title || service.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base text-white/90 sm:text-lg font-medium drop-shadow">
                {view.short_desc || service.description?.[0] || ""}
              </p>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-3 bg-card">
            
            {/* Left Content Area */}
            <div className="space-y-8 lg:col-span-2">
              <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4 mb-6">Service Offerings & Deliverables</h2>
                <ul className="grid gap-3">
                  {(view.description || service.description || []).map((point, idx) => (
                    <li key={idx} className="flex gap-3 text-muted-foreground font-medium">
                      <div className="mt-1 w-2 h-2 rounded-full bg-secondary shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4 mb-6">Why Choose This Service?</h2>
                <p className="text-base leading-relaxed text-muted-foreground font-medium">
                  {view.why_choose_this_course || "Expert solutions tailored to scale with your business or academic needs."}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4 mb-6">Client Review</h2>
                <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-5 italic text-muted-foreground relative">
                   "{view.public_review || "Clients highly recommend this service for robust execution and quantifiable results."}"
                </div>
              </div>
            </div>

            {/* Right Sidebar Info */}
            <aside className="space-y-6">
              <div className="rounded-2xl border border-secondary bg-secondary/5 p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <div className="text-6xl font-black">$</div>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary">Starting At</p>
                <p className="mt-2 text-3xl font-black text-foreground">{service.price}</p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                 <p className="text-sm font-bold text-foreground">Delivery Terms</p>
                 <p className="pt-2 text-sm font-medium text-muted-foreground">Standard deployment cycles vary between 2-12 weeks depending on tier selected. Reach out for custom enterprise quotes.</p>
              </div>

              <Link 
                to="/contact" 
                className="inline-flex w-full items-center justify-center rounded-xl bg-foreground px-6 py-5 text-base font-black uppercase tracking-widest text-background shadow-lg hover:-translate-y-1 hover:bg-secondary transition-all duration-300"
              >
                Inquire Now
              </Link>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServiceDetail;
