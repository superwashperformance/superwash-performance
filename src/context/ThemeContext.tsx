import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeSettings, ThemeMode, PrimaryColorName, InterfaceSize, FontScale } from '../types';

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: 'dark',
  primaryColor: 'cyan',
  interfaceSize: 'normal',
  fontScale: 'normal',
  showAnimations: true,
  showShadows: true,
  allowTransparencies: true,
  roundedCorners: true,
  highContrast: false,
  reduceMotion: false,
};

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
  effectiveMode: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('sw_theme_settings');
    if (saved) {
      try {
        return { ...DEFAULT_THEME_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error parsing saved theme settings', e);
      }
    }
    return DEFAULT_THEME_SETTINGS;
  });

  const [effectiveMode, setEffectiveMode] = useState<'dark' | 'light'>('dark');

  // Handle system theme changes
  useEffect(() => {
    const determineEffectiveMode = (): 'dark' | 'light' => {
      if (settings.mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return settings.mode;
    };

    const mode = determineEffectiveMode();
    setEffectiveMode(mode);

    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    root.setAttribute('data-primary', settings.primaryColor);
    root.setAttribute('data-size', settings.interfaceSize);
    root.setAttribute('data-font', settings.fontScale);
    root.setAttribute('data-animations', settings.showAnimations ? 'true' : 'false');
    root.setAttribute('data-shadows', settings.showShadows ? 'true' : 'false');
    root.setAttribute('data-transparencies', settings.allowTransparencies ? 'true' : 'false');
    root.setAttribute('data-rounded', settings.roundedCorners ? 'true' : 'false');
    root.setAttribute('data-contrast', settings.highContrast ? 'true' : 'false');
    root.setAttribute('data-reduce-motion', settings.reduceMotion ? 'true' : 'false');

    // Listener for system preference changes
    if (settings.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newMode = e.matches ? 'dark' : 'light';
        setEffectiveMode(newMode);
        root.setAttribute('data-theme', newMode);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('sw_theme_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_THEME_SETTINGS);
    localStorage.setItem('sw_theme_settings', JSON.stringify(DEFAULT_THEME_SETTINGS));
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, resetSettings, effectiveMode }}>
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
