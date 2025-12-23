'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileDropzone } from '@/components/FileDropzone'
import { YearSummary } from '@/components/YearSummary'
import { ClaudeStats } from '@/lib/types'
import { Sparkles, Code2, Terminal } from 'lucide-react'

export default function Home() {
  const [stats, setStats] = useState<ClaudeStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDataParsed = (parsedStats: ClaudeStats) => {
    setStats(parsedStats)
  }

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {!stats ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col items-center justify-center px-4"
          >
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl">
                  <Terminal className="w-8 h-8 text-amber-500" />
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                <span className="gradient-text">Your Year in</span>
                <br />
                <span className="text-white">Claude Code</span>
              </h1>

              <p className="text-xl text-gray-400 max-w-lg mx-auto mb-2">
                {new Date().getFullYear()}년, 당신과 Claude의 코딩 여정을 돌아보세요
              </p>

              <div className="flex items-center justify-center gap-2 text-amber-500/80 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>모든 데이터는 브라우저에서만 처리됩니다</span>
              </div>
            </motion.div>

            {/* File Dropzone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-2xl"
            >
              <FileDropzone
                onDataParsed={handleDataParsed}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 text-center"
            >
              <p className="text-gray-500 text-sm mb-4">
                ~/.claude 폴더를 드래그하거나 클릭하여 선택하세요
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  <span>프로젝트 수</span>
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>대화 기록</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>도구 사용량</span>
                </div>
              </div>
            </motion.div>

            {/* Demo Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={() => setStats(generateDemoStats())}
              className="mt-8 px-6 py-3 text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-full transition-all"
            >
              데모 데이터로 미리보기
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <YearSummary stats={stats} onReset={() => setStats(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function generateDemoStats(): ClaudeStats {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return {
    totalConversations: 1247,
    totalMessages: 8934,
    totalTokens: 2_450_000,
    activeDays: 287,
    longestStreak: 42,
    currentStreak: 15,
    projectCount: 23,

    monthlyActivity: months.map((month, i) => ({
      month,
      conversations: Math.floor(Math.random() * 150) + 50,
      messages: Math.floor(Math.random() * 1000) + 200,
    })),

    weeklyHeatmap: generateHeatmapData(),

    topTools: [
      { name: 'Edit', count: 3421, icon: '✏️' },
      { name: 'Read', count: 2856, icon: '📖' },
      { name: 'Bash', count: 1923, icon: '💻' },
      { name: 'Write', count: 1456, icon: '📝' },
      { name: 'Grep', count: 987, icon: '🔍' },
      { name: 'Glob', count: 654, icon: '📁' },
      { name: 'Task', count: 432, icon: '🤖' },
      { name: 'WebFetch', count: 234, icon: '🌐' },
    ],

    topProjects: [
      { name: 'alarmy-ios', conversations: 342, percentage: 27 },
      { name: 'my-website', conversations: 189, percentage: 15 },
      { name: 'api-server', conversations: 156, percentage: 12 },
      { name: 'mobile-app', conversations: 134, percentage: 11 },
      { name: 'data-pipeline', conversations: 98, percentage: 8 },
    ],

    funStats: {
      lateNightCoding: 47,
      weekendWarrior: 62,
      earlyBird: 23,
      longestSession: '4h 32m',
      favoriteTime: '오후 2-4시',
      mostProductiveDay: '화요일',
    },

    firstConversation: new Date('2024-01-15'),
    peakDay: {
      date: new Date('2024-09-12'),
      conversations: 24,
    },
  }
}

function generateHeatmapData() {
  const data: { date: string; count: number }[] = []
  const startDate = new Date('2024-01-01')
  const endDate = new Date('2024-12-31')

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseActivity = isWeekend ? 2 : 5
    const randomFactor = Math.random()

    let count = 0
    if (randomFactor > 0.3) {
      count = Math.floor(Math.random() * 10 * baseActivity)
    }

    data.push({
      date: d.toISOString().split('T')[0],
      count,
    })
  }

  return data
}
