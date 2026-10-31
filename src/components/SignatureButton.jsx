import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const SignatureButton = ({ 
  label = "View", 
  onClick, 
  className = "", 
  size = "w-16 h-16",
  iconSize = 20,
  labelSize = "text-[7px]",
  translateY = "translate-y-4"
}) => {
  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ 
        scale: 1.1,
        rotate: 90,
        borderColor: "rgba(254, 240, 138, 0.9)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`${size} bg-gradient-to-br from-[#12131a] via-[#050507] to-[#1a1813] border border-[#d4af37]/50 rounded-[14px] flex flex-col items-center justify-center text-[#fcf6ba] shadow-[0_8px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(212,175,55,0.25)] cursor-pointer group/btn relative overflow-hidden ${className}`}
    >
      {/* Intense Inner Royal Gold Glow */}
      <div className="absolute inset-0 bg-[#d4af37]/15 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Outer Pulse Glow (Imperial Gold) */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37] via-[#f5d061] to-[#aa7c11] rounded-inherit blur-md opacity-30 group-hover:opacity-75 transition-opacity" />

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-30 pointer-events-none" />
      
      <ArrowRight size={iconSize} className="relative z-10 text-[#fcf6ba] drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
      <span className={`absolute ${labelSize} font-mono font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity ${translateY} z-10 text-[#fcf6ba] drop-shadow-md`}>
        {label}
      </span>
    </motion.div>
  );
};

export default SignatureButton;
