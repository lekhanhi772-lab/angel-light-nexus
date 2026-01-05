import { ANGEL_VARIANTS, VariantKey } from './AngelCursor';
import { Sparkles } from 'lucide-react';

interface AngelCursorSettingsProps {
  currentVariant: VariantKey;
  onVariantChange: (variant: VariantKey) => void;
}

const VARIANT_COLORS: Record<VariantKey, { bg: string; border: string }> = {
  default: { bg: 'linear-gradient(135deg, #FFF8E7 50%, #FFD700 50%)', border: '#FFD700' },
  pink: { bg: 'linear-gradient(135deg, #FFF0F5 50%, #FF69B4 50%)', border: '#FF69B4' },
  golden: { bg: 'linear-gradient(135deg, #FFFEF5 50%, #FFA500 50%)', border: '#FFA500' },
  mint: { bg: 'linear-gradient(135deg, #F0FFFF 50%, #40E0D0 50%)', border: '#40E0D0' },
};

export const AngelCursorSettings = ({ currentVariant, onVariantChange }: AngelCursorSettingsProps) => {
  return (
    <div 
      className="p-6 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(255, 248, 220, 0.98) 100%)',
        border: '1px solid rgba(218, 165, 32, 0.3)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" style={{ color: '#DAA520' }} />
        <h3 className="text-lg font-bold" style={{ color: '#B8860B' }}>
          Màu Nàng Tiên Con Trỏ
        </h3>
      </div>
      
      <p className="text-sm mb-4" style={{ color: '#8B6914' }}>
        Chọn nàng tiên xinh đẹp bay lượn theo con trỏ của bạn ✨
      </p>

      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(ANGEL_VARIANTS) as VariantKey[]).map((key) => {
          const variant = ANGEL_VARIANTS[key];
          const colors = VARIANT_COLORS[key];
          const isSelected = currentVariant === key;
          
          return (
            <button
              key={key}
              onClick={() => onVariantChange(key)}
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: isSelected 
                  ? 'rgba(218, 165, 32, 0.2)' 
                  : 'rgba(255, 255, 255, 0.5)',
                border: isSelected 
                  ? '2px solid #DAA520' 
                  : '1px solid rgba(218, 165, 32, 0.2)',
                boxShadow: isSelected ? '0 0 15px rgba(218, 165, 32, 0.3)' : 'none',
              }}
            >
              {/* Color preview circle */}
              <div
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{
                  background: colors.bg,
                  border: `2px solid ${colors.border}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              
              <span 
                className="text-sm font-medium text-left"
                style={{ color: isSelected ? '#B8860B' : '#8B6914' }}
              >
                {variant.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Preview mini fairy angel */}
      <div className="mt-4 flex items-center justify-center p-4 rounded-xl" 
        style={{ background: 'rgba(255, 255, 255, 0.5)' }}
      >
        <div className="flex items-center gap-2">
          <MiniAngelPreview variant={currentVariant} />
          <span className="text-xs" style={{ color: '#8B6914' }}>
            Nàng tiên đang bay theo con trỏ của bạn!
          </span>
        </div>
      </div>
    </div>
  );
};

// Mini Fairy Angel preview - elegant style
const MiniAngelPreview = ({ variant }: { variant: VariantKey }) => {
  const colors = ANGEL_VARIANTS[variant];
  
  return (
    <svg width="45" height="55" viewBox="0 0 70 90" className="animate-bounce">
      <defs>
        <linearGradient id={`previewHair-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.hairGlow} />
          <stop offset="50%" stopColor={colors.hairHighlight} />
          <stop offset="100%" stopColor={colors.hair} />
        </linearGradient>
        <linearGradient id={`previewDress-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.dressLight} />
          <stop offset="50%" stopColor={colors.dress} />
          <stop offset="100%" stopColor={colors.dressShadow} />
        </linearGradient>
        <radialGradient id={`previewWing-${variant}`} cx="30%" cy="30%" r="80%">
          <stop offset="0%" stopColor={colors.wingsLight} stopOpacity="0.95" />
          <stop offset="60%" stopColor={colors.wingsGlow} stopOpacity="0.7" />
          <stop offset="100%" stopColor={colors.wings} stopOpacity="0.4" />
        </radialGradient>
      </defs>
      
      {/* Halo */}
      <ellipse cx="35" cy="5" rx="10" ry="3" fill="none" stroke={colors.halo} strokeWidth="2" opacity="0.8" />
      
      {/* Wings */}
      <path d="M25 42 Q8 28 5 42 Q8 55 16 58 Q22 55 25 46 Z" fill={`url(#previewWing-${variant})`} />
      <path d="M45 42 Q62 28 65 42 Q62 55 54 58 Q48 55 45 46 Z" fill={`url(#previewWing-${variant})`} />
      
      {/* Hair back */}
      <ellipse cx="35" cy="18" rx="14" ry="12" fill={`url(#previewHair-${variant})`} />
      
      {/* Flowing hair */}
      <path d="M22 20 Q17 35 20 55" fill={`url(#previewHair-${variant})`} />
      <path d="M48 20 Q53 35 50 55" fill={`url(#previewHair-${variant})`} />
      
      {/* Face */}
      <ellipse cx="35" cy="24" rx="10" ry="9" fill={colors.skin} />
      
      {/* Hair bangs */}
      <path d="M24 15 Q30 8 35 10 Q40 8 46 15 L44 20 Q38 14 35 15 Q32 14 26 20 Z" fill={`url(#previewHair-${variant})`} />
      
      {/* Cheeks */}
      <ellipse cx="28" cy="26" rx="2.5" ry="1.5" fill={colors.cheek} opacity="0.5" />
      <ellipse cx="42" cy="26" rx="2.5" ry="1.5" fill={colors.cheek} opacity="0.5" />
      
      {/* Eyes - natural almond shape */}
      <ellipse cx="31" cy="23" rx="2" ry="1.5" fill="#FFFFFF" />
      <ellipse cx="39" cy="23" rx="2" ry="1.5" fill="#FFFFFF" />
      <ellipse cx="31.2" cy="23.2" rx="1.2" ry="1" fill={colors.eyes} />
      <ellipse cx="39.2" cy="23.2" rx="1.2" ry="1" fill={colors.eyes} />
      <circle cx="31.5" cy="22.8" r="0.4" fill="#FFFFFF" />
      <circle cx="39.5" cy="22.8" r="0.4" fill="#FFFFFF" />
      
      {/* Lips */}
      <path d="M33 29 Q35 30 37 29" stroke={colors.lips} strokeWidth="0.8" fill="none" />
      
      {/* Dress */}
      <path d="M28 36 Q35 34 42 36 L50 70 Q35 74 20 70 Z" fill={`url(#previewDress-${variant})`} />
      <path d="M18 70 Q35 76 52 70 Q56 80 48 84 Q35 88 22 84 Q14 80 18 70 Z" fill={`url(#previewDress-${variant})`} />
      
      {/* Ribbon belt */}
      <ellipse cx="35" cy="42" rx="6" ry="1.5" fill={colors.ribbon} opacity="0.8" />
      
      {/* Arms */}
      <path d="M28 38 Q22 48 18 54" stroke={colors.skin} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M42 38 Q50 32 55 26" stroke={colors.skin} strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* Wand */}
      <line x1="55" y1="25" x2="60" y2="15" stroke={colors.wand} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M60 12 L61 14 L63 15 L61 16 L60 18 L59 16 L57 15 L59 14 Z" fill={colors.wand} />
      
      {/* Shoes */}
      <ellipse cx="30" cy="86" rx="3" ry="1.5" fill={colors.ribbon} />
      <ellipse cx="40" cy="86" rx="3" ry="1.5" fill={colors.ribbon} />
    </svg>
  );
};
