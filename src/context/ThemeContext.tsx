import React, { createContext, useContext, useState, useEffect } from 'react';
import { UiThemeId } from '../types/pos';

export interface ThemeConfig {
  id: UiThemeId;
  name: string;
  tagline: string;
  accentColorName: string;
  isDark: boolean;
  classes: {
    root: string;
    surface: string;
    subtle: string;
    card: string;
    border: string;
    borderSubtle: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentHover: string;
    accentText: string;
    badge: string;
    activePill: string;
    inactivePill: string;
    input: string;
    sidebarActive: string;
    sidebarHover: string;
  };
}

export const THEMES: Record<UiThemeId, ThemeConfig> = {
  'modern-light': {
    id: 'modern-light',
    name: 'Modern Clean Light',
    tagline: 'Crisp white surfaces, high-contrast typography & clean borders for bright retail counters',
    accentColorName: 'Royal Sapphire',
    isDark: false,
    classes: {
      root: 'bg-slate-100 text-slate-900',
      surface: 'bg-white',
      subtle: 'bg-slate-50',
      card: 'bg-white border-slate-200 shadow-sm hover:border-blue-500/60',
      border: 'border-slate-200',
      borderSubtle: 'border-slate-100',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      accent: 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm',
      accentHover: 'hover:bg-blue-500',
      accentText: 'text-blue-600',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      activePill: 'bg-blue-600 text-white font-semibold shadow-sm',
      inactivePill: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
      input: 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600',
      sidebarActive: 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600',
      sidebarHover: 'hover:bg-slate-100 text-slate-600',
    },
  },
  'midnight-sapphire': {
    id: 'midnight-sapphire',
    name: 'Midnight Sapphire',
    tagline: 'Deep obsidian backdrop with glowing sapphire blue accents & sleek fintech styling',
    accentColorName: 'Electric Sapphire',
    isDark: true,
    classes: {
      root: 'bg-[#0B0F19] text-slate-100',
      surface: 'bg-[#151D2E]',
      subtle: 'bg-[#0E1524]',
      card: 'bg-[#151D2E] border-slate-800 shadow-lg hover:border-blue-500/60',
      border: 'border-slate-800',
      borderSubtle: 'border-slate-800/60',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-500',
      accent: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-950',
      accentHover: 'hover:bg-blue-500',
      accentText: 'text-blue-400',
      badge: 'bg-blue-950/70 text-blue-300 border-blue-800',
      activePill: 'bg-blue-600 text-white font-semibold shadow-md',
      inactivePill: 'bg-[#151D2E] text-slate-400 hover:bg-slate-800',
      input: 'bg-[#0B0F19] border-slate-800 text-slate-100 placeholder-slate-500 focus:border-blue-500',
      sidebarActive: 'bg-blue-600/15 text-blue-400 font-semibold border-r-2 border-blue-500',
      sidebarHover: 'hover:bg-[#151D2E] text-slate-400',
    },
  },
  'artisan-warm': {
    id: 'artisan-warm',
    name: 'Artisan Bistro & Cafe',
    tagline: 'Warm linen parchment, roasted espresso text, toasted amber & terracotta boutique tones',
    accentColorName: 'Terracotta Rust',
    isDark: false,
    classes: {
      root: 'bg-[#FAF7F2] text-[#292524]',
      surface: 'bg-[#F4ECE1]',
      subtle: 'bg-[#EDE4D7]',
      card: 'bg-[#FDFBF7] border-[#E5DACD] shadow-sm hover:border-[#C2410C]/60',
      border: 'border-[#E5DACD]',
      borderSubtle: 'border-[#EFE9DF]',
      textPrimary: 'text-[#292524]',
      textSecondary: 'text-[#57534E]',
      textMuted: 'text-[#78716C]',
      accent: 'bg-[#C2410C] hover:bg-[#EA580C] text-white shadow-sm',
      accentHover: 'hover:bg-[#EA580C]',
      accentText: 'text-[#C2410C]',
      badge: 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]',
      activePill: 'bg-[#C2410C] text-white font-semibold shadow-sm',
      inactivePill: 'bg-[#EDE4D7] text-[#57534E] hover:bg-[#E5DACD]',
      input: 'bg-white border-[#D6C7B7] text-[#292524] placeholder-[#A8A29E] focus:border-[#C2410C]',
      sidebarActive: 'bg-[#FFEDD5] text-[#C2410C] font-semibold border-r-2 border-[#C2410C]',
      sidebarHover: 'hover:bg-[#F4ECE1] text-[#57534E]',
    },
  },
  'high-density': {
    id: 'high-density',
    name: 'High Density Terminal',
    tagline: 'Technical slate Bloomberg-style terminal with monospace numerals and maximum data density',
    accentColorName: 'Cyan / Cobalt',
    isDark: true,
    classes: {
      root: 'bg-[#0F172A] text-slate-100',
      surface: 'bg-[#1E293B]',
      subtle: 'bg-[#0F172A]',
      card: 'bg-[#1E293B] border-slate-800 hover:border-blue-500/80',
      border: 'border-slate-800',
      borderSubtle: 'border-slate-800/80',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-500',
      accent: 'bg-blue-600 hover:bg-blue-500 text-white',
      accentHover: 'hover:bg-blue-500',
      accentText: 'text-blue-400',
      badge: 'bg-blue-950/80 text-blue-400 border-blue-800',
      activePill: 'bg-blue-600 text-white font-semibold',
      inactivePill: 'bg-[#1E293B] text-slate-400 hover:bg-slate-800',
      input: 'bg-[#0F172A] border-slate-800 text-slate-200 placeholder-slate-500 focus:border-blue-500 font-mono',
      sidebarActive: 'bg-slate-800 text-blue-400 font-mono border-r-2 border-blue-500',
      sidebarHover: 'hover:bg-slate-800/60 text-slate-400',
    },
  },
  'emerald-retail': {
    id: 'emerald-retail',
    name: 'Emerald Supermarket',
    tagline: 'Deep dark green & slate with vivid jade accents, engineered for high-volume grocery operations',
    accentColorName: 'Emerald Jade',
    isDark: true,
    classes: {
      root: 'bg-[#061A14] text-[#F0FDF4]',
      surface: 'bg-[#0C2A20]',
      subtle: 'bg-[#061A14]',
      card: 'bg-[#0C2A20] border-[#144738] hover:border-emerald-500',
      border: 'border-[#144738]',
      borderSubtle: 'border-[#144738]/60',
      textPrimary: 'text-[#F0FDF4]',
      textSecondary: 'text-[#D1FAE5]',
      textMuted: 'text-[#6EE7B7]',
      accent: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950',
      accentHover: 'hover:bg-emerald-500',
      accentText: 'text-emerald-400',
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
      activePill: 'bg-emerald-600 text-white font-semibold',
      inactivePill: 'bg-[#0C2A20] text-[#A7F3D0] hover:bg-[#144738]',
      input: 'bg-[#061A14] border-[#144738] text-[#F0FDF4] placeholder-[#059669] focus:border-emerald-500',
      sidebarActive: 'bg-[#064E3B] text-emerald-300 font-semibold border-r-2 border-emerald-400',
      sidebarHover: 'hover:bg-[#0C2A20] text-[#A7F3D0]',
    },
  },
};

interface ThemeContextType {
  themeId: UiThemeId;
  theme: ThemeConfig;
  setThemeId: (id: UiThemeId) => void;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'offline_pos_ui_theme';

export const ThemeProvider: React.FC<{
  initialTheme?: UiThemeId;
  children: React.ReactNode;
}> = ({ initialTheme = 'modern-light', children }) => {
  const [themeId, setThemeIdState] = useState<UiThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as UiThemeId;
    if (saved && THEMES[saved]) return saved;
    return initialTheme;
  });

  const setThemeId = (id: UiThemeId) => {
    if (THEMES[id]) {
      setThemeIdState(id);
      localStorage.setItem(STORAGE_KEY, id);
    }
  };

  useEffect(() => {
    // Sync class or attribute to document root for seamless styling
    document.documentElement.setAttribute('data-theme', themeId);
    if (THEMES[themeId].isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeId]);

  const value: ThemeContextType = {
    themeId,
    theme: THEMES[themeId],
    setThemeId,
    availableThemes: Object.values(THEMES),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
