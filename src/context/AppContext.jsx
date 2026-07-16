import { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('ebo-lang') || 'es');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ebo-dark') === 'true');
  const [cameraEnabled, setCameraEnabled] = useState(() => localStorage.getItem('ebo-camera') !== 'false');
  const [docType, setDocType] = useState('libro');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('ebo-dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('ebo-lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('ebo-camera', cameraEnabled);
  }, [cameraEnabled]);

  return (
    <AppContext.Provider value={{ lang, setLang, darkMode, setDarkMode, cameraEnabled, setCameraEnabled, docType, setDocType }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
