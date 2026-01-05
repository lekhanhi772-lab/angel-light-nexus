import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Shizuka-style color variants - cute anime girl design
const ANGEL_VARIANTS = {
  default: { 
    // Classic Shizuka - pink dress, black hair
    hair: '#1a1a2e',
    hairHighlight: '#2a2a4e',
    hairGlow: '#3a3a5e',
    skin: '#FFECD2',
    cheek: '#FFB6C1',
    dress: '#FF69B4', 
    dressLight: '#FFB6C1',
    dressAccent: '#FF1493',
    ribbon: '#FF69B4',
    eyes: '#2a2a4e',
    eyeshine: '#FFFFFF',
    name: 'Shizuka Hồng' 
  },
  pink: { 
    // Sweet Pink Version
    hair: '#4a3728',
    hairHighlight: '#5a4738',
    hairGlow: '#6a5748',
    skin: '#FFECD2',
    cheek: '#FFC0CB',
    dress: '#FF85C0', 
    dressLight: '#FFADD2',
    dressAccent: '#FF69B4',
    ribbon: '#FF69B4',
    eyes: '#4a3728',
    eyeshine: '#FFFFFF',
    name: 'Shizuka Ngọt Ngào' 
  },
  golden: { 
    // Yellow Dress Version
    hair: '#1a1a2e',
    hairHighlight: '#2a2a4e',
    hairGlow: '#3a3a5e',
    skin: '#FFECD2',
    cheek: '#FFDAB9',
    dress: '#FFD700', 
    dressLight: '#FFEC8B',
    dressAccent: '#FFA500',
    ribbon: '#FF6347',
    eyes: '#2a2a4e',
    eyeshine: '#FFFFFF',
    name: 'Shizuka Vàng' 
  },
  mint: { 
    // Blue Dress Version
    hair: '#1a1a2e',
    hairHighlight: '#2a2a4e',
    hairGlow: '#3a3a5e',
    skin: '#FFECD2',
    cheek: '#E0FFFF',
    dress: '#87CEEB', 
    dressLight: '#B0E0E6',
    dressAccent: '#4682B4',
    ribbon: '#87CEEB',
    eyes: '#2a2a4e',
    eyeshine: '#FFFFFF',
    name: 'Shizuka Xanh' 
  },
};

