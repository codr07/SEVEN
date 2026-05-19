import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

const GlassSearch = ({ placeholder = 'Search...', value, onChange, suggestions = [], className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!value) {
      setFilteredSuggestions([]);
      return;
    }
    const filtered = suggestions.filter(item =>
      String(item || '').toLowerCase().includes(value.toLowerCase()) &&
      String(item || '').toLowerCase() !== value.toLowerCase()
    );
    setFilteredSuggestions(filtered.slice(0, 8)); // limit suggestions for performance and UI layout
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
        e.preventDefault();
        selectSuggestion(filteredSuggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const selectSuggestion = (val) => {
    onChange(val);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full pl-14 pr-12 py-4 bg-white/5 border border-white/10 rounded-[24px] outline-none focus:border-primary/50 transition-all text-sm backdrop-blur-xl shadow-2xl relative z-10"
      />
      {value && (
        <button
          onClick={() => selectSuggestion('')}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors z-20"
        >
          <X size={16} />
        </button>
      )}

      <AnimatePresence>
        {isOpen && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 right-0 top-full mt-4 bg-black/60 border border-white/10 backdrop-blur-[30px] rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-3 z-[60] overflow-hidden"
          >
            <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest px-4 py-2 border-b border-white/5">
              Protocol Suggestions
            </div>
            <div className="flex flex-col gap-1 mt-2 max-h-60 overflow-y-auto custom-scrollbar">
              {filteredSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-between ${
                    activeIndex === idx
                      ? 'bg-accent text-white shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]'
                      : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                >
                  <span>{suggestion}</span>
                  <span className="text-[7px] opacity-40">SELECT</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlassSearch;
