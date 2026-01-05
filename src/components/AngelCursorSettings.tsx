import { ANGEL_VARIANTS, VariantKey } from './AngelCursor';
import { Sparkles } from 'lucide-react';

interface AngelCursorSettingsProps {
  currentVariant: VariantKey;
  onVariantChange: (variant: VariantKey) => void;
}

const VARIANT_COLORS: Record<VariantKey, { bg: string; border: string }> = {
  default: { bg: 'linear-gradient(135deg, #FF69B4 50%, #1a1a2e 50%)', border: '#FF69B4' },
  pink: { bg: 'linear-gradient(135deg, #FF85C0 50%, #4a3728 50%)', border: '#FF85C0' },
  golden: { bg: 'linear-gradient(135deg, #FFD700 50%, #1a1a2e 50%)', border: '#FFD700' },
  mint: { bg: 'linear-gradient(135deg, #87CEEB 50%, #1a1a2e 50%)', border: '#87CEEB' },
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

// Mini Shizuka preview
const MiniAngelPreview = ({ variant }: { variant: VariantKey }) => {
  const colors = ANGEL_VARIANTS[variant];
  
  return (
    <svg width="32" height="38" viewBox="0 0 40 48" className="animate-bounce">
      {/* Hair back */}
      <ellipse cx="20" cy="10" rx="10" ry="9" fill={colors.hair} />
      {/* Face */}
      <ellipse cx="20" cy="12" rx="8" ry="7" fill={colors.skin} />
      {/* Hair bangs */}
      <path d="M10 10 Q14 4 20 6 Q26 4 30 10 L28 14 Q24 8 20 10 Q16 8 12 14 Z" fill={colors.hair} />
      {/* Eyes */}
      <ellipse cx="16" cy="12" rx="2" ry="2.5" fill="#fff" />
      <ellipse cx="24" cy="12" rx="2" ry="2.5" fill="#fff" />
      <circle cx="16" cy="12" r="1.5" fill={colors.eyes} />
      <circle cx="24" cy="12" r="1.5" fill={colors.eyes} />
      <circle cx="15.5" cy="11" r="0.6" fill="#fff" />
      <circle cx="23.5" cy="11" r="0.6" fill="#fff" />
      {/* Cheeks */}
      <ellipse cx="13" cy="14" rx="2" ry="1" fill={colors.cheek} opacity="0.5" />
      <ellipse cx="27" cy="14" rx="2" ry="1" fill={colors.cheek} opacity="0.5" />
      {/* Mouth */}
      <path d="M18 16 Q20 18 22 16" stroke="#D4736C" strokeWidth="0.8" fill="none" />
      {/* Ribbon */}
      <path d="M28 8 Q32 6 30 8 Q32 10 28 8" fill={colors.ribbon} />
      {/* Dress */}
      <path d="M14 20 L20 18 L26 20 L29 42 L20 44 L11 42 Z" fill={colors.dress} />
      {/* Dress collar */}
      <path d="M16 20 Q20 22 24 20" stroke={colors.dressLight} strokeWidth="1" fill="none" />
    </svg>
  );
};
