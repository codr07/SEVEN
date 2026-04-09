import React, { useEffect, useRef, useState } from 'react';

const DrawingCursor = () => {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

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

    // Color of the ink - using the primary purple logic from SEVEN theme or just a sleek black
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (!ctx) return;

    const getMousePos = (e) => {
      return { x: e.clientX, y: e.clientY };
    };

    const isInteractiveElement = (target) => {
      // Check if clicking inside a link, button, input, or any interactive widget
      return target.closest('a, button, input, select, textarea, [role="button"], [role="dialog"], .custom-scrollbar');
    };

    const handleMouseDown = (e) => {
      if (e.button !== 0) return; // Only left click
      if (isInteractiveElement(e.target)) return;

      isDrawing.current = true;
      lastPos.current = getMousePos(e);
    };

    const handleMouseMove = (e) => {
      if (!isDrawing.current) return;

      const currentPos = getMousePos(e);

      // Create a gradient or use primary color
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#E05D5D'; // Using the theme's secondary color (coral) as drawing ink, or whatever stands out
      
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();

      lastPos.current = currentPos;
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
    };

    // Fading out the drawing slowly over time for a magical effect
    const fadeCanvas = setInterval(() => {
      if (!ctx || !canvasRef.current) return;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; // For light mode, we might need a mix-blend mode or clear rect
      // Better way to fade on a transparent canvas:
      const canvas = canvasRef.current;
      const originalComposite = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = originalComposite;
    }, 50);

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    // Also stop if mouse leaves window
    window.addEventListener('mouseleave', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
      clearInterval(fadeCanvas);
    };
  }, [ctx]);

  // Use a data URI SVG for the pencil cursor so it works natively via CSS globally
  const pencilSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="#000"/>
    </svg>
  `);

  return (
    <>
      <style>
        {`
          body {
            /* Hotspot depends on the SVG geometry. For this pencil, tip is near 0,24 */
            cursor: url("data:image/svg+xml;utf8,${pencilSvg}") 2 22, auto !important;
          }
          a, button, [role="button"], input, select, textarea {
            cursor: pointer !important;
          }
        `}
      </style>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{ width: '100vw', height: '100vh' }}
      />
    </>
  );
};

export default DrawingCursor;
