'use client'

import { motion } from 'framer-motion'
import { ClaudeStats } from '@/lib/types'
import { StatCard } from './StatCard'
import { YearHeatmap } from './YearHeatmap'
import { ToolUsageChart } from './ToolUsageChart'
import { ProjectBreakdown } from './ProjectBreakdown'
import { FunStatsCard } from './FunStatsCard'
import { MonthlyChart } from './MonthlyChart'
import {
  MessageSquare,
  Calendar,
  Flame,
  FolderOpen,
  Zap,
  Terminal,
  ArrowLeft,
  Share2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface YearSummaryProps {
  stats: ClaudeStats
  onReset: () => void
}

export function YearSummary({ stats, onReset }: YearSummaryProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const handleShare = async () => {
    const shareText = `🤖 My Year in Claude Code 2024\n\n` +
      `💬 ${stats.totalConversations.toLocaleString()} conversations\n` +
      `📊 ${stats.activeDays} active days\n` +
      `🔥 ${stats.longestStreak} day longest streak\n` +
      `📁 ${stats.projectCount} projects\n\n` +
      `#ClaudeCode #YearInReview`

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
      } catch (e) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareText)
      alert('클립보드에 복사되었습니다!')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-gray-800"
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>처음으로</span>
          </button>

          <h1 className="text-lg font-semibold gradient-text">
            Year in Claude Code
          </h1>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full hover:bg-amber-500/20 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">공유</span>
          </button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative py-20 px-4 text-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="relative"
        >
          <p className="text-amber-500/80 text-sm uppercase tracking-wider mb-4">
            {format(stats.firstConversation, 'yyyy년 M월 d일', { locale: ko })}부터 함께
          </p>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">당신과 Claude의</span>
            <br />
            <span className="gradient-text">{stats.firstConversation.getFullYear()}년</span>
          </h2>

          <p className="text-xl text-gray-400">
            {stats.activeDays}일 동안 {stats.totalConversations.toLocaleString()}번의 대화
          </p>
        </motion.div>
      </motion.section>

      {/* Main Stats */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <StatCard
              icon={<MessageSquare className="w-6 h-6" />}
              label="총 대화"
              value={stats.totalConversations}
              suffix="회"
              color="amber"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              icon={<Calendar className="w-6 h-6" />}
              label="활동 일수"
              value={stats.activeDays}
              suffix="일"
              color="blue"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              icon={<Flame className="w-6 h-6" />}
              label="최장 연속"
              value={stats.longestStreak}
              suffix="일"
              color="orange"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              icon={<FolderOpen className="w-6 h-6" />}
              label="프로젝트"
              value={stats.projectCount}
              suffix="개"
              color="green"
            />
          </motion.div>
        </div>

        {/* Token usage */}
        <motion.div variants={itemVariants} className="mt-4">
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400">총 토큰 사용량</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {(stats.totalTokens / 1_000_000).toFixed(2)}
              <span className="text-lg text-gray-400 ml-1">M tokens</span>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Activity Heatmap */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 mt-16"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-green-400" />
          활동 히트맵
        </h3>
        <YearHeatmap data={stats.weeklyHeatmap} />
      </motion.section>

      {/* Monthly Activity Chart */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 mt-16"
      >
        <h3 className="text-2xl font-bold text-white mb-6">
          📊 월별 활동
        </h3>
        <MonthlyChart data={stats.monthlyActivity} />
      </motion.section>

      {/* Tool Usage & Projects */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 mt-16"
      >
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Terminal className="w-6 h-6 text-amber-400" />
              가장 많이 사용한 도구
            </h3>
            <ToolUsageChart tools={stats.topTools} />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-blue-400" />
              상위 프로젝트
            </h3>
            <ProjectBreakdown projects={stats.topProjects} />
          </div>
        </div>
      </motion.section>

      {/* Fun Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 mt-16"
      >
        <h3 className="text-2xl font-bold text-white mb-6">
          ✨ 재미있는 통계
        </h3>
        <FunStatsCard funStats={stats.funStats} peakDay={stats.peakDay} />
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 mt-20 text-center"
      >
        <div className="py-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            Made with ❤️ and Claude Code
          </p>
          <p className="text-gray-600 text-xs mt-2">
            모든 데이터는 브라우저에서만 처리됩니다. 서버로 전송되지 않습니다.
          </p>
        </div>
      </motion.footer>
    </div>
  )
}
