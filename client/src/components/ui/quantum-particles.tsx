import React, { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  dx: number;
  dy: number;
  alpha: number;
}

interface QuantumParticlesProps extends React.HTMLAttributes<HTMLDivElement> {
  particleCount?: number;
  colorPrimary?: string;
  colorSecondary?: string;
  speed?: number;
  animate?: boolean;
}

const QuantumParticles = React.forwardRef<HTMLDivElement, QuantumParticlesProps>(
  ({ 
    className, 
    particleCount = 20, 
    colorPrimary = "#0099ff", 
    colorSecondary = "#6a11cb",
    speed = 1,
    animate = true,
    ...props 
  }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const particles = useRef<Particle[]>([]);
    const animationRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    
    // Setup canvas drawing context
    const setupCanvas = useCallback(() => {
      if (!containerRef.current) return null;
      
      const container = containerRef.current;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      
      // Remove any existing canvas
      if (canvasRef.current) {
        container.removeChild(canvasRef.current);
      }
      
      // Create new canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      
      container.appendChild(canvas);
      canvasRef.current = canvas;
      
      // Get 2D context
      const ctx = canvas.getContext('2d');
      ctxRef.current = ctx;
      
      return { ctx, width, height };
    }, []);
    
    // Initialize particles
    const initParticles = useCallback((width: number, height: number) => {
      return Array.from({ length: particleCount }, () => {
        const size = Math.random() * 3 + 1;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size,
          color: Math.random() > 0.5 ? colorPrimary : colorSecondary,
          dx: (Math.random() > 0.5 ? 1 : -1) * Math.random() * speed,
          dy: (Math.random() > 0.5 ? 1 : -1) * Math.random() * speed,
          alpha: Math.random() * 0.5 + 0.2
        };
      });
    }, [particleCount, colorPrimary, colorSecondary, speed]);
    
    // Animation effect
    useEffect(() => {
      if (!animate || !containerRef.current) return;
      
      const canvasSetup = setupCanvas();
      if (!canvasSetup || !canvasSetup.ctx) return;
      
      const { ctx, width, height } = canvasSetup;
      particles.current = initParticles(width, height);
      
      // Animation loop
      const animateParticles = () => {
        if (!ctx) return;
        
        ctx.clearRect(0, 0, width, height);
        
        particles.current.forEach(particle => {
          // Update position
          particle.x += particle.dx;
          particle.y += particle.dy;
          
          // Bounce off boundaries
          if (particle.x <= 0 || particle.x >= width) particle.dx *= -1;
          if (particle.y <= 0 || particle.y >= height) particle.dy *= -1;
          
          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `${particle.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.fill();
        });
        
        animationRef.current = requestAnimationFrame(animateParticles);
      };
      
      // Start animation
      animateParticles();
      
      // Cleanup function
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };
    }, [animate, setupCanvas, initParticles]);
    
    // Combine refs (internal + forwarded)
    const setContainerRef = useCallback((element: HTMLDivElement | null) => {
      containerRef.current = element;
      
      // Handle the forwarded ref
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    }, [ref]);
    
    return (
      <div 
        ref={setContainerRef}
        className={cn("relative overflow-hidden", className)}
        {...props}
      />
    );
  }
);

QuantumParticles.displayName = "QuantumParticles";

export { QuantumParticles };
