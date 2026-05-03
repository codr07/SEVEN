import React, { useEffect, useState, useMemo } from 'react';
import { supabase, withTimeout, filterVisible } from '../lib/supabase';
import { Loader2, Code, Laptop, Cpu, Rocket, Search, Filter, Share2, ArrowRight, Sparkles, MessageSquare, X, Send, User, Mail, FileText, CheckCircle2, Phone, Briefcase, IndianRupee, Clock, PlusSquare, MessageSquarePlus, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import MergedShape from '../components/MergedShape';
import SignatureButton from '../components/SignatureButton';
import SignatureShareButton from '../components/SignatureShareButton';

const CustomServiceModal = ({ isOpen, onClose, services }) => {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    tier: 'Basic',
    budget: '',
    timeline: '',
    addons: [],
    requirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isTierDropdownOpen, setIsTierDropdownOpen] = useState(false);

  const selectedServiceObj = services.find(s => s.title === formData.service_type);
  const serviceCategory = selectedServiceObj ? (selectedServiceObj.category || '').toLowerCase() : 'custom';

  const DYNAMIC_OPTIONS = useMemo(() => {
    if (serviceCategory.includes('web') || serviceCategory.includes('software') || serviceCategory.includes('app')) {
      return {
        addons: [
          { id: 'seo', label: 'Advanced SEO Optimization', price: 5000 },
          { id: 'maint', label: '1 Year Support & Maintenance', price: 12000 },
          { id: 'hosting', label: 'Premium Cloud Hosting', price: 8000 },
          { id: 'security', label: 'Enhanced Security Shield', price: 6000 },
          { id: 'speed', label: 'Speed & Performance Tuning', price: 3000 },
        ],
        tiers: ['Basic', 'Professional', 'Advanced', 'Dynamic', 'Premium', 'Enterprise'],
        tierMultipliers: { 'Basic': 1, 'Professional': 1.5, 'Advanced': 2, 'Dynamic': 2.5, 'Premium': 3, 'Enterprise': 4 },
        timelinePlaceholder: "e.g. 4-6 weeks for full build"
      };
    } else if (serviceCategory.includes('design') || serviceCategory.includes('graphic') || serviceCategory.includes('ui')) {
      return {
        addons: [
          { id: 'source', label: 'Raw Source Files (.PSD, .AI)', price: 3000 },
          { id: 'revisions', label: 'Unlimited Revisions', price: 5000 },
          { id: 'social', label: 'Social Media Assets Kit', price: 4000 },
          { id: 'guidelines', label: 'Brand Guidelines Document', price: 6000 },
        ],
        tiers: ['Essential', 'Standard', 'Premium', 'Elite'],
        tierMultipliers: { 'Essential': 1, 'Standard': 1.5, 'Premium': 2, 'Elite': 3 },
        timelinePlaceholder: "e.g. 1-2 weeks for initial drafts"
      };
    } else if (serviceCategory.includes('marketing') || serviceCategory.includes('seo') || serviceCategory.includes('growth')) {
      return {
        addons: [
          { id: 'reports', label: 'Weekly Analytics Reports', price: 2000 },
          { id: 'copy', label: 'Expert Copywriting', price: 5000 },
          { id: 'ab', label: 'A/B Testing Setup', price: 4000 },
          { id: 'influencer', label: 'Influencer Outreach', price: 8000 },
        ],
        tiers: ['Growth', 'Scale', 'Domination'],
        tierMultipliers: { 'Growth': 1, 'Scale': 1.8, 'Domination': 3 },
        timelinePlaceholder: "e.g. 3 months minimum engagement"
      };
    } else {
      return {
        addons: [
          { id: 'priority', label: 'Priority Support Queue', price: 5000 },
          { id: 'manager', label: 'Dedicated Project Manager', price: 10000 },
          { id: 'express', label: 'Express Delivery', price: 15000 },
          { id: 'consult', label: '1-on-1 Consultation', price: 3000 },
        ],
        tiers: ['Standard', 'Professional', 'Elite Partnership'],
        tierMultipliers: { 'Standard': 1, 'Professional': 1.5, 'Elite Partnership': 3 },
        timelinePlaceholder: "e.g. ASAP timeline"
      };
    }
  }, [serviceCategory]);

  if (!isOpen) return null;

  const toggleAddon = (addonId) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.includes(addonId) 
        ? prev.addons.filter(a => a !== addonId) 
        : [...prev.addons, addonId]
    }));
  };

  const getEstimatedPrice = () => {
    if (!formData.service_type) return 'Select a service to calculate price';
    const service = services.find(s => s.title === formData.service_type);
    if (!service) return 'Custom Quote';

    // Base price extraction (handling ranges like "Rs. 4,999 - 9,999")
    const priceStr = service.price || '0';
    const basePriceMatch = priceStr.match(/\d+/);
    let total = basePriceMatch ? parseInt(basePriceMatch[0]) : 0;

    // Add-on prices
    formData.addons.forEach(id => {
      const addon = DYNAMIC_OPTIONS.addons.find(a => a.id === id);
      if (addon) total += addon.price;
    });

    // Tier multipliers (dynamic)
    const multiplier = DYNAMIC_OPTIONS.tierMultipliers[formData.tier] || 1;
    total = Math.round(total * multiplier);

    return `Estimated Price: ₹${total.toLocaleString()}${formData.tier ? '+' : ''}`;
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    try {
      await supabase.from('service_inquiries').insert([
        { ...formData, status: 'ordered', created_at: new Date().toISOString() }
      ]);
    } catch (err) {
      console.error(err);
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
        <div className="relative w-full min-h-screen max-w-5xl mx-auto flex flex-col justify-start pt-32 pb-24 px-6">
          <button 
            onClick={onClose}
            className="fixed top-8 right-8 p-4 bg-white/5 hover:bg-destructive shadow-xl hover:text-destructive-foreground rounded-full transition-all border border-white/10 z-[110]"
          >
            <X size={32} />
          </button>

          <div className="relative z-10 w-full bg-white/70 dark:bg-white/10 backdrop-blur-md rounded-[40px] border border-black/10 dark:border-white/10 p-8 md:p-14 shadow-2xl">
            <div className="mb-10">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-gray-900 dark:text-white italic">Order Service <span className="text-primary">Pipeline</span></h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Submit this architectural manifesto to initiate elite project execution.</p>
            </div>

            <form 
              action={`https://formsubmit.co/orders.seveninst@gmail.com?subject=Web Service Order: ${formData.service_type}`} 
              method="post"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="Total Estimated" value={getEstimatedPrice()} />

              {/* Basic Details - Always Visible */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Full Legal Name</label>
                <input name="Full Name" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] text-sm outline-none focus:border-primary focus:bg-white/60 dark:focus:bg-white/10 hover:bg-white/50 dark:hover:bg-white/10 transition-all text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Secure Email</label>
                <input name="Email" type="email" required placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] text-sm outline-none focus:border-primary focus:bg-white/60 dark:focus:bg-white/10 hover:bg-white/50 dark:hover:bg-white/10 transition-all text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Direct Contact</label>
                <input name="Phone" type="tel" required placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] text-sm outline-none focus:border-primary focus:bg-white/60 dark:focus:bg-white/10 hover:bg-white/50 dark:hover:bg-white/10 transition-all text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Core Service</label>
                <div className="relative z-50">
                  <div 
                    onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                    className="w-full px-6 py-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] text-sm outline-none transition-all text-gray-900 dark:text-white cursor-pointer font-bold flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/10 group"
                  >
                    <span className={!formData.service_type ? "text-gray-500 dark:text-gray-400" : ""}>{formData.service_type || 'Select Core Product'}</span>
                    <MessageSquarePlus size={18} className={`text-primary/40 group-hover:text-primary transition-all duration-300 ${isServiceDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {isServiceDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsServiceDropdownOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 top-full left-0 right-0 mt-3 rounded-2xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-black/60 backdrop-blur-3xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden max-h-64 overflow-y-auto custom-scrollbar"
                        >
                          {[...new Set(services.map(s => s.category))].map(cat => (
                            <div key={cat}>
                              <div className="px-6 py-3 text-[9px] uppercase font-black tracking-widest text-primary/80 bg-black/5 dark:bg-white/5 backdrop-blur-md border-b border-black/5 dark:border-white/5">{cat}</div>
                              {services.filter(s => s.category === cat).map(s => (
                                <div 
                                  key={s.id} 
                                  onClick={() => {
                                    setFormData({...formData, service_type: s.title, tier: DYNAMIC_OPTIONS.tiers[0], addons: []});
                                    setIsServiceDropdownOpen(false);
                                  }}
                                  className={`px-6 py-4 text-sm font-bold cursor-pointer transition-colors border-b border-black/5 dark:border-white/5 last:border-0 ${formData.service_type === s.title ? 'bg-primary/20 text-primary' : 'text-gray-900 dark:text-white hover:bg-white/50 dark:hover:bg-white/10'}`}
                                >
                                  {s.title}
                                </div>
                              ))}
                            </div>
                          ))}
                          <div 
                            onClick={() => {
                              setFormData({...formData, service_type: 'Custom', tier: DYNAMIC_OPTIONS.tiers[0], addons: []});
                              setIsServiceDropdownOpen(false);
                            }}
                            className={`px-6 py-4 text-sm font-bold cursor-pointer transition-colors border-t-2 border-black/10 dark:border-white/10 ${formData.service_type === 'Custom' ? 'bg-primary/20 text-primary' : 'text-gray-900 dark:text-white hover:bg-white/50 dark:hover:bg-white/10'}`}
                          >
                            Custom Architectural Support
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Dynamic Fields - Appear after service choice */}
              <AnimatePresence>
                {formData.service_type && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-black/5 dark:border-white/5"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Architectural Tier</label>
                      <div className="relative z-40">
                        <div 
                          onClick={() => setIsTierDropdownOpen(!isTierDropdownOpen)}
                          className="w-full px-6 py-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] text-sm outline-none transition-all text-gray-900 dark:text-white cursor-pointer font-bold flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/10 group"
                        >
                          <span>{formData.tier ? `${formData.tier} Implementation` : 'Select Architectural Tier'}</span>
                          <CheckCircle2 size={18} className={`text-primary/40 group-hover:text-primary transition-all duration-300 ${isTierDropdownOpen ? 'text-primary' : ''}`} />
                        </div>

                        <AnimatePresence>
                          {isTierDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsTierDropdownOpen(false)} />
                              <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute z-50 top-full left-0 right-0 mt-3 rounded-2xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-black/60 backdrop-blur-3xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden"
                              >
                                {DYNAMIC_OPTIONS.tiers.map(t => (
                                  <div 
                                    key={t}
                                    onClick={() => {
                                      setFormData({...formData, tier: t});
                                      setIsTierDropdownOpen(false);
                                    }}
                                    className={`px-6 py-4 text-sm font-bold cursor-pointer transition-colors border-b border-black/5 dark:border-white/5 last:border-0 ${formData.tier === t ? 'bg-primary/20 text-primary' : 'text-gray-900 dark:text-white hover:bg-white/50 dark:hover:bg-white/10'}`}
                                  >
                                    {t} Implementation
                                  </div>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Budget Allocation</label>
                      <input name="Budget Range" placeholder="e.g. Rs. 80,000 - 1,50,000" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] text-sm outline-none focus:border-primary focus:bg-white/60 dark:focus:bg-white/10 hover:bg-white/50 dark:hover:bg-white/10 transition-all text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-bold" />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Expected Timeline</label>
                      <input name="Expected Timeline" placeholder={DYNAMIC_OPTIONS.timelinePlaceholder} value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] text-sm outline-none focus:border-primary focus:bg-white/60 dark:focus:bg-white/10 hover:bg-white/50 dark:hover:bg-white/10 transition-all text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-bold" />
                    </div>

                    <div className="md:col-span-2 rounded-3xl border border-white/40 dark:border-white/10 p-6 bg-white/20 dark:bg-white/5 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)]">
                      <p className="text-xs font-black uppercase tracking-widest text-primary mb-4">Strategic Add-ons</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {DYNAMIC_OPTIONS.addons.map(addon => (
                          <label key={addon.id} className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all cursor-pointer ${formData.addons.includes(addon.id) ? 'bg-primary/20 border-primary text-primary shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]' : 'bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10'}`}>
                            <input type="checkbox" className="hidden" checked={formData.addons.includes(addon.id)} onChange={() => toggleAddon(addon.id)} />
                            <div className={`w-4 h-4 rounded flex flex-shrink-0 items-center justify-center transition-all ${formData.addons.includes(addon.id) ? 'bg-primary border border-primary' : 'bg-black/10 dark:bg-white/10 border border-white/20'}`}>
                              {formData.addons.includes(addon.id) && <CheckCircle2 size={10} className="text-white" />}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{addon.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2 bg-primary/10 border border-primary/20 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Live Price Estimation</span>
                      <span className="text-3xl font-black text-gray-900 dark:text-white">{getEstimatedPrice()}</span>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Vision Manifesto</label>
                      <textarea name="Project Requirements" rows="4" placeholder="Describe your project requirements, technical constraints, and desired outcomes..." value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className="w-full px-6 py-4 rounded-3xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] text-sm outline-none focus:border-primary focus:bg-white/60 dark:focus:bg-white/10 hover:bg-white/50 dark:hover:bg-white/10 transition-all text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-bold resize-none" />
                    </div>

                    <button type="submit" className="md:col-span-2 py-6 rounded-2xl bg-gray-900 dark:bg-primary text-white font-black uppercase tracking-[0.4em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-2xl">Place Order Protocol</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const Services = () => {
  const { showAlert } = useAlert();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await withTimeout(
        supabase.from('services').select('*').order('created_at', { ascending: false }),
        10000,
        'Database connection timed out.'
      );
      if (error) throw error;
      setServices(filterVisible(data));
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

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
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input 
                placeholder="Search services..." 
                className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-full outline-none focus:border-primary transition-all shadow-sm" 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] py-4 px-8 rounded-full shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-primary/50"
              >
                <MessageSquarePlus size={16} />
                <span>Request Custom Service</span>
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
                            className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              !selectedCategory ? "bg-primary text-white" : "hover:bg-white/5 text-muted-foreground hover:text-white"
                            }`}
                          >
                            All Services
                          </button>
                          {categories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                              className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                selectedCategory === cat ? "bg-primary text-white" : "hover:bg-white/5 text-muted-foreground hover:text-white"
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

        {/* Floating Trigger Button Removed - now in header flow */}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-center">
                <div className="w-[410px] h-[520px] bg-white/5 animate-pulse rounded-[32px] border border-white/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
            {filteredServices.map((service, idx) => {
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
                               <img src={service.cover_image} alt={service.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
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
                           
                           <h3 className="text-2xl font-black mb-6 leading-tight group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tighter">
                             {service.title}
                           </h3>
                           
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
                             <SignatureButton label="Details" />
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
        )}
      </div>

      <CustomServiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        services={services}
      />
    </main>
  );
};

export default Services;
