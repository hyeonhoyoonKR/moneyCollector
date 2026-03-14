"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-14 h-8 rounded-full" style={{ backgroundColor: '#ffe4e8' }} />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-14 h-8 rounded-full p-1 transition-colors flex items-center"
      style={{ backgroundColor: isDark ? '#3d3133' : '#ffe4e8' }}
      aria-label="Toggle theme"
    >
      <motion.div
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center z-10"
      >
        {isDark ? (
          <Moon size={14} className="text-accent" />
        ) : (
          <Sun size={14} className="text-accent" />
        )}
      </motion.div>
      <div className="absolute inset-0 flex justify-between items-center px-2">
        <Sun size={12} className={`transition-opacity ${isDark ? 'opacity-40' : 'opacity-0'}`} />
        <Moon size={12} className={`transition-opacity ${isDark ? 'opacity-0' : 'opacity-40'}`} />
      </div>
    </button>
  );
}
