import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import Thai translations
import commonTh from './locales/th/common.json'
import navigationTh from './locales/th/navigation.json'
import memberTh from './locales/th/member.json'
import lotteryTh from './locales/th/lottery.json'
import transactionTh from './locales/th/transaction.json'
import promotionTh from './locales/th/promotion.json'
import gameTh from './locales/th/game.json'
import authTh from './locales/th/auth.json'
import affiliateTh from './locales/th/affiliate.json'
import landingTh from './locales/th/landing.json'

// Import English translations
import commonEn from './locales/en/common.json'
import navigationEn from './locales/en/navigation.json'
import memberEn from './locales/en/member.json'
import lotteryEn from './locales/en/lottery.json'
import transactionEn from './locales/en/transaction.json'
import promotionEn from './locales/en/promotion.json'
import gameEn from './locales/en/game.json'
import authEn from './locales/en/auth.json'
import affiliateEn from './locales/en/affiliate.json'
import landingEn from './locales/en/landing.json'

const resources = {
  th: {
    common: commonTh,
    navigation: navigationTh,
    member: memberTh,
    lottery: lotteryTh,
    transaction: transactionTh,
    promotion: promotionTh,
    game: gameTh,
    auth: authTh,
    affiliate: affiliateTh,
    landing: landingTh,
  },
  en: {
    common: commonEn,
    navigation: navigationEn,
    member: memberEn,
    lottery: lotteryEn,
    transaction: transactionEn,
    promotion: promotionEn,
    game: gameEn,
    auth: authEn,
    affiliate: affiliateEn,
    landing: landingEn,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    ns: ['common', 'navigation', 'member', 'lottery', 'transaction', 'promotion', 'game', 'auth', 'affiliate', 'landing'],
    fallbackLng: 'th',
    supportedLngs: ['th', 'en'],
    load: 'languageOnly', // This ensures we only get 'th' or 'en', not 'th-TH' or 'en-US'
    // Don't set lng - let LanguageDetector handle it from localStorage

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    react: {
      useSuspense: false,
    },
  })

export default i18n
