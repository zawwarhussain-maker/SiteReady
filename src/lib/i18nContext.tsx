import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from './translations';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface I18nContextType {
  locale: Locale;
  dir: Direction;
  isRtl: boolean;
  setLocale: (locale: Locale) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (dateStr?: string | null) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('siteready_locale');
    if (saved === 'ar' || saved === 'en') return saved;
    // Default to 'en' or browser language
    return navigator.language.startsWith('ar') ? 'ar' : 'en';
  });

  const dir: Direction = locale === 'ar' ? 'rtl' : 'ltr';
  const isRtl = locale === 'ar';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStorage.setItem('siteready_locale', locale);
  }, [locale, dir]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const toggleLanguage = () => {
    setLocaleState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = (translations as Record<string, Record<string, string>>)[locale] || translations.en;
    let translation = dict[key] || translations.en[key as keyof typeof translations.en] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        translation = translation.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramVal));
      });
    }

    return translation;
  };

  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return isRtl ? 'غير محدد' : 'N/A';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Riyadh'
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(num);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        dir,
        isRtl,
        setLocale,
        toggleLanguage,
        t,
        formatDate,
        formatNumber,
        formatCurrency
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
