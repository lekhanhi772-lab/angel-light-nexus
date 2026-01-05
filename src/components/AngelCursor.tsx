import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Elegant fairy angel color variants - classic painting style
const ANGEL_VARIANTS = {
  default: { 
    // Golden Angel - warm, radiant
    hair: '#8B6914',
    hairHighlight: '#D4A84B',
    hairGlow: '#F5D78E',
    skin: '#FDE8D0',
    skinShadow: '#E8C9A8',
    cheek: '#FFCBC4',
    dress: '#FFFFFF', 
    dressLight: '#FFFEF5',
    dressAccent: '#FFD700',
    dressShadow: '#F0E6D3',
    ribbon: '#FFD700',
    wings: '#FFF8E7',
    wingsLight: '#FFFFFF',
    wingsGlow: '#FFE4B5',
    wingsEdge: '#FFD700',
    halo: '#FFD700',
    eyes: '#5D4E37',
    eyeHighlight: '#8B7355',
    lips: '#E8A0A0',
    wand: '#FFD700',
    sparkle: '#FFFACD',
    name: 'Thiên Thần Ánh Vàng' 
  },
  pink: { 
    // Rose Fairy - soft, dreamy
    hair: '#6B4423',
    hairHighlight: '#9B7B5B',
    hairGlow: '#C4A882',
    skin: '#FDE8D0',
    skinShadow: '#E8C9A8',
    cheek: '#FFB6C1',
    dress: '#FFF0F5', 
    dressLight: '#FFFFFF',
    dressAccent: '#FFB6C1',
    dressShadow: '#F5E0E5',
    ribbon: '#FF69B4',
    wings: '#FFE4EC',
    wingsLight: '#FFF5F8',
    wingsGlow: '#FFD1DC',
    wingsEdge: '#FF69B4',
    halo: '#FF69B4',
    eyes: '#5D4E37',
    eyeHighlight: '#8B7355',
    lips: '#E88A9A',
    wand: '#FF69B4',
    sparkle: '#FFE4EC',
    name: 'Nàng Tiên Hồng' 
  },
  golden: { 
    // Celestial Gold - majestic
    hair: '#C4A84B',
    hairHighlight: '#E8D078',
    hairGlow: '#FFF0B5',
    skin: '#FDE8D0',
    skinShadow: '#E8C9A8',
    cheek: '#FFDAB9',
    dress: '#FFFEF5', 
    dressLight: '#FFFFFF',
    dressAccent: '#FFD700',
    dressShadow: '#F5EED8',
    ribbon: '#FFA500',
    wings: '#FFF8DC',
    wingsLight: '#FFFFFF',
    wingsGlow: '#FFE4B5',
    wingsEdge: '#FFA500',
    halo: '#FFD700',
    eyes: '#5D4E37',
    eyeHighlight: '#8B7355',
    lips: '#DBA090',
    wand: '#FFD700',
    sparkle: '#FFFACD',
    name: 'Thiên Thần Hoàng Kim' 
  },
  mint: { 
    // Forest Fairy - ethereal
    hair: '#4A6B5B',
    hairHighlight: '#7A9B8B',
    hairGlow: '#A8C5B5',
    skin: '#FDE8D0',
    skinShadow: '#E8C9A8',
    cheek: '#D4EBE4',
    dress: '#F0FFFF', 
    dressLight: '#FFFFFF',
    dressAccent: '#40E0D0',
    dressShadow: '#E0F5F0',
    ribbon: '#40E0D0',
    wings: '#E8FFF8',
    wingsLight: '#FFFFFF',
    wingsGlow: '#B8F0E8',
    wingsEdge: '#20B2AA',
    halo: '#40E0D0',
    eyes: '#3D5E4E',
    eyeHighlight: '#5B8B7B',
    lips: '#C8A898',
    wand: '#40E0D0',
    sparkle: '#E8FFF8',
    name: 'Nàng Tiên Rừng Xanh' 
  },
};

export type VariantKey = keyof typeof ANGEL_VARIANTS;

