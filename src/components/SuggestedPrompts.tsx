import { Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SuggestedPromptsProps {
  mode: 'chat' | 'image';
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const SuggestedPrompts = ({ mode, onSelect, disabled }: SuggestedPromptsProps) => {
  const { t } = useTranslation();

  const suggestions = t(`chat.suggestions.${mode}`, { returnObjects: true }) as string[];

  if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4" style={{ color: '#DAA520' }} />
        <span 
          className="text-sm font-medium"
          style={{ color: '#B8860B' }}
        >
          {t('chat.suggested_prompts', 'Suggested questions')}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="px-4 py-2 rounded-full text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.95) 100%)',
              border: '1px solid rgba(218, 165, 32, 0.4)',
              color: '#5C4033',
              boxShadow: '0 2px 8px rgba(218, 165, 32, 0.15)',
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;
