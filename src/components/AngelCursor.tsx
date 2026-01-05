import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// 4 color variants - Elegant Angel style matching the avatar
const ANGEL_VARIANTS = {
  default: { 
    // Golden Angel - like the avatar
    hair: '#F5DEB3',
    hairHighlight: '#FFFACD',
    hairGlow: '#FFD700',
    skin: '#FFF5EB',
    cheek: '#FFE4E1',
    dress: '#FFFFFF', 
    dressGold: '#FFD700',
    dressShimmer: '#FFFACD',
    wings: '#FFE4B5',
    wingsLight: '#FFFAF0',
    wingsSparkle: '#FFD700',
    heart: '#FFD700',
    heartGlow: '#FFF8DC',
    halo: '#FFD700',
    name: 'Thiên Thần Ánh Sáng' 
  },
  pink: { 
    // Rose Angel
    hair: '#DDA0DD',
    hairHighlight: '#E6E6FA',
    hairGlow: '#FF69B4',
    skin: '#FFF5EB',
    cheek: '#FFB6C1',
    dress: '#FFF0F5', 
    dressGold: '#FFB6C1',
    dressShimmer: '#FFC0CB',
    wings: '#FFD1DC',
    wingsLight: '#FFF0F5',
    wingsSparkle: '#FF69B4',
    heart: '#FF69B4',
    heartGlow: '#FFB6C1',
    halo: '#FF69B4',
    name: 'Thiên Thần Hồng' 
  },
  golden: { 
    // Celestial Gold Angel
    hair: '#FFD700',
    hairHighlight: '#FFEC8B',
    hairGlow: '#FFA500',
    skin: '#FFF5EB',
    cheek: '#FFDAB9',
    dress: '#FFFAF0', 
    dressGold: '#FFD700',
    dressShimmer: '#FFE4B5',
    wings: '#FFE4B5',
    wingsLight: '#FFFACD',
    wingsSparkle: '#FFA500',
    heart: '#FFA500',
    heartGlow: '#FFD700',
    halo: '#FFD700',
    name: 'Thiên Thần Vàng' 
  },
  mint: { 
    // Ethereal Mint Angel
    hair: '#B0E0E6',
    hairHighlight: '#E0FFFF',
    hairGlow: '#40E0D0',
    skin: '#FFF5EB',
    cheek: '#E0FFFF',
    dress: '#F0FFFF', 
    dressGold: '#40E0D0',
    dressShimmer: '#AFEEEE',
    wings: '#E0FFFF',
    wingsLight: '#F0FFFF',
    wingsSparkle: '#00CED1',
    heart: '#40E0D0',
    heartGlow: '#7FFFD4',
    halo: '#40E0D0',
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

    if (!isMobileRef.current && Math.random() > 0.4) {
      const newTrail: StarTrail = {
        id: trailIdRef.current++,
        x: e.clientX + (Math.random() - 0.5) * 40,
        y: e.clientY + (Math.random() - 0.5) * 40,
        opacity: 1,
        size: 6 + Math.random() * 10,
      };
      setTrails((prev) => [...prev.slice(-20), newTrail]);
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
  const wingFlap = Math.sin(phase * 0.15) * (isHovering ? 12 : 8);
  const floatY = Math.sin(phase * 0.05) * 3;
  const hairFlow = Math.sin(phase * 0.08) * 6;
  const dressFlow = Math.sin(phase * 0.06) * 4;
  const heartPulse = 0.9 + Math.sin(phase * 0.12) * 0.15;
  const haloGlow = 0.6 + Math.sin(phase * 0.1) * 0.3;
  const sparklePhase = phase * 0.2;

  const ui = (
    <>
      {/* Golden sparkle trails */}
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
            <defs>
              <radialGradient id={`sparkle-${trail.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor={colors.wingsSparkle} />
                <stop offset="100%" stopColor={colors.wingsSparkle} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="8" cy="8" r="6" fill={`url(#sparkle-${trail.id})`} />
            <path
              d="M8 0L9 6L16 8L9 10L8 16L7 10L0 8L7 6L8 0Z"
              fill={colors.wingsSparkle}
              opacity="0.8"
              transform="scale(0.5) translate(8, 8)"
            />
          </svg>
        </div>
      ))}

      {/* Elegant Angel */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: currentPos.x,
          top: currentPos.y,
          transform: `translate(-50%, -50%) translateY(${floatY}px)`,
          transition: isIdle ? 'left 3s ease-in-out, top 3s ease-in-out' : 'none',
        }}
      >
        <svg width="75" height="95" viewBox="0 0 75 95" className="overflow-visible" style={{ filter: 'drop-shadow(0 4px 12px rgba(255, 215, 0, 0.3))' }}>
          <defs>
            {/* Skin gradient */}
            <radialGradient id="angelSkin" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor={colors.skin} />
              <stop offset="100%" stopColor="#FFE4D4" />
            </radialGradient>
            
            {/* Crystal wing gradient */}
            <linearGradient id="crystalWing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.wingsLight} stopOpacity="0.95" />
              <stop offset="30%" stopColor={colors.wings} stopOpacity="0.7" />
              <stop offset="70%" stopColor={colors.wingsSparkle} stopOpacity="0.5" />
              <stop offset="100%" stopColor={colors.wingsLight} stopOpacity="0.3" />
            </linearGradient>
            
            {/* Hair gradient - flowing gold */}
            <linearGradient id="goldenHair" x1="0%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={colors.hairHighlight} />
              <stop offset="40%" stopColor={colors.hair} />
              <stop offset="100%" stopColor={colors.hairGlow} />
            </linearGradient>
            
            {/* Dress shimmer */}
            <linearGradient id="dressShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.dress} />
              <stop offset="50%" stopColor={colors.dressShimmer} />
              <stop offset="100%" stopColor={colors.dress} />
            </linearGradient>
            
            {/* Heart glow */}
            <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor={colors.heartGlow} />
              <stop offset="100%" stopColor={colors.heart} />
            </radialGradient>
            
            {/* Halo gradient */}
            <linearGradient id="haloGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.halo} stopOpacity="0.3" />
              <stop offset="50%" stopColor={colors.halo} stopOpacity="0.9" />
              <stop offset="100%" stopColor={colors.halo} stopOpacity="0.3" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="angelGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ethereal Aura */}
          <ellipse 
            cx="37.5" cy="50" rx="35" ry="40" 
            fill="none" 
            stroke={colors.wingsSparkle} 
            strokeWidth="0.5" 
            opacity={0.2 + haloGlow * 0.2}
          />

          {/* Halo */}
          <ellipse 
            cx="37.5" cy="8" rx="14" ry="4" 
            fill="none" 
            stroke="url(#haloGrad)" 
            strokeWidth="2.5"
            opacity={haloGlow}
            filter="url(#softGlow)"
          />

          {/* Crystal Wings - Left */}
          <g transform={`rotate(${-wingFlap}, 30, 35)`} filter="url(#softGlow)">
            {/* Main wing */}
            <path
              d="M28 35 Q5 20 3 40 Q5 55 15 58 Q22 55 28 45 Z"
              fill="url(#crystalWing)"
              opacity="0.85"
            />
            {/* Wing detail lines */}
            <path d="M28 38 Q15 30 8 40" stroke={colors.wingsSparkle} strokeWidth="0.5" fill="none" opacity="0.6" />
            <path d="M28 42 Q18 38 12 48" stroke={colors.wingsSparkle} strokeWidth="0.5" fill="none" opacity="0.6" />
            <path d="M26 48 Q20 48 16 55" stroke={colors.wingsSparkle} strokeWidth="0.5" fill="none" opacity="0.6" />
            {/* Sparkles on wing */}
            <circle cx="10" cy="38" r="1.5" fill={colors.wingsSparkle} opacity={0.5 + Math.sin(sparklePhase) * 0.4} />
            <circle cx="15" cy="50" r="1" fill={colors.wingsSparkle} opacity={0.5 + Math.sin(sparklePhase + 1) * 0.4} />
            <circle cx="8" cy="45" r="0.8" fill="#FFFFFF" opacity={0.6 + Math.sin(sparklePhase + 2) * 0.3} />
          </g>
          
          {/* Crystal Wings - Right */}
          <g transform={`rotate(${wingFlap}, 45, 35)`} filter="url(#softGlow)">
            <path
              d="M47 35 Q70 20 72 40 Q70 55 60 58 Q53 55 47 45 Z"
              fill="url(#crystalWing)"
              opacity="0.85"
            />
            <path d="M47 38 Q60 30 67 40" stroke={colors.wingsSparkle} strokeWidth="0.5" fill="none" opacity="0.6" />
            <path d="M47 42 Q57 38 63 48" stroke={colors.wingsSparkle} strokeWidth="0.5" fill="none" opacity="0.6" />
            <path d="M49 48 Q55 48 59 55" stroke={colors.wingsSparkle} strokeWidth="0.5" fill="none" opacity="0.6" />
            <circle cx="65" cy="38" r="1.5" fill={colors.wingsSparkle} opacity={0.5 + Math.sin(sparklePhase + 0.5) * 0.4} />
            <circle cx="60" cy="50" r="1" fill={colors.wingsSparkle} opacity={0.5 + Math.sin(sparklePhase + 1.5) * 0.4} />
            <circle cx="67" cy="45" r="0.8" fill="#FFFFFF" opacity={0.6 + Math.sin(sparklePhase + 2.5) * 0.3} />
          </g>

          {/* Long flowing hair - back layer */}
          <path
            d={`M22 18 Q15 ${35 + hairFlow} 12 ${55 + hairFlow * 1.2} Q10 ${70 + hairFlow} 15 ${80 + hairFlow * 0.8}`}
            stroke="url(#goldenHair)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d={`M25 16 Q18 ${30 + hairFlow * 0.8} 16 ${48 + hairFlow} Q14 ${62 + hairFlow * 0.9} 18 ${75 + hairFlow * 0.7}`}
            stroke="url(#goldenHair)"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d={`M53 18 Q60 ${35 - hairFlow * 0.6} 63 ${55 - hairFlow * 0.8} Q65 ${70 - hairFlow * 0.5} 60 ${80 - hairFlow * 0.6}`}
            stroke="url(#goldenHair)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d={`M50 16 Q57 ${30 - hairFlow * 0.5} 59 ${48 - hairFlow * 0.7}`}
            stroke="url(#goldenHair)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Elegant White Dress */}
          <g>
            {/* Dress body */}
            <path
              d={`M28 42 Q37.5 38 47 42 L${52 + dressFlow} ${75 + dressFlow * 0.5} Q37.5 80 ${23 - dressFlow} ${75 + dressFlow * 0.5} Z`}
              fill="url(#dressShimmer)"
              opacity="0.95"
            />
            {/* Dress folds */}
            <path
              d={`M32 50 Q35 ${65 + dressFlow * 0.3} 30 ${78 + dressFlow * 0.4}`}
              stroke={colors.dressGold}
              strokeWidth="0.8"
              fill="none"
              opacity="0.4"
            />
            <path
              d={`M43 50 Q40 ${65 - dressFlow * 0.3} 45 ${78 - dressFlow * 0.4}`}
              stroke={colors.dressGold}
              strokeWidth="0.8"
              fill="none"
              opacity="0.4"
            />
            {/* Golden trim */}
            <path
              d={`M${23 - dressFlow} ${75 + dressFlow * 0.5} Q37.5 82 ${52 + dressFlow} ${75 + dressFlow * 0.5}`}
              stroke={colors.dressGold}
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
            />
            {/* Bodice detail */}
            <ellipse cx="37.5" cy="44" rx="7" ry="3" fill={colors.dressShimmer} opacity="0.5" />
          </g>

          {/* Delicate Arms */}
          {/* Left arm - holding heart */}
          <path
            d={`M28 45 Q22 50 20 55 Q18 60 22 62`}
            stroke="url(#angelSkin)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="22" cy="63" r="2.5" fill="url(#angelSkin)" />
          
          {/* Right arm */}
          <path
            d={`M47 45 Q53 50 55 55 Q57 60 53 62`}
            stroke="url(#angelSkin)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="53" cy="63" r="2.5" fill="url(#angelSkin)" />

          {/* Glowing Heart in hands */}
          <g transform={`translate(37.5, 68) scale(${heartPulse})`} filter="url(#angelGlow)">
            {/* Heart glow aura */}
            <ellipse cx="0" cy="0" rx="12" ry="10" fill={colors.heartGlow} opacity="0.3" />
            {/* Heart shape */}
            <path
              d="M0 4 C-4 0 -8 -4 -8 -7 C-8 -11 -4 -12 0 -8 C4 -12 8 -11 8 -7 C8 -4 4 0 0 4Z"
              fill="url(#heartGlow)"
            />
            {/* Heart shine */}
            <ellipse cx="-3" cy="-6" rx="2" ry="1.5" fill="#FFFFFF" opacity="0.7" />
            {/* Heart sparkles */}
            {[...Array(5)].map((_, i) => (
              <circle
                key={i}
                cx={Math.cos((sparklePhase + i * 72 * Math.PI / 180) * 2) * 10}
                cy={Math.sin((sparklePhase + i * 72 * Math.PI / 180) * 2) * 8}
                r={1 + Math.sin(sparklePhase + i) * 0.5}
                fill={colors.wingsSparkle}
                opacity={0.6 + Math.sin(sparklePhase + i * 0.5) * 0.4}
              />
            ))}
          </g>

          {/* Elegant Face */}
          <ellipse cx="37.5" cy="26" rx="10" ry="12" fill="url(#angelSkin)" />
          
          {/* Delicate jawline */}
          <ellipse cx="37.5" cy="34" rx="6" ry="4" fill="url(#angelSkin)" />

          {/* Hair top - crown with golden sparkles */}
          <ellipse cx="37.5" cy="16" rx="11" ry="7" fill="url(#goldenHair)" />
          <ellipse cx="37.5" cy="14" rx="8" ry="4" fill={colors.hairHighlight} opacity="0.7" />
          
          {/* Hair strands framing face */}
          <path
            d={`M27 17 Q23 ${22 + hairFlow * 0.3} 22 ${30 + hairFlow * 0.4}`}
            stroke="url(#goldenHair)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M48 17 Q52 ${22 - hairFlow * 0.2} 53 ${30 - hairFlow * 0.3}`}
            stroke="url(#goldenHair)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Hair sparkles */}
          {[...Array(6)].map((_, i) => (
            <circle
              key={i}
              cx={25 + i * 5}
              cy={12 + Math.sin(i * 0.8) * 3}
              r={0.8 + Math.sin(sparklePhase + i) * 0.4}
              fill={colors.hairGlow}
              opacity={0.5 + Math.sin(sparklePhase + i * 0.7) * 0.4}
            />
          ))}

          {/* Closed serene eyes - like the avatar */}
          <g>
            {/* Left eye - closed, peaceful curve */}
            <path
              d="M30 26 Q33 28 36 26"
              stroke="#5D4E37"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Delicate lashes */}
            <path d="M30 26 Q29 24 28 24" stroke="#5D4E37" strokeWidth="0.6" fill="none" />
            <path d="M32 27 Q31 25 30 24.5" stroke="#5D4E37" strokeWidth="0.6" fill="none" />
            <path d="M34 27 Q34 25 33.5 24.5" stroke="#5D4E37" strokeWidth="0.6" fill="none" />
            
            {/* Right eye - closed, peaceful curve */}
            <path
              d="M39 26 Q42 28 45 26"
              stroke="#5D4E37"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Delicate lashes */}
            <path d="M45 26 Q46 24 47 24" stroke="#5D4E37" strokeWidth="0.6" fill="none" />
            <path d="M43 27 Q44 25 45 24.5" stroke="#5D4E37" strokeWidth="0.6" fill="none" />
            <path d="M41 27 Q41 25 41.5 24.5" stroke="#5D4E37" strokeWidth="0.6" fill="none" />
          </g>

          {/* Soft cheek blush */}
          <ellipse cx="29" cy="30" rx="3.5" ry="1.8" fill={colors.cheek} opacity="0.35" />
          <ellipse cx="46" cy="30" rx="3.5" ry="1.8" fill={colors.cheek} opacity="0.35" />

          {/* Gentle smile */}
          <path 
            d={isHovering ? "M34 33 Q37.5 36 41 33" : "M34 33 Q37.5 35 41 33"} 
            stroke="#D4A5A5" 
            strokeWidth="1" 
            fill="none" 
            strokeLinecap="round"
          />

          {/* Floating sparkles around angel */}
          {!isMobileRef.current && [...Array(8)].map((_, i) => (
            <circle
              key={i}
              cx={37.5 + Math.cos((sparklePhase + i * 45) * 0.08) * (25 + i * 3)}
              cy={45 + Math.sin((sparklePhase + i * 45) * 0.08) * (20 + i * 2)}
              r={1 + Math.sin((sparklePhase + i * 30) * 0.15) * 0.6}
              fill={colors.wingsSparkle}
              opacity={0.4 + Math.sin(sparklePhase * 0.1 + i) * 0.3}
            />
          ))}
        </svg>
      </div>
    </>
  );

  return createPortal(ui, document.body);
};

export { ANGEL_VARIANTS };
