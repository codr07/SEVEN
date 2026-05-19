import React, { useEffect, useState, useMemo } from 'react';
import { supabase, withTimeout, filterVisible, orderedFetch } from '../lib/supabase';
import { Loader2, Code, Laptop, Cpu, Rocket, Search, Filter, Share2, ArrowRight, Sparkles, MessageSquare, X, Send, User, Mail, FileText, CheckCircle2, Phone, Briefcase, IndianRupee, Clock, PlusSquare, MessageSquarePlus, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassSelect from '../components/GlassSelect';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import MergedShape from '../components/MergedShape';
import SignatureButton from '../components/SignatureButton';
import SignatureShareButton from '../components/SignatureShareButton';
import UniversalEnquiryModal from '../components/UniversalEnquiryModal';
import GlassSearch from '../components/GlassSearch';

const EnquiryModal = ({ isOpen, onClose, services, formData, setFormData }) => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: `${formData.country_code} ${formData.phone}`,
        service_type: formData.service_type || 'General Enquiry',
        status: 'enquiry',
        created_at: new Date().toISOString(),
        requirements: formData.requirements,
      };
      await supabase.from('service_inquiries').insert([payload]);

      // Send email alert to admin
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'service_enquiry',
            email: formData.email,
            name: formData.name,
            service_name: formData.service_type || 'General Enquiry',
            phone: `${formData.country_code} ${formData.phone}`,
            message: formData.requirements,
            origin: window.location.origin,
          }),
        });
      } catch (emailErr) {
        console.error('Email alert failed (enquiry still saved):', emailErr);
      }

      setSubmitted(true);
      showAlert('Enquiry submitted! We will reach out to you shortly.', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-lenis-prevent="true"
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl overflow-y-auto w-full h-full custom-scrollbar"
      >
        <div className="relative w-full min-h-screen max-w-3xl mx-auto flex flex-col justify-start pt-32 pb-24 px-6">
          <button
            onClick={() => { onClose(); setSubmitted(false); }}
            className="fixed top-8 right-8 p-4 bg-white/5 hover:bg-destructive shadow-xl hover:text-destructive-foreground rounded-full transition-all border border-white/10 z-[110]"
          >
            <X size={32} />
          </button>

          <div className="relative z-10 w-full bg-white/70 dark:bg-white/10 backdrop-blur-md rounded-[40px] border border-black/10 dark:border-white/10 p-8 md:p-14 shadow-2xl">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-6">
                <CheckCircle2 size={64} className="text-green-500" />
                <h2 className="text-3xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white">Enquiry <span className="text-primary">Received</span></h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">Our team has been notified and will contact you within 24 hours. Check your email for confirmation.</p>
                <button onClick={() => { onClose(); setSubmitted(false); }} className="mt-4 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">Close</button>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-gray-900 dark:text-white italic">Enquire <span className="text-primary">Now</span></h2>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Share your details and we'll get back to you with a tailored solution.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary">Full Name</label>
                      <input type="text" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary">Email Address</label>
                      <input type="email" required placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none" />
                    </div>
                    <div className="grid grid-cols-4 gap-4 md:col-span-1">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary">Code</label>
                        <input type="text" placeholder="+91" value={formData.country_code} onChange={e => setFormData({ ...formData, country_code: e.target.value })} className="w-full px-4 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none" />
                      </div>
                      <div className="col-span-3 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary">Phone Number</label>
                        <input type="tel" required placeholder="9876543210" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary">Service of Interest</label>
                      <GlassSelect
                        value={formData.service_type}
                        onChange={(val) => setFormData({ ...formData, service_type: val })}
                        placeholder="Select a service..."
                        options={[
                          ...services.map(s => ({ value: s.title, label: s.title })),
                          { value: "Custom", label: "Other / Custom Request" }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Tell Us About Your Requirement</label>
                    <textarea
                      rows="4"
                      value={formData.requirements}
                      onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="Briefly describe what you're looking for..."
                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none resize-none font-bold text-sm"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    <span>{loading ? 'Sending...' : 'Submit Enquiry'}</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const Services = () => {
  const { services, loading, error: errorMsg } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country_code: '+91',
    phone: '',
    service_type: '',
    requirements: '',
  });

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = !searchQuery ||
        String(service.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(service.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  const categories = useMemo(() => [...new Set(services.map(s => s.category))].filter(Boolean), [services]);

  const groupedServices = useMemo(() => {
    return filteredServices.reduce((acc, service) => {
      const cat = service.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(service);
      return acc;
    }, {});
  }, [filteredServices]);

  return (
    <main className="flex-1 min-h-screen">
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 transform hover:scale-105 transition-transform duration-500 text-animate-gradient"
            >
              Services
            </motion.h1>
            <p className="max-w-xl text-lg font-light tracking-widest uppercase opacity-70 leading-relaxed mt-2 text-left">
              Comprehensive commercial and digital support beyond the classroom. We care about your professional success.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <GlassSearch
              placeholder="Search services..."
              value={searchQuery}
              onChange={setSearchQuery}
              suggestions={services.map(s => s.title)}
              className="flex-1 md:w-80"
            />

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, service_type: '' }));
                  setIsModalOpen(true);
                }}
                className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] py-4 px-8 rounded-full shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-primary/50"
              >
                <MessageSquarePlus size={16} />
                <span>Enquire Now</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`p-4 border rounded-full transition-colors shadow-sm ${selectedCategory ? 'bg-primary text-white border-primary' : 'bg-card hover:bg-accent border-border'}`}
                >
                  <Filter size={20} />
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-4 w-64 bg-card border border-border rounded-[30px] shadow-2xl p-4 z-50 overflow-hidden"
                      >
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => { setSelectedCategory(''); setIsFilterOpen(false); }}
                            className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!selectedCategory ? "bg-primary text-white" : "hover:bg-white/5 text-muted-foreground hover:text-white"
                              }`}
                          >
                            All Services
                          </button>
                          {categories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                              className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? "bg-primary text-white" : "hover:bg-white/5 text-muted-foreground hover:text-white"
                                }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-center">
                <div className="w-[410px] h-[520px] bg-white/5 animate-pulse rounded-[32px] border border-white/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-32">
            {Object.entries(groupedServices).map(([category, items]) => (
              <div key={category} className="space-y-12">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black uppercase tracking-[0.3em] text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">
                    {category}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
                  {items.map((service, idx) => {
                    const details = Array.isArray(service.extra_details?.details)
                      ? service.extra_details.details
                      : (service.description ? [service.description] : []);

                    return (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="flex justify-center"
                      >
                        <Link to={`/services/${service.id}`} className="group relative block transition-all duration-500 hover:scale-[1.02]">
                          <MergedShape height={520}>
                            {/* Category Vertical Indicator (Left Side) */}
                            <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center py-8 bg-primary/5 border-r border-white/10 z-10 rounded-l-[32px]">
                              <div className="flex-1 w-px bg-gradient-to-b from-primary/50 to-transparent mb-4" />
                              <div className="text-[8px] font-black text-primary rotate-180 uppercase tracking-[0.4em] [writing-mode:vertical-lr] whitespace-nowrap drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] opacity-80 group-hover:opacity-100 transition-all">
                                {service.category}
                              </div>
                              <div className="flex-1 w-px bg-gradient-to-t from-primary/20 to-transparent mt-4" />
                            </div>

                            <div className="absolute left-0 top-0 w-[390px] h-[520px] p-8 pl-16 flex flex-col pointer-events-auto">
                              <div className="relative w-full h-[180px] rounded-[24px] overflow-hidden mb-8 bg-white/5 border border-white/10 group-hover:border-primary/20 transition-colors">
                                {service.cover_image ? (
                                  <img src={service.cover_image} alt={service.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center opacity-20"><Laptop size={40} className="text-primary" /></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                  <div className="flex text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={8} fill={i < 4 ? "currentColor" : "none"} className="text-primary" />)}
                                  </div>
                                  <span className="text-[7px] font-black uppercase tracking-widest text-white/60">Verified Service</span>
                                </div>
                              </div>

                              <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tighter">
                                  {service.title}
                                </h3>
                                {service.extra_details?.id_number && (
                                  <span className="text-[7px] font-black bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 whitespace-nowrap ml-2">
                                    {service.extra_details.id_number}
                                  </span>
                                )}
                              </div>

                              {/* Pointwise Details */}
                              <div className="space-y-3 mb-8">
                                {details.slice(0, 3).map((detail, dIdx) => (
                                  <div key={dIdx} className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest line-clamp-1">{detail}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-8">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                                    <IndianRupee size={14} />
                                    <span>Starting from</span>
                                  </div>
                                  <span className="text-xl font-black text-white">{service.price || 'Elite Quote'}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setFormData(prev => ({ ...prev, service_type: service.title }));
                                      setIsModalOpen(true);
                                    }}
                                    className="px-6 py-3 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                  >
                                    Enquire
                                  </button>
                                  <SignatureButton label="Details" />
                                </div>
                              </div>
                            </div>

                            <div className="absolute left-[390px] top-[60px] w-[70px] h-[50px] flex items-center justify-center pointer-events-auto">
                              <SignatureShareButton
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(`${window.location.origin}/services/${service.id}`);
                                  showAlert("Link copied!", "success");
                                }}
                              />
                            </div>
                          </MergedShape>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      <EnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={services}
        formData={formData}
        setFormData={setFormData}
      />
    </main>
  );
};

export default Services;
