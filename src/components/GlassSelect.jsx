import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

/**
 * A premium "Liquid Glass" select component.
 * @param {Object} props
 * @param {any} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {Array<{value: any, label: string}>|string[]} props.options - List of options
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional classes for the container
 * @param {boolean} props.disabled - Whether the select is disabled
 */
const GlassSelect = ({ value, onChange, options = [], placeholder = "Select...", className = "", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getOptionValue = (opt) => (opt && typeof opt === 'object' ? opt.value : opt);
  const getOptionLabel = (opt) => (opt && typeof opt === 'object' ? opt.label : opt);

  // Flatten options for finding selected label
  const allOptions = options.reduce((acc, opt) => {
    if (opt && typeof opt === 'object' && opt.options) {
      return [...acc, ...opt.options];
    }
    return [...acc, opt];
  }, []);

  const selectedOption = allOptions.find(opt => getOptionValue(opt) === value);
  const displayLabel = selectedOption ? getOptionLabel(selectedOption) : placeholder;

  const renderOption = (opt, idx) => {
    const val = getOptionValue(opt);
    const label = getOptionLabel(opt);
    const isSelected = val === value;

    return (
      <motion.div
        key={idx}
        whileHover={{ x: 5, backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
        onClick={() => {
          onChange(val);
          setIsOpen(false);
        }}
        className={`
          px-6 py-4 text-sm font-bold cursor-pointer transition-all border-b border-white/5 last:border-0 flex items-center justify-between
          ${isSelected ? 'bg-primary/20 text-primary' : 'text-white/70 hover:text-white'}
        `}
      >
        <span>{label}</span>
        {isSelected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check size={16} className="text-primary" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-5 py-3.5 rounded-2xl border transition-all duration-500 flex items-center justify-between cursor-pointer font-bold text-sm
          ${disabled ? 'opacity-50 cursor-not-allowed border-white/5 bg-white/5' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30'}
          ${isOpen ? 'border-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]' : 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.2)]'}
          backdrop-blur-2xl
        `}
      >
        <span className={`${!value && !selectedOption ? "text-white/30" : "text-white"}`}>{displayLabel}</span>
        <ChevronDown
          size={18}
          className={`text-white/40 transition-transform duration-500 ${isOpen ? 'rotate-180 text-primary' : ''}`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute z-[100] top-full left-0 right-0 mt-3 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden max-h-80 overflow-y-auto custom-scrollbar"
          >
            {options.map((opt, idx) => {
              if (opt && typeof opt === 'object' && opt.options) {
                return (
                  <div key={idx}>
                    <div className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 bg-white/5 border-b border-white/5">
                      {opt.label}
                    </div>
                    {opt.options.map((subOpt, subIdx) => renderOption(subOpt, `${idx}-${subIdx}`))}
                  </div>
                );
              }
              return renderOption(opt, idx);
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlassSelect;
