import { createContext, useContext, useState, useEffect } from 'react';
import translations from '@/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ko');

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('language') || 'ko';
    setLanguage(savedLanguage);
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key, defaultValue) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (!value || typeof value !== 'object') {
        return defaultValue || key;
      }
      value = value[k];
    }
    
    return value || defaultValue || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};