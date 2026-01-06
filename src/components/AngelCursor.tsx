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
  type: 'star' | 'sparkle' | 'dust';
  fallSpeed?: number;
  drift?: number;
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
        prev.map((t) => ({
          ...t,
          opacity: t.opacity - (t.type === 'dust' ? 0.025 : 0.04),
          y: t.type === 'dust' ? t.y + (t.fallSpeed || 1.5) : t.y,
          x: t.type === 'dust' ? t.x + (t.drift || 0) : t.x,
        })).filter((t) => t.opacity > 0)
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

    if (!isMobileRef.current) {
      const newTrails: StarTrail[] = [];
      
      // Sparkle trails (original)
      if (Math.random() > 0.7) {
        newTrails.push({
          id: trailIdRef.current++,
          x: e.clientX + (Math.random() - 0.5) * 25,
          y: e.clientY + (Math.random() - 0.5) * 25,
          opacity: 1,
          size: 6 + Math.random() * 6,
          type: Math.random() > 0.5 ? 'star' : 'sparkle',
        });
      }
      
      // Fairy dust - falling particles
      if (Math.random() > 0.5) {
        newTrails.push({
          id: trailIdRef.current++,
          x: e.clientX + (Math.random() - 0.5) * 40,
          y: e.clientY + 10 + Math.random() * 15,
          opacity: 0.9 + Math.random() * 0.1,
          size: 2 + Math.random() * 4,
          type: 'dust',
          fallSpeed: 1 + Math.random() * 2,
          drift: (Math.random() - 0.5) * 0.8,
        });
      }
      
      if (newTrails.length > 0) {
        setTrails((prev) => [...prev.slice(-20), ...newTrails]);
      }
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
  
  // Elegant, gentle animations for sitting pose
  const floatY = Math.sin(phase * 0.05) * 2;
  const hairFlow = Math.sin(phase * 0.08) * 3; // More flow for relaxed sitting
  const dressFlow = Math.sin(phase * 0.06) * 3;
  const wingFlutter = Math.sin(phase * 0.12) * 8;
  const haloGlow = 0.7 + Math.sin(phase * 0.08) * 0.25;
  const wandSparkle = Math.sin(phase * 0.2) * 0.3 + 0.7;
  const blinkPhase = phase % 150;
  const isBlinking = blinkPhase < 4;
  const scale = isHovering ? 1.08 : 1;
  
  // Wand arm wave animation - playful waving motion
  const wandArmWave = Math.sin(phase * 0.12) * 8;
  const wandRotate = Math.sin(phase * 0.18) * 12;
  
  // Leg swinging animation - relaxed dangling
  const legSwing = Math.sin(phase * 0.08) * 8; // Swing left-right
  const legSwing2 = Math.sin(phase * 0.08 + 1.5) * 6; // Second leg offset
  
  // Face expressions - lively and dynamic
  const eyeLookX = Math.sin(phase * 0.03) * 0.4;
  const eyeLookY = Math.cos(phase * 0.04) * 0.2;
  const eyebrowRaise = Math.sin(phase * 0.02) * 0.5;
  const smileWidth = isHovering ? 1.2 : (0.9 + Math.sin(phase * 0.025) * 0.15);
  const cheekGlow = 0.4 + Math.sin(phase * 0.06) * 0.1;

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
            ) : trail.type === 'dust' ? (
              <>
                <defs>
                  <radialGradient id={`dustGrad-${trail.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                    <stop offset="40%" stopColor={colors.sparkle} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={colors.wingsGlow} stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="8" cy="8" r="6" fill={`url(#dustGrad-${trail.id})`} />
                <circle cx="8" cy="8" r="2" fill="#FFFFFF" opacity="0.9" />
              </>
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
        {/* Sitting pose - body tilted, viewing from side angle */}
        <svg width="85" height="95" viewBox="0 0 85 95" className="overflow-visible" style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))' }}>
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
            
            {/* Wing gradient - ethereal, luminous */}
            <radialGradient id="wingGrad" cx="30%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="30%" stopColor={colors.wingsLight} stopOpacity="0.98" />
              <stop offset="60%" stopColor={colors.wingsGlow} stopOpacity="0.85" />
              <stop offset="100%" stopColor={colors.wings} stopOpacity="0.6" />
            </radialGradient>
            
            {/* Wing sparkle gradient */}
            <radialGradient id="wingSparkle" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="50%" stopColor={colors.wingsGlow} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.wingsEdge} stopOpacity="0" />
            </radialGradient>
            
            {/* Wing glow filter */}
            <filter id="wingGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur1" />
              <feGaussianBlur stdDeviation="1.5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
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
            
            {/* Crown gradient */}
            <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="30%" stopColor={colors.halo} stopOpacity="1" />
              <stop offset="100%" stopColor={colors.dressAccent} stopOpacity="0.9" />
            </linearGradient>
            
            {/* Crown jewel gradient */}
            <radialGradient id="jewelGrad" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="40%" stopColor={colors.wingsEdge} stopOpacity="0.9" />
              <stop offset="100%" stopColor={colors.ribbon} stopOpacity="0.8" />
            </radialGradient>
            
            {/* Crown glow filter */}
            <filter id="crownGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* === SITTING FAIRY POSE - Side view, on a branch === */}
          
          {/* Tree branch/perch */}
          <path 
            d={`M5 62 Q25 58 45 60 Q65 62 80 58`} 
            stroke="#8B5A2B" 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
          />
          <path 
            d={`M5 62 Q25 58 45 60 Q65 62 80 58`} 
            stroke="#A0522D" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round"
            opacity="0.6"
          />
          
          {/* Wings - Behind body, larger for sitting pose */}
          <g transform={`rotate(${-wingFlutter * 0.5}, 38, 42)`} filter="url(#wingGlow)">
            <path
              d="M38 42 Q15 28 10 45 Q12 62 25 70 Q34 60 38 50 Z"
              fill="url(#wingGrad)"
              stroke={colors.wingsEdge}
              strokeWidth="0.4"
              strokeOpacity="0.5"
            />
            <path d="M36 44 Q22 34 14 48" stroke={colors.wingsEdge} strokeWidth="0.5" fill="none" opacity="0.4" />
            <path d="M35 50 Q22 48 16 60" stroke={colors.wingsEdge} strokeWidth="0.4" fill="none" opacity="0.35" />
            <circle cx="18" cy="45" r={1 + Math.sin(phase * 0.15) * 0.3} fill="url(#wingSparkle)" opacity={0.7 + Math.sin(phase * 0.2) * 0.2} />
            <circle cx="16" cy="55" r={0.8 + Math.sin(phase * 0.18) * 0.3} fill="url(#wingSparkle)" opacity={0.6 + Math.sin(phase * 0.25) * 0.2} />
          </g>
          
          <g transform={`rotate(${wingFlutter * 0.5}, 48, 42)`} filter="url(#wingGlow)">
            <path
              d="M48 42 Q72 28 78 45 Q76 62 62 70 Q52 60 48 50 Z"
              fill="url(#wingGrad)"
              stroke={colors.wingsEdge}
              strokeWidth="0.4"
              strokeOpacity="0.5"
            />
            <path d="M50 44 Q65 34 72 48" stroke={colors.wingsEdge} strokeWidth="0.5" fill="none" opacity="0.4" />
            <path d="M52 50 Q65 48 70 60" stroke={colors.wingsEdge} strokeWidth="0.4" fill="none" opacity="0.35" />
            <circle cx="68" cy="45" r={1 + Math.sin(phase * 0.16) * 0.3} fill="url(#wingSparkle)" opacity={0.7 + Math.sin(phase * 0.21) * 0.2} />
            <circle cx="70" cy="55" r={0.8 + Math.sin(phase * 0.19) * 0.3} fill="url(#wingSparkle)" opacity={0.6 + Math.sin(phase * 0.26) * 0.2} />
          </g>

          {/* Hair - Back volume, tilted for sitting */}
          <ellipse cx="43" cy="22" rx="14" ry="12" fill="url(#fairyHair)" />
          
          {/* Flowing hair - cascading down back */}
          <path
            d={`M30 24 Q25 ${38 + hairFlow} 28 ${52 + hairFlow * 1.2}`}
            fill="url(#fairyHair)"
          />
          <path
            d={`M33 26 Q28 ${40 + hairFlow * 0.8} 30 ${55 + hairFlow}`}
            fill="url(#fairyHair)"
          />
          <path
            d={`M55 24 Q60 ${38 - hairFlow * 0.5} 58 ${50 - hairFlow * 0.8}`}
            fill="url(#fairyHair)"
          />
          
          {/* Hair highlights */}
          <path
            d={`M32 28 Q27 ${42 + hairFlow * 0.5} 30 ${52 + hairFlow * 0.3}`}
            stroke={colors.hairGlow}
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
          
          {/* Halo - tilted for sitting pose */}
          <ellipse 
            cx="43" cy="6" rx="9" ry="2.5" 
            fill="none" 
            stroke="url(#haloGrad)" 
            strokeWidth="2"
            opacity={haloGlow}
            filter="url(#softGlow)"
            transform="rotate(-5, 43, 6)"
          />
          
          {/* Crown/Tiara */}
          <g filter="url(#crownGlow)" transform="rotate(-5, 43, 14)">
            <path d="M32 16 Q43 18 54 16" fill="none" stroke="url(#crownGrad)" strokeWidth="2" strokeLinecap="round" />
            <path d="M35 16 L36 11 L37 16" fill="url(#crownGrad)" stroke={colors.halo} strokeWidth="0.3" />
            <path d="M39 17 L40.5 9 L42 17" fill="url(#crownGrad)" stroke={colors.halo} strokeWidth="0.3" />
            <path d="M43 17.5 L44 7 L45 17.5" fill="url(#crownGrad)" stroke={colors.halo} strokeWidth="0.3" />
            <path d="M46 17 L47.5 9 L49 17" fill="url(#crownGrad)" stroke={colors.halo} strokeWidth="0.3" />
            <path d="M51 16 L52 11 L53 16" fill="url(#crownGrad)" stroke={colors.halo} strokeWidth="0.3" />
            <circle cx="36" cy="12" r="1.2" fill="url(#jewelGrad)" opacity={0.8 + Math.sin(phase * 0.15) * 0.2} />
            <circle cx="40.5" cy="10" r="1.4" fill="url(#jewelGrad)" opacity={0.85 + Math.sin(phase * 0.18) * 0.15} />
            <circle cx="44" cy="8.5" r="1.6" fill="url(#jewelGrad)" opacity={0.9 + Math.sin(phase * 0.12) * 0.1} />
            <circle cx="47.5" cy="10" r="1.4" fill="url(#jewelGrad)" opacity={0.85 + Math.sin(phase * 0.2) * 0.15} />
            <circle cx="52" cy="12" r="1.2" fill="url(#jewelGrad)" opacity={0.8 + Math.sin(phase * 0.16) * 0.2} />
          </g>

          {/* Face - slightly tilted, relaxed expression */}
          <ellipse
            cx="43"
            cy="28"
            rx="10"
            ry="9"
            fill="url(#fairySkin)"
            transform="rotate(-5, 43, 28)"
          />
          
          {/* Cheeks */}
          <ellipse cx="36" cy="30" rx="2.5" ry="1.5" fill={colors.cheek} opacity={cheekGlow + 0.05} />
          <ellipse cx="50" cy="29" rx="2.5" ry="1.5" fill={colors.cheek} opacity={cheekGlow + 0.05} />
          
          {/* Eyes - relaxed, dreamy */}
          {isBlinking ? (
            <>
              <path d="M37 27 Q39 25 41 27" stroke={colors.eyes} strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M45 26 Q47 24 49 26" stroke={colors.eyes} strokeWidth="1" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="39" cy="26.5" rx="2.2" ry="1.8" fill="#FFFFFF" />
              <ellipse cx={39.2 + eyeLookX} cy={26.6 + eyeLookY} rx="1.4" ry="1.2" fill={colors.eyes} />
              <circle cx={39.4 + eyeLookX * 0.5} cy={26.2 + eyeLookY * 0.5} r="0.4" fill="#FFFFFF" />
              <path d="M36.5 26 Q39 24.5 41.5 26" stroke={colors.hair} strokeWidth="0.5" fill="none" opacity="0.5" />
              
              <ellipse cx="47" cy="25.5" rx="2.2" ry="1.8" fill="#FFFFFF" />
              <ellipse cx={47.2 + eyeLookX} cy={25.6 + eyeLookY} rx="1.4" ry="1.2" fill={colors.eyes} />
              <circle cx={47.4 + eyeLookX * 0.5} cy={25.2 + eyeLookY * 0.5} r="0.4" fill="#FFFFFF" />
              <path d="M44.5 25 Q47 23.5 49.5 25" stroke={colors.hair} strokeWidth="0.5" fill="none" opacity="0.5" />
            </>
          )}
          
          {/* Eyebrows */}
          <path d={`M36 ${24 - eyebrowRaise} Q39 ${23 - eyebrowRaise} 42 ${24 - eyebrowRaise}`} stroke={colors.hair} strokeWidth="0.4" fill="none" opacity="0.4" />
          <path d={`M44 ${23 - eyebrowRaise} Q47 ${22 - eyebrowRaise} 50 ${23 - eyebrowRaise}`} stroke={colors.hair} strokeWidth="0.4" fill="none" opacity="0.4" />
          
          {/* Nose */}
          <path d="M43 28 L43.5 30" stroke={colors.skinShadow} strokeWidth="0.4" fill="none" opacity="0.4" />
          
          {/* Lips - gentle smile */}
          <path 
            d={`M${40 - smileWidth * 0.5} 33 Q43 ${32 + smileWidth} ${46 + smileWidth * 0.5} 32.5`} 
            stroke={colors.lips} 
            strokeWidth="1" 
            fill="none" 
            strokeLinecap="round" 
          />

          {/* Hair bangs */}
          <path d="M32 19 Q38 12 44 14 Q50 12 56 19" fill="url(#fairyHair)" />
          <path d="M32 19 Q30 24 32 30" fill="url(#fairyHair)" />
          <path d="M35 18 Q33 22 34 28" fill="url(#fairyHair)" />
          <path d="M56 19 Q58 24 56 30" fill="url(#fairyHair)" />

          {/* Neck */}
          <path d="M40 36 Q43 38 46 36 L46 40 Q43 42 40 40 Z" fill="url(#fairySkin)" />

          {/* Body/Dress - SITTING POSE */}
          {/* Upper dress - torso */}
          <path
            d="M36 40 Q43 38 50 40 L52 52 Q43 55 34 52 Z"
            fill="url(#fairyDress)"
          />
          
          {/* Dress skirt - flowing over legs */}
          <path
            d={`M32 50 Q43 48 54 50 
               Q${60 + dressFlow * 0.5} 58 ${55 + dressFlow * 0.3} 65 
               Q43 68 ${30 - dressFlow * 0.3} 65 
               Q${26 - dressFlow * 0.5} 58 32 50 Z`}
            fill="url(#fairyDress)"
          />
          
          {/* Dress fold lines */}
          <path d="M38 52 Q40 58 38 64" stroke={colors.dressShadow} strokeWidth="0.4" fill="none" opacity="0.3" />
          <path d="M48 52 Q46 58 48 64" stroke={colors.dressShadow} strokeWidth="0.4" fill="none" opacity="0.3" />
          
          {/* Ribbon belt */}
          <ellipse cx="43" cy="50" rx="7" ry="1.8" fill={colors.ribbon} opacity="0.8" />
          <circle cx="43" cy="50" r="1.8" fill={colors.dressLight} opacity="0.9" />
          
          {/* Dress neckline */}
          <path d="M38 40 Q43 42 48 40" stroke={colors.dressAccent} strokeWidth="0.8" fill="none" opacity="0.6" />

          {/* Left arm - resting on branch */}
          <path
            d="M36 42 Q28 50 22 56"
            stroke="url(#fairySkin)"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="21" cy="57" rx="2.2" ry="1.8" fill="url(#fairySkin)" />
          
          {/* Right arm - waving wand with playful motion */}
          <g style={{ transform: `rotate(${wandArmWave}deg)`, transformOrigin: '50px 42px' }}>
            <path
              d={`M50 42 Q${58 + wandArmWave * 0.3} ${36 - Math.abs(wandArmWave) * 0.15} ${64 + wandArmWave * 0.4} ${28 - Math.abs(wandArmWave) * 0.2}`}
              stroke="url(#fairySkin)"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse 
              cx={65 + wandArmWave * 0.4} 
              cy={27 - Math.abs(wandArmWave) * 0.2} 
              rx="2.2" 
              ry="1.8" 
              fill="url(#fairySkin)" 
            />
            
            {/* Magic Wand */}
            <g 
              filter="url(#sparkleGlow)"
              style={{ transform: `rotate(${wandRotate}deg)`, transformOrigin: `${65 + wandArmWave * 0.4}px ${26 - Math.abs(wandArmWave) * 0.2}px` }}
            >
              <line 
                x1={65 + wandArmWave * 0.4} 
                y1={26 - Math.abs(wandArmWave) * 0.2} 
                x2={72 + wandArmWave * 0.5 + wandRotate * 0.1} 
                y2={14 - Math.abs(wandArmWave) * 0.3} 
                stroke={colors.wand} 
                strokeWidth="1.5" 
                strokeLinecap="round" 
              />
              {/* Wand star */}
              <path
                d={`M${72 + wandArmWave * 0.5} ${10 - Math.abs(wandArmWave) * 0.3} 
                    L${73 + wandArmWave * 0.5} ${13 - Math.abs(wandArmWave) * 0.3} 
                    L${76 + wandArmWave * 0.5} ${14 - Math.abs(wandArmWave) * 0.3} 
                    L${73 + wandArmWave * 0.5} ${15 - Math.abs(wandArmWave) * 0.3} 
                    L${72 + wandArmWave * 0.5} ${18 - Math.abs(wandArmWave) * 0.3} 
                    L${71 + wandArmWave * 0.5} ${15 - Math.abs(wandArmWave) * 0.3} 
                    L${68 + wandArmWave * 0.5} ${14 - Math.abs(wandArmWave) * 0.3} 
                    L${71 + wandArmWave * 0.5} ${13 - Math.abs(wandArmWave) * 0.3} Z`}
                fill={colors.wand}
                opacity={wandSparkle}
              />
              {/* Sparkles around wand */}
              <circle 
                cx={70 + wandArmWave * 0.5 + Math.sin(phase * 0.3) * 2} 
                cy={12 - Math.abs(wandArmWave) * 0.3 + Math.cos(phase * 0.25) * 2} 
                r={1 + Math.sin(phase * 0.2) * 0.3} 
                fill={colors.sparkle} 
                opacity={wandSparkle * 0.8} 
              />
              <circle 
                cx={74 + wandArmWave * 0.5 + Math.cos(phase * 0.35) * 1.5} 
                cy={16 - Math.abs(wandArmWave) * 0.3 + Math.sin(phase * 0.3) * 1.5} 
                r={0.8 + Math.cos(phase * 0.25) * 0.2} 
                fill={colors.sparkle} 
                opacity={wandSparkle * 0.6} 
              />
              <circle 
                cx={68 + wandArmWave * 0.5 + Math.sin(phase * 0.4) * 1.5} 
                cy={16 - Math.abs(wandArmWave) * 0.3 + Math.cos(phase * 0.35) * 1.5} 
                r={0.6 + Math.sin(phase * 0.3) * 0.2} 
                fill={colors.sparkle} 
                opacity={wandSparkle * 0.7} 
              />
              <circle 
                cx={75 + wandArmWave * 0.5 + Math.sin(phase * 0.5) * 3} 
                cy={10 - Math.abs(wandArmWave) * 0.3 + Math.cos(phase * 0.4) * 3} 
                r={0.5 + Math.sin(phase * 0.35) * 0.2} 
                fill={colors.sparkle} 
                opacity={wandSparkle * 0.5} 
              />
            </g>
          </g>

          {/* LEGS - Dangling and swinging */}
          {/* Left leg - swinging */}
          <g style={{ transform: `rotate(${legSwing}deg)`, transformOrigin: '38px 58px' }}>
            {/* Thigh */}
            <path
              d="M38 58 Q36 68 32 78"
              stroke="url(#fairySkin)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Calf */}
            <path
              d={`M32 78 Q30 84 ${28 + legSwing * 0.15} 90`}
              stroke="url(#fairySkin)"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Foot/Shoe */}
            <ellipse 
              cx={27 + legSwing * 0.15} 
              cy={91} 
              rx="4" 
              ry="2" 
              fill={colors.ribbon} 
              opacity="0.85" 
              transform={`rotate(${-15 + legSwing * 0.5}, ${27 + legSwing * 0.15}, 91)`}
            />
            <circle cx={27 + legSwing * 0.15} cy={90} r="0.8" fill={colors.dressLight} opacity="0.8" />
          </g>
          
          {/* Right leg - swinging with offset */}
          <g style={{ transform: `rotate(${legSwing2}deg)`, transformOrigin: '48px 58px' }}>
            {/* Thigh */}
            <path
              d="M48 58 Q50 68 52 78"
              stroke="url(#fairySkin)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Calf */}
            <path
              d={`M52 78 Q54 84 ${56 + legSwing2 * 0.15} 90`}
              stroke="url(#fairySkin)"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Foot/Shoe */}
            <ellipse 
              cx={57 + legSwing2 * 0.15} 
              cy={91} 
              rx="4" 
              ry="2" 
              fill={colors.ribbon} 
              opacity="0.85"
              transform={`rotate(${-10 + legSwing2 * 0.5}, ${57 + legSwing2 * 0.15}, 91)`}
            />
            <circle cx={57 + legSwing2 * 0.15} cy={90} r="0.8" fill={colors.dressLight} opacity="0.8" />
          </g>
        </svg>
      </div>
    </>
  );

  return createPortal(ui, document.body);
};

export { ANGEL_VARIANTS };
