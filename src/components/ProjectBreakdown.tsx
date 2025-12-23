'use client'

import { motion } from 'framer-motion'
import { ProjectUsage } from '@/lib/types'
import { FolderOpen } from 'lucide-react'
import { EmptyState } from './EmptyState'

interface ProjectBreakdownProps {
  projects: ProjectUsage[]
}

const colors = [
  'from-blue-500 to-cyan-400',
  'from-purple-500 to-pink-400',
  'from-green-500 to-emerald-400',
  'from-amber-500 to-orange-400',
  'from-red-500 to-rose-400',
]

export function ProjectBreakdown({ projects }: ProjectBreakdownProps) {
  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <div className="space-y-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4"
          >
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-xl
              bg-gradient-to-br ${colors[index % colors.length]}
              flex items-center justify-center
            `}>
              <FolderOpen className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-medium truncate">
                  {project.name}
                </span>
                <span className="text-gray-400 text-sm ml-2 stat-number">
                  {project.percentage}%
                </span>
              </div>

              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                  className={`h-full rounded-full bg-gradient-to-r ${colors[index % colors.length]}`}
                />
              </div>

              <span className="text-xs text-gray-500 stat-number">
                {project.conversations.toLocaleString()}<span className="font-sans">회 대화</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {projects.length === 0 && (
        <EmptyState
          icon={FolderOpen}
          title="프로젝트 데이터 없음"
          description="분석 가능한 프로젝트 정보가 없습니다"
        />
      )}
    </div>
  )
}
