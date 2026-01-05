import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// 4 color variants with hair and dress colors
const ANGEL_VARIANTS = {
  default: { 
    hair: '#FFD700', 
    dress: '#FFFFFF', 
    dressAccent: '#FFD700',
    wings: '#FFD700', 
    wand: '#FFD700',
    name: 'Tóc Vàng Kim - Váy Trắng' 
  },
  pink: { 
    hair: '#FFB6C1', 
    dress: '#FFB6C1', 
    dressAccent: '#9370DB',
    wings: '#9370DB', 
    wand: '#FF69B4',
    name: 'Tóc Hồng - Váy Tím Lấp Lánh' 
  },
  golden: { 
    hair: '#FFD700', 
    dress: '#FFD700', 
    dressAccent: '#FFA500',
    wings: '#FFA500', 
    wand: '#FFD700',
    name: 'Tóc Vàng Rực - Váy Vàng Kim' 
  },
  mint: { 
    hair: '#98FF98', 
    dress: '#FFFFFF', 
    dressAccent: '#98FF98',
    wings: '#FFFFFF', 
    wand: '#98FF98',
    name: 'Tóc Xanh Mint - Váy Trắng Xanh' 
  },
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
  const [bodyPhase, setBodyPhase] = useState(0);
  
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
    }, isHovering ? 25 : 45);
    return () => clearInterval(interval);
  }, [isHovering]);

  // Body sway animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBodyPhase((prev) => (prev + 1) % 360);
    }, 60);
    return () => clearInterval(interval);
  }, []);

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
    if (!isMobileRef.current && Math.random() > 0.5) {
      const newTrail: StarTrail = {
        id: trailIdRef.current++,
        x: e.clientX + (Math.random() - 0.5) * 25,
        y: e.clientY + (Math.random() - 0.5) * 25,
        opacity: 1,
      };
      setTrails((prev) => [...prev.slice(-15), newTrail]);
    }
  }, []);

  // Mouse fallback (some environments may not emit pointer events)
  const handleMouseMove = useCallback((e: MouseEvent) => {
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
    document.documentElement.classList.add('angel-cursor-active');
    document.body.classList.add('angel-cursor-active');

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
  const wingOffset = Math.sin(wingPhase * 0.15) * (isHovering ? 10 : 6);
  const bodySway = Math.sin(bodyPhase * 0.05) * 1.5;
  const hairSway = Math.sin(bodyPhase * 0.08) * 3;
  const dressSway = Math.sin(bodyPhase * 0.06) * 2;
  const wandGlow = isHovering ? 1 : (0.5 + Math.sin(wingPhase * 0.1) * 0.3);
  const wandRotate = Math.sin(bodyPhase * 0.04) * 5;

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
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path
              d="M7 0L8.2 5.8L14 7L8.2 8.2L7 14L5.8 8.2L0 7L5.8 5.8L7 0Z"
              fill={colors.wand}
              filter="drop-shadow(0 0 4px rgba(255, 215, 0, 0.9))"
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
          transform: `translate(-50%, -50%) rotate(${bodySway}deg)`,
          transition: isIdle ? 'left 3s ease-in-out, top 3s ease-in-out' : 'none',
          filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))',
        }}
      >
        <svg width="56" height="72" viewBox="0 0 56 72" className="overflow-visible">
          {/* Filter definitions */}
          <defs>
            <filter id="angelGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="sparkleGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="dressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.dress} />
              <stop offset="50%" stopColor={colors.dressAccent} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colors.dress} />
            </linearGradient>
            <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.hair} />
              <stop offset="100%" stopColor={colors.hair} stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Halo */}
          <ellipse
            cx="28"
            cy="6"
            rx="8"
            ry="2.5"
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            filter="url(#angelGlow)"
            opacity="0.9"
          />
          
          {/* Left wing */}
          <path
            d={`M18 ${28 + wingOffset} 
                C4 ${24 + wingOffset * 1.5} 
                0 ${38 + wingOffset * 0.5} 
                14 44`}
            fill={colors.wings}
            opacity="0.85"
            filter="url(#angelGlow)"
          />
          <path
            d={`M18 ${30 + wingOffset * 0.8} 
                C8 ${28 + wingOffset} 
                5 ${36 + wingOffset * 0.3} 
                14 42`}
            fill="white"
            opacity="0.5"
          />
          
          {/* Right wing */}
          <path
            d={`M38 ${28 + wingOffset} 
                C52 ${24 + wingOffset * 1.5} 
                56 ${38 + wingOffset * 0.5} 
                42 44`}
            fill={colors.wings}
            opacity="0.85"
            filter="url(#angelGlow)"
          />
          <path
            d={`M38 ${30 + wingOffset * 0.8} 
                C48 ${28 + wingOffset} 
                51 ${36 + wingOffset * 0.3} 
                42 42`}
            fill="white"
            opacity="0.5"
          />

          {/* Flowing Hair - Back layer */}
          <path
            d={`M18 14 
                Q14 ${20 + hairSway} 12 ${32 + hairSway * 1.2}
                Q10 ${40 + hairSway} 14 ${48 + hairSway * 0.8}`}
            fill="none"
            stroke="url(#hairGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d={`M38 14 
                Q42 ${20 - hairSway} 44 ${32 - hairSway * 1.2}
                Q46 ${40 - hairSway} 42 ${48 - hairSway * 0.8}`}
            fill="none"
            stroke="url(#hairGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Head */}
          <circle cx="28" cy="16" r="8" fill="#FFE4C4" />
          
          {/* Hair - Top and sides */}
          <ellipse cx="28" cy="12" rx="7" ry="4" fill={colors.hair} />
          <path
            d={`M21 12 
                Q18 ${16 + hairSway * 0.5} 16 ${26 + hairSway}
                Q14 ${34 + hairSway * 1.2} 16 ${42 + hairSway}`}
            fill="none"
            stroke={colors.hair}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={`M35 12 
                Q38 ${16 - hairSway * 0.5} 40 ${26 - hairSway}
                Q42 ${34 - hairSway * 1.2} 40 ${42 - hairSway}`}
            fill="none"
            stroke={colors.hair}
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Face */}
          <circle cx="25" cy="16" r="1" fill="#333" />
          <circle cx="31" cy="16" r="1" fill="#333" />
          <ellipse cx="25" cy="15.5" r="0.4" ry="0.2" fill="white" />
          <ellipse cx="31" cy="15.5" r="0.4" ry="0.2" fill="white" />
          <path d="M26 19 Q28 20.5 30 19" stroke="#FF9999" strokeWidth="0.8" fill="none" />
          <circle cx="23" cy="17" r="1.5" fill="#FFB6C1" opacity="0.4" />
          <circle cx="33" cy="17" r="1.5" fill="#FFB6C1" opacity="0.4" />

          {/* Body/Long Dress */}
          <path
            d={`M22 24 
                L28 23 
                L34 24 
                L${38 + dressSway} 58 
                Q${36 + dressSway * 0.5} 66 28 68
                Q${20 - dressSway * 0.5} 66 ${18 - dressSway} 58
                Z`}
            fill="url(#dressGradient)"
            stroke={colors.dressAccent}
            strokeWidth="0.5"
          />
          
          {/* Dress sparkles */}
          {[...Array(6)].map((_, i) => (
            <circle
              key={i}
              cx={24 + (i % 3) * 4 + Math.sin((wingPhase + i * 60) * 0.1) * 1}
              cy={35 + Math.floor(i / 3) * 12 + Math.cos((wingPhase + i * 40) * 0.1) * 1}
              r="0.8"
              fill={colors.dressAccent}
              opacity={0.4 + Math.sin((wingPhase + i * 50) * 0.15) * 0.4}
              filter="url(#sparkleGlow)"
            />
          ))}
          
          {/* Dress shine */}
          <path
            d={`M25 28 Q28 27 29 50`}
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.35"
          />

          {/* Left Arm with magic wand */}
          <g transform={`rotate(${wandRotate}, 20, 28)`}>
            <path
              d="M22 26 C18 28 15 32 14 36"
              stroke="#FFE4C4"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Magic Wand */}
            <line
              x1="14"
              y1="36"
              x2="6"
              y2="26"
              stroke="#8B4513"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Wand tip glow */}
            <circle
              cx="5"
              cy="24"
              r={2 + wandGlow}
              fill={colors.wand}
              filter="url(#sparkleGlow)"
              opacity={wandGlow}
            />
            <circle
              cx="5"
              cy="24"
              r="1"
              fill="white"
            />
            {/* Wand sparkles */}
            {isHovering && [...Array(3)].map((_, i) => (
              <circle
                key={i}
                cx={5 + Math.cos((wingPhase + i * 120) * 0.2) * 6}
                cy={24 + Math.sin((wingPhase + i * 120) * 0.2) * 6}
                r="0.8"
                fill={colors.wand}
                opacity={0.8 - i * 0.2}
                filter="url(#sparkleGlow)"
              />
            ))}
          </g>

          {/* Right Arm */}
          <path
            d="M34 26 C38 28 40 32 39 36"
            stroke="#FFE4C4"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Right hand */}
          <circle cx="39" cy="36" r="2" fill="#FFE4C4" />

          {/* Wing sparkle effects */}
          <circle
            cx={10 + Math.sin(wingPhase * 0.1) * 3}
            cy={32 + Math.cos(wingPhase * 0.1) * 3}
            r="1.2"
            fill={colors.wings}
            opacity={0.6 + Math.sin(wingPhase * 0.2) * 0.4}
            filter="url(#sparkleGlow)"
          />
          <circle
            cx={46 + Math.cos(wingPhase * 0.1) * 3}
            cy={32 + Math.sin(wingPhase * 0.1) * 3}
            r="1.2"
            fill={colors.wings}
            opacity={0.6 + Math.cos(wingPhase * 0.2) * 0.4}
            filter="url(#sparkleGlow)"
          />

          {/* Extra floating sparkles around angel */}
          {!isMobileRef.current && [...Array(4)].map((_, i) => (
            <circle
              key={`float-${i}`}
              cx={28 + Math.cos((bodyPhase + i * 90) * 0.03) * 25}
              cy={36 + Math.sin((bodyPhase + i * 90) * 0.03) * 20}
              r="0.6"
              fill="#FFD700"
              opacity={0.3 + Math.sin((bodyPhase + i * 45) * 0.05) * 0.3}
            />
          ))}
        </svg>
      </div>
    </>
  );

  return createPortal(ui, document.body);
};

export const ANGEL_VARIANTS_LIST = ANGEL_VARIANTS;
export type { VariantKey };
