'use client'

import { motion } from 'framer-motion'
import { ProductivityStats } from '@/lib/types'
import { Timer, TrendingUp, Coffee, RotateCcw, MessageSquare, CalendarDays } from 'lucide-react'

interface ProductivityStatsCardProps {
  stats: ProductivityStats
}

export function ProductivityStatsCard({ stats }: ProductivityStatsCardProps) {
  const items = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      label: 'Msgs/Conversation',
      value: stats.messagesPerConversation,
      suffix: '',
      description: 'Average messages per chat',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Peak Month',
      value: stats.mostActiveMonth,
      suffix: ` (${stats.mostActiveMonthCount})`,
      description: 'Most active month',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Timer className="w-6 h-6" />,
      label: 'Marathon Sessions',
      value: stats.marathonSessions,
      suffix: '',
      description: '2+ hour coding sessions',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      label: 'Longest Break',
      value: stats.longestBreak,
      suffix: ' days',
      description: 'Time away from coding',
      color: 'from-amber-500 to-yellow-500',
    },
    {
      icon: <RotateCcw className="w-6 h-6" />,
      label: 'Comeback Streak',
      value: stats.comebackStreak,
      suffix: ' days',
      description: 'After longest break',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <CalendarDays className="w-6 h-6" />,
      label: 'Daily Average',
      value: stats.avgConversationsPerActiveDay,
      suffix: ' chats',
      description: 'Per active day',
      color: 'from-indigo-500 to-blue-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden bg-gray-900/50 rounded-2xl p-5 border border-gray-800"
        >
          <motion.div
            className={`
              inline-flex p-2 rounded-xl mb-3
              bg-gradient-to-br ${item.color} bg-opacity-20
            `}
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-white opacity-90">
              {item.icon}
            </div>
          </motion.div>

          <div className="text-2xl font-bold text-white mb-1 stat-number">
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            {item.suffix && (
              <span className="text-sm text-gray-400 ml-1 font-sans">{item.suffix}</span>
            )}
          </div>

          <div className="text-sm text-gray-400 mb-0.5">{item.label}</div>
          <div className="text-xs text-gray-500">{item.description}</div>

          <div
            className={`
              absolute -bottom-8 -right-8 w-24 h-24
              rounded-full bg-gradient-to-br ${item.color}
              opacity-10 blur-2xl
            `}
          />
        </motion.div>
      ))}
    </div>
  )
}
