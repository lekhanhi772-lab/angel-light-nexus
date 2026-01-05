import { ANGEL_VARIANTS, VariantKey } from './AngelCursor';
import { Sparkles } from 'lucide-react';

interface AngelCursorSettingsProps {
  currentVariant: VariantKey;
  onVariantChange: (variant: VariantKey) => void;
}

const VARIANT_COLORS: Record<VariantKey, { bg: string; border: string }> = {
  default: { bg: 'linear-gradient(135deg, #FFFFFF 50%, #FFD700 50%)', border: '#FFD700' },
  pink: { bg: 'linear-gradient(135deg, #FFB6C1 50%, #9370DB 50%)', border: '#9370DB' },
  golden: { bg: 'linear-gradient(135deg, #FFD700 50%, #FFA500 50%)', border: '#FFA500' },
  mint: { bg: 'linear-gradient(135deg, #98FF98 50%, #FFFFFF 50%)', border: '#98FF98' },
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

// Mini preview angel
const MiniAngelPreview = ({ variant }: { variant: VariantKey }) => {
  const colors = ANGEL_VARIANTS[variant];
  
  return (
    <svg width="32" height="38" viewBox="0 0 40 48" className="animate-bounce">
      <ellipse cx="20" cy="4" rx="6" ry="2" fill="none" stroke="#FFD700" strokeWidth="1.5" />
      <path d="M12 20 C2 18 0 28 10 32" fill={colors.wings} opacity="0.9" />
      <path d="M28 20 C38 18 40 28 30 32" fill={colors.wings} opacity="0.9" />
      <circle cx="20" cy="12" r="6" fill="#FFE4C4" />
      <ellipse cx="20" cy="9" rx="5.5" ry="3" fill="#8B4513" />
      <circle cx="18" cy="12" r="0.8" fill="#333" />
      <circle cx="22" cy="12" r="0.8" fill="#333" />
      <path d="M15 18 L20 17 L25 18 L27 38 L20 40 L13 38 Z" fill={colors.dress} stroke={colors.wings} strokeWidth="0.5" />
    </svg>
  );
};
