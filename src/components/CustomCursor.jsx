import React, { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const canvasRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const pointsRef = useRef([]);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const loopRunningRef = useRef(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Enable only on hover-capable devices (skip touch-only screens/phones)
    const hasHover = window.matchMedia('(hover: hover)').matches;
    setIsEnabled(hasHover);
    if (!hasHover) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use lightweight mouseover boundaries instead of running closest() on every mousemove pixel
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      const isOverInteractive = !!target.closest('a, button, input, select, textarea, [role="button"], .view-profile-btn');
      setIsHovering(isOverInteractive);
    };
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    const handleFirstMove = (e) => {
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      window.removeEventListener('mousemove', handleFirstMove);
    };
    window.addEventListener('mousemove', handleFirstMove, { passive: true });

    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      
      pointsRef.current.push({
        x,
        y,
        prevX: lastMousePosRef.current.x,
        prevY: lastMousePosRef.current.y,
        life: 1.0
      });

      lastMousePosRef.current = { x, y };

      if (!loopRunningRef.current) {
        loopRunningRef.current = true;
        requestAnimationFrame(renderLoop);
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // requestAnimationFrame rendering loop - stops running when mouse is still
    const renderLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas || !ctx) {
        loopRunningRef.current = false;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const points = pointsRef.current;
      
      if (points.length > 0) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.5;

        for (let i = 0; i < points.length; i++) {
          const pt = points[i];
          ctx.strokeStyle = `rgba(224, 93, 93, ${pt.life})`;
          ctx.beginPath();
          ctx.moveTo(pt.prevX, pt.prevY);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();

          // Slowly fade out
          pt.life -= 0.08;
        }

        pointsRef.current = points.filter(p => p.life > 0);
        
        requestAnimationFrame(renderLoop);
      } else {
        // Sleep when no active segments are left
        loopRunningRef.current = false;
      }
    };

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousemove', handleFirstMove);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!isEnabled) return null;

  const pencilSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="#000"/>
    </svg>
  `);

  const pointerSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#E05D5D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="16" cy="16" r="12" fill="rgba(224,93,93,0.1)"/>
      <circle cx="16" cy="16" r="4" fill="#E05D5D"/>
      <path d="M16 2v4 M16 26v4 M2 16h4 M26 16h4"/>
    </svg>
  `);

  return (
    <>
      <style>
        {`
          body {
            cursor: url("data:image/svg+xml;utf8,${pencilSvg}") 2 22, auto;
          }
          a, button, [role="button"], input, select, textarea, .view-profile-btn, a * {
            cursor: url("data:image/svg+xml;utf8,${pointerSvg}") 16 16, pointer !important;
          }
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