export type VariantKey = keyof typeof ANGEL_VARIANTS;

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
        prev.map((t) => ({ ...t, opacity: t.opacity - 0.05 })).filter((t) => t.opacity > 0)
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

    if (!isMobileRef.current && Math.random() > 0.5) {
      const newTrail: StarTrail = {
        id: trailIdRef.current++,
        x: e.clientX + (Math.random() - 0.5) * 30,
        y: e.clientY + (Math.random() - 0.5) * 30,
        opacity: 1,
        size: 8 + Math.random() * 8,
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
  const bounce = Math.sin(phase * 0.08) * 3;
  const hairSwing = Math.sin(phase * 0.1) * 3;
  const dressSwing = Math.sin(phase * 0.06) * 4;
  const blinkPhase = phase % 120;
  const isBlinking = blinkPhase < 5;
  const ribbonBounce = Math.sin(phase * 0.12) * 2;
  const armSwing = Math.sin(phase * 0.07) * 5;
  const scale = isHovering ? 1.1 : 1;

  const ui = (
    <>
      {/* Cute heart/star trails */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: trail.x,
            top: trail.y,
            opacity: trail.opacity,
            transform: `translate(-50%, -50%) scale(${trail.opacity}) rotate(${trail.id * 30}deg)`,
          }}
        >
          <svg width={trail.size} height={trail.size} viewBox="0 0 16 16">
            <defs>
              <radialGradient id={`heart-trail-${trail.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor={colors.dress} />
                <stop offset="100%" stopColor={colors.dress} stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Heart shape */}
            <path
              d="M8 14 C4 10 0 7 0 4 C0 1 3 0 5 2 L8 5 L11 2 C13 0 16 1 16 4 C16 7 12 10 8 14Z"
              fill={`url(#heart-trail-${trail.id})`}
              transform="scale(1)"
            />
          </svg>
        </div>
      ))}

      {/* Shizuka-style Cute Girl Cursor */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: currentPos.x,
          top: currentPos.y,
          transform: `translate(-50%, -50%) translateY(${bounce}px) scale(${scale})`,
          transition: isIdle ? 'left 3s ease-in-out, top 3s ease-in-out' : 'transform 0.2s ease-out',
        }}
      >
        <svg width="60" height="80" viewBox="0 0 60 80" className="overflow-visible" style={{ filter: 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.2))' }}>
          <defs>
            {/* Skin gradient */}
            <radialGradient id="shizukaSkin" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor={colors.skin} />
              <stop offset="100%" stopColor="#FFD9B3" />
            </radialGradient>
            
            {/* Hair gradient */}
            <linearGradient id="shizukaHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.hairHighlight} />
              <stop offset="50%" stopColor={colors.hair} />
              <stop offset="100%" stopColor={colors.hairGlow} />
            </linearGradient>
            
            {/* Dress gradient */}
            <linearGradient id="shizukaDress" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.dressLight} />
              <stop offset="50%" stopColor={colors.dress} />
              <stop offset="100%" stopColor={colors.dressAccent} />
            </linearGradient>
            
            {/* Ribbon gradient */}
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.ribbon} />
              <stop offset="50%" stopColor={colors.dressLight} />
              <stop offset="100%" stopColor={colors.ribbon} />
            </linearGradient>
            
            {/* Eye gradient */}
            <radialGradient id="eyeGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor={colors.hairHighlight} />
              <stop offset="100%" stopColor={colors.eyes} />
            </radialGradient>
          </defs>

          {/* Hair back (behind head) - longer flowing */}
          <ellipse
            cx="30"
            cy="22"
            rx="18"
            ry="16"
            fill="url(#shizukaHair)"
          />
          
          {/* Long flowing hair strands - left side */}
          <path
            d={`M12 18 Q6 ${28 + hairSwing * 1.5} 8 ${45 + hairSwing * 1.2} Q10 ${60 + hairSwing} 14 ${70 + hairSwing * 0.8}`}
            fill="url(#shizukaHair)"
            stroke={colors.hairHighlight}
            strokeWidth="0.3"
          />
          <path
            d={`M14 20 Q10 ${32 + hairSwing * 1.3} 12 ${50 + hairSwing} Q14 ${62 + hairSwing * 0.9} 16 ${68 + hairSwing * 0.7}`}
            fill="url(#shizukaHair)"
          />
          <path
            d={`M16 22 Q12 ${35 + hairSwing} 14 ${48 + hairSwing * 0.8}`}
            fill="url(#shizukaHair)"
          />
          
          {/* Long flowing hair strands - right side */}
          <path
            d={`M48 18 Q54 ${28 - hairSwing * 1.5} 52 ${45 - hairSwing * 1.2} Q50 ${60 - hairSwing} 46 ${70 - hairSwing * 0.8}`}
            fill="url(#shizukaHair)"
            stroke={colors.hairHighlight}
            strokeWidth="0.3"
          />
          <path
            d={`M46 20 Q50 ${32 - hairSwing * 1.3} 48 ${50 - hairSwing} Q46 ${62 - hairSwing * 0.9} 44 ${68 - hairSwing * 0.7}`}
            fill="url(#shizukaHair)"
          />
          <path
            d={`M44 22 Q48 ${35 - hairSwing} 46 ${48 - hairSwing * 0.8}`}
            fill="url(#shizukaHair)"
          />

          {/* Face */}
          <ellipse
            cx="30"
            cy="25"
            rx="14"
            ry="13"
            fill="url(#shizukaSkin)"
          />
          
          {/* Cheeks (blush) */}
          <ellipse cx="20" cy="28" rx="4" ry="2.5" fill={colors.cheek} opacity="0.6" />
          <ellipse cx="40" cy="28" rx="4" ry="2.5" fill={colors.cheek} opacity="0.6" />
          
          {/* Eyes - smaller but sparkly */}
          {isBlinking ? (
            <>
              {/* Closed eyes - happy expression */}
              <path d="M23 24 Q25 22.5 27 24" stroke={colors.eyes} strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M33 24 Q35 22.5 37 24" stroke={colors.eyes} strokeWidth="1" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Left eye - smaller */}
              <ellipse cx="25" cy="24" rx="2.5" ry="3" fill="#FFFFFF" />
              <ellipse cx="25.2" cy="24" rx="2" ry="2.5" fill="url(#eyeGrad)" />
              <circle cx="24.3" cy="23" r="1" fill={colors.eyeshine} />
              <circle cx="25.8" cy="24.2" r="0.5" fill={colors.eyeshine} opacity="0.8" />
              <circle cx="24.8" cy="25" r="0.3" fill={colors.eyeshine} opacity="0.5" />
              
              {/* Right eye - smaller */}
              <ellipse cx="35" cy="24" rx="2.5" ry="3" fill="#FFFFFF" />
              <ellipse cx="35.2" cy="24" rx="2" ry="2.5" fill="url(#eyeGrad)" />
              <circle cx="34.3" cy="23" r="1" fill={colors.eyeshine} />
              <circle cx="35.8" cy="24.2" r="0.5" fill={colors.eyeshine} opacity="0.8" />
              <circle cx="34.8" cy="25" r="0.3" fill={colors.eyeshine} opacity="0.5" />
            </>
          )}
          
          {/* Eyebrows */}
          <path d="M20 19 Q24 18 28 19" stroke={colors.hair} strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M32 19 Q36 18 40 19" stroke={colors.hair} strokeWidth="1" fill="none" strokeLinecap="round" />
          
          {/* Nose (simple dot) */}
          <circle cx="30" cy="27" r="0.8" fill="#E8B4A0" />
          
          {/* Mouth - cute smile */}
          <path 
            d={isHovering ? "M26 31 Q30 35 34 31" : "M27 31 Q30 33 33 31"} 
            stroke="#D4736C" 
            strokeWidth="1.2" 
            fill="none" 
            strokeLinecap="round" 
          />

          {/* Hair front bangs - Shizuka style */}
          <path
            d="M16 16 Q20 8 30 10 Q40 8 44 16 L42 22 Q38 15 30 16 Q22 15 18 22 Z"
            fill="url(#shizukaHair)"
          />
          
          {/* Hair ribbon/bow on side */}
          <g transform={`translate(42, ${14 + ribbonBounce})`}>
            <path
              d="M0 0 Q6 -4 4 0 Q6 4 0 0"
              fill="url(#ribbonGrad)"
            />
            <path
              d="M0 0 Q-3 -2 -1 0 Q-3 2 0 0"
              fill="url(#ribbonGrad)"
            />
            <circle cx="0" cy="0" r="1.5" fill={colors.dressLight} />
          </g>

          {/* Neck */}
          <path
            d="M26 37 L26 40 Q30 41 34 40 L34 37"
            fill="url(#shizukaSkin)"
          />

          {/* Dress body */}
          <path
            d={`M22 40 Q30 38 38 40 L${42 + dressSwing} 70 Q30 75 ${18 - dressSwing} 70 Z`}
            fill="url(#shizukaDress)"
          />
          
          {/* Dress collar/neckline */}
          <path
            d="M24 40 Q30 43 36 40"
            stroke={colors.dressLight}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Dress fold details */}
          <path
            d={`M26 48 Q28 ${58 + dressSwing * 0.3} 24 68`}
            stroke={colors.dressAccent}
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
          />
          <path
            d={`M34 48 Q32 ${58 - dressSwing * 0.3} 36 68`}
            stroke={colors.dressAccent}
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
          />
          
          {/* Dress hem decoration */}
          <path
            d={`M${18 - dressSwing} 70 Q30 73 ${42 + dressSwing} 70`}
            stroke={colors.dressLight}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Arms */}
          {/* Left arm */}
          <path
            d={`M22 42 Q${16 - armSwing} 50 ${14 - armSwing} 58`}
            stroke="url(#shizukaSkin)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={14 - armSwing} cy="58" r="3" fill="url(#shizukaSkin)" />
          
          {/* Right arm */}
          <path
            d={`M38 42 Q${44 + armSwing} 50 ${46 + armSwing} 58`}
            stroke="url(#shizukaSkin)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={46 + armSwing} cy="58" r="3" fill="url(#shizukaSkin)" />

          {/* Legs */}
          <path d="M26 68 L24 78" stroke="url(#shizukaSkin)" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M34 68 L36 78" stroke="url(#shizukaSkin)" strokeWidth="4" fill="none" strokeLinecap="round" />
          
          {/* Shoes */}
          <ellipse cx="24" cy="79" rx="4" ry="2" fill={colors.dress} />
          <ellipse cx="36" cy="79" rx="4" ry="2" fill={colors.dress} />
        </svg>
      </div>
    </>
  );

  return createPortal(ui, document.body);
};

export { ANGEL_VARIANTS };
