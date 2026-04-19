import { useEffect } from 'react';
import gsap from 'gsap';

export const useMagneticHover = () => {
  useEffect(() => {
    let activeElement = null;

    const handleMouseMove = (e) => {
      const target = e.target.closest('a, button, [role="button"], .hover-magnet');
      
      // Handle Mouse Leave explicitly using target tracking
      if (activeElement && activeElement !== target) {
        gsap.to(activeElement, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.3)',
        });
        activeElement = null;
      }

      if (!target) return;
      activeElement = target;

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Strength of the pull
      const strength = target.dataset.magneticStrength || 0.25;

      gsap.to(target, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = (e) => {
      const target = e.target.closest('a, button, [role="button"], .hover-magnet');
      if (!target) {
        if (activeElement) {
            gsap.to(activeElement, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: 'elastic.out(1, 0.3)',
            });
            activeElement = null;
        }
        return;
      }
      
      // It's leaving this target but check if it's moving into a child
      if (activeElement === target) {
        if (e.relatedTarget && target.contains(e.relatedTarget)) {
          return; // Still inside
        }

        gsap.to(activeElement, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.3)',
        });
        activeElement = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseout', handleMouseLeave); // Actually mouseout bubbles, so this captures elements leaving

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);
};
