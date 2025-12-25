import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import vi from './locales/vi.json';

const resources = {
    en: { translation: en },
    vi: { translation: vi },
};

// Function to get the language to use
export const getInitialLanguage = (savedLanguage?: string) => {
    if (savedLanguage && savedLanguage !== 'system') {
        return savedLanguage;
    }

    const systemLocales = Localization.getLocales();
    const systemLanguage = systemLocales[0]?.languageCode || 'en';

    return resources.hasOwnProperty(systemLanguage) ? systemLanguage : 'en';
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getInitialLanguage(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
