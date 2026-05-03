import React from 'react';
import { motion } from 'framer-motion';

const GlowingBlob = ({ color, className, delay = 0 }) => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 0.5, 0.3],
        x: [0, 50, 0],
        y: [0, 30, 0]
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className={`absolute rounded-full blur-[120px] pointer-events-none z-0 ${className}`}
      style={{ backgroundColor: color, position: 'absolute' }}
    />
);

const GlobalBackground = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-background" 
      style={{ position: 'fixed' }}
    >
      <GlowingBlob color="hsl(var(--primary))" className="top-[-10%] left-[-10%] w-[60%] h-[60%]" />
      <GlowingBlob color="hsl(var(--secondary))" className="bottom-[-10%] right-[-10%] w-[60%] h-[60%]" delay={2} />
      <GlowingBlob color="hsl(var(--accent))" className="top-[30%] right-[10%] w-[50%] h-[50%]" delay={4} />
      
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      
      {/* Robust Noise/Grain Texture (SVG Data URL) */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
};

export default GlobalBackground;
