import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

// GIF paths from public folder - lazy loaded, not bundled
const gif1 = '/angel-gifs/1.gif';
const gif2 = '/angel-gifs/2.gif';
const gif3 = '/angel-gifs/3.gif';
const gif4 = '/angel-gifs/4.gif';
const gif5 = '/angel-gifs/5.gif';
const gif6 = '/angel-gifs/6.gif';
const gif7 = '/angel-gifs/7.gif';
const gif8 = '/angel-gifs/8.gif';
const gif9 = '/angel-gifs/9.gif';
const gif10 = '/angel-gifs/10.gif';

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

// Extended angel states with new animations
type AngelState = 
  | 'idle' 
  | 'sleeping' 
  | 'waving' 
  | 'leanLeft'   // Ngã sang trái
  | 'leanRight'  // Ngã sang phải
  | 'spinning'   // Xoay vòng tròn
  | 'kickUp'     // Đá chân lên
  | 'kickDown';  // Đá chân xuống

interface AngelCompanionProps {
  enabled?: boolean;
}

// Configuration - Increased distance to not interfere with user actions
const OFFSET_X = -150; // Pixels to the left of cursor
const OFFSET_Y = -120; // Pixels above cursor center
const IDLE_TIMEOUT = 4000; // 4 seconds before sleeping
const GIF_SIZE = 160; // Size of the GIF in pixels (doubled)

// Map states to GIFs - using all 10 GIFs
const GIF_STATES: Record<AngelState, string> = {
  idle: gif1,
  sleeping: gif2,
  waving: gif3,
  leanLeft: gif4,
  leanRight: gif5,
  spinning: gif6,
  kickUp: gif7,
  kickDown: gif8,
};

// Random idle GIFs for variety
const IDLE_GIFS = [gif1, gif9, gif10];

// CSS transforms for each state
const STATE_TRANSFORMS: Record<AngelState, string> = {
  idle: 'rotate(0deg)',
  sleeping: 'rotate(-5deg)',
  waving: 'rotate(0deg) scale(1.05)',
  leanLeft: 'rotate(-25deg) translateX(-10px)',
  leanRight: 'rotate(25deg) translateX(10px)',
  spinning: 'rotate(360deg)',
  kickUp: 'translateY(-25px) rotate(-10deg)',
  kickDown: 'translateY(25px) rotate(10deg)',
};

export const AngelCompanion = ({ enabled = true }: AngelCompanionProps) => {
  const [position, setPosition] = useState({ x: -200, y: -200 });
  const [currentPos, setCurrentPos] = useState({ x: -200, y: -200 });
  const [angelState, setAngelState] = useState<AngelState>('idle');
  const [currentGif, setCurrentGif] = useState<string>(gif1);
  const [isHovering, setIsHovering] = useState(false);
  const [trails, setTrails] = useState<StarTrail[]>([]);
  const [floatY, setFloatY] = useState(0);
  
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMoveRef = useRef<number>(Date.now());
  const lastXRef = useRef<number>(0);
  const trailIdRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // Update GIF when state changes
  useEffect(() => {
    if (angelState === 'idle') {
      // Random idle GIF for variety
      setCurrentGif(IDLE_GIFS[Math.floor(Math.random() * IDLE_GIFS.length)]);
    } else {
      setCurrentGif(GIF_STATES[angelState]);
    }
  }, [angelState]);

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

  // Helper to set temporary state
  const setTemporaryState = useCallback((state: AngelState, duration: number) => {
    if (stateTimeoutRef.current) {
      clearTimeout(stateTimeoutRef.current);
    }
    setAngelState(state);
    stateTimeoutRef.current = setTimeout(() => {
      setAngelState('idle');
    }, duration);
  }, []);

  // Mouse move handler with lean detection
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled) return;

    setPosition({ x: e.clientX, y: e.clientY });
    lastMoveRef.current = Date.now();

    // Detect fast horizontal movement for leaning
    const deltaX = e.clientX - lastXRef.current;
    if (Math.abs(deltaX) > 40 && angelState !== 'leanLeft' && angelState !== 'leanRight') {
      setTemporaryState(deltaX > 0 ? 'leanRight' : 'leanLeft', 400);
    }
    lastXRef.current = e.clientX;

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
  }, [enabled, angelState, isHovering, createTrail, setTemporaryState]);

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

  // Click handler for kick up
  const handleClick = useCallback(() => {
    if (!enabled || angelState === 'kickUp') return;
    setTemporaryState('kickUp', 350);
  }, [enabled, angelState, setTemporaryState]);

  // Double click handler for kick down
  const handleDblClick = useCallback(() => {
    if (!enabled || angelState === 'kickDown') return;
    setTemporaryState('kickDown', 350);
  }, [enabled, angelState, setTemporaryState]);

  // Scroll handler for spinning
  const handleScroll = useCallback(() => {
    if (!enabled || angelState === 'spinning') return;
    setTemporaryState('spinning', 600);
  }, [enabled, angelState, setTemporaryState]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('click', handleClick);
    window.addEventListener('dblclick', handleDblClick);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('dblclick', handleDblClick);
      window.removeEventListener('scroll', handleScroll);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      if (stateTimeoutRef.current) {
        clearTimeout(stateTimeoutRef.current);
      }
    };
  }, [enabled, handleMouseMove, handleMouseOver, handleClick, handleDblClick, handleScroll]);

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
          src={currentGif} 
          alt="Angel companion"
          className={`object-contain drop-shadow-lg transition-transform duration-300 ease-out ${
            angelState === 'spinning' ? 'animate-spin' : ''
          }`}
          style={{ 
            width: GIF_SIZE, 
            height: GIF_SIZE,
            transform: STATE_TRANSFORMS[angelState],
          }}
          draggable={false}
        />
      </div>
    </>,
    document.body
  );
};

export default AngelCompanion;
