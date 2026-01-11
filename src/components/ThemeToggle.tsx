import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

type Theme = 'light' | 'dark' | 'system';

const ThemeToggle = () => {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="w-4 h-4" />, label: t('theme.light', 'Light') },
    { value: 'dark', icon: <Moon className="w-4 h-4" />, label: t('theme.dark', 'Dark') },
    { value: 'system', icon: <Monitor className="w-4 h-4" />, label: t('theme.system', 'System') },
  ];

  return (
    <div 
      className="flex items-center gap-1 p-1 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.8) 0%, rgba(255, 248, 220, 0.8) 100%)',
        border: '1px solid rgba(218, 165, 32, 0.3)',
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium",
            theme === option.value
              ? "bg-gradient-to-r from-[#DAA520] to-[#B8860B] text-white shadow-sm"
              : "text-[#8B6914] hover:bg-[#FFFACD]/50"
          )}
          title={option.label}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
