import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './en.json'
import ne from './ne.json'
import hi from './hi.json'
import ru from './ru.json'
import zh from './zh.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ne: { translation: ne },
      hi: { translation: hi },
      ru: { translation: ru },
      zh: { translation: zh },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ne', 'hi', 'ru', 'zh'],
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
