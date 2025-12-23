'use client'

import { motion } from 'framer-motion'
import { ModelUsage } from '@/lib/types'
import { Cpu, Sparkles, Zap, Bot } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface ModelUsageChartProps {
  models: ModelUsage[]
}

// 모델별 아이콘
const getModelIcon = (name: string) => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('opus')) return <Sparkles className="w-4 h-4" />
  if (lowerName.includes('sonnet')) return <Cpu className="w-4 h-4" />
  if (lowerName.includes('haiku')) return <Zap className="w-4 h-4" />
  return <Bot className="w-4 h-4" />
}

// Model description
const getModelDescription = (name: string): string => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('opus')) return 'Most powerful model'
  if (lowerName.includes('sonnet')) return 'Balanced performance'
  if (lowerName.includes('haiku')) return 'Fast response'
  return 'Other model'
}

export function ModelUsageChart({ models }: ModelUsageChartProps) {
  // 도넛 차트 데이터
  const pieData = models.map(model => ({
    name: model.name,
    value: model.count,
    percentage: model.percentage,
    color: model.color,
  }))

  // 가장 많이 사용한 모델
  const topModel = models[0]

  // 총 대화 수
  const totalCount = models.reduce((sum, m) => sum + m.count, 0)

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="grid md:grid-cols-2 gap-6">
        {/* 도넛 차트 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()} times`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 도넛 중앙 텍스트 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{topModel?.percentage}%</p>
              <p className="text-sm text-gray-400">{topModel?.name}</p>
            </div>
          </div>
        </motion.div>

        {/* 범례 및 상세 정보 */}
        <div className="flex flex-col justify-center space-y-4">
          {models.map((model, index) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: model.color }}
                  />
                  <div className="flex items-center gap-2">
                    <span style={{ color: model.color }}>
                      {getModelIcon(model.name)}
                    </span>
                    <span className="text-white font-medium">{model.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold stat-number">
                    {model.percentage}%
                  </span>
                </div>
              </div>

              {/* 프로그레스 바 */}
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${model.percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: model.color }}
                />
              </div>

              {/* 상세 정보 */}
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{getModelDescription(model.name)}</span>
                <span>{model.count.toLocaleString()} times</span>
              </div>
            </motion.div>
          ))}

          {/* 총계 */}
          <div className="pt-4 border-t border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total conversations</span>
              <span className="text-white font-bold stat-number">
                {totalCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
