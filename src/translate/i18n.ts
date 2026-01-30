import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import global_es from './es/global.json';
import global_en from './en/global.json';
import global_ca from './ca/global.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    interpolation: { escapeValue: false }, // React already does escaping
    lng: 'es', // default language
    fallbackLng: 'es',
    resources: {
      es: {
        global: global_es,
      },
      en: {
        global: global_en,
      },
      ca: {
        global: global_ca,
      },
    },
    ns: ['global'],
    defaultNS: 'global',
  });

export default i18n;
