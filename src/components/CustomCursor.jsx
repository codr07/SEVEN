import React, { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    setCtx(context);

    // Initialize lastPos to current mouse position to avoid drawing a line from 0,0 on first move
    const handleFirstMove = (e) => {
      lastPos.current = { x: e.clientX, y: e.clientY };
      window.removeEventListener('mousemove', handleFirstMove);
    };
    window.addEventListener('mousemove', handleFirstMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleFirstMove);
    };
  }, []);

  useEffect(() => {
    if (!ctx) return;

    const getMousePos = (e) => {
      return { x: e.clientX, y: e.clientY };
    };

    const isInteractiveElement = (target) => {
      // Strictly links, buttons, and form inputs. No card wrappers or group effects.
      return target.closest('a, button, input, select, textarea, [role="button"], .view-profile-btn');
    };

    const handleMouseMove = (e) => {
      const isOverInteractive = isInteractiveElement(e.target);
      setIsHovering(!!isOverInteractive);

      const currentPos = getMousePos(e);

      // Continuous drawing on mouse move (if not over a link/button)
      if (!isOverInteractive) {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#E05D5D'; 
        
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
      }

      lastPos.current = currentPos;
    };

    // Constant fade out of canvas
    const fadeCanvas = setInterval(() => {
      if (!ctx || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const originalComposite = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'; // Slightly faster fade
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = originalComposite;
    }, 50);

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(fadeCanvas);
    };
  }, [ctx]);

  // Clean, sleek pencil icon mapping pointing to bottom left tip (0, 24 geometry roughly)
  const pencilSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${isHovering ? '#E05D5D' : '#fff'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="${isHovering ? '#000' : '#000'}"/>
    </svg>
  `);

  return (
    <>
      <style>
        {`
          * {
            cursor: url("data:image/svg+xml;utf8,${pencilSvg}") 2 22, auto !important;
          }
          a, button, [role="button"], input, select, textarea, .view-profile-btn, a * {
            cursor: pointer !important;
          }
          /* Ensure cards themselves do NOT force a pointer cursor */
          .hover-glow, .group, .bg-card, .rounded-3xl, .rounded-4xl {
            cursor: url("data:image/svg+xml;utf8,${pencilSvg}") 2 22, auto !important;
          }
          /* Fix Lenis overlay hijacking pointer states */
          .lenis {
            cursor: inherit;
          }
        `}
      </style>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{ width: '100vw', height: '100vh', opacity: isHovering ? 0.2 : 0.7 }}
      />
    </>
  );
};

export default CustomCursor;
