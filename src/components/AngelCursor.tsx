import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// 4 color variants - Elegant fairy style
const ANGEL_VARIANTS = {
  default: { 
    hair: '#5C4033', 
    hairHighlight: '#8B6914',
    hairBow: '#FF69B4',
    skin: '#FFF0E6',
    blush: '#FFB6C1',
    dress: '#FFD1DC', 
    dressInner: '#FF69B4',
    dressShine: '#FFFFFF',
    wings: '#FFE4EC',
    wingsInner: '#FFB6C1',
    wingsShine: '#FFFFFF',
    shoes: '#FF69B4',
    wand: '#FFD700',
    name: 'Tiên Hồng Dịu Dàng' 
  },
  pink: { 
    hair: '#D35400', 
    hairHighlight: '#F39C12',
    hairBow: '#27AE60',
    skin: '#FFF0E6',
    blush: '#FFCBA4',
    dress: '#F7DC6F', 
    dressInner: '#F39C12',
    dressShine: '#FFFACD',
    wings: '#FFFACD',
    wingsInner: '#F7DC6F',
    wingsShine: '#FFFFFF',
    shoes: '#F39C12',
    wand: '#FFD700',
    name: 'Tiên Vàng Ánh Nắng' 
  },
  golden: { 
    hair: '#F4D03F', 
    hairHighlight: '#F7DC6F',
    hairBow: '#85C1E9',
    skin: '#FFF0E6',
    blush: '#E8DAEF',
    dress: '#D7BDE2', 
    dressInner: '#AF7AC5',
    dressShine: '#F5EEF8',
    wings: '#EBE2F5',
    wingsInner: '#D7BDE2',
    wingsShine: '#FFFFFF',
    shoes: '#AF7AC5',
    wand: '#FFD700',
    name: 'Tiên Tím Mộng Mơ' 
  },
  mint: { 
    hair: '#76D7C4', 
    hairHighlight: '#A3E4D7',
    hairBow: '#F1948A',
    skin: '#FFF0E6',
    blush: '#ABEBC6',
    dress: '#ABEBC6', 
    dressInner: '#58D68D',
    dressShine: '#EAFAF1',
    wings: '#D5F5E3',
    wingsInner: '#ABEBC6',
    wingsShine: '#FFFFFF',
    shoes: '#58D68D',
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
  rotation: number;
}

interface AngelCursorProps {
  variant?: VariantKey;
}

export const AngelCursor = ({ variant = 'default' }: AngelCursorProps) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trails, setTrails] = useState<StarTrail[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [idlePosition, setIdlePosition] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState(0);
  
  const trailIdRef = useRef(0);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idleAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const isMobileRef = useRef(false);

  const colors = ANGEL_VARIANTS[variant];

  useEffect(() => {
    isMobileRef.current = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 360);
    }, isHovering ? 25 : 45);
    return () => clearInterval(interval);
  }, [isHovering]);

  useEffect(() => {
    if (trails.length === 0) return;
    const interval = setInterval(() => {
      setTrails((prev) => 
        prev.map((t) => ({ ...t, opacity: t.opacity - 0.05 })).filter((t) => t.opacity > 0)
      );
    }, 25);
    return () => clearInterval(interval);
  }, [trails.length]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    setIsIdle(false);

    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (idleAnimationRef.current) clearTimeout(idleAnimationRef.current);

    idleTimeoutRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 3000);

    if (!isMobileRef.current && Math.random() > 0.5) {
      const newTrail: StarTrail = {
        id: trailIdRef.current++,
        x: e.clientX + (Math.random() - 0.5) * 25,
        y: e.clientY + (Math.random() - 0.5) * 25,
        opacity: 1,
        size: 6 + Math.random() * 6,
        rotation: Math.random() * 360,
      };
      setTrails((prev) => [...prev.slice(-15), newTrail]);
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
      const newX = Math.random() * (window.innerWidth - 80) + 40;
      const newY = Math.random() * (window.innerHeight - 80) + 40;
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
  
  // Smooth animations
  const wingFlap = Math.sin(phase * 0.18) * (isHovering ? 12 : 8);
  const floatY = Math.sin(phase * 0.05) * 2;
  const bodyTilt = Math.sin(phase * 0.04) * 1.5;
  const hairFlow = Math.sin(phase * 0.08) * 4;
  const dressWave = Math.sin(phase * 0.06) * 3;
  const legSwing = Math.sin(phase * 0.1) * 6;
  const wandGlow = 0.7 + Math.sin(phase * 0.12) * 0.3;

  const ui = (
    <>
      {/* Magical sparkle trails */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: trail.x,
            top: trail.y,
            opacity: trail.opacity,
            transform: `translate(-50%, -50%) rotate(${trail.rotation}deg) scale(${trail.opacity})`,
          }}
        >
          <svg width={trail.size} height={trail.size} viewBox="0 0 12 12">
            <path
              d="M6 0L7 4.5L12 6L7 7.5L6 12L5 7.5L0 6L5 4.5L6 0Z"
              fill={colors.wand}
              filter="drop-shadow(0 0 2px rgba(255, 215, 0, 0.8))"
            />
          </svg>
        </div>
      ))}

      {/* Elegant Fairy Cursor */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: currentPos.x,
          top: currentPos.y,
          transform: `translate(-50%, -50%) translateY(${floatY}px) rotate(${bodyTilt}deg)`,
          transition: isIdle ? 'left 3.5s ease-in-out, top 3.5s ease-in-out' : 'none',
        }}
      >
        <svg width="60" height="75" viewBox="0 0 60 75" className="overflow-visible" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.1))' }}>
          <defs>
            <radialGradient id="fairyWingL" cx="70%" cy="30%" r="70%">
              <stop offset="0%" stopColor={colors.wingsShine} stopOpacity="0.9" />
              <stop offset="40%" stopColor={colors.wingsInner} stopOpacity="0.7" />
              <stop offset="100%" stopColor={colors.wings} stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id="fairyWingR" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor={colors.wingsShine} stopOpacity="0.9" />
              <stop offset="40%" stopColor={colors.wingsInner} stopOpacity="0.7" />
              <stop offset="100%" stopColor={colors.wings} stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id="fairySkin" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor={colors.skin} />
            </radialGradient>
            <linearGradient id="fairyDress" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.dressShine} stopOpacity="0.8" />
              <stop offset="30%" stopColor={colors.dress} />
              <stop offset="100%" stopColor={colors.dressInner} />
            </linearGradient>
            <linearGradient id="fairyHair" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.hairHighlight} />
              <stop offset="100%" stopColor={colors.hair} />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="wandGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Delicate Wings - Left */}
          <g transform={`rotate(${-wingFlap}, 24, 32)`} style={{ transformOrigin: '24px 32px' }}>
            <ellipse cx="10" cy="28" rx="12" ry="18" fill="url(#fairyWingL)" />
            <ellipse cx="8" cy="24" rx="6" ry="10" fill={colors.wingsShine} opacity="0.4" />
            <path d="M6 20 Q8 28 6 36" stroke={colors.wingsInner} strokeWidth="0.5" fill="none" opacity="0.5" />
            <path d="M10 18 Q12 28 10 38" stroke={colors.wingsInner} strokeWidth="0.5" fill="none" opacity="0.5" />
          </g>

          {/* Delicate Wings - Right */}
          <g transform={`rotate(${wingFlap}, 36, 32)`} style={{ transformOrigin: '36px 32px' }}>
            <ellipse cx="50" cy="28" rx="12" ry="18" fill="url(#fairyWingR)" />
            <ellipse cx="52" cy="24" rx="6" ry="10" fill={colors.wingsShine} opacity="0.4" />
            <path d="M54 20 Q52 28 54 36" stroke={colors.wingsInner} strokeWidth="0.5" fill="none" opacity="0.5" />
            <path d="M50 18 Q48 28 50 38" stroke={colors.wingsInner} strokeWidth="0.5" fill="none" opacity="0.5" />
          </g>

          {/* Long flowing hair - back strands */}
          <path
            d={`M35 14 Q42 ${20 + hairFlow * 0.5} 44 ${35 + hairFlow} Q45 ${48 + hairFlow * 0.8} 42 ${58 + hairFlow * 0.5}`}
            stroke="url(#fairyHair)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d={`M38 12 Q48 ${18 + hairFlow * 0.6} 50 ${32 + hairFlow * 1.2} Q51 ${45 + hairFlow} 48 ${55 + hairFlow * 0.6}`}
            stroke="url(#fairyHair)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Elegant flowing dress */}
          <g>
            {/* Dress skirt layers - flowing petals */}
            <ellipse 
              cx={24 - dressWave * 0.3} 
              cy="52" 
              rx="8" 
              ry="10" 
              fill={colors.dress}
              transform={`rotate(${-12 + dressWave}, ${24 - dressWave * 0.3}, 52)`}
              opacity="0.9"
            />
            <ellipse 
              cx={36 + dressWave * 0.3} 
              cy="52" 
              rx="8" 
              ry="10" 
              fill={colors.dress}
              transform={`rotate(${12 - dressWave}, ${36 + dressWave * 0.3}, 52)`}
              opacity="0.9"
            />
            <ellipse cx="30" cy="54" rx="10" ry="12" fill={colors.dressInner} opacity="0.85" />
            <ellipse cx="30" cy="52" rx="8" ry="10" fill={colors.dress} />
            
            {/* Dress bodice */}
            <path
              d="M24 32 Q30 30 36 32 L38 46 Q30 50 22 46 Z"
              fill="url(#fairyDress)"
            />
            {/* Dress shine */}
            <path
              d="M26 34 Q30 32 32 44"
              stroke={colors.dressShine}
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
          </g>

          {/* Slender legs */}
          <path
            d={`M26 54 Q24 ${60 + legSwing * 0.2} 22 ${66 + legSwing * 0.4}`}
            stroke={colors.skin}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx={21} cy={67 + legSwing * 0.4} rx="3" ry="1.8" fill={colors.shoes} />
          
          <path
            d={`M34 54 Q36 ${60 - legSwing * 0.3} 38 ${64 - legSwing * 0.5}`}
            stroke={colors.skin}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx={39} cy={65 - legSwing * 0.5} rx="3" ry="1.8" fill={colors.shoes} />

          {/* Delicate arms */}
          <path
            d="M23 35 Q18 38 14 35"
            stroke={colors.skin}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Magic wand */}
          <g filter="url(#softGlow)">
            <line x1="14" y1="35" x2="4" y2="22" stroke="#C4A35A" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="14" y1="35" x2="4" y2="22" stroke="#8B7355" strokeWidth="1" strokeLinecap="round" />
          </g>
          
          {/* Wand star with glow */}
          <g filter="url(#wandGlow)">
            <path
              d="M4 22 L5.5 18.5 L4 15 L7.5 17 L11 15 L9 18.5 L11 22 L7.5 20 L4 22Z"
              fill="#FFD700"
              opacity={wandGlow}
            />
            <circle cx="7.5" cy="18.5" r="1.5" fill="#FFFACD" opacity={wandGlow} />
          </g>
          
          {/* Wand sparkles */}
          {[...Array(isHovering ? 6 : 4)].map((_, i) => (
            <circle
              key={i}
              cx={4 + Math.cos((phase + i * 60) * 0.12) * (6 + i * 2.5)}
              cy={20 + Math.sin((phase + i * 60) * 0.12) * (5 + i * 2)}
              r={0.8 + Math.sin((phase + i * 40) * 0.15) * 0.4}
              fill="#FFD700"
              opacity={0.9 - i * 0.12}
            />
          ))}

          {/* Right arm */}
          <path
            d="M37 35 Q42 38 44 42"
            stroke={colors.skin}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="45" cy="43" r="2" fill={colors.skin} />

          {/* Lovely face */}
          <ellipse cx="30" cy="20" rx="10" ry="11" fill="url(#fairySkin)" />

          {/* Hair top and sides */}
          <ellipse cx="30" cy="13" rx="9" ry="5" fill="url(#fairyHair)" />
          <path
            d={`M21 14 Q18 ${18 + hairFlow * 0.4} 17 ${26 + hairFlow * 0.6} Q16 ${32 + hairFlow} 18 ${38 + hairFlow * 0.5}`}
            stroke="url(#fairyHair)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M24 12 Q20 ${16 + hairFlow * 0.3} 18 ${22 + hairFlow * 0.5}`}
            stroke="url(#fairyHair)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Cute hair bow */}
          <g transform="translate(40, 10)">
            <ellipse cx="-2.5" cy="0" rx="3.5" ry="2.5" fill={colors.hairBow} transform="rotate(-25)" />
            <ellipse cx="2.5" cy="0" rx="3.5" ry="2.5" fill={colors.hairBow} transform="rotate(25)" />
            <circle cx="0" cy="0" r="1.8" fill={colors.hairBow} />
            <ellipse cx="-2" cy="-0.5" rx="1" ry="0.6" fill="white" opacity="0.4" />
            <ellipse cx="2" cy="-0.5" rx="1" ry="0.6" fill="white" opacity="0.4" />
          </g>

          {/* Beautiful big eyes */}
          <g>
            {/* Eye whites with soft gradient */}
            <ellipse cx="26" cy="20" rx="3.5" ry="4" fill="white" />
            <ellipse cx="34" cy="20" rx="3.5" ry="4" fill="white" />
            
            {/* Irises */}
            <ellipse cx="26.5" cy="21" rx="2.2" ry="2.8" fill="#3D2914" />
            <ellipse cx="34.5" cy="21" rx="2.2" ry="2.8" fill="#3D2914" />
            
            {/* Pupils */}
            <ellipse cx="26.8" cy="21.5" rx="1.2" ry="1.5" fill="#1A0F07" />
            <ellipse cx="34.8" cy="21.5" rx="1.2" ry="1.5" fill="#1A0F07" />
            
            {/* Eye sparkles - multiple for anime effect */}
            <circle cx="27.5" cy="19.5" r="1" fill="white" />
            <circle cx="35.5" cy="19.5" r="1" fill="white" />
            <circle cx="25.5" cy="22" r="0.5" fill="white" />
            <circle cx="33.5" cy="22" r="0.5" fill="white" />
            
            {/* Subtle eyelashes */}
            <path d="M22.5 18 Q24 17.5 25 18" stroke={colors.hair} strokeWidth="0.6" fill="none" opacity="0.4" />
            <path d="M35 18 Q36 17.5 37.5 18" stroke={colors.hair} strokeWidth="0.6" fill="none" opacity="0.4" />
          </g>

          {/* Rosy blush */}
          <ellipse cx="22.5" cy="23" rx="2.5" ry="1.2" fill={colors.blush} opacity="0.45" />
          <ellipse cx="37.5" cy="23" rx="2.5" ry="1.2" fill={colors.blush} opacity="0.45" />

          {/* Sweet smile */}
          <path 
            d={isHovering ? "M27 26 Q30 29 33 26" : "M27 26 Q30 28 33 26"} 
            stroke="#E8A0A0" 
            strokeWidth="1.2" 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* Tiny nose */}
          <path d="M30 22.5 L30 24" stroke={colors.skin} strokeWidth="0.8" opacity="0.3" />

          {/* Floating fairy dust around */}
          {!isMobileRef.current && [...Array(6)].map((_, i) => (
            <circle
              key={i}
              cx={30 + Math.cos((phase + i * 60) * 0.035) * 28}
              cy={35 + Math.sin((phase + i * 60) * 0.035) * 22}
              r={0.6 + Math.sin((phase + i * 50) * 0.07) * 0.3}
              fill="#FFD700"
              opacity={0.5 + Math.sin((phase + i * 40) * 0.05) * 0.3}
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
