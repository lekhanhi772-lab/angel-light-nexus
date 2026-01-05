import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// 4 color variants - Cute fairy style matching the reference
const ANGEL_VARIANTS = {
  default: { 
    hair: '#4A3728', 
    hairBow: '#FF69B4',
    skin: '#FFE4C4',
    dress: '#FFB6C1', 
    dressInner: '#FF69B4',
    wings: '#FFB6C1',
    wingsInner: '#FFC0CB',
    shoes: '#FF69B4',
    wand: '#FFD700',
    name: 'Tiên Hồng Dễ Thương' 
  },
  pink: { 
    hair: '#FF6B35', 
    hairBow: '#32CD32',
    skin: '#FFE4C4',
    dress: '#FFD700', 
    dressInner: '#FFA500',
    wings: '#FFFACD',
    wingsInner: '#FFD700',
    shoes: '#FFD700',
    wand: '#FFD700',
    name: 'Tiên Vàng Rực Rỡ' 
  },
  golden: { 
    hair: '#FFD700', 
    hairBow: '#87CEEB',
    skin: '#FFE4C4',
    dress: '#DDA0DD', 
    dressInner: '#BA55D3',
    wings: '#E6E6FA',
    wingsInner: '#DDA0DD',
    shoes: '#DDA0DD',
    wand: '#FFD700',
    name: 'Tiên Tím Huyền Bí' 
  },
  mint: { 
    hair: '#98FF98', 
    hairBow: '#FF69B4',
    skin: '#FFE4C4',
    dress: '#98FF98', 
    dressInner: '#3CB371',
    wings: '#E0FFFF',
    wingsInner: '#98FF98',
    shoes: '#3CB371',
    wand: '#FFD700',
    name: 'Tiên Xanh Thiên Nhiên' 
  },
};

type VariantKey = keyof typeof ANGEL_VARIANTS;

interface StarTrail {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
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

