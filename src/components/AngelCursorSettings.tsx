import { ANGEL_VARIANTS, VariantKey } from './AngelCursor';
import { Sparkles } from 'lucide-react';

interface AngelCursorSettingsProps {
  currentVariant: VariantKey;
  onVariantChange: (variant: VariantKey) => void;
}

const VARIANT_COLORS: Record<VariantKey, { bg: string; border: string }> = {
  default: { bg: 'linear-gradient(135deg, #FFFFFF 50%, #FFD700 50%)', border: '#FFD700' },
  pink: { bg: 'linear-gradient(135deg, #FFF0F5 50%, #FF69B4 50%)', border: '#FF69B4' },
  golden: { bg: 'linear-gradient(135deg, #FFFAF0 50%, #FFA500 50%)', border: '#FFA500' },
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
          Màu Thiên Thần Con Trỏ
        </h3>
      </div>
      
      <p className="text-sm mb-4" style={{ color: '#8B6914' }}>
        Chọn màu thiên thần bay lượn theo con trỏ yêu thích của con ✨
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

      {/* Preview mini angel */}
      <div className="mt-4 flex items-center justify-center p-4 rounded-xl" 
        style={{ background: 'rgba(255, 255, 255, 0.5)' }}
      >
        <div className="flex items-center gap-2">
          <MiniAngelPreview variant={currentVariant} />
          <span className="text-xs" style={{ color: '#8B6914' }}>
            Thiên thần đang bay theo con trỏ của con!
          </span>
        </div>
      </div>
    </div>
  );
};

// Mini Angel preview with wings
const MiniAngelPreview = ({ variant }: { variant: VariantKey }) => {
  const colors = ANGEL_VARIANTS[variant];
  
  return (
    <svg width="40" height="48" viewBox="0 0 50 55" className="animate-bounce">
      {/* Halo */}
      <ellipse cx="25" cy="4" rx="8" ry="2.5" fill="none" stroke={colors.halo} strokeWidth="1.5" opacity="0.8" />
      
      {/* Wings - Left */}
      <path d="M18 24 Q5 18 4 26 Q6 35 12 37 Q16 34 18 28 Z" fill={colors.wings} opacity="0.85" />
      {/* Wings - Right */}
      <path d="M32 24 Q45 18 46 26 Q44 35 38 37 Q34 34 32 28 Z" fill={colors.wings} opacity="0.85" />
      
      {/* Hair back */}
      <ellipse cx="25" cy="14" rx="12" ry="10" fill={colors.hair} />
      {/* Flowing hair left */}
      <path d="M13 14 Q8 22 10 32 Q12 38 15 40" fill={colors.hair} />
      {/* Flowing hair right */}
      <path d="M37 14 Q42 22 40 32 Q38 38 35 40" fill={colors.hair} />
      
      {/* Face */}
      <ellipse cx="25" cy="16" rx="9" ry="8" fill={colors.skin} />
      {/* Hair bangs */}
      <path d="M13 12 Q17 5 25 7 Q33 5 37 12 L35 17 Q30 10 25 12 Q20 10 15 17 Z" fill={colors.hair} />
      
      {/* Eyes */}
      <ellipse cx="21" cy="16" rx="1.8" ry="2.2" fill="#fff" />
      <ellipse cx="29" cy="16" rx="1.8" ry="2.2" fill="#fff" />
      <circle cx="21" cy="16" r="1.3" fill={colors.eyes} />
      <circle cx="29" cy="16" r="1.3" fill={colors.eyes} />
      <circle cx="20.5" cy="15" r="0.5" fill="#fff" />
      <circle cx="28.5" cy="15" r="0.5" fill="#fff" />
      
      {/* Cheeks */}
      <ellipse cx="17" cy="18" rx="2" ry="1" fill={colors.cheek} opacity="0.5" />
      <ellipse cx="33" cy="18" rx="2" ry="1" fill={colors.cheek} opacity="0.5" />
      
      {/* Mouth */}
      <path d="M23 20 Q25 22 27 20" stroke="#D4736C" strokeWidth="0.7" fill="none" />
      
      {/* Ribbon */}
      <path d="M35 10 Q39 8 37 10 Q39 12 35 10" fill={colors.ribbon} />
      
      {/* Angel Dress */}
      <path d="M18 26 L25 24 L32 26 L36 50 L25 52 L14 50 Z" fill={colors.dress} />
      {/* Dress golden trim */}
      <path d="M20 26 Q25 28 30 26" stroke={colors.dressAccent} strokeWidth="1" fill="none" />
      <path d="M14 50 Q25 53 36 50" stroke={colors.dressAccent} strokeWidth="1" fill="none" />
    </svg>
  );
};
