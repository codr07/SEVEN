import React from 'react';
import { motion } from 'framer-motion';

const VisionaryCard = ({
  name,
  role,
  bio,
  image,
  manifestoId = "5EVEN-VZN-001",
  onClick,
  fill = "rgba(255, 255, 255, 0.03)",
  accentColor = "var(--primary)"
}) => {
  return (
    <div className="w-full max-w-[1090px] mx-auto group py-8 md:py-32 px-4 md:px-8 flex justify-center items-center overflow-visible">
      
      {/* ========================================================= */}
      {/* MOBILE VIEW (< md) - Compact, Legible, Stacked            */}
      {/* ========================================================= */}
      <div className="flex md:hidden flex-col w-full rounded-[2rem] border border-white/10 bg-card/80 backdrop-blur-xl overflow-hidden relative shadow-2xl">
        {/* Image Section */}
        <div className="relative w-full h-72 overflow-hidden bg-black/50">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          {/* ID Badge */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),1)]" />
            <span className="text-[10px] font-mono text-white/90 font-black tracking-widest">{manifestoId}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 relative z-10 flex flex-col gap-5 -mt-20">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm drop-shadow-md">
              Strategic Command
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-lg">
              {role}
            </h3>
          </div>

          <div className="flex flex-col">
            <h4 
              className="font-black italic uppercase tracking-tighter text-white drop-shadow-xl leading-[1.1] break-words"
              style={{ fontSize: name.length > 16 ? '1.5rem' : (name.length > 12 ? '1.8rem' : '2.25rem') }}
            >
              {name}
            </h4>
            <div className="w-16 h-1 bg-primary mt-3 rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)]" />
          </div>

          <p className="text-sm text-muted-foreground font-medium leading-relaxed italic line-clamp-4">
            "{bio}"
          </p>

          <button 
            onClick={onClick}
            className="mt-2 w-full py-4 rounded-xl bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 text-white text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),1)]" />
            Read Archived Journey
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP/TABLET VIEW (>= md) - The Architectural Canvas    */}
      {/* ========================================================= */}
      <div
        className="hidden md:block relative shrink-0 scale-[0.65] lg:scale-[0.8] xl:scale-100 origin-center transition-all duration-700 cursor-pointer"
        style={{ width: 1090, height: 490 }}
        onClick={onClick}
      >
        {/* Shape 1 - Main Body */}
        <div
          className="absolute left-[190px] top-[90px] w-[650px] h-[320px] rounded-[0px_32px_32px_0px] border border-white/10 backdrop-blur-3xl transition-all duration-500 group-hover:bg-white/5 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]"
          style={{ backgroundColor: fill }}
        />

        {/* Shape 2 - Top Left (ID) */}
        <div
          className="absolute left-0 top-0 w-[190px] h-[150px] rounded-[42px_42px_0px_42px] border border-white/10 backdrop-blur-3xl transition-all duration-500 group-hover:bg-white/5 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]"
          style={{ backgroundColor: fill }}
        />

        {/* Shape 3 - Right Tab (Role) */}
        <div
          className="absolute left-[840px] top-[300px] w-[250px] h-[80px] rounded-[0px_7px_7px_0px] border border-white/10 backdrop-blur-3xl transition-all duration-500 group-hover:bg-white/5 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]"
          style={{ backgroundColor: fill }}
        />

        {/* Shape 4 - Bottom Left (Read Journey) */}
        <div
          className="absolute left-[40px] top-[340px] w-[150px] h-[150px] rounded-[80px_0px_80px_80px] border border-white/10 backdrop-blur-3xl transition-all duration-500 group-hover:bg-white/5 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]"
          style={{ backgroundColor: fill }}
        />

        {/* Bridges (Provided SVGs) */}
        <svg className="absolute left-[158px] top-[150px] w-8 h-8 pointer-events-none" viewBox="-32 -32 32 32">
          <path d="M 0 0 C 0 -23.872 -5.76 -32 -32 -32 H 0 Z" fill={fill} />
          <path d="M 0 0 C 0 -23.872 -5.76 -32 -32 -32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="group-hover:stroke-primary/50 transition-all" />
        </svg>

        <svg className="absolute left-[840px] top-[293px] w-[7px] h-[7px] pointer-events-none" viewBox="0 0 7 7">
          <path d="M 0 0 C 0 5.2219999999999995 1.26 7 7 7 H 0 Z" fill={fill} />
          <path d="M 0 0 C 0 5.2219999999999995 1.26 7 7 7" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" className="group-hover:stroke-primary/50 transition-all" />
        </svg>

        <svg className="absolute left-[840px] top-[380px] w-[7px] h-[7px] pointer-events-none" viewBox="0 -7 7 7">
          <path d="M 0 0 C 0 -5.2219999999999995 1.26 -7 7 -7 H 0 Z" fill={fill} />
          <path d="M 0 0 C 0 -5.2219999999999995 1.26 -7 7 -7" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" className="group-hover:stroke-primary/50 transition-all" />
        </svg>

        <svg className="absolute left-[158px] top-[308px] w-8 h-8 pointer-events-none" viewBox="-32 0 32 32">
          <path d="M 0 0 C 0 23.872 -5.76 32 -32 32 H 0 Z" fill={fill} />
          <path d="M 0 0 C 0 23.872 -5.76 32 -32 32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="group-hover:stroke-primary/50 transition-all" />
        </svg>

        <svg className="absolute left-[190px] top-[58px] w-8 h-8 pointer-events-none" viewBox="0 0 32 32">
          <path d="M 0 0 C 0 23.872 5.76 32 32 32 H 0 Z" fill={fill} />
          <path d="M 0 0 C 0 23.872 5.76 32 32 32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="group-hover:stroke-primary/50 transition-all" />
        </svg>

        <svg className="absolute left-[190px] top-[410px] w-8 h-8 pointer-events-none" viewBox="0 -32 32 32">
          <path d="M 0 0 C 0 -23.872 5.76 -32 32 -32 H 0 Z" fill={fill} />
          <path d="M 0 0 C 0 -23.872 5.76 -32 32 -32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="group-hover:stroke-primary/50 transition-all" />
        </svg>

        {/* Glow Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[190px] top-[90px] w-[650px] h-[320px] rounded-[0px_32px_32px_0px] shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)] group-hover:shadow-[0_0_120px_rgba(var(--primary-rgb),0.3)] transition-all duration-700" />
          <div className="absolute left-0 top-0 w-[190px] h-[150px] rounded-[42px_42px_0px_42px] group-hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)] transition-all duration-700" />
        </div>

        {/* CONTENT MAPPING */}

        {/* 1. ID Section (Top Left) */}
        <div className="absolute left-0 top-0 w-[190px] h-[150px] z-30 flex flex-col items-center justify-center p-6">
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-primary mb-1 opacity-40">Classification</span>
          <span className="text-2xl font-black text-white tracking-tighter font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{manifestoId}</span>
          <div className="w-8 h-[2px] bg-primary/20 mt-4 rounded-full" />
        </div>

        {/* 2. Read Journey (Bottom Left - Animated) */}
        <div
          className="absolute left-[40px] top-[340px] w-[150px] h-[150px] z-30 flex items-center justify-center cursor-pointer overflow-hidden group/btn"
          onClick={onClick}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="relative w-[140px] h-[140px]"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                id="textPath"
                d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
                fill="none"
              />
              <text className="text-[10px] font-black uppercase tracking-[0.3em] fill-white group-hover/btn:fill-primary transition-colors">
                <textPath href="#textPath">
                  READ ARCHIVED • READ ARCHIVED • READ ARCHIVED •
                </textPath>
              </text>
            </svg>
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center group-hover/btn:scale-110 group-hover/btn:bg-primary group-hover/btn:border-white transition-all duration-500 shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)]">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_10px_#fff]" />
            </div>
          </div>
        </div>

        {/* 3. Role (Right Tab) */}
        <div className="absolute left-[840px] top-[300px] w-[250px] h-[80px] z-30 flex items-center justify-center px-8">
          <div className="flex flex-col items-end w-full max-w-[210px]">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 shadow-sm">Strategic Command</span>
            <span
              className="text-xl font-black uppercase tracking-tight text-white leading-tight text-right break-words w-full"
              style={{ textShadow: '0 0 20px rgba(var(--primary-rgb), 0.8)' }}
            >
              {role}
            </span>
          </div>
        </div>

        {/* 4. Main Body Content (Name & Bio) */}
        <div className="absolute left-[240px] top-[90px] w-[420px] h-[320px] z-30 flex flex-col justify-center py-8">
          <div className="flex flex-col mb-4">
            <motion.h4
              className="font-black italic uppercase tracking-tighter text-animate-gradient leading-[1.1] break-words"
              style={{ fontSize: name.length > 18 ? '2.2rem' : (name.length > 12 ? '2.8rem' : '3.8rem') }}
            >
              {name}
            </motion.h4>
            <div className="w-20 h-1 bg-primary mt-4 rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)]" />
          </div>
          <p className="text-sm md:text-lg text-muted-foreground font-medium leading-relaxed italic line-clamp-4 pr-6 opacity-90">
            "{bio}"
          </p>
        </div>

        {/* 5. Image Section (Integrated in Main Body) */}
        <div className="absolute left-[640px] top-0 w-[420px] h-[450px] z-20 pointer-events-none group-hover:scale-[1.05] transition-transform duration-1000">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 rounded-[0_80px_0_80px] overflow-hidden border border-white/10">
              <img src={image} alt={name} className="w-full h-full object-cover grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
            {/* Decorative Glow */}
            <div className="absolute -inset-20 bg-primary/30 blur-[120px] opacity-0 group-hover:opacity-50 transition-opacity duration-1000" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default VisionaryCard;