  useEffect(() => {
    isMobileRef.current = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWingPhase((prev) => (prev + 1) % 360);
    }, isHovering ? 20 : 40);
    return () => clearInterval(interval);
  }, [isHovering]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBodyPhase((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (trails.length === 0) return;
    const interval = setInterval(() => {
      setTrails((prev) => 
        prev.map((t) => ({ ...t, opacity: t.opacity - 0.06 })).filter((t) => t.opacity > 0)
      );
    }, 30);
    return () => clearInterval(interval);
  }, [trails.length]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const now = Date.now();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsMoving(true);
    setIsIdle(false);
    lastMoveRef.current = now;

    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (idleAnimationRef.current) clearTimeout(idleAnimationRef.current);

    idleTimeoutRef.current = setTimeout(() => {
      setIsMoving(false);
      setIsIdle(true);
    }, 3000);

    if (!isMobileRef.current && Math.random() > 0.4) {
      const newTrail: StarTrail = {
        id: trailIdRef.current++,
        x: e.clientX + (Math.random() - 0.5) * 30,
        y: e.clientY + (Math.random() - 0.5) * 30,
        opacity: 1,
        size: 8 + Math.random() * 8,
      };
      setTrails((prev) => [...prev.slice(-18), newTrail]);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handlePointerMove(e as unknown as PointerEvent);
  }, [handlePointerMove]);

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
  const wingFlap = Math.sin(wingPhase * 0.2) * (isHovering ? 15 : 10);
  const bodySway = Math.sin(bodyPhase * 0.06) * 2;
  const hairBounce = Math.sin(bodyPhase * 0.1) * 3;
  const dressFlow = Math.sin(bodyPhase * 0.08) * 4;
  const legKick = Math.sin(bodyPhase * 0.12) * 8;
  const wandStar = 0.6 + Math.sin(wingPhase * 0.15) * 0.4;

  const ui = (
    <>
      {/* Magical star trails */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: trail.x,
            top: trail.y,
            opacity: trail.opacity,
            transform: `translate(-50%, -50%) rotate(${trail.id * 45}deg)`,
          }}
        >
          <svg width={trail.size} height={trail.size} viewBox="0 0 16 16">
            <path
              d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z"
              fill="#FFD700"
              filter="drop-shadow(0 0 3px rgba(255, 215, 0, 0.9))"
            />
          </svg>
        </div>
      ))}

      {/* Cute Fairy Cursor */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: currentPos.x,
          top: currentPos.y,
          transform: `translate(-50%, -50%) rotate(${bodySway * 0.5}deg)`,
          transition: isIdle ? 'left 3s ease-in-out, top 3s ease-in-out' : 'none',
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
        }}
      >
        <svg width="70" height="85" viewBox="0 0 70 85" className="overflow-visible">
          <defs>
            {/* Gradients */}
            <radialGradient id="wingGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colors.wingsInner} stopOpacity="0.9" />
              <stop offset="100%" stopColor={colors.wings} stopOpacity="0.7" />
            </radialGradient>
            <radialGradient id="skinGradient" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFF5E6" />
              <stop offset="100%" stopColor={colors.skin} />
            </radialGradient>
            <linearGradient id="dressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.dress} />
              <stop offset="100%" stopColor={colors.dressInner} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Left Wing */}
          <g transform={`rotate(${-wingFlap}, 28, 35)`}>
            <ellipse cx="12" cy="30" rx="14" ry="22" fill="url(#wingGradient)" opacity="0.85" />
            <ellipse cx="12" cy="30" rx="10" ry="16" fill={colors.wingsInner} opacity="0.3" />
            <ellipse cx="10" cy="25" rx="3" ry="5" fill="white" opacity="0.5" />
          </g>

          {/* Right Wing */}
          <g transform={`rotate(${wingFlap}, 42, 35)`}>
            <ellipse cx="58" cy="30" rx="14" ry="22" fill="url(#wingGradient)" opacity="0.85" />
            <ellipse cx="58" cy="30" rx="10" ry="16" fill={colors.wingsInner} opacity="0.3" />
            <ellipse cx="60" cy="25" rx="3" ry="5" fill="white" opacity="0.5" />
          </g>

          {/* Hair back ponytail */}
          <path
            d={`M40 18 Q55 ${22 + hairBounce} 52 ${40 + hairBounce * 1.5} Q48 ${50 + hairBounce} 45 ${55 + hairBounce}`}
            fill={colors.hair}
            stroke={colors.hair}
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Petal Dress - Multiple layers like flower */}
          <g transform={`translate(0, ${dressFlow * 0.3})`}>
            {/* Back petals */}
            <ellipse cx="28" cy="58" rx="12" ry="8" fill={colors.dress} transform="rotate(-20, 28, 58)" opacity="0.8" />
            <ellipse cx="42" cy="58" rx="12" ry="8" fill={colors.dress} transform="rotate(20, 42, 58)" opacity="0.8" />
            
            {/* Middle layer */}
            <ellipse cx="22" cy="56" rx="10" ry="10" fill={colors.dressInner} transform={`rotate(${-15 + dressFlow}, 22, 56)`} />
            <ellipse cx="48" cy="56" rx="10" ry="10" fill={colors.dressInner} transform={`rotate(${15 - dressFlow}, 48, 56)`} />
            
            {/* Front petals */}
            <ellipse cx="35" cy="60" rx="14" ry="10" fill={colors.dress} />
            <ellipse cx="30" cy="58" rx="11" ry="9" fill={colors.dressInner} transform={`rotate(${-10 + dressFlow * 0.5}, 30, 58)`} opacity="0.9" />
            <ellipse cx="40" cy="58" rx="11" ry="9" fill={colors.dressInner} transform={`rotate(${10 - dressFlow * 0.5}, 40, 58)`} opacity="0.9" />

            {/* Dress body */}
            <path
              d="M28 38 Q35 36 42 38 L46 52 Q35 56 24 52 Z"
              fill={colors.dress}
            />
            <path
              d="M30 40 Q35 38 40 40 L42 50 Q35 52 28 50 Z"
              fill={colors.dressInner}
              opacity="0.6"
            />
          </g>

          {/* Legs */}
          <g>
            {/* Left leg */}
            <path
              d={`M30 60 Q28 ${68 + legKick * 0.3} 26 ${75 + legKick * 0.5}`}
              stroke={colors.skin}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="25" cy={76 + legKick * 0.5} rx="4" ry="2.5" fill={colors.shoes} />

            {/* Right leg */}
            <path
              d={`M40 60 Q42 ${68 - legKick * 0.5} 45 ${72 - legKick * 0.8}`}
              stroke={colors.skin}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="46" cy={73 - legKick * 0.8} rx="4" ry="2.5" fill={colors.shoes} />
          </g>

          {/* Arms */}
          {/* Left arm with wand */}
          <path
            d="M26 42 Q20 45 16 40"
            stroke={colors.skin}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Magic wand */}
          <line x1="16" y1="40" x2="6" y2="25" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round" />
          {/* Wand star */}
          <g filter="url(#glow)">
            <path
              d="M6 25 L7.5 21 L6 17 L10 19.5 L14 17 L12 21 L14 25 L10 22.5 L6 25Z"
              fill="#FFD700"
              opacity={wandStar}
              transform={`scale(${0.8 + wandStar * 0.3})`}
              style={{ transformOrigin: '10px 21px' }}
            />
            <circle cx="10" cy="21" r="2" fill="white" opacity={wandStar} />
          </g>
          {/* Sparkles from wand */}
          {[...Array(isHovering ? 5 : 3)].map((_, i) => (
            <circle
              key={i}
              cx={6 + Math.cos((wingPhase + i * 72) * 0.15) * (8 + i * 3)}
              cy={22 + Math.sin((wingPhase + i * 72) * 0.15) * (6 + i * 2)}
              r={1 + Math.sin((wingPhase + i * 50) * 0.2) * 0.5}
              fill="#FFD700"
              opacity={0.8 - i * 0.15}
            />
          ))}

          {/* Right arm */}
          <path
            d="M44 42 Q50 46 52 50"
            stroke={colors.skin}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="53" cy="51" r="3" fill={colors.skin} />

          {/* Head */}
          <circle cx="35" cy="24" r="14" fill="url(#skinGradient)" />

          {/* Hair */}
          <ellipse cx="35" cy="16" rx="12" ry="8" fill={colors.hair} />
          <path
            d={`M23 18 Q20 ${24 + hairBounce * 0.5} 22 ${32 + hairBounce}`}
            stroke={colors.hair}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M47 18 Q50 ${24 - hairBounce * 0.5} 48 ${32 - hairBounce}`}
            stroke={colors.hair}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Hair bow */}
          <g transform="translate(45, 12)">
            <ellipse cx="-3" cy="0" rx="4" ry="3" fill={colors.hairBow} transform="rotate(-30)" />
            <ellipse cx="3" cy="0" rx="4" ry="3" fill={colors.hairBow} transform="rotate(30)" />
            <circle cx="0" cy="0" r="2" fill={colors.hairBow} />
          </g>

          {/* Face - Big cute eyes */}
          <g>
            {/* Eyes white */}
            <ellipse cx="30" cy="24" rx="4" ry="4.5" fill="white" />
            <ellipse cx="40" cy="24" rx="4" ry="4.5" fill="white" />
            {/* Pupils */}
            <ellipse cx="31" cy="25" rx="2.5" ry="3" fill="#2D1B07" />
            <ellipse cx="41" cy="25" rx="2.5" ry="3" fill="#2D1B07" />
            {/* Eye shine */}
            <circle cx="32" cy="23" r="1.2" fill="white" />
            <circle cx="42" cy="23" r="1.2" fill="white" />
            <circle cx="30" cy="26" r="0.6" fill="white" />
            <circle cx="40" cy="26" r="0.6" fill="white" />
          </g>

          {/* Eyebrows */}
          <path d="M27 19 Q30 18 33 19" stroke={colors.hair} strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M37 19 Q40 18 43 19" stroke={colors.hair} strokeWidth="1" fill="none" opacity="0.5" />

          {/* Blush */}
          <ellipse cx="26" cy="28" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.5" />
          <ellipse cx="44" cy="28" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.5" />

          {/* Smile */}
          <path 
            d={isHovering ? "M32 31 Q35 34 38 31" : "M32 31 Q35 33 38 31"} 
            stroke="#E88B8B" 
            strokeWidth="1.5" 
            fill="none" 
            strokeLinecap="round"
          />

          {/* Floating sparkles around fairy */}
          {!isMobileRef.current && [...Array(5)].map((_, i) => (
            <g key={i}>
              <circle
                cx={35 + Math.cos((bodyPhase + i * 72) * 0.04) * 32}
                cy={40 + Math.sin((bodyPhase + i * 72) * 0.04) * 25}
                r={1 + Math.sin((bodyPhase + i * 60) * 0.08) * 0.5}
                fill="#FFD700"
                opacity={0.4 + Math.sin((bodyPhase + i * 45) * 0.06) * 0.3}
              />
            </g>
          ))}
        </svg>
      </div>
    </>
  );

  return createPortal(ui, document.body);
};

export const ANGEL_VARIANTS_LIST = ANGEL_VARIANTS;
export type { VariantKey };
