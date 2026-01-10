import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import vi from './locales/vi.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

export const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', speechCode: 'vi-VN', edgeVoice: 'vi-VN-HoaiMyNeural' },
  { code: 'en', name: 'English', flag: '🇺🇸', speechCode: 'en-US', edgeVoice: 'en-US-JennyNeural' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', speechCode: 'fr-FR', edgeVoice: 'fr-FR-DeniseNeural' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', speechCode: 'ja-JP', edgeVoice: 'ja-JP-NanamiNeural' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', speechCode: 'ko-KR', edgeVoice: 'ko-KR-SunHiNeural' },
];

export const getSpeechCode = (langCode: string): string => {
  const lang = languages.find(l => l.code === langCode);
  return lang?.speechCode || 'vi-VN';
};

export const getEdgeVoice = (langCode: string): string => {
  const lang = languages.find(l => l.code === langCode);
  return lang?.edgeVoice || 'vi-VN-HoaiMyNeural';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
      fr: { translation: fr },
      ja: { translation: ja },
      ko: { translation: ko },
    },
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
