import React, { useEffect, useRef } from 'react';

interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

export const Silk: React.FC<SilkProps> = ({
  speed = 5,
  scale = 1,
  color = '#7B7481',
  noiseIntensity = 1.5,
  rotation = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += speed * 0.001;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw flowing silk-like waves
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
          const noise = Math.sin(angle * 8 + time + i) * noiseIntensity * 20;
          const radius = 100 * scale + noise + i * 30;
          
          const x = centerX + Math.cos(angle + rotation + time * 0.2) * radius;
          const y = centerY + Math.sin(angle + rotation + time * 0.2) * radius;
          
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        ctx.strokeStyle = `${color}${Math.floor((1 - i * 0.15) * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [speed, scale, color, noiseIntensity, rotation]);

  return (
    <canvas
      ref={canvasRef}
      width={1080}
      height={1080}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        opacity: 0.6,
      }}
    />
  );
};
