import React, { useEffect, useState } from 'react';
import { Loader2, Zap, X, MessageSquarePlus } from 'lucide-react';
import { supabase, withTimeout, filterVisible } from '../lib/supabase';
import { Link } from 'react-router-dom';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [selectedService, setSelectedService] = useState('');
  const [mockTests, setMockTests] = useState(1);
  const [subjects, setSubjects] = useState(1);
  const [docType, setDocType] = useState('');
  const [thesisRange, setThesisRange] = useState('');
  const [desktopSetups, setDesktopSetups] = useState(1);
  const [posterPackage, setPosterPackage] = useState('');
  const [albumPackage, setAlbumPackage] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await withTimeout(
        supabase.from('services').select('*'),
        10000,
        'Database connection timed out. Please check your network or try again.'
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

  const getEstimatedPrice = () => {
    if (!selectedService) return "Select a service to calculate price";
    
    if (selectedService.includes("Mock")) {
      const total = mockTests * subjects * 500;
      return `₹${total} (${mockTests} test(s) × ${subjects} subject(s) × ₹500)`;
    }
    if (selectedService.includes("Project Doc")) {
      if (!docType) return "Select documentation type to calculate price";
      const prices = { "Word": 500, "LaTeX": 1000, "Custom Publisher": 2000 };
      return `₹${prices[docType]}`;
    }
    if (selectedService.includes("Thesis")) {
      if (!thesisRange) return "Select thesis page range to calculate price";
      if (thesisRange === "40+") return "Discussion Required (40+ pages)";
      const prices = { "4-7": 2000, "8-20": 5000, "20-40": 8000 };
      return `₹${prices[thesisRange]}`;
    }
    if (selectedService.includes("Desktop Design")) {
      const total = desktopSetups * 2000;
      return `₹${total} (${desktopSetups} setup(s) × ₹2000)`;
    }
    if (selectedService.includes("Poster")) {
      if (!posterPackage) return "Select package to calculate price";
      return posterPackage === "Standard" ? "₹500" : "₹1000";
    }
    if (selectedService.includes("Album")) {
      if (!albumPackage) return "Select package to calculate price";
      return albumPackage === "Standard" ? "₹2000" : "₹5000";
    }
    
    // Default Web Services
    return "Custom Quote (Check Mail After Submission)";
  };

  const isWebService = selectedService && !selectedService.includes("Mock") && !selectedService.includes("Doc") && !selectedService.includes("Thesis") && !selectedService.includes("Desktop") && !selectedService.includes("Poster") && !selectedService.includes("Album");

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-20 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-8 transform hover:scale-105 transition-transform duration-500 text-animate-gradient">Services</h1>
        <p className="text-lg md:text-xl font-light tracking-widest uppercase opacity-70 leading-relaxed">
          Comprehensive commercial and digital support beyond the classroom. We care about your professional success.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary w-12 h-12" />
        </div>
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6 text-destructive">
          <div className="text-xl font-bold uppercase tracking-widest text-animate-gradient">Connection Issue</div>
          <div className="text-sm opacity-80 max-w-xl text-center px-4 mb-4">{errorMsg}</div>
          <button 
            onClick={fetchServices}
            className="px-8 py-3 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            Retry Connection
          </button>
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <div className="text-xl font-bold uppercase tracking-widest">No Services Found</div>
          <div className="text-sm opacity-80">We currently have no IT or MISC services available. Check back soon!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link 
              to={`/services/${service.id}`} 
              key={service.id} 
              className="group relative overflow-hidden backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[40px] p-10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/10 hover:border-primary/30 hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(var(--primary),0.2)] transition-all duration-500 flex flex-col justify-between"
            >
              {/* Liquid Shine Effect */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-20" />
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-full h-48 relative rounded-[24px] overflow-hidden mb-8 border border-white/10 group-hover:border-primary/30 transition-colors duration-500">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                  <img 
                    src={service.thumbnail || service.image_url || service.cover_image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop'} 
                    alt={service.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/20 shadow-lg">
                      {service.category}
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 z-20">
                    <div className="w-12 h-12 bg-black/80 backdrop-blur-md border border-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:-rotate-12 group-hover:scale-110 transition-all duration-500 shadow-xl">
                      <Zap size={20} />
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-black uppercase tracking-widest mb-4 min-h-[4rem] flex items-center group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-xl font-bold opacity-80 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  {service.price}
                </p>
                <div className="text-sm font-medium opacity-70 leading-relaxed transition-colors space-y-3 mb-8">
                  {service.description?.slice(0, 2).map((point, idx) => (
                    <p key={idx} className="flex gap-3">
                      <span className="text-primary mt-1 opacity-70">•</span>
                      <span className="line-clamp-2">{point}</span>
                    </p>
                  ))}
                </div>
              </div>
              
              <div className="w-full py-4 text-xs bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:text-primary transition-all duration-300 relative z-10">
                <span>View Full Package</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Floating Action Button (Top Right) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed top-24 right-4 md:right-8 z-40 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs py-3 px-6 rounded-full shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-primary/50"
      >
        <MessageSquarePlus size={18} />
        <span>Request Custom Service</span>
      </button>

      {/* Dynamic Service Request Form Modal (Full Screen) */}
      {isModalOpen && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl overflow-y-auto w-full h-full">
          <div className="relative w-full min-h-screen max-w-7xl mx-auto flex flex-col justify-start pt-32 pb-24 px-6 md:px-16 lg:px-24">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="fixed top-8 right-8 md:top-12 md:right-12 p-4 bg-white/5 hover:bg-destructive shadow-xl hover:text-destructive-foreground rounded-full transition-all border border-white/10 z-[110]"
            >
               <X size={32} />
            </button>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-primary">Custom Service Request</h2>
              <p className="text-muted-foreground">Select a service below to configure dynamic options and generate an estimated price.</p>
            </div>

            <form action="https://formsubmit.co/orders.seveninst@gmail.com" method="POST" className="space-y-8">
              <input type="hidden" name="_subject" value="New Highly-Detailed Service Request from 5EVEN!" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="Calculated Estimated Price" value={getEstimatedPrice()} />

              {/* Base Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Full Name</label>
                  <input type="text" name="name" required placeholder="John Doe" className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Email Address</label>
                  <input type="email" name="email" required placeholder="john@example.com" className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Phone Number</label>
                  <input type="tel" name="Phone" required placeholder="+91 9876543210" className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none" />
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary">Select Service Type</label>
                <select 
                  name="service_type" 
                  required 
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary border-primary/50 text-foreground outline-none font-bold"
                >
                  <option value="" disabled>Select a service you are interested in...</option>
                  <optgroup label="Web & Commercial Services">
                    {services.length > 0 ? (
                      services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)
                    ) : (
                      <>
                        <option value="Developer Portfolio Website">Developer Portfolio Website</option>
                        <option value="IT Executive / Corporate Portfolio">IT Executive / Corporate Portfolio</option>
                        <option value="Ecommerce Development">Ecommerce Development</option>
                        <option value="LMS Platform Development">LMS Platform Development</option>
                        <option value="Custom Desktop Design">Custom Desktop Design</option>
                        <option value="Poster and Related Design">Poster and Related Design</option>
                        <option value="Album Design">Album Design</option>
                      </>
                    )}
                  </optgroup>
                  <optgroup label="Other Offerings">
                    <option value="Project Documentation">Project Documentation</option>
                    <option value="Thesis Documentation">Thesis Documentation</option>
                    <option value="Mock and Rock (Mock Exams)">Mock and Rock (Mock Exams)</option>
                  </optgroup>
                  <option value="Custom">Other Custom Service</option>
                </select>
              </div>

              {/* DYNAMIC FORM SEGMENTS */}
              
              {/* Web Services Fields */}
              {isWebService && selectedService !== "Custom" && selectedService !== "" && (
                <div className="p-6 border border-border bg-card/50 rounded-2xl space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-secondary">Web Service Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select name="Preferred Tier" required className="rounded-xl px-4 py-3 bg-background border border-border">
                      <option value="Basic">Basic Tier</option>
                      <option value="Professional">Professional Tier</option>
                      <option value="Advanced">Advanced Tier</option>
                      <option value="Premium">Premium Tier</option>
                      <option value="Enterprise">Enterprise Tier</option>
                    </select>
                    <input type="text" name="Budget Range" placeholder="Budget (e.g. Rs. 80,000)" className="rounded-xl px-4 py-3 bg-background border border-border" />
                    <input type="text" name="Timeline" placeholder="Expected Timeline (e.g. 4 weeks)" className="md:col-span-2 rounded-xl px-4 py-3 bg-background border border-border" />
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70">Optional Add-ons</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {["Admin Panel", "Custom Database", "Payment Gateway", "SEO Config", "AI Chatbot"].map(addon => (
                        <label key={addon} className="flex items-center gap-2 text-sm bg-background p-3 rounded-xl border border-border hover:border-primary cursor-pointer">
                          <input type="checkbox" name="Add-ons[]" value={addon} className="accent-primary" />
                          <span className="truncate">{addon}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mock Test Fields */}
              {selectedService.includes("Mock") && (
                <div className="p-6 border border-border bg-card/50 rounded-2xl space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-secondary">Mock Exam Parameters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select name="Mock Tests Count" value={mockTests} onChange={e => setMockTests(Number(e.target.value))} className="rounded-xl px-4 py-3 bg-background border border-border">
                      {[1,2,3,4].map(n => <option key={n} value={n}>{n} Mock Test{n > 1 ? 's' : ''}</option>)}
                    </select>
                    <input type="number" min="1" value={subjects} onChange={e => setSubjects(Number(e.target.value))} name="Number of Subjects" placeholder="Number of Subjects" className="rounded-xl px-4 py-3 bg-background border border-border" />
                  </div>
                </div>
              )}

              {/* Project Doc Fields */}
              {selectedService.includes("Project Doc") && (
                <div className="p-6 border border-border bg-card/50 rounded-2xl space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-secondary">Documentation Details</h3>
                  <select name="Documentation Type" value={docType} onChange={e => setDocType(e.target.value)} required className="w-full rounded-xl px-4 py-3 bg-background border border-border">
                    <option value="" disabled>Select Format</option>
                    <option value="Word">Word Document - ₹500</option>
                    <option value="LaTeX">LaTeX Documentation - ₹1000</option>
                    <option value="Custom Publisher">Publisher Format - ₹2000</option>
                  </select>
                </div>
              )}

              {/* Thesis Fields */}
              {selectedService.includes("Thesis") && (
                <div className="p-6 border border-border bg-card/50 rounded-2xl space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-secondary">Thesis Details</h3>
                  <select name="Thesis Page Range" value={thesisRange} onChange={e => setThesisRange(e.target.value)} required className="w-full rounded-xl px-4 py-3 bg-background border border-border">
                    <option value="" disabled>Select Content Volume</option>
                    <option value="4-7">4-7 pages - ₹2000</option>
                    <option value="8-20">8-20 pages - ₹5000</option>
                    <option value="20-40">20-40 pages - ₹8000</option>
                    <option value="40+">40+ pages - Custom Quote</option>
                  </select>
                </div>
              )}

              {/* Design Fields */}
              {selectedService.includes("Desktop Design") && (
                <div className="p-6 border border-border bg-card/50 rounded-2xl space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <input type="number" min="1" value={desktopSetups} onChange={e => setDesktopSetups(e.target.value)} name="Desktop Setups" placeholder="Total Desktop Setups" className="rounded-xl px-4 py-3 bg-background border border-border" />
                    <input type="text" name="Theme Preference" placeholder="Theme / Style Preferences..." className="rounded-xl px-4 py-3 bg-background border border-border" />
                  </div>
                </div>
              )}
              {selectedService.includes("Poster") && (
                <div className="p-6 border border-border bg-card/50 rounded-2xl space-y-4">
                  <select name="Poster Package" value={posterPackage} onChange={e => setPosterPackage(e.target.value)} required className="w-full rounded-xl px-4 py-3 bg-background border border-border">
                    <option value="" disabled>Select Design Package</option>
                    <option value="Standard">Standard - ₹500</option>
                    <option value="Premium">Premium - ₹1000</option>
                  </select>
                </div>
              )}
              {selectedService.includes("Album") && (
                <div className="p-6 border border-border bg-card/50 rounded-2xl space-y-4">
                  <select name="Album Package" value={albumPackage} onChange={e => setAlbumPackage(e.target.value)} required className="w-full rounded-xl px-4 py-3 bg-background border border-border">
                    <option value="" disabled>Select Layout Package</option>
                    <option value="Standard">Standard - ₹2000</option>
                    <option value="Premium">Premium - ₹5000</option>
                  </select>
                </div>
              )}

              {/* Price Calculation Display */}
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black uppercase tracking-widest text-primary mb-2">Estimated Pricing</span>
                <span className="text-2xl font-black">{getEstimatedPrice()}</span>
              </div>

              {/* Project Requirements text area */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary">Additional Details</label>
                <textarea 
                  name="message" 
                  required 
                  rows="4" 
                  placeholder="Tell us any other specifics about your requirements..." 
                  className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full py-5 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
              >
                Submit Detailed Request
              </button>
            </form>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default Services;
