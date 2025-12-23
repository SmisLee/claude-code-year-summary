'use client'

import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './Providers'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="relative p-2 rounded-full bg-[--bg-tertiary] border border-[--border-primary] hover:border-[--border-secondary] transition-colors"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 text-amber-400" aria-hidden="true" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />
        )}
      </motion.div>
    </motion.button>
  )
}
