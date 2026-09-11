import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { borderRadius, shadows } from './tokens';

type ThemeMode = 'light' | 'dark' | 'system';

interface Theme {
  colors: typeof colors.light;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const activeMode = mode === 'system' ? (systemColorScheme || 'light') : mode;
  const isDark = activeMode === 'dark';

  const theme: Theme = {
    colors: isDark ? colors.dark : colors.light,
    spacing,
    typography,
    borderRadius,
    shadows,
    isDark,
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
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
