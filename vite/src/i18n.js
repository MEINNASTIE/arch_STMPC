import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      header: {
        measurementStatus: "Measurement Status",
        configuration: {
          title: "Configuration",
          instrumentConfig: "Instrument Configuration",
          factoryConfig: "Factory Configuration",
          changesSummary: "Summary of Changes"
        },
        system: {
          title: "System",
          status: "System Status",
          storage: "Storage",
          info: "System Info"
        },
        language: {
          title: "Language",
          english: "English",
          german: "German",
          french: "French",
          russian: "Russian"
        },
        print: "Print",
        refresh: "Refresh",
        logout: "Log Out"
      }
    }
  },
  de: {
    translation: {
      header: {
        measurementStatus: "Messstatus",
        configuration: {
          title: "Konfiguration",
          instrumentConfig: "Instrumentenkonfiguration",
          factoryConfig: "Werkseinstellungen",
          changesSummary: "Änderungsübersicht"
        },
        system: {
          title: "System",
          status: "Systemstatus",
          storage: "Speicher",
          info: "Systeminformationen"
        },
        language: {
          title: "Sprache",
          english: "Englisch",
          german: "Deutsch",
          french: "Französisch",
          russian: "Russisch"
        },
        print: "Drucken",
        refresh: "Aktualisieren",
        logout: "Abmelden"
      }
    }
  },
  fr: {
    translation: {
      header: {
        measurementStatus: "État de la mesure",
        configuration: {
          title: "Configuration",
          instrumentConfig: "Configuration de l'instrument",
          factoryConfig: "Configuration d'usine",
          changesSummary: "Résumé des modifications"
        },
        system: {
          title: "Système",
          status: "État du système",
          storage: "Stockage",
          info: "Informations système"
        },
        language: {
          title: "Langue",
          english: "Anglais",
          german: "Allemand",
          french: "Français",
          russian: "Russe"
        },
        print: "Imprimer",
        refresh: "Actualiser",
        logout: "Déconnexion"
      }
    }
  },
  ru: {
    translation: {
      header: {
        measurementStatus: "Статус измерения",
        configuration: {
          title: "Конфигурация",
          instrumentConfig: "Конфигурация прибора",
          factoryConfig: "Заводская конфигурация",
          changesSummary: "Сводка изменений"
        },
        system: {
          title: "Система",
          status: "Статус системы",
          storage: "Хранилище",
          info: "Информация о системе"
        },
        language: {
          title: "Язык",
          english: "Английский",
          german: "Немецкий",
          french: "Французский",
          russian: "Русский"
        },
        print: "Печать",
        refresh: "Обновить",
        logout: "Выйти"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 