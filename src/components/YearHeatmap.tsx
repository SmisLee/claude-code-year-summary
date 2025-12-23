'use client'

import { motion } from 'framer-motion'
import { HeatmapData } from '@/lib/types'
import { useMemo, useState } from 'react'

interface YearHeatmapProps {
  data: HeatmapData[]
}

export function YearHeatmap({ data }: YearHeatmapProps) {
  const [showFullYear, setShowFullYear] = useState(false)

  const { weeks, maxCount, monthLabels, recentMonthsData } = useMemo(() => {
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

    // 모바일용: 월별 집계
    const monthlyTotals = new Map<string, number>()
    const koreanMonths = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

    data.forEach(d => {
      if (d.date && d.count > 0) {
        const month = new Date(d.date).getMonth()
        const monthName = koreanMonths[month]
        monthlyTotals.set(monthName, (monthlyTotals.get(monthName) || 0) + d.count)
      }
    })

    const recentMonthsData = koreanMonths.map(month => ({
      month,
      total: monthlyTotals.get(month) || 0,
    }))

    return { weeks, maxCount, monthLabels, recentMonthsData }
  }, [data])

  const getColor = (count: number) => {
    if (count < 0) return 'transparent'
    if (count === 0) return '#1a1a1a'
    const intensity = Math.min(count / Math.max(maxCount, 1), 1)

    // amber 계열로 브랜드 컬러 통일
    if (intensity < 0.25) return '#78350f' // amber-900
    if (intensity < 0.5) return '#92400e'  // amber-800
    if (intensity < 0.75) return '#b45309' // amber-700
    return '#d97706' // amber-600
  }

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']
  const maxMonthlyTotal = Math.max(...recentMonthsData.map(d => d.total), 1)

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      {/* 모바일: 월별 바 차트 */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {recentMonthsData.map((monthData, index) => (
            <motion.div
              key={monthData.month}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="text-xs text-gray-500 w-8">{monthData.month}</span>
              <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(monthData.total / maxMonthlyTotal) * 100}%` }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-500"
                />
              </div>
              <span className="text-xs text-gray-400 stat-number w-10 text-right">
                {monthData.total}
              </span>
            </motion.div>
          ))}
        </div>

        {/* 전체 보기 토글 */}
        <button
          onClick={() => setShowFullYear(!showFullYear)}
          className="mt-4 w-full text-xs text-amber-500/70 hover:text-amber-500 transition-colors"
        >
          {showFullYear ? '간략히 보기' : '전체 히트맵 보기'}
        </button>

        {showFullYear && (
          <div className="mt-4 overflow-x-auto">
            <HeatmapGrid
              weeks={weeks}
              monthLabels={monthLabels}
              dayLabels={dayLabels}
              getColor={getColor}
            />
          </div>
        )}
      </div>

      {/* 데스크톱: 전체 히트맵 */}
      <div className="hidden md:block overflow-x-auto">
        <HeatmapGrid
          weeks={weeks}
          monthLabels={monthLabels}
          dayLabels={dayLabels}
          getColor={getColor}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-gray-400">Less</span>
        <div className="flex gap-1">
          {['#1a1a1a', '#78350f', '#92400e', '#b45309', '#d97706'].map((color, i) => (
            <div
              key={i}
              className="w-[12px] h-[12px] rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">More</span>
      </div>
    </div>
  )
}

// 히트맵 그리드 컴포넌트 분리
function HeatmapGrid({
  weeks,
  monthLabels,
  dayLabels,
  getColor,
}: {
  weeks: HeatmapData[][]
  monthLabels: { month: string; week: number }[]
  dayLabels: string[]
  getColor: (count: number) => string
}) {
  return (
    <>
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
                  tabIndex={day.date ? 0 : -1}
                  role="gridcell"
                  aria-label={day.date ? `${day.date}: ${day.count}회 활동` : undefined}
                  className="heatmap-cell w-[12px] h-[12px] rounded-sm cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 focus:ring-offset-gray-900"
                  style={{ backgroundColor: getColor(day.count) }}
                >
                  {day.date && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none z-10">
                      {day.date}: {day.count}회
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
