import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, setThemeMode } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-zinc-800/50 dark:bg-zinc-800/50 p-1 rounded-lg">
      <button
        onClick={() => setThemeMode('light')}
        className={`p-2 rounded-md transition-all ${
          theme === 'light' 
            ? 'bg-white text-black shadow-lg' 
            : 'text-zinc-400 hover:text-white'
        }`}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setThemeMode('dark')}
        className={`p-2 rounded-md transition-all ${
          theme === 'dark' 
            ? 'bg-[#FF007F] text-white shadow-lg' 
            : 'text-zinc-400 hover:text-white'
        }`}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setThemeMode(isDark ? 'dark' : 'light');
        }}
        className={`p-2 rounded-md transition-all text-zinc-400 hover:text-white`}
        title="System theme"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
