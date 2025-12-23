'use client'

import { motion } from 'framer-motion'
import { CodeWorkPattern } from '@/lib/types'
import { Search, Pencil, Bot, Eye, FileEdit } from 'lucide-react'

interface CodeWorkPatternChartProps {
  pattern: CodeWorkPattern
}

export function CodeWorkPatternChart({ pattern }: CodeWorkPatternChartProps) {
  const getWorkStyleEmoji = (style: CodeWorkPattern['workStyle']) => {
    switch (style) {
      case 'explorer': return { emoji: '🔍', label: 'Explorer', description: 'You prefer understanding code before changing it' }
      case 'modifier': return { emoji: '✏️', label: 'Modifier', description: 'You dive straight into making changes' }
      case 'balanced': return { emoji: '⚖️', label: 'Balanced', description: 'You balance exploration and modification' }
    }
  }

  const workStyleInfo = getWorkStyleEmoji(pattern.workStyle)

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      {/* Work Style Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6"
      >
        <span className="text-4xl mb-2 block">{workStyleInfo.emoji}</span>
        <h4 className="text-xl font-bold text-white mb-1">
          {workStyleInfo.label} Style
        </h4>
        <p className="text-sm text-gray-400">{workStyleInfo.description}</p>
      </motion.div>

      {/* Exploration vs Modification Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4 text-cyan-400" />
            Exploration {pattern.explorationRatio}%
          </span>
          <span className="flex items-center gap-1">
            Modification {pattern.modificationRatio}%
            <FileEdit className="w-4 h-4 text-amber-400" />
          </span>
        </div>

        <div className="h-4 bg-gray-800 rounded-full overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${pattern.explorationRatio}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
          />
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${pattern.modificationRatio}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
          />
        </div>
      </div>

      {/* Tool Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center p-3 bg-gray-800/50 rounded-xl"
        >
          <Search className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white stat-number">
            {pattern.explorationTools.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Read/Grep/Glob</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center p-3 bg-gray-800/50 rounded-xl"
        >
          <Pencil className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white stat-number">
            {pattern.modificationTools.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Edit/Write</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center p-3 bg-gray-800/50 rounded-xl"
        >
          <Bot className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white stat-number">
            {pattern.automationUsage.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Task (Agent)</div>
        </motion.div>
      </div>
    </div>
  )
}
