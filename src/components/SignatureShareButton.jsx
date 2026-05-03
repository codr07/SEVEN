import React from 'react';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';

const SignatureShareButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`p-3 bg-white/5 backdrop-blur-md rounded-[12px] border border-white/5 transition-all text-primary hover:bg-white/10 group/share relative ${className}`}
    >
      <motion.div
        whileHover={{ scale: 1.2, rotate: -15 }}
        whileTap={{ scale: 0.9 }}
        className="relative z-10"
      >
        <Share2 size={16} className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" />
      </motion.div>
    </button>
  );
};

export default SignatureShareButton;
