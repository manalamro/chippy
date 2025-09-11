import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './translations/ar.json';
import en from './translations/en.json';

// جلب اللغة المحفوظة من localStorage أو استخدام العربية افتراضياً
const savedLanguage = localStorage.getItem('language') || 'ar';

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: savedLanguage, // استخدام اللغة المحفوظة
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
