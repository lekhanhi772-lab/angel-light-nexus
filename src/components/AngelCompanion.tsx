import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

// Import GIF assets
import gif1 from '@/assets/angel-gifs/1.gif';
import gif2 from '@/assets/angel-gifs/2.gif';
import gif3 from '@/assets/angel-gifs/3.gif';

interface StarTrail {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
  type: 'star' | 'sparkle' | 'dust';
  rotation: number;
  color: string;
}

type AngelState = 'idle' | 'sleeping' | 'waving';

interface AngelCompanionProps {
  enabled?: boolean;
}

// Configuration - Increased distance to not interfere with user actions
const OFFSET_X = -100; // Pixels to the left of cursor
const OFFSET_Y = -60;  // Pixels above cursor center
const IDLE_TIMEOUT = 4000; // 4 seconds before sleeping
const GIF_SIZE = 80; // Size of the GIF in pixels

// Map states to GIFs
const GIF_STATES: Record<AngelState, string> = {
  idle: gif1,
  sleeping: gif2,
  waving: gif3,
};

export const AngelCompanion = ({ enabled = true }: AngelCompanionProps) => {
  const [position, setPosition] = useState({ x: -200, y: -200 });
  const [currentPos, setCurrentPos] = useState({ x: -200, y: -200 });
  const [angelState, setAngelState] = useState<AngelState>('idle');
  const [isHovering, setIsHovering] = useState(false);
  const [trails, setTrails] = useState<StarTrail[]>([]);
  const [floatY, setFloatY] = useState(0);
  
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMoveRef = useRef<number>(Date.now());
  const trailIdRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // Smooth position interpolation
  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      setCurrentPos(prev => ({
        x: prev.x + (position.x - prev.x) * 0.15,
        y: prev.y + (position.y - prev.y) * 0.15,
      }));
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [position, enabled]);

  // Floating animation
  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    const floatAnimation = () => {
      frame += 0.05;
      setFloatY(Math.sin(frame) * 5);
      requestAnimationFrame(floatAnimation);
    };
    const id = requestAnimationFrame(floatAnimation);
    return () => cancelAnimationFrame(id);
  }, [enabled]);

  // Create fairy dust trails
  const createTrail = useCallback((x: number, y: number) => {
    const types: ('star' | 'sparkle' | 'dust')[] = ['star', 'sparkle', 'dust'];
    const colors = ['#FFD700', '#FFF8DC', '#FFFACD', '#FFE4B5'];
    
    const newTrail: StarTrail = {
      id: trailIdRef.current++,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      opacity: 0.8 + Math.random() * 0.2,
      size: 3 + Math.random() * 5,
      type: types[Math.floor(Math.random() * types.length)],
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setTrails(prev => [...prev.slice(-15), newTrail]);
  }, []);

  // Fade out trails
  useEffect(() => {
    if (!enabled || trails.length === 0) return;

    const interval = setInterval(() => {
      setTrails(prev => 
        prev
          .map(trail => ({ ...trail, opacity: trail.opacity - 0.03, y: trail.y + 1 }))
          .filter(trail => trail.opacity > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, [trails.length, enabled]);

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled) return;

    setPosition({ x: e.clientX, y: e.clientY });
    lastMoveRef.current = Date.now();

    // Reset idle timeout
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    // Wake up if sleeping
    if (angelState === 'sleeping') {
      setAngelState('idle');
    }

    // Create fairy dust from companion position
    if (Math.random() > 0.7) {
      createTrail(e.clientX + OFFSET_X + GIF_SIZE / 2, e.clientY + OFFSET_Y + GIF_SIZE / 2);
    }

    // Set idle timeout
    idleTimeoutRef.current = setTimeout(() => {
      if (!isHovering) {
        setAngelState('sleeping');
      }
    }, IDLE_TIMEOUT);
  }, [enabled, angelState, isHovering, createTrail]);

  // Hover detection for interactive elements
  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = 
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('a') ||
      target.getAttribute('role') === 'button';

    if (isInteractive) {
      setIsHovering(true);
      setAngelState('waving');
    } else {
      setIsHovering(false);
      if (angelState === 'waving') {
        setAngelState('idle');
      }
    }
  }, [angelState]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [enabled, handleMouseMove, handleMouseOver]);

  if (!enabled) return null;

  // Render trail particles
  const renderTrail = (trail: StarTrail) => {
    if (trail.type === 'star') {
      return (
        <svg
          key={trail.id}
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: trail.x,
            top: trail.y,
            opacity: trail.opacity,
            transform: `rotate(${trail.rotation}deg)`,
          }}
          width={trail.size}
          height={trail.size}
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={trail.color}
          />
        </svg>
      );
    }

    if (trail.type === 'sparkle') {
      return (
        <div
          key={trail.id}
          className="fixed pointer-events-none z-[9998] rounded-full"
          style={{
            left: trail.x,
            top: trail.y,
            width: trail.size,
            height: trail.size,
            opacity: trail.opacity,
            background: `radial-gradient(circle, ${trail.color} 0%, transparent 70%)`,
            boxShadow: `0 0 ${trail.size}px ${trail.color}`,
          }}
        />
      );
    }

    return (
      <div
        key={trail.id}
        className="fixed pointer-events-none z-[9998] rounded-full"
        style={{
          left: trail.x,
          top: trail.y,
          width: trail.size * 0.5,
          height: trail.size * 0.5,
          opacity: trail.opacity * 0.7,
          backgroundColor: trail.color,
        }}
      />
    );
  };

  return createPortal(
    <>
      {/* Fairy dust trails */}
      {trails.map(renderTrail)}

      {/* Angel companion - positioned to the left of cursor */}
      <div
        className="fixed pointer-events-none z-[9999] transition-transform duration-100"
        style={{
          left: currentPos.x + OFFSET_X,
          top: currentPos.y + OFFSET_Y + floatY,
        }}
      >
        <img 
          src={GIF_STATES[angelState]} 
          alt="Angel companion"
          className="object-contain drop-shadow-lg"
          style={{ width: GIF_SIZE, height: GIF_SIZE }}
          draggable={false}
        />
      </div>
    </>,
    document.body
  );
};

export default AngelCompanion;
