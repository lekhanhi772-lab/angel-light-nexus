import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// 4 color variants - Cute cartoon fairy style like the reference image
const ANGEL_VARIANTS = {
  default: { 
    // Pink Fairy - like the left one in reference
    hair: '#3D2314', 
    hairHighlight: '#5C3A2E',
    hairBow: '#FF69B4',
    skin: '#FFE5D4',
    cheek: '#FFB6C1',
    dress: '#FFB6C1', 
    dressLight: '#FFD1DC',
    dressDark: '#FF69B4',
    wings: '#FFB6C1',
    wingsLight: '#FFD1DC',
    shoes: '#FF69B4',
    name: 'Tiên Hồng Dễ Thương' 
  },
  pink: { 
    // Yellow/Orange Fairy - like the middle one
    hair: '#E67E22', 
    hairHighlight: '#F39C12',
    hairBow: '#27AE60',
    skin: '#FFE5D4',
    cheek: '#FFCBA4',
    dress: '#F1C40F', 
    dressLight: '#F7DC6F',
    dressDark: '#D4AC0D',
    dressLeaves: '#27AE60',
    wings: '#FFFACD',
    wingsLight: '#FFFFFF',
    shoes: '#F1C40F',
    name: 'Tiên Vàng Rực Rỡ' 
  },
  golden: { 
    // Purple Fairy - like the right one
    hair: '#F4D03F', 
    hairHighlight: '#F7DC6F',
    hairBow: '#85C1E9',
    skin: '#FFE5D4',
    cheek: '#E8DAEF',
    dress: '#BB8FCE', 
    dressLight: '#D7BDE2',
    dressDark: '#8E44AD',
    wings: '#D6EAF8',
    wingsLight: '#FFFFFF',
    shoes: '#BB8FCE',
    name: 'Tiên Tím Huyền Bí' 
  },
  mint: { 
    // Mint/Green Fairy variant
    hair: '#1ABC9C', 
    hairHighlight: '#48C9B0',
    hairBow: '#FF69B4',
    skin: '#FFE5D4',
    cheek: '#ABEBC6',
    dress: '#58D68D', 
    dressLight: '#ABEBC6',
    dressDark: '#27AE60',
    wings: '#D5F5E3',
    wingsLight: '#FFFFFF',
    shoes: '#27AE60',
    name: 'Tiên Xanh Lá' 
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
        prev.map((t) => ({ ...t, opacity: t.opacity - 0.06 })).filter((t) => t.opacity > 0)
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
  
  // Animations
  const wingFlap = Math.sin(phase * 0.2) * (isHovering ? 14 : 10);
  const floatY = Math.sin(phase * 0.06) * 2;
  const bodyBounce = Math.sin(phase * 0.08) * 1;
  const hairSwing = Math.sin(phase * 0.1) * 4;
  const dressWave = Math.sin(phase * 0.07) * 3;
  const legDance = Math.sin(phase * 0.12) * 8;
  const armWave = Math.sin(phase * 0.09) * 5;
  const wandGlow = 0.7 + Math.sin(phase * 0.15) * 0.3;

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
            transform: `translate(-50%, -50%) scale(${trail.opacity})`,
          }}
        >
          <svg width={trail.size} height={trail.size} viewBox="0 0 16 16">
            <path
              d="M8 0L9.5 6L16 8L9.5 10L8 16L6.5 10L0 8L6.5 6L8 0Z"
              fill="#FFD700"
              filter="drop-shadow(0 0 3px rgba(255, 215, 0, 0.9))"
            />
          </svg>
        </div>
      ))}

      {/* Cute Cartoon Fairy */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: currentPos.x,
          top: currentPos.y,
          transform: `translate(-50%, -50%) translateY(${floatY + bodyBounce}px)`,
          transition: isIdle ? 'left 3s ease-in-out, top 3s ease-in-out' : 'none',
        }}
      >
        <svg width="65" height="80" viewBox="0 0 65 80" className="overflow-visible" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
          <defs>
            <radialGradient id="skinTone" cx="40%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FFF5EB" />
              <stop offset="100%" stopColor={colors.skin} />
            </radialGradient>
            <radialGradient id="wingGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor={colors.wingsLight} stopOpacity="0.95" />
              <stop offset="100%" stopColor={colors.wings} stopOpacity="0.6" />
            </radialGradient>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.hairHighlight} />
              <stop offset="100%" stopColor={colors.hair} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Wings - Rounded cartoon style */}
          <g transform={`rotate(${-wingFlap}, 26, 32)`}>
            <ellipse cx="10" cy="28" rx="14" ry="20" fill="url(#wingGrad)" />
            <ellipse cx="8" cy="24" rx="8" ry="12" fill={colors.wingsLight} opacity="0.5" />
            <ellipse cx="6" cy="20" rx="4" ry="6" fill="white" opacity="0.6" />
          </g>
          <g transform={`rotate(${wingFlap}, 39, 32)`}>
            <ellipse cx="55" cy="28" rx="14" ry="20" fill="url(#wingGrad)" />
            <ellipse cx="57" cy="24" rx="8" ry="12" fill={colors.wingsLight} opacity="0.5" />
            <ellipse cx="59" cy="20" rx="4" ry="6" fill="white" opacity="0.6" />
          </g>

          {/* Hair back - flowing ponytail */}
          <path
            d={`M38 14 Q48 ${18 + hairSwing} 50 ${30 + hairSwing * 1.2} Q52 ${42 + hairSwing} 48 ${52 + hairSwing * 0.8}`}
            stroke="url(#hairGrad)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M40 12 Q52 ${16 + hairSwing * 0.8} 54 ${26 + hairSwing}`}
            stroke="url(#hairGrad)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Petal Dress - Layered flower style like reference */}
          <g>
            {/* Back dress petals */}
            <ellipse 
              cx={24 - dressWave * 0.4} cy="54" rx="10" ry="12" 
              fill={colors.dressLight}
              transform={`rotate(${-15 + dressWave}, ${24 - dressWave * 0.4}, 54)`}
            />
            <ellipse 
              cx={41 + dressWave * 0.4} cy="54" rx="10" ry="12" 
              fill={colors.dressLight}
              transform={`rotate(${15 - dressWave}, ${41 + dressWave * 0.4}, 54)`}
            />
            
            {/* Middle petals */}
            <ellipse 
              cx={20 - dressWave * 0.3} cy="52" rx="9" ry="11" 
              fill={colors.dress}
              transform={`rotate(${-25 + dressWave * 0.8}, ${20 - dressWave * 0.3}, 52)`}
            />
            <ellipse 
              cx={45 + dressWave * 0.3} cy="52" rx="9" ry="11" 
              fill={colors.dress}
              transform={`rotate(${25 - dressWave * 0.8}, ${45 + dressWave * 0.3}, 52)`}
            />
            
            {/* Front center petals */}
            <ellipse cx="32.5" cy="56" rx="12" ry="14" fill={colors.dress} />
            <ellipse cx="28" cy="54" rx="9" ry="12" fill={colors.dressDark} opacity="0.7" transform={`rotate(-8, 28, 54)`} />
            <ellipse cx="37" cy="54" rx="9" ry="12" fill={colors.dressDark} opacity="0.7" transform={`rotate(8, 37, 54)`} />
            
            {/* Dress bodice */}
            <path
              d="M25 32 Q32.5 30 40 32 L43 48 Q32.5 52 22 48 Z"
              fill={colors.dress}
            />
            <path
              d="M28 34 Q32.5 32 37 34 L38 46 Q32.5 48 27 46 Z"
              fill={colors.dressLight}
              opacity="0.6"
            />
            
            {/* Green leaves for yellow fairy variant */}
            {'dressLeaves' in colors && (
              <>
                <ellipse cx="20" cy="56" rx="6" ry="10" fill={(colors as { dressLeaves: string }).dressLeaves} opacity="0.8" transform="rotate(-30, 20, 56)" />
                <ellipse cx="45" cy="56" rx="6" ry="10" fill={(colors as { dressLeaves: string }).dressLeaves} opacity="0.8" transform="rotate(30, 45, 56)" />
              </>
            )}
          </g>

          {/* Cute legs - dancing pose */}
          <path
            d={`M28 58 Q26 ${64 + legDance * 0.3} 24 ${70 + legDance * 0.5}`}
            stroke={colors.skin}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx={23} cy={72 + legDance * 0.5} rx="4" ry="2.5" fill={colors.shoes} />
          
          <path
            d={`M37 58 Q39 ${64 - legDance * 0.4} 42 ${68 - legDance * 0.6}`}
            stroke={colors.skin}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx={43} cy={69 - legDance * 0.6} rx="4" ry="2.5" fill={colors.shoes} />

          {/* Arms */}
          {/* Left arm holding magic wand */}
          <path
            d={`M24 36 Q18 ${38 + armWave * 0.3} 14 ${34 + armWave * 0.5}`}
            stroke={colors.skin}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Magic Wand */}
          <line 
            x1={14} y1={34 + armWave * 0.5} 
            x2={4} y2={18 + armWave * 0.3} 
            stroke="#C4A35A" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          
          {/* Wand Star with glow */}
          <g filter="url(#glow)">
            <path
              d={`M4 ${18 + armWave * 0.3} 
                  L6 ${13 + armWave * 0.3} 
                  L4 ${8 + armWave * 0.3} 
                  L9 ${11 + armWave * 0.3} 
                  L14 ${8 + armWave * 0.3} 
                  L11 ${13 + armWave * 0.3} 
                  L14 ${18 + armWave * 0.3} 
                  L9 ${15 + armWave * 0.3} Z`}
              fill="#FFD700"
              opacity={wandGlow}
            />
            <circle cx="9" cy={13 + armWave * 0.3} r="2" fill="#FFFACD" opacity={wandGlow} />
          </g>
          
          {/* Sparkles from wand */}
          {[...Array(isHovering ? 6 : 4)].map((_, i) => (
            <circle
              key={i}
              cx={5 + Math.cos((phase + i * 60) * 0.12) * (8 + i * 3)}
              cy={12 + armWave * 0.3 + Math.sin((phase + i * 60) * 0.12) * (6 + i * 2)}
              r={1 + Math.sin((phase + i * 45) * 0.15) * 0.5}
              fill="#FFD700"
              opacity={0.9 - i * 0.12}
            />
          ))}

          {/* Right arm */}
          <path
            d={`M41 36 Q47 ${38 - armWave * 0.2} 50 ${42 - armWave * 0.3}`}
            stroke={colors.skin}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={51} cy={43 - armWave * 0.3} r="3" fill={colors.skin} />

          {/* Big round head - cartoon style */}
          <circle cx="32.5" cy="20" r="14" fill="url(#skinTone)" />

          {/* Hair top */}
          <ellipse cx="32.5" cy="12" rx="12" ry="7" fill="url(#hairGrad)" />
          
          {/* Side hair strands */}
          <path
            d={`M20 14 Q16 ${18 + hairSwing * 0.4} 15 ${26 + hairSwing * 0.6}`}
            stroke="url(#hairGrad)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M22 12 Q17 ${15 + hairSwing * 0.3} 16 ${20 + hairSwing * 0.4}`}
            stroke="url(#hairGrad)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />

          {/* Cute Hair Bow */}
          <g transform="translate(44, 10)">
            <ellipse cx="-4" cy="0" rx="5" ry="3.5" fill={colors.hairBow} transform="rotate(-25)" />
            <ellipse cx="4" cy="0" rx="5" ry="3.5" fill={colors.hairBow} transform="rotate(25)" />
            <circle cx="0" cy="0" r="2.5" fill={colors.hairBow} />
            {/* Bow shine */}
            <ellipse cx="-3" cy="-1" rx="1.5" ry="0.8" fill="white" opacity="0.5" />
            <ellipse cx="3" cy="-1" rx="1.5" ry="0.8" fill="white" opacity="0.5" />
          </g>

          {/* Big Cute Eyes - Cartoon style */}
          <g>
            {/* Eye whites */}
            <ellipse cx="27" cy="20" rx="5" ry="5.5" fill="white" />
            <ellipse cx="38" cy="20" rx="5" ry="5.5" fill="white" />
            
            {/* Irises */}
            <ellipse cx="28" cy="21" rx="3.5" ry="4" fill="#2C1810" />
            <ellipse cx="39" cy="21" rx="3.5" ry="4" fill="#2C1810" />
            
            {/* Big eye shine - anime style */}
            <ellipse cx="29.5" cy="19" rx="1.8" ry="2" fill="white" />
            <ellipse cx="40.5" cy="19" rx="1.8" ry="2" fill="white" />
            <circle cx="26.5" cy="22.5" r="0.8" fill="white" />
            <circle cx="37.5" cy="22.5" r="0.8" fill="white" />
          </g>

          {/* Rosy cheeks */}
          <ellipse cx="22" cy="24" rx="3.5" ry="2" fill={colors.cheek} opacity="0.5" />
          <ellipse cx="43" cy="24" rx="3.5" ry="2" fill={colors.cheek} opacity="0.5" />

          {/* Happy smile - like the reference fairies */}
          <path 
            d={isHovering ? "M28 28 Q32.5 33 37 28" : "M28 28 Q32.5 31 37 28"} 
            stroke="#D35400" 
            strokeWidth="1.8" 
            fill="none" 
            strokeLinecap="round"
          />

          {/* Floating fairy dust */}
          {!isMobileRef.current && [...Array(5)].map((_, i) => (
            <circle
              key={i}
              cx={32.5 + Math.cos((phase + i * 72) * 0.04) * 30}
              cy={40 + Math.sin((phase + i * 72) * 0.04) * 25}
              r={0.8 + Math.sin((phase + i * 55) * 0.08) * 0.4}
              fill="#FFD700"
              opacity={0.5 + Math.sin((phase + i * 40) * 0.06) * 0.3}
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
