import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { languages } from '@/i18n';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

const LanguageSelector = ({ compact = false, className }: LanguageSelectorProps) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "flex items-center gap-2 rounded-xl transition-all duration-300",
          compact 
            ? "p-2 hover:bg-[#FFFACD]/50" 
            : "px-4 py-2 hover:bg-[#FFFACD]/50 border border-[#DAA520]/30"
        )}
        style={{ color: '#8B6914' }}
        title={t('language.select')}
      >
        {compact ? (
          <>
            <span className="text-lg">{currentLang.flag}</span>
          </>
        ) : (
          <>
            <Globe className="w-4 h-4" style={{ color: '#DAA520' }} />
            <span className="text-lg">{currentLang.flag}</span>
            <span className="text-sm font-medium hidden sm:inline">{currentLang.name}</span>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 py-2 rounded-xl shadow-lg z-50 min-w-[160px] overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 100%)',
            border: '2px solid #DAA520',
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-200",
                i18n.language === lang.code 
                  ? "bg-[#FFFACD]" 
                  : "hover:bg-[#FFFACD]/50"
              )}
            >
              <span className="text-xl">{lang.flag}</span>
              <span 
                className={cn(
                  "text-sm font-medium",
                  i18n.language === lang.code ? "text-[#B8860B] font-bold" : "text-[#8B6914]"
                )}
              >
                {lang.name}
              </span>
              {i18n.language === lang.code && (
                <span className="ml-auto text-[#DAA520]">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
