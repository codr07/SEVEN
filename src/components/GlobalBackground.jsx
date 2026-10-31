import React from 'react';

const GlobalBackground = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden"
      style={{ backgroundColor: '#050507', position: 'fixed' }}
    >
      {/* Royal Gold Atmospheric Luminescence (Optimized static GPU layers) */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full blur-[140px] pointer-events-none"
        style={{ backgroundColor: 'rgba(212, 175, 55, 0.12)', willChange: 'transform' }}
      />
      <div 
        className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[150px] pointer-events-none"
        style={{ backgroundColor: 'rgba(245, 208, 97, 0.08)', willChange: 'transform' }}
      />
      <div 
        className="absolute bottom-[-15%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[160px] pointer-events-none"
        style={{ backgroundColor: 'rgba(170, 124, 17, 0.1)', willChange: 'transform' }}
      />
      
      {/* Specular Refraction Grain Texture */}
      <div 
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* Royal Subtle Gold Grid */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.15) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
    </div>
  );
};

export default GlobalBackground;
