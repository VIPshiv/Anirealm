'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function CursorParticles() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  
  // Handle Hydration mismatch by only rendering on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Premium colors: Pink, Gold, Cyan, White (RGB values)
  const colors = [
    '236, 72, 153', // Pink
    '250, 204, 21', // Gold
    '34, 211, 238', // Cyan
    '255, 255, 255' // White
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const createParticle = (x: number, y: number, isClick = false) => {
      const count = isClick ? 30 : 2; // Fewer particles on move for performance
      const speedMult = isClick ? 4 : 0.5; // Slower movement on hover
      
      for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (isClick ? 5 : 1) + 0.2;
        
        particles.current.push({
          x,
          y,
          size: Math.random() * 3 + (isClick ? 2 : 0.5),
          speedX: Math.cos(angle) * speed * speedMult,
          speedY: Math.sin(angle) * speed * speedMult,
          life: 1,
          maxLife: Math.random() * 0.5 + 0.5,
          color
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      createParticle(e.clientX, e.clientY, false);
    };

    const handleClick = (e: MouseEvent) => {
      createParticle(e.clientX, e.clientY, true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Enable additive blending for "glow" effect
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Friction - slow down over time
        p.speedX *= 0.92;
        p.speedY *= 0.92;
        
        // Slight gravity
        p.speedY += 0.05;
        
        // Fade out
        p.life -= 0.02;
        p.size *= 0.95;

        if (p.life <= 0 || p.size <= 0.1) {
          particles.current.splice(i, 1);
          i--;
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${p.color}, 0.5)`;
        
        ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
        ctx.fill();
        
        // Reset shadow for next iteration
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100, // Reduced from 9999 to avoid overlaying Modals/Tooltips
      }}
    />
  );
}
