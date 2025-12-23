'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileDropzone } from '@/components/FileDropzone'
import { YearSummary } from '@/components/YearSummary'
import { AdSlot } from '@/components/AdSlot'
import { ThemeToggle } from '@/components/ThemeToggle'

// AdSense ad unit IDs (create in AdSense console after approval)
const AD_SLOTS = {
  landing: '', // Landing page ad
}
import { ClaudeStats } from '@/lib/types'
import { Sparkles, Terminal, Play, BarChart3, Calendar, Flame, Cpu, FolderOpen, Moon, MessageSquare } from 'lucide-react'

// 공유 링크에서 파싱된 통계
interface SharedStats {
  activeDays: number
  totalConversations: number
  projectCount: number
  longestStreak: number
  year: number
}

export default function Home() {
  const [stats, setStats] = useState<ClaudeStats | null>(null)
  const [sharedStats, setSharedStats] = useState<SharedStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 공유 링크 파라미터 확인
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shareParam = params.get('share')

    if (shareParam) {
      try {
        const decoded = atob(shareParam)
        const shareParams = new URLSearchParams(decoded)

        setSharedStats({
          activeDays: Number(shareParams.get('d')) || 0,
          totalConversations: Number(shareParams.get('c')) || 0,
          projectCount: Number(shareParams.get('p')) || 0,
          longestStreak: Number(shareParams.get('s')) || 0,
          year: Number(shareParams.get('y')) || new Date().getFullYear(),
        })
      } catch (e) {
        console.error('Failed to parse share link:', e)
      }
    }
  }, [])

  const handleDataParsed = (parsedStats: ClaudeStats) => {
    setStats(parsedStats)
  }

  const handleDismissShared = () => {
    setSharedStats(null)
    // URL에서 share 파라미터 제거
    window.history.replaceState({}, '', window.location.pathname)
  }

  return (
    <main className="min-h-screen bg-[--bg-primary] transition-colors">
      <AnimatePresence mode="wait">
        {!stats ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 relative"
          >
            {/* 테마 토글 - 우상단 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-4 right-4"
            >
              <ThemeToggle />
            </motion.div>

            {/* 공유된 통계 카드 */}
            {sharedStats && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-4 right-20 max-w-md"
              >
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-amber-500 text-sm font-medium">
                      Someone shared their {sharedStats.year} stats!
                    </span>
                    <button
                      onClick={handleDismissShared}
                      className="text-[--text-muted] hover:text-[--text-primary] transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-[--text-primary] stat-number">
                        {sharedStats.activeDays}
                      </div>
                      <div className="text-xs text-[--text-secondary]">days</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[--text-primary] stat-number">
                        {sharedStats.totalConversations.toLocaleString()}
                      </div>
                      <div className="text-xs text-[--text-secondary]">chats</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[--text-primary] stat-number">
                        {sharedStats.projectCount}
                      </div>
                      <div className="text-xs text-[--text-secondary]">projects</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[--text-primary] stat-number">
                        {sharedStats.longestStreak}
                      </div>
                      <div className="text-xs text-[--text-secondary]">streak</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

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
                <span className="text-[--text-primary]">Claude Code</span>
              </h1>

              <p className="text-xl text-[--text-secondary] max-w-lg mx-auto mb-2">
                Look back on your {new Date().getFullYear()} coding journey with Claude
              </p>

              <div className="flex items-center justify-center gap-2 text-amber-500/80 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>All data is processed locally in your browser</span>
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

            {/* Preview Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-16 w-full max-w-3xl"
            >
              <p className="text-[--text-tertiary] text-sm mb-6 text-center">
                See stats like these
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[--bg-secondary]/50 border border-[--border-primary] rounded-2xl p-4 text-center hover:border-[--border-secondary] transition-colors">
                  <Calendar className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-xs text-[--text-secondary]">Activity Heatmap</p>
                </div>
                <div className="bg-[--bg-secondary]/50 border border-[--border-primary] rounded-2xl p-4 text-center hover:border-[--border-secondary] transition-colors">
                  <BarChart3 className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs text-[--text-secondary]">Tool Usage</p>
                </div>
                <div className="bg-[--bg-secondary]/50 border border-[--border-primary] rounded-2xl p-4 text-center hover:border-[--border-secondary] transition-colors">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-xs text-[--text-secondary]">Streaks</p>
                </div>
                <div className="bg-[--bg-secondary]/50 border border-[--border-primary] rounded-2xl p-4 text-center hover:border-[--border-secondary] transition-colors">
                  <Cpu className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs text-[--text-secondary]">Model Usage</p>
                </div>
                <div className="bg-[--bg-secondary]/50 border border-[--border-primary] rounded-2xl p-4 text-center hover:border-[--border-secondary] transition-colors">
                  <FolderOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-[--text-secondary]">Projects</p>
                </div>
                <div className="bg-[--bg-secondary]/50 border border-[--border-primary] rounded-2xl p-4 text-center hover:border-[--border-secondary] transition-colors">
                  <Moon className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                  <p className="text-xs text-[--text-secondary]">Night Owl</p>
                </div>
              </div>
            </motion.div>

            {/* Ad Slot - Preview Cards 아래 */}
            {AD_SLOTS.landing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 w-full max-w-3xl"
              >
                <AdSlot slot={AD_SLOTS.landing} format="horizontal" />
              </motion.div>
            )}

            {/* Demo Button - 강조 */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStats(generateDemoStats())}
              aria-label="Preview with demo data"
              className="mt-8 flex items-center gap-2 px-6 py-3 text-sm bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 rounded-full transition-all"
            >
              <Play className="w-4 h-4" aria-hidden="true" />
              Try Demo
            </motion.button>

            {/* Privacy note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 text-xs text-[--text-muted]"
            >
              Drag and drop your ~/.claude folder or click to select
            </motion.p>
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
      favoriteTime: '2-4 PM',
      mostProductiveDay: 'Tuesday',
    },

    firstConversation: new Date('2025-01-15'),
    peakDay: {
      date: new Date('2025-09-12'),
      conversations: 24,
    },

    // 모델별 사용 통계
    modelUsage: [
      { name: 'Sonnet', count: 810, percentage: 65, color: '#3B82F6' },
      { name: 'Opus', count: 312, percentage: 25, color: '#A855F7' },
      { name: 'Haiku', count: 125, percentage: 10, color: '#22C55E' },
    ],

    // 시간대별 분석
    timeAnalysis: generateTimeAnalysisData(),

    // 생산성 지표
    productivityStats: {
      messagesPerConversation: 7.2,
      mostActiveMonth: 'Sep',
      mostActiveMonthCount: 187,
      marathonSessions: 34,
      longestBreak: 12,
      comebackStreak: 8,
      avgConversationsPerActiveDay: 4.3,
    },

    // 코드 작업 패턴
    codeWorkPattern: {
      explorationRatio: 45,
      modificationRatio: 55,
      explorationTools: 4497,  // Read + Grep + Glob
      modificationTools: 4877, // Edit + Write
      automationUsage: 432,    // Task
      workStyle: 'balanced',
    },
  }
}

function generateTimeAnalysisData() {
  // 24시간 활동 패턴 (오후 2-4시 피크)
  const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
    let baseActivity = 10
    // 업무 시간 증가
    if (hour >= 9 && hour <= 18) baseActivity = 50
    // 점심 시간 감소
    if (hour >= 12 && hour <= 13) baseActivity = 30
    // 오후 2-4시 피크
    if (hour >= 14 && hour <= 16) baseActivity = 80
    // 야간 감소
    if (hour >= 22 || hour <= 6) baseActivity = 5

    return {
      hour,
      count: Math.floor(baseActivity * (0.7 + Math.random() * 0.6)),
    }
  })

  // 요일×시간 매트릭스
  const dayHourMatrix = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isWeekend = day === 0 || day === 6
      const isWorkHour = hour >= 9 && hour <= 18
      let baseCount = 5

      if (!isWeekend && isWorkHour) {
        baseCount = 25
        if (hour >= 14 && hour <= 16) baseCount = 40
      } else if (isWeekend && hour >= 10 && hour <= 16) {
        baseCount = 10
      }

      dayHourMatrix.push({
        day,
        hour,
        count: Math.floor(baseCount * (0.5 + Math.random())),
      })
    }
  }

  return {
    hourlyActivity,
    dayHourMatrix,
    peakHour: 15, // 오후 3시
    peakDay: 2,   // 화요일
  }
}

function generateHeatmapData() {
  const data: { date: string; count: number }[] = []
  const startDate = new Date('2025-01-01')
  const endDate = new Date('2025-12-31')

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
