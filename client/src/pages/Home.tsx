import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "@/components/Scene";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Cpu, Trophy } from "lucide-react";
import { Link } from "wouter";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out",
        delay: 0.5
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const features = [
    {
      title: "Endure the Toughness",
      icon: <Cpu className="w-8 h-8 text-secondary" />,
      desc: "Resilience is key. We prepare you for the grind of the tech industry."
    },
    {
      title: "Work Hard & Smart",
      icon: <Terminal className="w-8 h-8 text-primary" />,
      desc: "Efficiency meets effort. Learn to optimize your workflow like a pro."
    },
    {
      title: "Conquer Challenges",
      icon: <Trophy className="w-8 h-8 text-accent" />,
      desc: "Victory belongs to the bold. Face complex problems head-on."
    }
  ];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <Scene />
          </Canvas>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <h1 
            ref={titleRef}
            className="text-6xl md:text-8xl lg:text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 mb-6 drop-shadow-2xl"
          >
            5EVEN
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <p className="text-xl md:text-2xl text-secondary font-mono mb-8 tracking-wider">
              WE BUILD, NOT TRAIN
            </p>
            <Link href="/services">
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-white font-display uppercase tracking-widest px-8 py-6 rounded-none clip-path-slant neon-border">
                Start Journey <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-current rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Welcome Section */}
      <section className="py-24 bg-background relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">
                Welcome to <span className="text-primary">The Future</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6 font-light">
                5EVEN is not just an institution; it's a forging ground for the next generation of tech leaders. 
                We combine academic rigor with the competitive spirit of esports to create a learning environment unlike any other.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed font-light">
                From Data Science to Full Stack Development, our curriculum is designed to push your boundaries and unlock your true potential.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-20 blur-2xl rounded-xl" />
              {/* Unsplash abstract tech image */}
              <img 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070" 
                alt="Cyberpunk workspace" 
                className="relative rounded-xl border border-white/10 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-32 bg-black/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-white mb-4">Three Pillars of Academia</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-white/5 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-2"
              >
                <div className="mb-6 p-4 bg-white/5 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display font-bold mb-3 text-white group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      </section>
    </div>
  );
}
