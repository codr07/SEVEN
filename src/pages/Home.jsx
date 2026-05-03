import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase, withTimeout, filterVisible } from '../lib/supabase';
import { Loader2, Code, Rocket, Brain, Cpu, Sparkles, BookOpen, GraduationCap, Laptop, Book as BookIcon, Zap } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import sevenLogo from '../assets/seven.svg';
import ProfileModal from '../components/ProfileModal';
import TiltCard from '../components/TiltCard';

const ScrollAnimatedSection = ({ children, className = "" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.9, 1, 1, 0.9]);
  const rotateX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [10, 0, 0, -10]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{
        scale,
        rotateX,
        opacity,
        perspective: 1200,
        transformStyle: "preserve-3d",
        willChange: "transform, opacity"
      }}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
};

const PopOutIcon = ({ icon: Icon, x, y, rotate, delay, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1, x: `${x}vw`, y: `${y}vh`, rotate }}
    transition={{ delay, duration: 1, type: "spring", bounce: 0.4 }}
    className="absolute pointer-events-none z-0"
    style={{ color }}
  >
    <Icon size={40} className="opacity-20" />
  </motion.div>
);

const FloatingIcon = ({ icon: Icon, x, y, delay, color }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{
      opacity: [0.1, 0.3, 0.1],
      y: [`${y}vh`, `${y - 4}vh`, `${y}vh`],
      x: [`${x}vw`, `${x + 2}vw`, `${x}vw`]
    }}
    transition={{
      delay,
      duration: 6 + Math.random() * 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute pointer-events-none z-0"
    style={{ left: '50%', top: '50%', color }}
  >
    <Icon size={28} className="opacity-10" />
  </motion.div>
);

const GlowingBlob = ({ color, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{
      opacity: [0.15, 0.3, 0.15],
      scale: [1, 1.2, 1],
      rotate: [0, 90, 0]
    }}
    transition={{
      delay,
      duration: 10,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={`absolute rounded-full blur-[60px] pointer-events-none z-0 will-change-[transform,opacity] ${className}`}
    style={{ backgroundColor: color }}
  />
);

const Hero3DAsset = ({ icon: Icon, x = 0, y = 0, color = "var(--color-primary)", delay = 1 }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const xPct = (e.clientX / innerWidth - 0.5) * 30;
      const yPct = (e.clientY / innerHeight - 0.5) * 30;
      mouseX.set(xPct);
      mouseY.set(yPct);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const rotateX = useTransform(springY, [-15, 15], [15, -15]);
  const rotateY = useTransform(springX, [-15, 15], [-15, 15]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{ opacity: 1, scale: 1, x: `${x}px`, y: `${y}px` }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 12,
        delay
      }}
      style={{
        rotateX,
        rotateY,
        perspective: 1000,
        transformStyle: "preserve-3d",
        position: 'absolute',
        top: '50%',
        left: '50%',
        willChange: "transform, opacity"
      }}
      className="hidden md:block pointer-events-none z-[5]"
    >
      <div
        className="p-8 rounded-3xl bg-white/30 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center group"
        style={{ transform: "translateZ(60px)" }}
      >
        <Icon size={64} color={color} className="filter drop-shadow-2xl group-hover:scale-110 transition-transform" />
      </div>
    </motion.div>
  );
};

const Home = () => {
  const [faculties, setFaculties] = useState([]);
  const [founders, setFounders] = useState([]);
  const [academics, setAcademics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [loadError, setLoadError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const results = await withTimeout(
        Promise.all([
          supabase.from('faculty').select('*'),
          supabase.from('founders').select('*'),
          supabase.from('academics').select('*'),
          supabase.from('courses').select('*'),
          supabase.from('services').select('*')
        ]),
        15000,
        'Server is taking too long to respond.'
      );

      const [fac, fnd, aca, crs, srv] = results;

      setFaculties(filterVisible(fac.data || []));
      setFounders(filterVisible(fnd.data || []));
      setAcademics(filterVisible(aca.data || []));
      setCourses(filterVisible(crs.data || []));
      setServices(filterVisible(srv.data || []));
    } catch (err) {
      console.error('Data Fetch Error:', err);
      setLoadError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categories = [...new Set(courses.map(c => c.category || 'General'))].slice(0, 4);

  return (
    <div className="relative w-full overflow-hidden flex flex-col text-foreground selection:bg-primary/20">
      {/* Hero Section */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 md:px-12 max-w-7xl mx-auto py-20 md:py-0 overflow-hidden">
        <div className="hidden md:block">
          <Hero3DAsset icon={BookOpen} x={-380} y={-180} color="var(--color-primary)" delay={1} />
          <Hero3DAsset icon={GraduationCap} x={340} y={-220} color="var(--color-accent)" delay={1.2} />
          <Hero3DAsset icon={Laptop} x={-420} y={120} color="var(--color-accent)" delay={1.4} />
          <Hero3DAsset icon={BookIcon} x={380} y={180} color="var(--color-primary)" delay={1.6} />

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FloatingIcon icon={Code} x={-40} y={-30} delay={0} color="var(--color-primary)" />
            <FloatingIcon icon={Rocket} x={35} y={-20} delay={1} color="var(--color-secondary)" />
            <FloatingIcon icon={Brain} x={-30} y={20} delay={2} color="var(--color-accent)" />
            <FloatingIcon icon={Cpu} x={40} y={30} delay={1.5} color="var(--color-primary)" />
          </div>
        </div>

        <section className="flex flex-col items-center justify-center gap-6 md:gap-10 w-full text-center relative z-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-4 md:mb-8">
              <span className="block text-sm md:text-xl font-bold text-muted-foreground uppercase tracking-[0.4em] mb-2 md:mb-4">
                Redefining
              </span>
              <span className="relative inline-block text-animate-gradient drop-shadow-sm">
                5EVEN
                <Sparkles className="absolute -top-4 -right-8 md:-top-6 md:-right-10 w-8 h-8 md:w-12 md:h-12 text-accent opacity-50 animate-pulse" />
              </span>
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed px-4">
            Empowering the next generation with divine balance and innovation.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 w-full">
            <Link to="/courses" className="cool-button w-full sm:w-auto min-w-[180px] h-12 text-sm text-white">Explore Programs</Link>
            <Link to="/contact" className="cool-button-secondary w-full sm:w-auto min-w-[180px] h-12 text-sm">Join Community</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex items-center justify-center gap-2 md:gap-3 flex-wrap mt-8">
            {categories.map((badge) => (
              <span key={badge} className="px-5 py-2 rounded-xl badge-glass text-[10px]">
                {badge}
              </span>
            ))}
          </motion.div>
        </section>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col gap-24 md:gap-32 px-4 md:px-12 max-w-7xl mx-auto pb-32">
        <GlowingBlob color="hsl(var(--primary))" className="top-[40%] left-[-20%] w-[60%] h-[60%]" delay={1} />
        <GlowingBlob color="hsl(var(--accent))" className="top-[60%] right-[-20%] w-[60%] h-[60%]" delay={3} />

        {/* Services */}
        <ScrollAnimatedSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 w-full">
            <TiltCard>
              <div className="institution-card p-6 md:p-10 h-full flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mb-6 md:mb-8 text-primary">
                    <GraduationCap size={28} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-3 md:mb-4">Academic Excellence</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8">Structured learning programs for schools and universities.</p>
                  <div className="relative pl-4 border-l-2 border-primary/30 flex flex-wrap gap-2">
                    {academics.length > 0 ? (
                      [...new Set(academics.map(aca => aca.title || aca.category))].slice(0, 6).map((topic, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg badge-glass text-[9px] hover:scale-105 transition-transform">{topic}</span>
                      ))
                    ) : (
                      ['School Prep', 'University Support', 'Skill Mastery'].map((topic, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg badge-glass text-[9px]">{topic}</span>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-8 md:mt-12">
                  <Link to="/academics" className="w-full sm:flex-1 cool-button h-12 md:h-14">Academic Path</Link>
                  <Link to="/notes" className="w-full sm:flex-1 cool-button-secondary h-12 md:h-14">Study Desk</Link>
                </div>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="institution-card p-6 md:p-10 h-full flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 md:mb-8 text-secondary">
                    <Zap size={28} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-3 md:mb-4">Professional Services</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8">Digital solutions and commercial support for students.</p>
                  <div className="relative pl-4 border-l-2 border-secondary/30 flex flex-wrap gap-2">
                    {services.length > 0 ? (
                      [...new Set(services.map(srv => srv.title || srv.category))].slice(0, 6).map((topic, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg badge-glass text-[9px] hover:scale-105 transition-transform">{topic}</span>
                      ))
                    ) : (
                      ['Web Dev', 'IT Solutions', 'Digital Presence'].map((topic, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg badge-glass text-[8px] text-primary border-primary/20">{topic}</span>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex mt-8 md:mt-12">
                  <Link to="/services" className="w-full cool-button h-12 md:h-14">Explore Offerings</Link>
                </div>
              </div>
            </TiltCard>
          </div>
        </ScrollAnimatedSection>

        {/* Philosophy */}
        <ScrollAnimatedSection>
          <div className="flex flex-col items-center text-center gap-10 md:gap-16 w-full">
            <div className="flex flex-col gap-2 md:gap-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">The 5EVEN Philosophy</h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl font-medium px-4">Ancient wisdom meets modern technology.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
              {[
                { img: "https://pngimg.com/uploads/globe/globe_PNG100087.png", title: "5 Elements", desc: "Foundation of everything.", color: "primary", border: "border-t-primary", bg: "bg-primary/10", text: "text-primary", innerBorder: "border-primary/20" },
                { img: "https://i.pinimg.com/736x/82/b0/d9/82b0d91458e8291ddf1529f14c171c1d.jpg", title: "7 Chakras", desc: "Aligning energy centers.", color: "secondary", border: "border-t-secondary", bg: "bg-secondary/10", text: "text-secondary", innerBorder: "border-secondary/20" },
                { img: sevenLogo, title: "Divine Union", desc: "Synergy of 5 and 7.", color: "accent", border: "border-t-accent", bg: "bg-accent/10", text: "text-accent", innerBorder: "border-accent/20" }
              ].map((item, idx) => (
                <div key={idx} className={`institution-card p-6 md:p-10 flex flex-col items-center gap-4 md:gap-6 group border-t-4 ${item.border}`}>
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${item.bg} p-4 group-hover:scale-105 transition-transform border ${item.innerBorder}`}>
                    <img src={item.img} className="w-full h-full object-cover rounded-full" alt={item.title} loading="lazy" />
                  </div>
                  <h4 className={`text-xl md:text-2xl font-black ${item.text}`}>{item.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground px-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Founders & Faculty */}
        <section className="flex flex-col gap-16 md:gap-24 w-full">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
          ) : loadError ? (
            <div className="text-center py-10 bg-muted/10 rounded-2xl border border-border">
              <p className="text-xs text-destructive font-bold mb-4">{loadError}</p>
              <button onClick={fetchData} className="cool-button px-6 py-3 text-[10px]">Retry</button>
            </div>
          ) : (
            <>
              <ScrollAnimatedSection>
                <div className="flex flex-col gap-8 md:gap-12">
                  <h2 className="text-3xl md:text-4xl font-black text-center text-animate-gradient">Our Visionaries</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-5xl mx-auto w-full">
                    {founders.map(founder => (
                      <TiltCard key={founder.id}>
                        <div className="institution-card p-6 md:p-8 flex flex-col items-center text-center group h-full">
                          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl mb-8 group-hover:scale-105 transition-transform duration-500">
                            <img src={founder.cover_image || 'https://via.placeholder.com/150'} alt={founder.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <h4 className="text-xl md:text-2xl font-black mb-1">{founder.name}</h4>
                          <p className="text-[8px] md:text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4 md:mb-6">{founder.role}</p>
                          <p className="text-xs md:text-sm text-muted-foreground italic mb-6 md:mb-8 px-2">"{founder.bio}"</p>
                          <button onClick={() => { setSelectedProfile(founder); setProfileType('founder'); }} className="w-full h-12 md:h-14 cool-button mt-auto">Read Journey</button>
                        </div>
                      </TiltCard>
                    ))}
                  </div>
                </div>
              </ScrollAnimatedSection>

              <ScrollAnimatedSection>
                <div className="flex flex-col gap-8 md:gap-12 w-full overflow-hidden">
                  <div className="flex flex-col items-center gap-2">
                    <h2 className="text-3xl md:text-4xl font-black text-animate-gradient">Expert Mentors</h2>
                    <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Meet our expertise</p>
                  </div>

                  <div className="relative w-full marquee-container">
                    {/* Fades */}
                    <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none"></div>

                    <div className="overflow-x-auto no-scrollbar scroll-smooth overflow-y-visible py-20">
                      <div className="marquee-track px-4 md:px-32 flex gap-8">
                        {[...faculties, ...faculties].map((fac, idx) => (
                          <div key={`${fac.id}-${idx}`} className="min-w-[280px] md:min-w-[420px]">
                            <TiltCard>
                              <div className="institution-card p-6 md:p-8 flex flex-col items-center text-center h-[450px] group">
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-white/10 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                  <img src={fac.cover_image || 'https://via.placeholder.com/150'} alt={fac.name} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                                <h4 className="text-lg md:text-xl font-black mb-1">{fac.name}</h4>
                                <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-widest mb-4 md:mb-6">{fac.topic || fac.department}</p>
                                <p className="text-xs md:text-sm text-muted-foreground line-clamp-3 mb-6 md:mb-8 italic opacity-60">"{fac.bio || fac.description}"</p>
                                <button onClick={() => { setSelectedProfile(fac); setProfileType('faculty'); }} className="w-full h-12 md:h-14 cool-button-secondary mt-auto">Full Profile</button>
                              </div>
                            </TiltCard>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollAnimatedSection>
            </>
          )}
        </section>
      </div>

      <ProfileModal profile={selectedProfile} type={profileType} onClose={() => { setSelectedProfile(null); setProfileType(null); }} />
    </div>
  );
};

export default Home;
