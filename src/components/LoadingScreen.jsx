import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useTheme } from '../context/ThemeContext';
import logoLight from '../assets/seven.svg';
import logoDark from '../assets/seven_dark.svg';

const LoadingScreen = ({ onLoadingComplete }) => {
  const { theme } = useTheme();

  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          y: "-100%",
          duration: 0.5,
          ease: "expo.inOut",
          onComplete: onLoadingComplete,
        });
      },
    });

    tl.fromTo(
      logoRef.current,
      { scale: 0, opacity: 0, rotate: -45 },
      { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
    )
    .fromTo(
      textRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
      "-=0.2"
    )
    .to(logoRef.current, {
      scale: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut",
    });

    // Fallback timer
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 1500);

    return () => {
      tl.kill();
      clearTimeout(timer);
    };
  }, [onLoadingComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background"
    >
      <div
        ref={logoRef}
        className="mb-12 flex items-center justify-center p-4 drop-shadow-2xl"
      >
        <img 
          src={theme === 'dark' ? logoDark : logoLight} 
          alt="5EVEN Logo" 
          className="w-40 h-auto object-contain" 
        />
      </div>
      <div ref={textRef} className="text-center">
        <h1 className="text-3xl font-bold tracking-widest uppercase mb-2">5EVEN Institution</h1>
        <div className="w-48 h-1 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-progress" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
