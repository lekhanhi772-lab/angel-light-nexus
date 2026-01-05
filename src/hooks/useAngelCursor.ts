import { useState, useEffect } from 'react';
import { VariantKey } from '@/components/AngelCursor';

const STORAGE_KEY = 'angel-cursor-variant';

export const useAngelCursor = () => {
  const [variant, setVariant] = useState<VariantKey>('default');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['default', 'pink', 'golden', 'mint'].includes(saved)) {
      setVariant(saved as VariantKey);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when variant changes
  const changeVariant = (newVariant: VariantKey) => {
    setVariant(newVariant);
    localStorage.setItem(STORAGE_KEY, newVariant);
  };

  return {
    variant,
    changeVariant,
    isLoaded,
  };
};
