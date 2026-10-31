import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    title: 'Beyond the Limits of Computation.',
    subtitle:
      'From mathematical complexity and computer vision to supercomputing, quantum physics, and enterprise IT solutions — we engineer ideas, explore computational frontiers, and transform complex challenges into technological possibilities.',
    image: '/assets/images/hero content/hero slide images/slide 1.png',
    primaryCta: { text: 'Explore Capabilities', link: '/services' },
    secondaryCta: { text: 'Discover IT Services', link: '/services' },
    badge: 'Computational Engineering & IT',
  },
  {
    id: 2,
    title: 'Building Minds. Shaping Generations.',
    subtitle:
      'Education is the foundation upon which societies evolve. At 5EVEN, we provide structured academic support, conceptual clarity, and intellectual guidance to learners from school education to higher studies — nurturing curiosity, confidence, and lifelong learning.',
    image: '/assets/images/hero content/hero slide images/slide 2.png',
    primaryCta: { text: 'Academic Programs', link: '/academics' },
    secondaryCta: { text: 'Begin Learning', link: '/courses' },
    badge: 'Academic Ecosystem',
  },
  {
    id: 3,
    title: 'For Minds That Question Everything.',
    subtitle:
      'We believe every profound discovery begins with a question. Through independent research, academic publications, interdisciplinary exploration, and critical inquiry, 5EVEN cultivates thoughtful minds committed to challenging assumptions and expanding the boundaries of human understanding.',
    image: '/assets/images/hero content/hero slide images/slide 3.png',
    primaryCta: { text: 'Explore Research', link: '/academics' },
    secondaryCta: { text: 'Read Publications', link: '/notes' },
    badge: 'Research & Publications',
  },
  {
    id: 4,
    pretitle: 'For Those Who Invest in Understanding.',
    title: 'Coffee with C',
    subtitle:
      'An exercise in precision, logic, and the art of programming. Fifteen carefully composed chapters, designed to make every page count.',
    image: '/assets/images/hero content/hero slide images/book cover.png',
    primaryCta: { text: 'Prebook', link: '/notes' },
    secondaryCta: { text: 'Unload Writings', link: '/contact' },
    badge: 'Publication Spotlight',
    isBookSpotlight: true,
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full h-screen min-h-screen flex flex-col justify-between overflow-hidden pt-24 pb-10 md:pt-28 md:pb-14 px-4 sm:px-8 lg:px-16 select-none">
      {/* Background Video Layer with Dark Royal Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-35 scale-105 filter contrast-125 brightness-90"
          style={{ willChange: "transform" }}
        >
          <source
            src="/assets/images/hero content/hero bg/gemini_generated_video_d000ef8e.mp4"
            type="video/mp4"
          />
        </video>
        {/* Royal Vignette & Liquid Gradient */}
        <div className="absolute inset-0 bg-radial-vignette" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/85 via-transparent to-[#050507]" />
      </div>

      {/* Floating Royal Header Pill: [ 5EVEN ] */}
      <div className="relative z-10 w-full flex justify-center mt-1">
        <div className="liquid-glass px-6 py-2 rounded-full inline-flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.25em] text-[#d4af37] shadow-[0_10px_35px_rgba(0,0,0,0.9)] border border-[rgba(212,175,55,0.45)]">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_12px_#d4af37]" />
          <span className="font-bold text-[#fcf6ba] tracking-widest">5EVEN</span>
          <span className="text-[#d4af37]/40">|</span>
          <span className="text-[#f3e5ab]/80 font-medium tracking-wider text-[11px] hidden sm:inline">
            {slide.badge}
          </span>
        </div>
      </div>

      {/* Main Full-Screen Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col justify-center my-auto">
        <AnimatePresence mode="wait">
          <div key={slide.id} className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              {/* Left Part: Title & Subtitle */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="lg:col-span-7 flex flex-col justify-center text-left"
              >
                {slide.pretitle && (
                  <span className="text-xs md:text-sm font-mono tracking-[0.25em] uppercase text-[#d4af37] mb-3 inline-block">
                    {slide.pretitle}
                  </span>
                )}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-heading font-normal tracking-tight text-[#fbf5e6] leading-[1.05] mb-5 md:mb-6">
                  {slide.title}
                </h1>
                <p className="font-serif-body text-base sm:text-lg md:text-xl text-[#bba782] font-light leading-relaxed max-w-2xl">
                  {slide.subtitle}
                </p>
              </motion.div>

              {/* Right Part: Royal Liquid Glass Graphic Container */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="lg:col-span-5 flex justify-center items-center"
              >
                <div className="relative group w-full max-w-md">
                  {/* Royal Gold Halo behind frame */}
                  <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-tr from-[#d4af37]/35 via-[#f5d061]/20 to-[#aa7c11]/30 blur-2xl opacity-60 pointer-events-none" />

                  {/* Refractive Royal Glass Card */}
                  <div className="liquid-glass-card rounded-[28px] p-6 sm:p-8 overflow-hidden flex items-center justify-center min-h-[280px] sm:min-h-[360px] relative border border-[rgba(212,175,55,0.4)] shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className={`w-full h-auto object-contain max-h-[280px] sm:max-h-[350px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] transition-transform duration-700 hover:scale-105 ${
                        slide.isBookSpotlight ? 'rotate-[-2deg]' : ''
                      }`}
                      loading="eager"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </AnimatePresence>
      </div>

      {/* Pinned Bottom CTA Action Bar */}
      <div className="relative z-10 w-full max-w-7xl mx-auto pt-5 border-t border-[rgba(212,175,55,0.25)] flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <Link
            to={slide.primaryCta.link}
            className="liquid-btn-primary group w-full sm:w-auto px-8 py-3.5 rounded-full inline-flex items-center justify-center gap-2.5 text-xs text-[#fcf6ba]"
          >
            <span className="relative z-10">{slide.primaryCta.text}</span>
            <ArrowRight
              size={15}
              className="relative z-10 group-hover:translate-x-1.5 transition-transform text-[#fcf6ba]"
            />
          </Link>

          <Link
            to={slide.secondaryCta.link}
            className="liquid-btn-secondary w-full sm:w-auto px-8 py-3.5 rounded-full inline-flex items-center justify-center text-xs text-[#f3e5ab]"
          >
            <span>{slide.secondaryCta.text}</span>
          </Link>
        </div>

        {/* Minimal Royal Gold Progress Bar */}
        <div className="w-full sm:w-48 h-1 bg-[rgba(212,175,55,0.15)] rounded-full overflow-hidden border border-[rgba(212,175,55,0.25)]">
          <motion.div
            key={slide.id}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 8, ease: "linear" }}
            className="h-full bg-gradient-to-r from-[#aa7c11] via-[#d4af37] to-[#fcf6ba]"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
