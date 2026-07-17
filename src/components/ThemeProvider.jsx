import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Preferences } from '@capacitor/preferences';

const ThemeContext = createContext(null);

export const Dp = [
  { id: "rosa", label: "Rosa", swatch: "#ff8fb1" },
  { id: "lavanda", label: "Lavanda", swatch: "#b39cff" },
  { id: "menta", label: "Menta", swatch: "#6bcf9a" },
  { id: "durazno", label: "Durazno", swatch: "#ffab76" },
  { id: "cielo", label: "Cielo", swatch: "#7ab8ff" }
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("rosa");
  const [mode, setMode] = useState("light");

  useEffect(() => {
    async function loadTheme() {
      try {
        const { value: storedTheme } = await Preferences.get({ key: "rimi.theme" });
        const { value: storedMode } = await Preferences.get({ key: "rimi.mode" });
        if (storedTheme) setTheme(storedTheme);
        else {
          const fallback = localStorage.getItem("rimi.theme");
          if (fallback) setTheme(fallback);
        }
        if (storedMode) setMode(storedMode);
        else {
          const fallback = localStorage.getItem("rimi.mode");
          if (fallback) setMode(fallback);
        }
      } catch (e) {
        try {
          const t = localStorage.getItem("rimi.theme");
          const m = localStorage.getItem("rimi.mode");
          if (t) setTheme(t);
          if (m) setMode(m);
        } catch {}
      }
    }
    loadTheme();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-mode", mode);

    Preferences.set({ key: "rimi.theme", value: theme });
    Preferences.set({ key: "rimi.mode", value: mode });
    try {
      localStorage.setItem("rimi.theme", theme);
      localStorage.setItem("rimi.mode", mode);
    } catch {}
  }, [theme, mode]);

  const value = useMemo(() => ({
    theme,
    mode,
    setTheme,
    setMode
  }), [theme, mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be inside ThemeProvider");
  return context;
}
