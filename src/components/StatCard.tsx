'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
  color?: 'amber' | 'blue' | 'green' | 'orange' | 'purple'
}

const colorMap = {
  amber: {
    bg: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/20',
    icon: 'text-amber-500',
  },
  blue: {
    bg: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-500',
  },
  green: {
    bg: 'from-green-500/20 to-emerald-500/10',
    border: 'border-green-500/20',
    icon: 'text-green-500',
  },
  orange: {
    bg: 'from-orange-500/20 to-red-500/10',
    border: 'border-orange-500/20',
    icon: 'text-orange-500',
  },
  purple: {
    bg: 'from-purple-500/20 to-pink-500/10',
    border: 'border-purple-500/20',
    icon: 'text-purple-500',
  },
}

export function StatCard({ icon, label, value, suffix = '', color = 'amber' }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const colors = colorMap[color]

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const stepValue = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += stepValue
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${colors.bg}
        border ${colors.border}
        rounded-2xl p-6
      `}
    >
      <div className={`${colors.icon} mb-3`}>
        {icon}
      </div>

      <div className="text-3xl font-bold text-white mb-1">
        {displayValue.toLocaleString()}
        {suffix && <span className="text-lg text-gray-400 ml-1">{suffix}</span>}
      </div>

      <div className="text-sm text-gray-400">
        {label}
      </div>

      {/* Decorative glow */}
      <div
        className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${colors.bg} blur-3xl opacity-50`}
      />
    </motion.div>
  )
}
