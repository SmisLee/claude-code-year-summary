'use client'

import { motion } from 'framer-motion'
import { ToolUsage } from '@/lib/types'
import { Terminal } from 'lucide-react'
import { EmptyState } from './EmptyState'

interface ToolUsageChartProps {
  tools: ToolUsage[]
}

export function ToolUsageChart({ tools }: ToolUsageChartProps) {
  if (tools.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <EmptyState
          icon={Terminal}
          title="No tool usage data"
          description="No analyzable tool usage information"
        />
      </div>
    )
  }

  const maxCount = Math.max(...tools.map(t => t.count))

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="space-y-4">
        {tools.slice(0, 8).map((tool, index) => {
          const percentage = (tool.count / maxCount) * 100

          return (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tool.icon}</span>
                  <span className="text-white font-medium">{tool.name}</span>
                </div>
                <span className="text-gray-400 text-sm stat-number">
                  {tool.count.toLocaleString()} <span className="font-sans">times</span>
                </span>
              </div>

              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    background: `linear-gradient(90deg,
                      hsl(${40 - index * 5}, 80%, 50%),
                      hsl(${50 - index * 5}, 80%, 60%)
                    )`,
                  }}
                >
                  {/* Shimmer 효과 */}
                  <div className="absolute inset-0 shimmer" />
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
