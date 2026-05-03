import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const SignatureButton = ({ 
  label = "View", 
  onClick, 
  className = "", 
  size = "w-16 h-16",
  iconSize = 20,
  labelSize = "text-[6px]",
  translateY = "translate-y-4"
}) => {
  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ 
        scale: 1.15,
        rotate: 90,
        borderRadius: "50%",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 12 }}
      className={`${size} bg-gradient-to-br from-[#7C3AED] via-[#C026D3] to-[#7C3AED] bg-[length:200%_200%] animate-gradient rounded-[16px] flex flex-col items-center justify-center text-white shadow-[0_10px_30px_rgba(124,58,237,0.5)] cursor-pointer group/btn relative overflow-hidden ${className}`}
    >
      {/* Intense Inner Glow */}
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Outer Pulse Glow (Deep Purple) */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#7C3AED] to-[#DB2777] rounded-inherit blur-md opacity-40 group-hover:opacity-80 transition-opacity animate-pulse" />

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-40" />
      
      <ArrowRight size={iconSize} className="relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
      <span className={`absolute ${labelSize} font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity ${translateY} z-10 text-white drop-shadow-md`}>
        {label}
      </span>
    </motion.div>
  );
};

export default SignatureButton;
