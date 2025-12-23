'use client'

import { motion } from 'framer-motion'
import { HeatmapData } from '@/lib/types'
import { useMemo } from 'react'

interface YearHeatmapProps {
  data: HeatmapData[]
}

export function YearHeatmap({ data }: YearHeatmapProps) {
  const { weeks, maxCount, monthLabels } = useMemo(() => {
    // Group data by weeks
    const weeks: HeatmapData[][] = []
    let currentWeek: HeatmapData[] = []
    let maxCount = 0

    // Find max count
    data.forEach(d => {
      if (d.count > maxCount) maxCount = d.count
    })

    // Group into weeks
    data.forEach((d, i) => {
      const date = new Date(d.date)
      const dayOfWeek = date.getDay()

      if (i === 0) {
        // Pad the first week
        for (let j = 0; j < dayOfWeek; j++) {
          currentWeek.push({ date: '', count: -1 })
        }
      }

      currentWeek.push(d)

      if (dayOfWeek === 6 || i === data.length - 1) {
        // Pad the last week if needed
        while (currentWeek.length < 7) {
          currentWeek.push({ date: '', count: -1 })
        }
        weeks.push(currentWeek)
        currentWeek = []
      }
    })

    // Calculate month labels positions
    const monthLabels: { month: string; week: number }[] = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let lastMonth = -1

    weeks.forEach((week, weekIndex) => {
      const validDay = week.find(d => d.date)
      if (validDay) {
        const month = new Date(validDay.date).getMonth()
        if (month !== lastMonth) {
          monthLabels.push({ month: months[month], week: weekIndex })
          lastMonth = month
        }
      }
    })

    return { weeks, maxCount, monthLabels }
  }, [data])

  const getColor = (count: number) => {
    if (count < 0) return 'transparent'
    if (count === 0) return '#1a1a1a'
    const intensity = Math.min(count / Math.max(maxCount, 1), 1)

    if (intensity < 0.25) return '#2d4a3e'
    if (intensity < 0.5) return '#3d6b50'
    if (intensity < 0.75) return '#4d8c62'
    return '#5aad74'
  }

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 overflow-x-auto">
      {/* Month labels */}
      <div className="flex mb-2 ml-8">
        {monthLabels.map((m, i) => (
          <div
            key={i}
            className="text-xs text-gray-500"
            style={{
              marginLeft: i === 0 ? 0 : `${(m.week - (monthLabels[i - 1]?.week || 0)) * 14 - 24}px`,
            }}
          >
            {m.month}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col mr-2">
          {dayLabels.map((day, i) => (
            <div
              key={i}
              className="text-xs text-gray-500 h-[12px] leading-[12px]"
              style={{ marginBottom: i < 6 ? '2px' : 0 }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-[2px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px]">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: weekIndex * 0.01,
                    duration: 0.2,
                  }}
                  className="heatmap-cell w-[12px] h-[12px] rounded-sm cursor-pointer relative group"
                  style={{ backgroundColor: getColor(day.count) }}
                >
                  {day.date && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {day.date}: {day.count}회
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-gray-500">Less</span>
        <div className="flex gap-1">
          {['#1a1a1a', '#2d4a3e', '#3d6b50', '#4d8c62', '#5aad74'].map((color, i) => (
            <div
              key={i}
              className="w-[12px] h-[12px] rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">More</span>
      </div>
    </div>
  )
}
