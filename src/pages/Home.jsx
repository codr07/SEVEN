import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, withTimeout, filterVisible } from '../lib/supabase';
import { Loader2, Code, Rocket, Brain, Cpu, Sparkles, BookOpen, GraduationCap, Laptop, Book as BookIcon } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import sevenLogo from '../assets/seven_dark.svg';
import ProfileModal from '../components/ProfileModal';
import TiltCard from '../components/TiltCard';

const PopOutIcon = ({ icon: Icon, delay = 0, x = 0, y = 0, rotate = 0, color = "var(--color-primary)" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
    animate={{
      opacity: 0.4,
      scale: 1,
      x: `${x}vw`,
      y: `${y}vh`,
      rotate: [rotate, rotate + 5, rotate - 5, rotate]
    }}
    transition={{
      opacity: { duration: 0.5, delay: delay + 0.5 },
      scale: { type: "spring", stiffness: 100, damping: 10, delay: delay + 0.5 },
      x: { duration: 0.8, delay: delay + 0.5 },
      y: { duration: 0.8, delay: delay + 0.5 },
      rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    }}
    className="absolute pointer-events-none z-[-1]"
    style={{ color, left: '50%', top: '50%' }}
  >
    <Icon size={64} strokeWidth={1} className="filter drop-shadow-[0_0_20px_rgba(0,0,0,0.15)] opacity-60" />
  </motion.div>
);

const FloatingIcon = ({ icon: Icon, delay = 0, x = 0, y = 0, color = "var(--color-primary)" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0.1, 0.2, 0.1],
      scale: [1, 1.2, 1],
      x: [x - 10, x + 10, x - 10],
      y: [y - 10, y + 10, y - 10],
      rotate: [0, 10, 0]
    }}
    transition={{
      duration: 5,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute pointer-events-none hidden md:block"
    style={{ left: `${50 + x}%`, top: `${40 + y}%`, transform: 'translate(-50%, -50%)', color }}
  >
    <Icon className="w-12 h-12 opacity-30 fill-current" />
  </motion.div>
);

const Hero3DAsset = ({ icon: Icon, x = 0, y = 0, color = "var(--color-primary)", delay = 1 }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const xPct = (e.clientX / innerWidth - 0.5) * 40;
      const yPct = (e.clientY / innerHeight - 0.5) * 40;
      mouseX.set(xPct);
      mouseY.set(yPct);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const rotateX = useTransform(springY, [-20, 20], [20, -20]);
  const rotateY = useTransform(springX, [-20, 20], [-20, 20]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{ opacity: 1, scale: 1, x: `${x}px`, y: `${y}px` }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
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
      }}
      className="hidden md:block pointer-events-none z-[5]"
    >
      <div
        className="p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center group"
        style={{ transform: "translateZ(80px)" }}
      >
        <Icon size={72} color={color} className="filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform" />
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
      const [facultiesRes, foundersRes, academicsRes, coursesRes, servicesRes] = await withTimeout(
        Promise.all([
          supabase.from('faculty').select('*'),
          supabase.from('founders').select('*'),
          supabase.from('academics').select('*'),
          supabase.from('courses').select('*'),
          supabase.from('services').select('*')
        ]),
        12000,
        'Connection timed out. Please check your internet and try again.'
      );

      if (facultiesRes.error) throw facultiesRes.error;
      if (foundersRes.error) throw foundersRes.error;
      if (academicsRes.error) throw academicsRes.error;
      if (coursesRes.error) throw coursesRes.error;
      if (servicesRes.error) throw servicesRes.error;

      setFaculties(filterVisible(facultiesRes.data));
      setFounders(filterVisible(foundersRes.data));
      setAcademics(filterVisible(academicsRes.data));
      setCourses(filterVisible(coursesRes.data));
      setServices(filterVisible(servicesRes.data));
    } catch (err) {
      console.error('Error fetching home data:', err);
      setLoadError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="relative w-full overflow-hidden flex flex-col bg-background text-foreground">
      {/* Background Graphic */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)] opacity-40"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center px-4 md:px-8 max-w-7xl mx-auto overflow-visible">

        {/* 3D Interactive Assets */}
        <Hero3DAsset icon={BookOpen} x={-350} y={-150} color="var(--color-primary)" delay={1.2} />
        <Hero3DAsset icon={GraduationCap} x={300} y={-200} color="var(--color-secondary)" delay={1.4} />
        <Hero3DAsset icon={Laptop} x={-400} y={100} color="var(--color-accent)" delay={1.6} />
        <Hero3DAsset icon={BookIcon} x={350} y={150} color="var(--color-primary)" delay={1.8} />

        {/* Pop-out Decorations */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <PopOutIcon icon={Code} x={-25} y={-22} rotate={-15} delay={0.2} color="var(--color-primary)" />
          <PopOutIcon icon={Rocket} x={28} y={-18} rotate={20} delay={0.4} color="var(--color-secondary)" />
          <PopOutIcon icon={Brain} x={-32} y={15} rotate={-10} delay={0.6} color="var(--color-accent)" />
          <PopOutIcon icon={Cpu} x={35} y={25} rotate={15} delay={0.8} color="var(--color-primary)" />
          {/* Study Icons */}
          <PopOutIcon icon={Sparkles} x={10} y={-35} rotate={30} delay={0.3} color="var(--color-secondary)" />
          <PopOutIcon icon={Sparkles} x={-15} y={30} rotate={-20} delay={0.7} color="var(--color-accent)" />
        </div>

        {/* Floating Hero Decorations */}
        <FloatingIcon icon={Code} x={-42} y={-25} delay={0} color="var(--color-primary)" />
        <FloatingIcon icon={Rocket} x={38} y={-10} delay={1} color="var(--color-secondary)" />
        <FloatingIcon icon={Brain} x={-35} y={15} delay={2} color="var(--color-accent)" />
        <FloatingIcon icon={Cpu} x={45} y={20} delay={1.5} color="var(--color-primary)" />
        <FloatingIcon icon={Sparkles} x={0} y={-35} delay={0.5} color="var(--color-secondary)" />

        {/* Hero Content */}
        <section className="flex flex-col items-center justify-center gap-8 w-full text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-8xl text-black font-black tracking-tighter leading-none mb-6 flex flex-col items-center gap-4">
              <span className="flex items-center gap-4 text-xl md:text-2xl font-bold text-black uppercase tracking-[0.4em]">
                Welcome to
              </span>
              <span className="relative inline-block">
                <span className="text-animate-gradient drop-shadow-[0_0_30px_rgba(hsl(var(--primary)),0.2)] p-2">5EVEN</span>
                <Sparkles className="absolute -top-4 -right-8 w-10 h-10 text-secondary opacity-70 animate-pulse" />
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-2xl text-muted-foreground w-full max-w-3xl mx-auto font-medium"
          >
            Boost your academia in a completely new way. <br className="hidden md:block" />
            Where innovation meets education, and your potential knows no bounds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-4 flex-wrap mt-4"
          >
            {[...new Set(courses.map(c => c.category))].slice(0, 4).map((badge) => (
              <span key={badge} className="px-6 py-2.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-black tracking-widest uppercase backdrop-blur-md shadow-sm hover:bg-primary/10 transition-colors">
                {badge}
              </span>
            ))}
          </motion.div>
        </section>
      </div>

      {/* Main Content Areas */}

      <div className="relative z-10 w-full flex flex-col gap-24 px-4 md:px-8 max-w-7xl mx-auto pb-20">

        {/* Services Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          <div className="flex flex-col gap-8">
            <TiltCard className="h-full">
              <div className="flex flex-col gap-5 p-10 rounded-4xl border border-border bg-card/40 backdrop-blur-2xl shadow-xl hover:border-primary/30 transition-all h-full justify-between group">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <i className="ri-school-line text-3xl"></i>
                  </div>
                  <p className="text-3xl font-black mb-4">School Academics</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {academics.slice(0, 3).map(item => (
                      <div key={item.title} className="px-4 py-1.5 bg-muted/50 border border-border rounded-xl text-xs font-bold text-foreground">
                        {item.title}
                      </div>
                    ))}
                    {academics.length === 0 && <span className="text-xs text-muted-foreground uppercase tracking-widest font-black opacity-50">Programs coming soon</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-8 w-full">
                  <Link to="/academics" className="flex-1 bg-primary text-white font-black py-4 flex items-center justify-center gap-2 rounded-2xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs shadow-lg shadow-primary/20 shadow-primary/20">
                    <i className="ri-graduation-cap-fill text-lg"></i>
                    Academics
                  </Link>
                  <Link to="/notes" className="flex-1 bg-transparent border-2 border-primary/50 text-foreground font-black py-4 flex items-center justify-center gap-2 rounded-2xl hover:bg-primary/5 transition-all uppercase tracking-widest text-xs">
                    <i className="ri-booklet-line text-lg"></i>
                    View Notes
                  </Link>
                </div>
              </div>
            </TiltCard>

            <TiltCard className="h-full">
              <div className="flex flex-col gap-5 p-10 rounded-4xl border border-border bg-card/40 backdrop-blur-2xl shadow-xl hover:border-secondary/30 transition-all h-full justify-between group">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform">
                    <i className="ri-award-line text-3xl"></i>
                  </div>
                  <p className="text-3xl font-black mb-4">Courses & Certs</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {courses.slice(0, 3).map(item => (
                      <div key={item.name} className="px-4 py-1.5 bg-muted/50 border border-border rounded-xl text-xs font-bold text-foreground flex items-center gap-2">
                        <i className="ri-checkbox-circle-fill text-secondary/60"></i>
                        {item.name}
                      </div>
                    ))}
                    {courses.length === 0 && <span className="text-xs text-muted-foreground uppercase tracking-widest font-black opacity-50">Courses coming soon</span>}
                  </div>
                </div>
                <Link to="/courses" className="mt-8 w-full bg-secondary text-white font-black py-4 flex items-center justify-center gap-2 rounded-2xl hover:bg-secondary/90 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs shadow-lg shadow-secondary/20 shadow-secondary/20">
                  <i className="ri-play-circle-fill text-lg"></i>
                  View Courses
                </Link>
              </div>
            </TiltCard>
          </div>

          <TiltCard className="h-full">
            <div className="flex flex-col gap-5 p-10 rounded-4xl border border-border bg-card/40 backdrop-blur-2xl shadow-xl hover:border-accent/30 transition-all justify-between h-full group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
                  <i className="ri-flask-line text-3xl"></i>
                </div>
                <p className="text-3xl font-black mb-4">IT & MISC Services</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.slice(0, 4).map(service => (
                    <div key={service.title} className="p-4 rounded-2xl bg-background/50 border border-border flex items-center gap-3 group/item hover:border-accent/40 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <i className="ri-rocket-line text-lg"></i>
                      </div>
                      <span className="text-sm font-bold text-muted-foreground group-hover/item:text-foreground transition-colors">{service.title}</span>
                    </div>
                  ))}
                  {services.length === 0 && <p className="text-xs text-muted-foreground uppercase tracking-widest font-black opacity-50 col-span-2">Services coming soon</p>}
                </div>
              </div>
              <Link to="/services" className="mt-8 w-full bg-accent text-white font-black py-4 flex items-center justify-center gap-2 rounded-2xl hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs shadow-lg shadow-accent/20 shadow-accent/20">
                <i className="ri-rocket-2-fill text-lg"></i>
                Explore Services
              </Link>
            </div>
          </TiltCard>
        </section>

        {/* About 5EVEN */}
        <section className="flex flex-col gap-12 w-full mt-10 border-t border-border pt-20">
          <div className="flex flex-col items-center justify-center gap-6 w-full">
            <h2 className="text-4xl md:text-5xl font-black text-center tracking-tight text-animate-gradient">About 5EVEN</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl text-center leading-relaxed font-medium">
              5EVEN is a premium educational institution dedicated to transforming academic excellence through innovative learning methodologies. We combine cutting-edge technology with expert mentorship to empower students across Data Science, Machine Learning, AI, and Full Stack Development.
            </p>
          </div>

          <div className="flex flex-col gap-10 w-full bg-card p-8 md:p-12 rounded-3xl shadow-xl border border-border mt-10">
            <h3 className="text-3xl flex items-center gap-3 font-bold">
              <span className="text-primary text-4xl">*</span> Why the Name 5EVEN?
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The name <strong className="text-foreground tracking-wide font-black">5EVEN</strong> is inspired by a timeless balance: the <strong>5 great elements</strong> of Indian philosophy and the <strong>7 chakras</strong> of the human body. Together, they represent harmony between body, mind, energy, and awareness.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              <div className="flex flex-col items-center text-center gap-4 p-10 rounded-4xl bg-background border border-border hover:border-primary/30 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/20"></div>
                <div className="relative">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg" alt="5 Elements" className="w-28 h-28 object-cover rounded-full shadow-2xl border-4 border-primary/20 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <p className="font-black text-2xl tracking-tight mt-2">5 Elements</p>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed uppercase tracking-widest opacity-70">Pancha Mahabhuta</p>
                <p className="text-sm text-muted-foreground px-4">Foundation, flow, energy, movement, and space.</p>
              </div>

              <div className="flex flex-col items-center text-center gap-4 p-10 rounded-4xl bg-background border border-border hover:border-secondary/30 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-secondary/20"></div>
                <div className="relative">
                  <img src="https://i.pinimg.com/736x/82/b0/d9/82b0d91458e8291ddf1529f14c171c1d.jpg" alt="7 Chakras" className="w-28 h-28 object-cover object-center rounded-full shadow-2xl border-4 border-secondary/20 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <p className="font-black text-2xl tracking-tight mt-2">7 Chakras</p>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed uppercase tracking-widest opacity-70">Energy Centers</p>
                <p className="text-sm text-muted-foreground px-4">Aligning your energy from root to crown.</p>
              </div>

              <div className="flex flex-col items-center text-center gap-4 p-10 rounded-4xl bg-background border border-border hover:border-accent/30 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent/20"></div>
                <div className="relative">
                  <img src={sevenLogo} alt="5EVEN emblem" className="w-28 h-28 object-contain rounded-full shadow-2xl border-4 border-accent/20 p-4 bg-white/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500" />
                </div>
                <p className="font-black text-2xl tracking-tight mt-2">Divine Balance</p>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed uppercase tracking-widest opacity-70">The Unity of 5 & 7</p>
                <p className="text-sm text-muted-foreground px-4">Where philosophy meets modern education.</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-8 rounded-2xl text-center font-black text-2xl tracking-widest text-foreground mt-4 shadow-inner border border-border/50">
              <span className="text-primary text-3xl">5</span> ELEMENTS <span className="mx-4 font-normal text-muted-foreground">+</span> <span className="text-secondary text-3xl">7</span> CHAKRAS <span className="mx-4 font-normal text-muted-foreground">=</span> <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-4xl">5EVEN</span>
            </div>
          </div>
        </section>

        {/* Dynamic Founders and Faculty Section */}
        <section className="flex flex-col gap-24 w-full pt-10">
          {loading ? (
            <div className="h-64 flex items-center justify-center w-full">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6 text-destructive">
              <div className="text-xl font-bold uppercase tracking-widest text-animate-gradient">Connection Issue</div>
              <div className="text-sm opacity-80 max-w-xl text-center px-4 mb-4">{loadError}</div>
              <button onClick={fetchData} className="px-8 py-3 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              {/* Founders Section */}
              <div className="flex flex-col gap-10 w-full">
                <h3 className="text-4xl font-black text-center tracking-tight text-animate-gradient">Meet Our Founders</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
                  {founders.length === 0 && (
                    <div className="col-span-full py-10 text-center text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                      No founders found. Check back soon!
                    </div>
                  )}
                  {founders.map((founder) => (
                    <TiltCard key={founder.id} className="h-full">
                      <div className="flex flex-col rounded-3xl overflow-hidden border border-border bg-card/40 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 pt-10 h-full group">
                        <div className="w-full flex justify-center mb-6">
                          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background overflow-hidden shadow-lg bg-muted flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                            {founder.cover_image ? (
                              <img src={founder.cover_image} alt={founder.name} className="w-full h-full object-cover object-top" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-primary/5 text-primary opacity-50">
                                <span className="text-5xl font-black">{founder.name?.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center text-center h-full">
                          <h4 className="text-3xl font-black mb-1 text-foreground">{founder.name}</h4>
                          <p className="text-xs font-black text-secondary uppercase tracking-widest mb-6 opacity-80">{founder.role}</p>
                          <p className="text-muted-foreground text-base flex-grow mb-8 leading-relaxed italic">
                            "{founder.bio}"
                          </p>
                          <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                            <button onClick={() => { setSelectedProfile(founder); setProfileType('founder'); }} className="col-span-2 w-full text-center bg-foreground text-background py-4 rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-primary hover:text-white transition-all shadow-md active:scale-[0.98]">View Profile</button>
                            <a href={founder.linkedin_url && founder.linkedin_url !== '#' ? founder.linkedin_url : ''} target="_blank" rel="noreferrer" className={`${founder.portfolio_url && founder.portfolio_url !== '#' ? 'col-span-1' : 'col-span-2'} w-full flex items-center justify-center bg-[#0A66C2]/10 text-[#0A66C2] py-4 rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-[#0A66C2] hover:text-white transition-all border border-[#0A66C2]/20`}>LinkedIn</a>
                            {founder.portfolio_url && founder.portfolio_url !== '#' && (
                              <a href={founder.portfolio_url} target="_blank" rel="noreferrer" className="col-span-1 w-full flex items-center justify-center bg-transparent border-2 border-border text-foreground py-4 rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-secondary hover:border-secondary hover:text-secondary-foreground transition-all">Portfolio</a>
                            )}
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              </div>

              {/* Faculty Section */}
              <div className="flex flex-col gap-10 w-full">
                <h3 className="text-4xl font-black text-center tracking-tight text-animate-gradient">Our Expert Faculties</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {faculties.length === 0 && (
                    <div className="col-span-full py-10 text-center text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                      No faculties found. Check back soon!
                    </div>
                  )}
                  {faculties.map((faculty) => (
                    <TiltCard key={faculty.id} className="h-full">
                      <div className="flex flex-col rounded-3xl overflow-hidden border border-border bg-card/40 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 pt-10 h-full group text-center">
                        <div className="w-full flex justify-center mb-6">
                          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-background overflow-hidden shadow-lg bg-muted flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                            {faculty.cover_image ? (
                              <img src={faculty.cover_image} alt={faculty.name} className="w-full h-full object-cover object-top" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-primary/5 text-primary opacity-50">
                                <span className="text-5xl font-black">{faculty.name?.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center text-center h-full">
                          <h4 className="text-2xl font-black mb-1 text-foreground">{faculty.name}</h4>
                          <p className="text-xs font-black text-primary uppercase tracking-widest mb-6 opacity-80">{faculty.topic}</p>
                          <p className="text-muted-foreground text-sm flex-grow mb-8 leading-relaxed italic">
                            "{faculty.description}"
                          </p>
                          <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                            <button onClick={() => { setSelectedProfile(faculty); setProfileType('faculty'); }} className="col-span-2 w-full text-center bg-foreground text-background py-4 rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-primary hover:text-white transition-all shadow-md active:scale-[0.98]">View Profile</button>
                            {faculty.link && faculty.link !== '#' && (
                              <a href={faculty.link} target="_blank" rel="noreferrer" className="col-span-2 w-full flex items-center justify-center bg-[#0A66C2]/10 text-[#0A66C2] py-4 rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-[#0A66C2] hover:text-white transition-all border border-[#0A66C2]/20">LinkedIn</a>
                            )}
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <ProfileModal
        profile={selectedProfile}
        type={profileType}
        onClose={() => { setSelectedProfile(null); setProfileType(null); }}
      />
    </div>
  );
};

export default Home;
