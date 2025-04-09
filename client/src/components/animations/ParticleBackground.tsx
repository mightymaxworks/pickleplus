import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface ParticleBackgroundProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
  colors?: string[];
}

export function ParticleBackground({
  count = 50,
  minSize = 2,
  maxSize = 6,
  minSpeed = 0.1,
  maxSpeed = 0.5,
  colors = ['#FFFFFF', '#FF9800', '#FF5722', '#F3D6C6', '#FFF8F5']
}: ParticleBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  // Generate initial particles
  useEffect(() => {
    if (!containerRef.current) return;
    
    const { clientWidth, clientHeight } = containerRef.current;
    setDimensions({ width: clientWidth, height: clientHeight });
    
    const initialParticles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * clientWidth,
      y: Math.random() * clientHeight,
      size: minSize + Math.random() * (maxSize - minSize),
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * (maxSpeed - minSpeed) + minSpeed,
      speedY: (Math.random() - 0.5) * (maxSpeed - minSpeed) + minSpeed,
      opacity: 0.1 + Math.random() * 0.5
    }));
    
    setParticles(initialParticles);
  }, [count, minSize, maxSize, minSpeed, maxSpeed, colors]);
  
  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({ width: clientWidth, height: clientHeight });
      
      // Adjust particle positions to fit the new dimensions
      setParticles(prevParticles => {
        return prevParticles.map(p => ({
          ...p,
          x: Math.min(p.x, clientWidth),
          y: Math.min(p.y, clientHeight)
        }));
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Animation loop
  useEffect(() => {
    if (particles.length === 0 || !containerRef.current) return;
    
    const animateParticles = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      setParticles(prevParticles => {
        return prevParticles.map(p => {
          let newX = p.x + p.speedX * deltaTime * 0.05;
          let newY = p.y + p.speedY * deltaTime * 0.05;
          
          // Bounce off walls
          if (newX < 0 || newX > dimensions.width) {
            p.speedX *= -1;
            newX = Math.max(0, Math.min(newX, dimensions.width));
          }
          
          if (newY < 0 || newY > dimensions.height) {
            p.speedY *= -1;
            newY = Math.max(0, Math.min(newY, dimensions.height));
          }
          
          return {
            ...p,
            x: newX,
            y: newY
          };
        });
      });
      
      animationRef.current = requestAnimationFrame(animateParticles);
    };
    
    animationRef.current = requestAnimationFrame(animateParticles);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, dimensions]);
  
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ pointerEvents: 'none' }}
    >
      {particles.map((particle, index) => (
        <motion.div
          key={`particle-${index}`}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            x: particle.x,
            y: particle.y,
            opacity: particle.opacity,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: particle.opacity,
            x: particle.x,
            y: particle.y,
          }}
          transition={{ 
            duration: 1.5,
            delay: index * 0.02,
            opacity: { duration: 1 },
            x: { type: 'spring', stiffness: 5 },
            y: { type: 'spring', stiffness: 5 }
          }}
        />
      ))}
    </div>
  );
}