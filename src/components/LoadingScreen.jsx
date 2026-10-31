import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import logoGold from '../assets/seven-gold.svg';

const LoadingScreen = ({ onLoadingComplete }) => {
  const containerRef = useRef(null);
  const logoWrapperRef = useRef(null);
  const ringRef = useRef(null);
  const textRef = useRef(null);
  const barRef = useRef(null);
  const subtextRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 1.04,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            if (onLoadingComplete) onLoadingComplete();
          },
        });
      },
    });

    // 1. Initial State
    gsap.set(logoWrapperRef.current, { scale: 0.82, opacity: 0 });
    gsap.set(ringRef.current, { scale: 0.7, opacity: 0, rotation: -90 });
    gsap.set(textRef.current, { y: 25, opacity: 0 });
    gsap.set(subtextRef.current, { y: 15, opacity: 0 });
    gsap.set(barRef.current, { scaleX: 0, transformOrigin: 'left center' });

    // 2. Entrance Choreography
    tl.to(ringRef.current, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.8,
      ease: 'expo.out'
    })
    .to(logoWrapperRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: 'back.out(1.4)'
    }, '-=0.5')
    .to(textRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5
    }, '-=0.3')
    .to(subtextRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.4
    }, '-=0.3')
    .to(barRef.current, {
      scaleX: 1,
      duration: 0.9,
      ease: 'power2.inOut'
    }, '-=0.2')
    .to(logoWrapperRef.current, {
      scale: 1.05,
      filter: 'drop-shadow(0 0 35px rgba(245, 208, 97, 0.65))',
      duration: 0.35,
      yoyo: true,
      repeat: 1,
      ease: 'sine.inOut'
    }, '-=0.2');

    // Safe fallback timeout (never block longer than 2.2s)
    const safetyTimer = setTimeout(() => {
      if (onLoadingComplete) onLoadingComplete();
    }, 2200);

    return () => {
      tl.kill();
      clearTimeout(safetyTimer);
    };
  }, [onLoadingComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#050507] overflow-hidden select-none"
    >
      {/* Background Ambient Radiance */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[650px] max-h-[650px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18)_0%,rgba(135,92,28,0.06)_45%,transparent_70%)] blur-[90px]" />
      </div>

      {/* Atmospheric Star Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Central Brand Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6">
        
        {/* Orbital Gold Rings & SVG Emblem Container */}
        <div className="relative flex items-center justify-center mb-10 w-44 h-44 sm:w-56 sm:h-56">
          
          {/* Outer Rotating Geometric Compass Ring */}
          <div
            ref={ringRef}
            className="absolute inset-0 rounded-full border border-[#d4af37]/35 flex items-center justify-center pointer-events-none"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#fcf6ba] shadow-[0_0_12px_#fcf6ba]" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#d4af37]" />
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-[#aa7c11]" />
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-[#aa7c11]" />
            <div className="w-full h-full rounded-full border border-dashed border-[#f5d061]/20 animate-spin" style={{ animationDuration: '24s' }} />
          </div>

          {/* Inner Golden Glow Halo */}
          <div className="absolute inset-4 rounded-full bg-[#d4af37]/10 blur-xl pointer-events-none" />

          {/* Full Screen View SVG Logo (Enhanced Imperial Gold) */}
          <div
            ref={logoWrapperRef}
            className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center filter drop-shadow-[0_12px_28px_rgba(212,175,55,0.4)]"
          >
            <img 
              src={logoGold} 
              alt="5EVEN Imperial Emblem" 
              className="w-full h-full object-contain pointer-events-none" 
            />
          </div>
        </div>

        {/* Brand Text Cluster */}
        <div ref={textRef} className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-6 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-[#d4af37]">
              Imperial Authority
            </span>
            <span className="w-6 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-[#fcf6ba]">
            <span className="font-mono text-[#d4af37] font-black">5EVEN</span> INSTITUTION
          </h1>
        </div>

        {/* Minimal High-Precision Gold Loading Bar */}
        <div className="w-56 sm:w-64 h-[2px] bg-white/10 rounded-full overflow-hidden relative mb-4">
          <div
            ref={barRef}
            className="absolute inset-0 bg-gradient-to-r from-[#aa7c11] via-[#d4af37] to-[#fcf6ba] shadow-[0_0_10px_#fcf6ba]"
          />
        </div>

        {/* System Node Telemetry */}
        <div ref={subtextRef} className="flex items-center gap-3 text-[9px] font-mono tracking-widest text-[#a1a1aa] uppercase">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-ping" />
          <span>INITIALIZING SECURE CORE</span>
        </div>

      </div>

      {/* Decorative Bottom Corner Watermark */}
      <div className="absolute bottom-6 text-center text-[8px] font-mono text-[#d4af37]/40 uppercase tracking-[0.3em]">
        ARCHITECTURAL PROTOCOL • v1.1.0 • ZERO LATENCY
      </div>
    </div>
  );
};

export default LoadingScreen;
