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
    style={{ backgroundColor: color }}
  />
);

const GlobalBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-background">
      <GlowingBlob color="hsl(var(--primary))" className="top-[-10%] left-[-10%] w-[60%] h-[60%]" />
      <GlowingBlob color="hsl(var(--secondary))" className="bottom-[-10%] right-[-10%] w-[60%] h-[60%]" delay={2} />
      <GlowingBlob color="hsl(var(--accent))" className="top-[30%] right-[10%] w-[50%] h-[50%]" delay={4} />
      
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      
      {/* Subtle Noise/Grain */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>
  );
};

export default GlobalBackground;