interface StarTrail {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
  type: 'star' | 'sparkle';
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
    }, isHovering ? 25 : 40);
    return () => clearInterval(interval);
  }, [isHovering]);

  useEffect(() => {
    if (trails.length === 0) return;
    const interval = setInterval(() => {
      setTrails((prev) => 
        prev.map((t) => ({ ...t, opacity: t.opacity - 0.04 })).filter((t) => t.opacity > 0)
      );
    }, 30);
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

    if (!isMobileRef.current && Math.random() > 0.6) {
      const newTrail: StarTrail = {
        id: trailIdRef.current++,
        x: e.clientX + (Math.random() - 0.5) * 25,
        y: e.clientY + (Math.random() - 0.5) * 25,
        opacity: 1,
        size: 6 + Math.random() * 6,
        type: Math.random() > 0.5 ? 'star' : 'sparkle',
      };
      setTrails((prev) => [...prev.slice(-12), newTrail]);
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
  
  // Elegant, gentle animations
  const floatY = Math.sin(phase * 0.05) * 2;
  const hairFlow = Math.sin(phase * 0.08) * 2;
  const dressFlow = Math.sin(phase * 0.06) * 3;
  const wingFlutter = Math.sin(phase * 0.12) * 8;
  const haloGlow = 0.7 + Math.sin(phase * 0.08) * 0.25;
  const wandSparkle = Math.sin(phase * 0.2) * 0.3 + 0.7;
  const blinkPhase = phase % 150;
  const isBlinking = blinkPhase < 4;
  const scale = isHovering ? 1.08 : 1;

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
            transform: `translate(-50%, -50%) scale(${trail.opacity}) rotate(${trail.id * 45}deg)`,
          }}
        >
          <svg width={trail.size} height={trail.size} viewBox="0 0 16 16">
            {trail.type === 'star' ? (
              <path
                d="M8 0 L9.5 6 L16 8 L9.5 10 L8 16 L6.5 10 L0 8 L6.5 6 Z"
                fill={colors.sparkle}
                opacity="0.9"
              />
            ) : (
              <circle cx="8" cy="8" r="4" fill={colors.sparkle} opacity="0.8" />
            )}
          </svg>
        </div>
      ))}

      {/* Elegant Fairy Angel */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: currentPos.x,
          top: currentPos.y,
          transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${scale})`,
          transition: isIdle ? 'left 3s ease-in-out, top 3s ease-in-out' : 'transform 0.2s ease-out',
        }}
      >
        <svg width="70" height="90" viewBox="0 0 70 90" className="overflow-visible" style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))' }}>
          <defs>
            {/* Skin gradient - soft, natural */}
            <radialGradient id="fairySkin" cx="45%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFF5EB" />
              <stop offset="50%" stopColor={colors.skin} />
              <stop offset="100%" stopColor={colors.skinShadow} />
            </radialGradient>
            
            {/* Hair gradient - flowing, silky */}
            <linearGradient id="fairyHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.hairGlow} />
              <stop offset="40%" stopColor={colors.hairHighlight} />
              <stop offset="100%" stopColor={colors.hair} />
            </linearGradient>
            
            {/* Dress gradient - soft, flowing fabric */}
            <linearGradient id="fairyDress" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.dressLight} />
              <stop offset="40%" stopColor={colors.dress} />
              <stop offset="100%" stopColor={colors.dressShadow} />
            </linearGradient>
            
            {/* Wing gradient - ethereal, translucent */}
            <radialGradient id="wingGrad" cx="30%" cy="30%" r="80%">
              <stop offset="0%" stopColor={colors.wingsLight} stopOpacity="0.95" />
              <stop offset="60%" stopColor={colors.wingsGlow} stopOpacity="0.7" />
              <stop offset="100%" stopColor={colors.wings} stopOpacity="0.4" />
            </radialGradient>
            
            {/* Halo gradient */}
            <linearGradient id="haloGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.halo} stopOpacity="0.2" />
              <stop offset="50%" stopColor={colors.halo} stopOpacity="0.85" />
              <stop offset="100%" stopColor={colors.halo} stopOpacity="0.2" />
            </linearGradient>
            
            {/* Soft glow filter */}
            <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Sparkle glow */}
            <filter id="sparkleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Halo - soft golden ring */}
          <ellipse 
            cx="35" cy="5" rx="12" ry="3.5" 
            fill="none" 
            stroke="url(#haloGrad)" 
            strokeWidth="2.5"
            opacity={haloGlow}
            filter="url(#softGlow)"
          />

          {/* Wings - Left - elegant, detailed feathers */}
          <g transform={`rotate(${-wingFlutter}, 25, 42)`} filter="url(#softGlow)">
            {/* Main wing shape */}
            <path
              d="M25 42 Q5 25 2 42 Q5 58 15 62 Q22 58 25 48 Z"
              fill="url(#wingGrad)"
            />
            {/* Wing veins/details */}
            <path d="M23 44 Q14 36 6 42" stroke={colors.wingsEdge} strokeWidth="0.6" fill="none" opacity="0.4" />
            <path d="M22 48 Q15 44 8 50" stroke={colors.wingsEdge} strokeWidth="0.5" fill="none" opacity="0.35" />
            <path d="M20 52 Q14 50 10 56" stroke={colors.wingsEdge} strokeWidth="0.4" fill="none" opacity="0.3" />
            {/* Wing edge highlight */}
            <path d="M25 42 Q5 25 2 42" stroke={colors.wingsEdge} strokeWidth="0.8" fill="none" opacity="0.5" />
          </g>
          
          {/* Wings - Right */}
          <g transform={`rotate(${wingFlutter}, 45, 42)`} filter="url(#softGlow)">
            <path
              d="M45 42 Q65 25 68 42 Q65 58 55 62 Q48 58 45 48 Z"
              fill="url(#wingGrad)"
            />
            <path d="M47 44 Q56 36 64 42" stroke={colors.wingsEdge} strokeWidth="0.6" fill="none" opacity="0.4" />
            <path d="M48 48 Q55 44 62 50" stroke={colors.wingsEdge} strokeWidth="0.5" fill="none" opacity="0.35" />
            <path d="M50 52 Q56 50 60 56" stroke={colors.wingsEdge} strokeWidth="0.4" fill="none" opacity="0.3" />
            <path d="M45 42 Q65 25 68 42" stroke={colors.wingsEdge} strokeWidth="0.8" fill="none" opacity="0.5" />
          </g>

          {/* Hair - Back volume */}
          <ellipse cx="35" cy="18" rx="16" ry="14" fill="url(#fairyHair)" />
          
          {/* Flowing hair strands - left side */}
          <path
            d={`M20 20 Q15 ${32 + hairFlow} 18 ${48 + hairFlow * 1.2} Q20 ${58 + hairFlow} 24 ${65 + hairFlow * 0.8}`}
            fill="url(#fairyHair)"
          />
          <path
            d={`M23 22 Q18 ${35 + hairFlow * 0.8} 20 ${50 + hairFlow} Q22 ${60 + hairFlow * 0.6} 26 ${68 + hairFlow * 0.5}`}
            fill="url(#fairyHair)"
          />
          <path
            d={`M26 24 Q22 ${38 + hairFlow * 0.6} 24 ${52 + hairFlow * 0.8}`}
            fill="url(#fairyHair)"
          />
          
          {/* Flowing hair strands - right side */}
          <path
            d={`M50 20 Q55 ${32 - hairFlow} 52 ${48 - hairFlow * 1.2} Q50 ${58 - hairFlow} 46 ${65 - hairFlow * 0.8}`}
            fill="url(#fairyHair)"
          />
          <path
            d={`M47 22 Q52 ${35 - hairFlow * 0.8} 50 ${50 - hairFlow} Q48 ${60 - hairFlow * 0.6} 44 ${68 - hairFlow * 0.5}`}
            fill="url(#fairyHair)"
          />
          
          {/* Hair highlights */}
          <path
            d={`M22 25 Q17 ${40 + hairFlow * 0.5} 20 ${55 + hairFlow * 0.3}`}
            stroke={colors.hairGlow}
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
          <path
            d={`M48 25 Q53 ${40 - hairFlow * 0.5} 50 ${55 - hairFlow * 0.3}`}
            stroke={colors.hairGlow}
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />

          {/* Face - oval, delicate proportions */}
          <ellipse
            cx="35"
            cy="25"
            rx="11"
            ry="10"
            fill="url(#fairySkin)"
          />
          
          {/* Soft cheek blush */}
          <ellipse cx="27" cy="27" rx="3" ry="1.8" fill={colors.cheek} opacity="0.45" />
          <ellipse cx="43" cy="27" rx="3" ry="1.8" fill={colors.cheek} opacity="0.45" />
          
          {/* Eyes - natural, expressive (not anime) */}
          {isBlinking ? (
            <>
              {/* Closed eyes - gentle curves */}
              <path d="M28 24 Q31 22 34 24" stroke={colors.eyes} strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M36 24 Q39 22 42 24" stroke={colors.eyes} strokeWidth="1" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Left eye - almond shaped, natural */}
              <ellipse cx="31" cy="23.5" rx="2.5" ry="2" fill="#FFFFFF" />
              <ellipse cx="31.2" cy="23.6" rx="1.6" ry="1.4" fill={colors.eyes} />
              <circle cx="31.5" cy="23.2" r="0.5" fill="#FFFFFF" />
              {/* Eyelid line */}
              <path d="M28 23 Q31 21.5 34 23" stroke={colors.hair} strokeWidth="0.6" fill="none" opacity="0.6" />
              {/* Lower lash line */}
              <path d="M28.5 24.5 Q31 25 33.5 24.5" stroke={colors.eyes} strokeWidth="0.3" fill="none" opacity="0.3" />
              
              {/* Right eye */}
              <ellipse cx="39" cy="23.5" rx="2.5" ry="2" fill="#FFFFFF" />
              <ellipse cx="39.2" cy="23.6" rx="1.6" ry="1.4" fill={colors.eyes} />
              <circle cx="39.5" cy="23.2" r="0.5" fill="#FFFFFF" />
              <path d="M36 23 Q39 21.5 42 23" stroke={colors.hair} strokeWidth="0.6" fill="none" opacity="0.6" />
              <path d="M36.5 24.5 Q39 25 41.5 24.5" stroke={colors.eyes} strokeWidth="0.3" fill="none" opacity="0.3" />
            </>
          )}
          
          {/* Eyebrows - delicate, natural arch */}
          <path d="M27 20.5 Q31 19.5 34 20.5" stroke={colors.hair} strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d="M36 20.5 Q39 19.5 43 20.5" stroke={colors.hair} strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.5" />
          
          {/* Nose - subtle, delicate */}
          <path d="M35 25 L35.5 27" stroke={colors.skinShadow} strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.5" />
          
          {/* Lips - soft, natural smile */}
          <path 
            d={isHovering 
              ? "M32 30 Q35 32 38 30" 
              : "M32.5 30 Q35 31 37.5 30"
            } 
            stroke={colors.lips} 
            strokeWidth="1.2" 
            fill="none" 
            strokeLinecap="round" 
          />
          {/* Upper lip definition */}
          <path d="M33 29.8 Q35 29 37 29.8" stroke={colors.lips} strokeWidth="0.4" fill="none" opacity="0.5" />

          {/* Hair bangs - soft, framing face */}
          <path
            d="M22 15 Q28 8 35 10 Q42 8 48 15"
            fill="url(#fairyHair)"
          />
          {/* Side bangs */}
          <path d="M22 15 Q20 20 22 26" fill="url(#fairyHair)" />
          <path d="M25 14 Q23 18 24 24" fill="url(#fairyHair)" />
          <path d="M48 15 Q50 20 48 26" fill="url(#fairyHair)" />
          <path d="M45 14 Q47 18 46 24" fill="url(#fairyHair)" />
          {/* Center parted bangs */}
          <path d="M30 12 Q33 10 35 11 Q37 10 40 12 Q38 16 35 15 Q32 16 30 12" fill="url(#fairyHair)" />

          {/* Neck */}
          <path d="M32 34 L32 38 Q35 39 38 38 L38 34" fill="url(#fairySkin)" />

          {/* Dress - flowing, elegant */}
          {/* Main dress body */}
          <path
            d={`M28 38 Q35 36 42 38 L${48 + dressFlow * 0.4} 55 Q35 58 ${22 - dressFlow * 0.4} 55 Z`}
            fill="url(#fairyDress)"
          />
          
          {/* Dress ruffles/layers */}
          <path
            d={`M${20 - dressFlow * 0.6} 55 Q28 58 35 56 Q42 58 ${50 + dressFlow * 0.6} 55 
               Q${54 + dressFlow * 0.8} 65 ${48 + dressFlow * 0.5} 70 
               Q35 74 ${22 - dressFlow * 0.5} 70 
               Q${16 - dressFlow * 0.8} 65 ${20 - dressFlow * 0.6} 55 Z`}
            fill="url(#fairyDress)"
          />
          
          {/* Bottom ruffle */}
          <path
            d={`M${18 - dressFlow * 0.8} 70 Q28 74 35 72 Q42 74 ${52 + dressFlow * 0.8} 70 
               Q${56 + dressFlow} 78 ${50 + dressFlow * 0.6} 82 
               Q35 86 ${20 - dressFlow * 0.6} 82 
               Q${14 - dressFlow} 78 ${18 - dressFlow * 0.8} 70 Z`}
            fill="url(#fairyDress)"
          />
          
          {/* Dress details - fold lines */}
          <path d={`M28 45 Q30 55 28 65`} stroke={colors.dressShadow} strokeWidth="0.5" fill="none" opacity="0.4" />
          <path d={`M35 42 Q35 58 35 75`} stroke={colors.dressShadow} strokeWidth="0.5" fill="none" opacity="0.35" />
          <path d={`M42 45 Q40 55 42 65`} stroke={colors.dressShadow} strokeWidth="0.5" fill="none" opacity="0.4" />
          
          {/* Dress neckline decoration */}
          <path d="M30 38 Q35 40 40 38" stroke={colors.dressAccent} strokeWidth="1" fill="none" opacity="0.7" />
          
          {/* Ribbon belt */}
          <ellipse cx="35" cy="45" rx="8" ry="2" fill={colors.ribbon} opacity="0.8" />
          <circle cx="35" cy="45" r="2" fill={colors.dressLight} opacity="0.9" />

          {/* Arms - graceful pose */}
          {/* Left arm - down, slightly out */}
          <path
            d="M28 40 Q20 50 16 58"
            stroke="url(#fairySkin)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Left hand */}
          <ellipse cx="15" cy="59" rx="2.5" ry="2" fill="url(#fairySkin)" />
          
          {/* Right arm - holding wand up */}
          <path
            d="M42 40 Q50 35 55 28"
            stroke="url(#fairySkin)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Right hand */}
          <ellipse cx="56" cy="27" rx="2.5" ry="2" fill="url(#fairySkin)" transform="rotate(30, 56, 27)" />
          
          {/* Magic Wand */}
          <g filter="url(#sparkleGlow)">
            <line x1="56" y1="26" x2="62" y2="14" stroke={colors.wand} strokeWidth="1.5" strokeLinecap="round" />
            {/* Wand star */}
            <path
              d="M62 10 L63 13 L66 14 L63 15 L62 18 L61 15 L58 14 L61 13 Z"
              fill={colors.wand}
              opacity={wandSparkle}
            />
            {/* Sparkles around wand */}
            <circle cx="60" cy="12" r="1" fill={colors.sparkle} opacity={wandSparkle * 0.8} />
            <circle cx="64" cy="16" r="0.8" fill={colors.sparkle} opacity={wandSparkle * 0.6} />
            <circle cx="58" cy="16" r="0.6" fill={colors.sparkle} opacity={wandSparkle * 0.7} />
          </g>

          {/* Feet/Shoes - dainty */}
          <ellipse cx="30" cy="86" rx="4" ry="2" fill={colors.ribbon} opacity="0.85" />
          <ellipse cx="40" cy="86" rx="4" ry="2" fill={colors.ribbon} opacity="0.85" />
          
          {/* Shoe bows */}
          <circle cx="30" cy="85" r="1" fill={colors.dressLight} opacity="0.8" />
          <circle cx="40" cy="85" r="1" fill={colors.dressLight} opacity="0.8" />
        </svg>
      </div>
    </>
  );

  return createPortal(ui, document.body);
};

export { ANGEL_VARIANTS };
