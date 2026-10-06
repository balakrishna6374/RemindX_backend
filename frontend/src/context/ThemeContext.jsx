import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const applyThemeToDOM = (t) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (t === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('remindx_theme');
      if (saved === 'dark' || saved === 'light') {
        applyThemeToDOM(saved);
        return saved;
      }
      // Default to Light theme
      applyThemeToDOM('light');
      return 'light';
    } catch {
      applyThemeToDOM('light');
      return 'light';
    }
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    try {
      localStorage.setItem('remindx_theme', newTheme);
    } catch (e) {}
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem('remindx_theme', theme);
    } catch (e) {}
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
