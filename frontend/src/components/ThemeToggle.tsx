import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-12 h-6 bg-secondary border-2 border-border rounded-full transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute w-5 h-5 bg-primary rounded-full shadow-lg flex items-center justify-center"
        animate={{
          x: theme === 'dark' ? 18 : -18,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
      >
        <motion.div
          animate={{ rotate: theme === 'dark' ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {theme === 'dark' ? (
            <Moon className="w-3 h-3 text-primary-foreground" />
          ) : (
            <Sun className="w-3 h-3 text-primary-foreground" />
          )}
        </motion.div>
      </motion.div>
      
      {/* Background icons for better visual feedback */}
      <div className="absolute inset-0 flex items-center justify-between px-1">
        <Sun className={`w-3 h-3 transition-opacity duration-200 ${
          theme === 'light' ? 'opacity-40' : 'opacity-20'
        }`} />
        <Moon className={`w-3 h-3 transition-opacity duration-200 ${
          theme === 'dark' ? 'opacity-40' : 'opacity-20'
        }`} />
      </div>
    </motion.button>
  );
}