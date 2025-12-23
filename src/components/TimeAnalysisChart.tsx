'use client'

import { motion } from 'framer-motion'
import { TimeAnalysis } from '@/lib/types'
import { Clock, Sun, Moon, Sunrise, Sunset } from 'lucide-react'
import { useState } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface TimeAnalysisChartProps {
  data: TimeAnalysis
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Time-based colors
const getTimeColor = (hour: number): string => {
  if (hour >= 0 && hour < 6) return '#6366F1'   // indigo - night
  if (hour >= 6 && hour < 12) return '#F59E0B'  // amber - morning
  if (hour >= 12 && hour < 18) return '#EF4444' // red - afternoon
  return '#8B5CF6'                               // violet - evening
}

// Time-based icons
const getTimeIcon = (hour: number) => {
  if (hour >= 0 && hour < 6) return <Moon className="w-4 h-4" />
  if (hour >= 6 && hour < 12) return <Sunrise className="w-4 h-4" />
  if (hour >= 12 && hour < 18) return <Sun className="w-4 h-4" />
  return <Sunset className="w-4 h-4" />
}

// Hour format
const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

export function TimeAnalysisChart({ data }: TimeAnalysisChartProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null)

  // 2D 히트맵에서 최대값 계산
  const maxCount = Math.max(...data.dayHourMatrix.map(d => d.count), 1)

  // 히트맵 셀 색상 계산 (보라-시안 그라데이션)
  const getCellColor = (count: number): string => {
    if (count === 0) return '#1a1a2e'
    const intensity = count / maxCount
    if (intensity < 0.25) return '#312e81'  // indigo-900
    if (intensity < 0.5) return '#4f46e5'   // indigo-600
    if (intensity < 0.75) return '#0ea5e9'  // sky-500
    return '#06b6d4'                         // cyan-500
  }

  // 방사형 차트 데이터 변환
  const radarData = data.hourlyActivity.map(item => ({
    hour: formatHour(item.hour),
    count: item.count,
    fullMark: Math.max(...data.hourlyActivity.map(d => d.count)),
  }))

  // 피크 시간 정보
  const peakHourInfo = {
    hour: data.peakHour,
    label: formatHour(data.peakHour),
    icon: getTimeIcon(data.peakHour),
    color: getTimeColor(data.peakHour),
  }

  return (
    <div className="space-y-8">
      {/* 피크 시간 요약 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800"
      >
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${peakHourInfo.color}20` }}
        >
          <Clock className="w-6 h-6" style={{ color: peakHourInfo.color }} />
        </div>
        <div>
          <p className="text-gray-400 text-sm">Most active time</p>
          <p className="text-xl font-bold text-white flex items-center gap-2">
            <span style={{ color: peakHourInfo.color }}>{peakHourInfo.icon}</span>
            {peakHourInfo.label}
          </p>
        </div>
      </motion.div>

      {/* 차트 그리드 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 24시간 방사형 차트 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800"
        >
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            24-Hour Activity
          </h4>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="hour"
                  tick={{ fill: '#9CA3AF', fontSize: 10 }}
                  tickLine={false}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 'auto']}
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Activity"
                  dataKey="count"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`${value}`, 'Conversations']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Time legend */}
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <Moon className="w-3 h-3 text-indigo-500" />
              <span className="text-gray-400">Night</span>
            </div>
            <div className="flex items-center gap-1">
              <Sunrise className="w-3 h-3 text-amber-500" />
              <span className="text-gray-400">Morning</span>
            </div>
            <div className="flex items-center gap-1">
              <Sun className="w-3 h-3 text-red-500" />
              <span className="text-gray-400">Afternoon</span>
            </div>
            <div className="flex items-center gap-1">
              <Sunset className="w-3 h-3 text-violet-500" />
              <span className="text-gray-400">Evening</span>
            </div>
          </div>
        </motion.div>

        {/* Day×Hour 2D Heatmap */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800"
        >
          <h4 className="text-lg font-semibold text-white mb-4">
            Weekly Activity Pattern
          </h4>

          <div className="overflow-x-auto">
            {/* Hour labels (top) */}
            <div className="flex mb-2 ml-8">
              {[0, 6, 12, 18].map(hour => (
                <div
                  key={hour}
                  className="text-xs text-gray-500"
                  style={{ width: '25%', textAlign: 'center' }}
                >
                  {hour === 0 ? '12AM' : hour === 12 ? '12PM' : `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`}
                </div>
              ))}
            </div>

            {/* 히트맵 그리드 */}
            <div className="space-y-1">
              {dayNames.map((dayName, dayIndex) => (
                <div key={dayIndex} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-6 text-right">{dayName}</span>
                  <div className="flex gap-[2px]">
                    {Array.from({ length: 24 }, (_, hourIndex) => {
                      const cellData = data.dayHourMatrix.find(
                        d => d.day === dayIndex && d.hour === hourIndex
                      )
                      const count = cellData?.count || 0
                      const isHovered = hoveredCell?.day === dayIndex && hoveredCell?.hour === hourIndex

                      return (
                        <motion.div
                          key={hourIndex}
                          className="relative cursor-pointer"
                          style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: getCellColor(count),
                            borderRadius: '2px',
                          }}
                          whileHover={{ scale: 1.3, zIndex: 10 }}
                          onMouseEnter={() => setHoveredCell({ day: dayIndex, hour: hourIndex })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {isHovered && count > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white whitespace-nowrap z-50"
                            >
                              {dayName} {hourIndex}:00 - {count} convos
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Color legend */}
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-400">
            <span>Less</span>
            <div className="flex gap-[2px]">
              {['#1a1a2e', '#312e81', '#4f46e5', '#0ea5e9', '#06b6d4'].map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
