import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// 4 color variants
const ANGEL_VARIANTS = {
  default: { dress: '#FFFFFF', wings: '#FFD700', name: 'Trắng - Vàng Kim' },
  pink: { dress: '#FFB6C1', wings: '#9370DB', name: 'Hồng - Tím' },
  golden: { dress: '#FFD700', wings: '#FFA500', name: 'Vàng Rực Rỡ' },
  mint: { dress: '#98FF98', wings: '#FFFFFF', name: 'Xanh Mint - Trắng' },
};

type VariantKey = keyof typeof ANGEL_VARIANTS;

interface StarTrail {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

interface AngelCursorProps {
  variant?: VariantKey;
}

export const AngelCursor = ({ variant = 'default' }: AngelCursorProps) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trails, setTrails] = useState<StarTrail[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [idlePosition, setIdlePosition] = useState({ x: 0, y: 0 });
  const [wingPhase, setWingPhase] = useState(0);
  
  const trailIdRef = useRef(0);
  const lastMoveRef = useRef(Date.now());
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idleAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const isMobileRef = useRef(false);

  const colors = ANGEL_VARIANTS[variant];

  // Check if mobile
  useEffect(() => {
    isMobileRef.current = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
  }, []);

  // Wing flapping animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWingPhase((prev) => (prev + 1) % 360);
    }, isHovering ? 30 : 50);
    return () => clearInterval(interval);
  }, [isHovering]);

  // Fade out trails
  useEffect(() => {
    if (trails.length === 0) return;
    
    const interval = setInterval(() => {
      setTrails((prev) => 
        prev
          .map((t) => ({ ...t, opacity: t.opacity - 0.08 }))
          .filter((t) => t.opacity > 0)
      );
    }, 30);
    
    return () => clearInterval(interval);
  }, [trails.length]);

  // Handle pointer move (mouse + touch/pen)
  const handlePointerMove = useCallback((e: PointerEvent) => {
    const now = Date.now();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsMoving(true);
    setIsIdle(false);
    lastMoveRef.current = now;

    // Reset idle timeout
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (idleAnimationRef.current) clearTimeout(idleAnimationRef.current);

    idleTimeoutRef.current = setTimeout(() => {
      setIsMoving(false);
      setIsIdle(true);
    }, 3000);

    // Add star trail (skip on mobile for performance)
    if (!isMobileRef.current && Math.random() > 0.6) {
      const newTrail: StarTrail = {
        id: trailIdRef.current++,
        x: e.clientX + (Math.random() - 0.5) * 20,
        y: e.clientY + (Math.random() - 0.5) * 20,
        opacity: 1,
      };
      setTrails((prev) => [...prev.slice(-12), newTrail]);
    }
  }, []);

  // Mouse fallback (some environments may not emit pointer events)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Reuse the same logic
    handlePointerMove(e as unknown as PointerEvent);
  }, [handlePointerMove]);

  // Check if hovering over interactive elements
  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = 
      target.tagName === 'BUTTON' || 
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="button"]');
    setIsHovering(!!isInteractive);
  }, []);

  // Idle floating animation
  useEffect(() => {
    if (!isIdle) return;

    const floatAround = () => {
      const newX = Math.random() * (window.innerWidth - 100) + 50;
      const newY = Math.random() * (window.innerHeight - 100) + 50;
      setIdlePosition({ x: newX, y: newY });
    };

    floatAround();
    idleAnimationRef.current = setInterval(floatAround, 4000);
    
    return () => {
      if (idleAnimationRef.current) clearInterval(idleAnimationRef.current);
    };
  }, [isIdle]);

  useEffect(() => {
    // Hide default cursor globally using CSS class
    document.documentElement.classList.add('angel-cursor-active');
    document.body.classList.add('angel-cursor-active');

    // Track pointer globally (more reliable across routes/modals)
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.documentElement.classList.remove('angel-cursor-active');
      document.body.classList.remove('angel-cursor-active');
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (idleAnimationRef.current) clearInterval(idleAnimationRef.current);
    };
  }, [handlePointerMove, handleMouseMove, handleMouseOver]);

  const currentPos = isIdle ? idlePosition : position;
  const wingOffset = Math.sin(wingPhase * 0.15) * (isHovering ? 8 : 5);

  const ui = (
    <>
      {/* Star trails */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: trail.x,
            top: trail.y,
            opacity: trail.opacity,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M6 0L7 5L12 6L7 7L6 12L5 7L0 6L5 5L6 0Z"
              fill="#FFD700"
              filter="drop-shadow(0 0 3px rgba(255, 215, 0, 0.8))"
            />
          </svg>
        </div>
      ))}

      {/* Angel cursor */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: currentPos.x,
          top: currentPos.y,
          transform: 'translate(-50%, -50%)',
          transition: isIdle ? 'left 3s ease-in-out, top 3s ease-in-out' : 'none',
          filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))',
        }}
      >
        <svg width="40" height="48" viewBox="0 0 40 48" className="overflow-visible">
          {/* Halo */}
          <ellipse
            cx="20"
            cy="4"
            rx="6"
            ry="2"
            fill="none"
            stroke="#FFD700"
            strokeWidth="1.5"
            filter="url(#glow)"
          />
          
          {/* Left wing */}
          <path
            d={`M12 ${20 + wingOffset} 
                C2 ${18 + wingOffset * 1.5} 
                0 ${28 + wingOffset * 0.5} 
                10 32`}
            fill={colors.wings}
            opacity="0.9"
            filter="url(#glow)"
            style={{ transformOrigin: '12px 26px' }}
          />
          <path
            d={`M12 ${22 + wingOffset * 0.8} 
                C5 ${21 + wingOffset} 
                3 ${27 + wingOffset * 0.3} 
                10 30`}
            fill="white"
            opacity="0.4"
          />
          
          {/* Right wing */}
          <path
            d={`M28 ${20 + wingOffset} 
                C38 ${18 + wingOffset * 1.5} 
                40 ${28 + wingOffset * 0.5} 
                30 32`}
            fill={colors.wings}
            opacity="0.9"
            filter="url(#glow)"
            style={{ transformOrigin: '28px 26px' }}
          />
          <path
            d={`M28 ${22 + wingOffset * 0.8} 
                C35 ${21 + wingOffset} 
                37 ${27 + wingOffset * 0.3} 
                30 30`}
            fill="white"
            opacity="0.4"
          />

          {/* Head */}
          <circle cx="20" cy="12" r="6" fill="#FFE4C4" />
          
          {/* Hair */}
          <ellipse cx="20" cy="9" rx="5.5" ry="3" fill="#8B4513" />
          
          {/* Face */}
          <circle cx="18" cy="12" r="0.8" fill="#333" />
          <circle cx="22" cy="12" r="0.8" fill="#333" />
          <path d="M19 14 Q20 15 21 14" stroke="#FF9999" strokeWidth="0.5" fill="none" />

          {/* Body/Dress */}
          <path
            d="M15 18 L20 17 L25 18 L27 38 L20 40 L13 38 Z"
            fill={colors.dress}
            stroke={colors.wings}
            strokeWidth="0.5"
          />
          
          {/* Dress shine */}
          <path
            d="M17 20 L20 19 L21 35"
            fill="none"
            stroke="white"
            strokeWidth="1"
            opacity="0.4"
          />

          {/* Arms */}
          <path
            d="M15 20 C12 22 11 26 13 28"
            stroke="#FFE4C4"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M25 20 C28 22 29 26 27 28"
            stroke="#FFE4C4"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Sparkle effects */}
          <circle
            cx={8 + Math.sin(wingPhase * 0.1) * 2}
            cy={24 + Math.cos(wingPhase * 0.1) * 2}
            r="1"
            fill="#FFD700"
            opacity={0.5 + Math.sin(wingPhase * 0.2) * 0.5}
          />
          <circle
            cx={32 + Math.cos(wingPhase * 0.1) * 2}
            cy={24 + Math.sin(wingPhase * 0.1) * 2}
            r="1"
            fill="#FFD700"
            opacity={0.5 + Math.cos(wingPhase * 0.2) * 0.5}
          />

          {/* Filter definitions */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    </>
  );

  // Render into document.body to avoid z-index/stacking-context issues across layouts
  return createPortal(ui, document.body);
};

export const ANGEL_VARIANTS_LIST = ANGEL_VARIANTS;
export type { VariantKey };
