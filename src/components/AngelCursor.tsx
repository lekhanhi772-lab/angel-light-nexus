import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Shizuka-style color variants - cute anime girl design
const ANGEL_VARIANTS = {
  default: { 
    // Classic Angel - white dress, golden wings
    hair: '#1a1a2e',
    hairHighlight: '#2a2a4e',
    hairGlow: '#3a3a5e',
    skin: '#FFECD2',
    cheek: '#FFB6C1',
    dress: '#FFFFFF', 
    dressLight: '#FFFAF0',
    dressAccent: '#FFD700',
    ribbon: '#FFD700',
    wings: '#FFE4B5',
    wingsLight: '#FFFAF0',
    wingsGlow: '#FFD700',
    halo: '#FFD700',
    eyes: '#2a2a4e',
    eyeshine: '#FFFFFF',
    name: 'Thiên Thần Vàng' 
  },
  pink: { 
    // Pink Angel
    hair: '#4a3728',
    hairHighlight: '#5a4738',
    hairGlow: '#6a5748',
    skin: '#FFECD2',
    cheek: '#FFC0CB',
    dress: '#FFF0F5', 
    dressLight: '#FFFFFF',
    dressAccent: '#FFB6C1',
    ribbon: '#FF69B4',
    wings: '#FFD1DC',
    wingsLight: '#FFF0F5',
    wingsGlow: '#FF69B4',
    halo: '#FF69B4',
    eyes: '#4a3728',
    eyeshine: '#FFFFFF',
    name: 'Thiên Thần Hồng' 
  },
  golden: { 
    // Golden Angel
    hair: '#1a1a2e',
    hairHighlight: '#2a2a4e',
    hairGlow: '#3a3a5e',
    skin: '#FFECD2',
    cheek: '#FFDAB9',
    dress: '#FFFAF0', 
    dressLight: '#FFFFFF',
    dressAccent: '#FFD700',
    ribbon: '#FFA500',
    wings: '#FFE4B5',
    wingsLight: '#FFFACD',
    wingsGlow: '#FFA500',
    halo: '#FFD700',
    eyes: '#2a2a4e',
    eyeshine: '#FFFFFF',
    name: 'Thiên Thần Hoàng Kim' 
  },
  mint: { 
    // Mint Angel
    hair: '#1a1a2e',
    hairHighlight: '#2a2a4e',
    hairGlow: '#3a3a5e',
    skin: '#FFECD2',
    cheek: '#E0FFFF',
    dress: '#F0FFFF', 
    dressLight: '#FFFFFF',
    dressAccent: '#40E0D0',
    ribbon: '#40E0D0',
    wings: '#E0FFFF',
    wingsLight: '#F0FFFF',
    wingsGlow: '#00CED1',
    halo: '#40E0D0',
    eyes: '#2a2a4e',
    eyeshine: '#FFFFFF',
    name: 'Thiên Thần Ngọc' 
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
  const wingFlap = Math.sin(phase * 0.15) * (isHovering ? 10 : 6);
  const haloGlow = 0.6 + Math.sin(phase * 0.1) * 0.3;
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
            
            {/* Dress gradient - angel white */}
            <linearGradient id="shizukaDress" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.dressLight} />
              <stop offset="50%" stopColor={colors.dress} />
              <stop offset="100%" stopColor={colors.dressAccent} />
            </linearGradient>
            
            {/* Wing gradient */}
            <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.wingsLight} stopOpacity="0.95" />
              <stop offset="50%" stopColor={colors.wings} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.wingsGlow} stopOpacity="0.6" />
            </linearGradient>
            
            {/* Halo gradient */}
            <linearGradient id="haloGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.halo} stopOpacity="0.3" />
              <stop offset="50%" stopColor={colors.halo} stopOpacity="0.9" />
              <stop offset="100%" stopColor={colors.halo} stopOpacity="0.3" />
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
            
            {/* Glow filter */}
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Halo */}
          <ellipse 
            cx="32" cy="4" rx="10" ry="3" 
            fill="none" 
            stroke="url(#haloGrad)" 
            strokeWidth="2"
            opacity={haloGlow}
            filter="url(#softGlow)"
          />

          {/* Angel Wings - Left (behind body) */}
          <g transform={`rotate(${-wingFlap}, 20, 40)`} filter="url(#softGlow)">
            <path
              d="M20 40 Q2 28 0 40 Q3 55 12 58 Q18 54 20 46 Z"
              fill="url(#wingGrad)"
              opacity="0.9"
            />
            <path d="M18 42 Q10 36 4 42" stroke={colors.wingsGlow} strokeWidth="0.5" fill="none" opacity="0.5" />
            <path d="M18 46 Q12 44 6 50" stroke={colors.wingsGlow} strokeWidth="0.5" fill="none" opacity="0.5" />
          </g>
          
          {/* Angel Wings - Right */}
          <g transform={`rotate(${wingFlap}, 42, 40)`} filter="url(#softGlow)">
            <path
              d="M42 40 Q60 28 62 40 Q59 55 50 58 Q44 54 42 46 Z"
              fill="url(#wingGrad)"
              opacity="0.9"
            />
            <path d="M44 42 Q52 36 58 42" stroke={colors.wingsGlow} strokeWidth="0.5" fill="none" opacity="0.5" />
            <path d="M44 46 Q50 44 56 50" stroke={colors.wingsGlow} strokeWidth="0.5" fill="none" opacity="0.5" />
          </g>

          {/* Hair back (behind head) - voluminous, shifted for 3/4 view */}
          <ellipse
            cx="32"
            cy="18"
            rx="17"
            ry="15"
            fill="url(#shizukaHair)"
          />
          
          {/* High ponytail - wavy flowing hair on right side */}
          <path
            d={`M42 14 Q52 ${16 + hairSwing} 50 ${28 + hairSwing * 1.5} Q48 ${40 + hairSwing * 1.2} 44 ${52 + hairSwing}`}
            fill="url(#shizukaHair)"
            strokeWidth="8"
          />
          <path
            d={`M44 15 Q54 ${18 + hairSwing * 0.8} 52 ${30 + hairSwing * 1.3} Q50 ${42 + hairSwing} 46 ${54 + hairSwing * 0.8}`}
            fill="url(#shizukaHair)"
            strokeWidth="6"
          />
          <path
            d={`M46 16 Q55 ${20 + hairSwing * 0.6} 53 ${32 + hairSwing} Q51 ${44 + hairSwing * 0.8} 48 ${55 + hairSwing * 0.6}`}
            fill="url(#shizukaHair)"
            strokeWidth="5"
          />
          {/* Extra wavy strand */}
          <path
            d={`M40 14 Q48 ${20 - hairSwing * 0.5} 47 ${35 + hairSwing * 1.2} Q45 ${48 + hairSwing} 42 ${56 + hairSwing * 0.7}`}
            fill="url(#shizukaHair)"
            strokeWidth="4"
          />
          
          {/* Hair highlight on ponytail */}
          <path
            d={`M45 18 Q52 ${25 + hairSwing * 0.8} 50 ${40 + hairSwing * 0.5}`}
            stroke={colors.hairHighlight}
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
          
          {/* Pink bow on ponytail */}
          <g transform={`translate(42, ${12 + ribbonBounce})`}>
            {/* Left bow loop */}
            <path
              d="M0 0 Q-6 -6 -3 0 Q-6 6 0 0"
              fill={colors.ribbon}
            />
            {/* Right bow loop */}
            <path
              d="M0 0 Q6 -6 3 0 Q6 6 0 0"
              fill={colors.ribbon}
            />
            {/* Bow center */}
            <circle cx="0" cy="0" r="2" fill={colors.dressLight} />
            {/* Ribbon tails */}
            <path
              d={`M-1 2 Q-3 ${6 + ribbonBounce * 0.5} -2 ${10 + ribbonBounce}`}
              stroke={colors.ribbon}
              strokeWidth="2"
              fill="none"
            />
            <path
              d={`M1 2 Q3 ${6 + ribbonBounce * 0.5} 2 ${10 + ribbonBounce}`}
              stroke={colors.ribbon}
              strokeWidth="2"
              fill="none"
            />
          </g>

          {/* Face - 3/4 view (slightly rotated oval) */}
          <ellipse
            cx="30"
            cy="24"
            rx="13"
            ry="12"
            fill="url(#shizukaSkin)"
            transform="rotate(-8, 30, 24)"
          />
          
          {/* Left cheek (more visible in 3/4 view) */}
          <ellipse cx="20" cy="28" rx="4" ry="2.5" fill={colors.cheek} opacity="0.6" />
          {/* Right cheek (less visible) */}
          <ellipse cx="38" cy="27" rx="2.5" ry="2" fill={colors.cheek} opacity="0.4" />
          
          {/* Eyes - 3/4 view positioning */}
          {isBlinking ? (
            <>
              {/* Closed eyes - happy curved expression */}
              <path d="M20 23 Q23 21 26 23" stroke={colors.eyes} strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M32 22 Q34 20.5 36 22" stroke={colors.eyes} strokeWidth="1" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Left eye - larger (closer to viewer) */}
              <ellipse cx="23" cy="23" rx="3" ry="3.5" fill="#FFFFFF" />
              <ellipse cx="23.5" cy="23" rx="2.2" ry="2.8" fill="url(#eyeGrad)" />
              <circle cx="22.3" cy="22" r="1.2" fill={colors.eyeshine} />
              <circle cx="24.2" cy="23.5" r="0.5" fill={colors.eyeshine} opacity="0.8" />
              
              {/* Right eye - smaller (further from viewer) */}
              <ellipse cx="34" cy="22.5" rx="2" ry="2.5" fill="#FFFFFF" />
              <ellipse cx="34.3" cy="22.5" rx="1.5" ry="2" fill="url(#eyeGrad)" />
              <circle cx="33.5" cy="21.8" r="0.8" fill={colors.eyeshine} />
            </>
          )}
          
          {/* Eyebrows - angled for 3/4 view */}
          <path d="M18 19 Q22 17.5 26 19" stroke={colors.hair} strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M31 18.5 Q34 17.5 37 18.5" stroke={colors.hair} strokeWidth="0.6" fill="none" strokeLinecap="round" />
          
          {/* Nose - side profile hint */}
          <path d="M28 25 Q29 26.5 28 28" stroke="#E8B4A0" strokeWidth="1" fill="none" strokeLinecap="round" />
          
          {/* Mouth - cute open smile like reference */}
          <ellipse 
            cx="25" 
            cy="31" 
            rx={isHovering ? 3.5 : 2.5} 
            ry={isHovering ? 2.5 : 1.8} 
            fill="#D4736C"
          />
          <ellipse 
            cx="25" 
            cy={isHovering ? 30 : 30.5} 
            rx={isHovering ? 2.5 : 1.8} 
            ry={isHovering ? 1.5 : 1} 
            fill="#FFFFFF"
            opacity="0.9"
          />

          {/* Hair front bangs - wavy framing face (3/4 view) */}
          <path
            d={`M14 16 Q18 6 28 8 Q38 6 42 14`}
            fill="url(#shizukaHair)"
          />
          {/* Left side bangs - longer, wavy */}
          <path
            d={`M14 16 Q10 ${20 + hairSwing * 0.8} 12 ${28 + hairSwing * 0.6} Q14 ${34 + hairSwing * 0.4} 16 ${38 + hairSwing * 0.3}`}
            fill="url(#shizukaHair)"
          />
          <path
            d={`M16 18 Q13 ${22 + hairSwing * 0.6} 14 ${30 + hairSwing * 0.5} Q16 ${36 + hairSwing * 0.3} 18 ${40 + hairSwing * 0.2}`}
            fill="url(#shizukaHair)"
          />
          <path
            d={`M18 17 Q16 ${24 + hairSwing * 0.5} 17 ${32 + hairSwing * 0.4}`}
            fill="url(#shizukaHair)"
          />
          {/* Center bangs */}
          <path
            d="M20 14 Q22 10 26 12 Q24 16 22 20"
            fill="url(#shizukaHair)"
          />
          <path
            d="M24 13 Q27 9 30 11 Q28 15 26 18"
            fill="url(#shizukaHair)"
          />
          {/* Right side bangs - shorter */}
          <path
            d="M32 12 Q36 10 40 14 Q38 18 36 20"
            fill="url(#shizukaHair)"
          />
          
          {/* Hair strand highlights */}
          <path
            d={`M15 20 Q12 ${26 + hairSwing * 0.5} 14 ${34 + hairSwing * 0.3}`}
            stroke={colors.hairHighlight}
            strokeWidth="1"
            fill="none"
            opacity="0.4"
          />

          {/* Neck */}
          <path
            d="M26 37 L26 40 Q30 41 34 40 L34 37"
            fill="url(#shizukaSkin)"
          />

          {/* Angel Dress body - flowing white */}
          <path
            d={`M22 40 Q30 38 38 40 L${44 + dressSwing} 72 Q30 78 ${16 - dressSwing} 72 Z`}
            fill="url(#shizukaDress)"
          />
          
          {/* Dress golden trim at top */}
          <path
            d="M24 40 Q30 43 36 40"
            stroke={colors.dressAccent}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Dress fold details */}
          <path
            d={`M26 48 Q28 ${58 + dressSwing * 0.3} 24 70`}
            stroke={colors.dressAccent}
            strokeWidth="0.4"
            fill="none"
            opacity="0.3"
          />
          <path
            d={`M30 45 Q30 ${60} 30 72`}
            stroke={colors.dressAccent}
            strokeWidth="0.4"
            fill="none"
            opacity="0.25"
          />
          <path
            d={`M34 48 Q32 ${58 - dressSwing * 0.3} 36 70`}
            stroke={colors.dressAccent}
            strokeWidth="0.4"
            fill="none"
            opacity="0.3"
          />
          
          {/* Dress hem - golden wavy */}
          <path
            d={`M${16 - dressSwing} 72 Q22 75 30 73 Q38 75 ${44 + dressSwing} 72`}
            stroke={colors.dressAccent}
            strokeWidth="1.5"
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
