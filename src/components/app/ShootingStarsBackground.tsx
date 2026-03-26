import React, { useEffect, useRef } from 'react';

export interface ShootingStarsBackgroundProps {
  enabled?: boolean;
}

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
  alpha: number;
}

const ShootingStarsBackground: React.FC<ShootingStarsBackgroundProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let nextSpawnTime = 0;

    // Config
    const maxActiveStars = 2;
    const minSpawnInterval = 3000;
    const maxSpawnInterval = 8000;
    const minLife = 400;
    const maxLife = 900;

    // State
    let width = 0;
    let height = 0;
    const activeStars: Star[] = [];

    const handleResize = () => {
      const scaleFactor = window.innerWidth < 768 ? 0.2 : 0.25;
      width = Math.floor(window.innerWidth * scaleFactor);
      height = Math.floor(window.innerHeight * scaleFactor);
      canvas.width = width;
      canvas.height = height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const spawnStar = () => {
      if (activeStars.length >= maxActiveStars) return;

      const isLeft = Math.random() > 0.5;
      // Spawn somewhat randomly along the top or upper sides
      const x = Math.random() * width;
      const y = Math.random() * (height * 0.3); // Spawn in the top 30% of the screen
      
      const vx = (isLeft ? 1 : -1) * (0.8 + Math.random() * 0.4) * (width / 500); // Faster movement
      const vy = (0.8 + Math.random() * 0.4) * (height / 500);

      activeStars.push({
        x,
        y,
        vx,
        vy,
        length: 15 + Math.random() * 30, // Shorter tail
        life: 0,
        maxLife: minLife + Math.random() * (maxLife - minLife),
        alpha: 0.4 + Math.random() * 0.4,
      });
    };

    const render = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      if (time > nextSpawnTime) {
        spawnStar();
        nextSpawnTime = time + minSpawnInterval + Math.random() * (maxSpawnInterval - minSpawnInterval);
      }

      for (let i = activeStars.length - 1; i >= 0; i--) {
        const star = activeStars[i];
        star.life += dt;

        if (star.life >= star.maxLife) {
          activeStars.splice(i, 1);
          continue;
        }

        star.x += star.vx * dt;
        star.y += star.vy * dt;

        // Fade in/out
        const lifeRatio = star.life / star.maxLife;
        let currentAlpha = star.alpha;
        if (lifeRatio < 0.2) {
          currentAlpha *= (lifeRatio / 0.2);
        } else if (lifeRatio > 0.8) {
          currentAlpha *= (1 - (lifeRatio - 0.8) / 0.2);
        }

        const angle = Math.atan2(star.vy, star.vx);
        const tailX = star.x - Math.cos(angle) * star.length;
        const tailY = star.y - Math.sin(angle) * star.length;

        const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha})`);
        grad.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        // Optionally, give it a tiny head highlight
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled]);

  if (!enabled) return null;

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
        zIndex: 1,
      }}
    />
  );
};

export default ShootingStarsBackground;
