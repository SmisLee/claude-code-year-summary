'use client'

import { motion } from 'framer-motion'
import { FunStats } from '@/lib/types'
import { Moon, Sun, Calendar, Clock, Star, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface FunStatsCardProps {
  funStats: FunStats
  peakDay: {
    date: Date
    conversations: number
  }
}

export function FunStatsCard({ funStats, peakDay }: FunStatsCardProps) {
  const stats = [
    {
      icon: <Moon className="w-6 h-6" />,
      label: '야행성 개발자',
      value: funStats.lateNightCoding,
      suffix: '번',
      description: '자정 이후 코딩',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: '주말 전사',
      value: funStats.weekendWarrior,
      suffix: '일',
      description: '주말에도 코딩한 날',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Sun className="w-6 h-6" />,
      label: '얼리버드',
      value: funStats.earlyBird,
      suffix: '번',
      description: '새벽 5-7시 코딩',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: '황금 시간대',
      value: funStats.favoriteTime,
      suffix: '',
      description: '가장 활발한 시간',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Star className="w-6 h-6" />,
      label: '최고의 날',
      value: funStats.mostProductiveDay,
      suffix: '',
      description: '가장 생산적인 요일',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      label: '피크 데이',
      value: peakDay.conversations,
      suffix: '회',
      description: format(peakDay.date, 'M월 d일', { locale: ko }),
      color: 'from-yellow-500 to-amber-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
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
              bg-gradient-to-br ${stat.color} bg-opacity-20
            `}
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-white opacity-90">
              {stat.icon}
            </div>
          </motion.div>

          <div className="text-2xl font-bold text-white mb-1 stat-number">
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            {stat.suffix && (
              <span className="text-sm text-gray-400 ml-2 font-sans">{stat.suffix}</span>
            )}
          </div>

          <div className="text-sm text-gray-400 mb-0.5">{stat.label}</div>
          <div className="text-xs text-gray-500">{stat.description}</div>

          {/* Decorative gradient */}
          <div
            className={`
              absolute -bottom-8 -right-8 w-24 h-24
              rounded-full bg-gradient-to-br ${stat.color}
              opacity-10 blur-2xl
            `}
          />
        </motion.div>
      ))}
    </div>
  )
}
