'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ClaudeStats } from '@/lib/types'
import { StatCard } from './StatCard'
import { YearHeatmap } from './YearHeatmap'
import { ToolUsageChart } from './ToolUsageChart'
import { ProjectBreakdown } from './ProjectBreakdown'
import { FunStatsCard } from './FunStatsCard'
import { MonthlyChart } from './MonthlyChart'
import { TimeAnalysisChart } from './TimeAnalysisChart'
import { ModelUsageChart } from './ModelUsageChart'
import { Toast } from './Toast'
import { AdSlot } from './AdSlot'

// AdSense ad unit IDs (create in AdSense console after approval)
const AD_SLOTS = {
  afterHeatmap: '', // Ad below heatmap
  beforeFooter: '', // Ad above footer
}
import {
  MessageSquare,
  Calendar,
  Flame,
  FolderOpen,
  Zap,
  Terminal,
  ArrowLeft,
  Share2,
  Copy,
  Twitter,
  Clock,
  Cpu,
} from 'lucide-react'
import { format } from 'date-fns'

interface YearSummaryProps {
  stats: ClaudeStats
  onReset: () => void
}

export function YearSummary({ stats, onReset }: YearSummaryProps) {
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showShareMenu, setShowShareMenu] = useState(false)

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

  const getShareText = () => {
    const year = stats.firstConversation.getFullYear()
    return `🤖 My Year in Claude Code ${year}\n\n` +
      `💬 ${stats.totalConversations.toLocaleString()} conversations\n` +
      `📊 ${stats.activeDays} active days\n` +
      `🔥 ${stats.longestStreak} day longest streak\n` +
      `📁 ${stats.projectCount} projects\n\n` +
      `#ClaudeCode #YearInReview`
  }

  const handleCopyToClipboard = async () => {
    await navigator.clipboard.writeText(getShareText())
    setToastMessage('Copied to clipboard!')
    setShowToast(true)
    setShowShareMenu(false)
  }

  const handleShareTwitter = () => {
    const text = encodeURIComponent(getShareText())
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
    setShowShareMenu(false)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: getShareText() })
      } catch (e) {
        // User cancelled - fall through to show menu
        setShowShareMenu(true)
      }
    } else {
      setShowShareMenu(!showShareMenu)
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
            aria-label="Back to home"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>Back</span>
          </button>

          <h1 className="text-lg font-semibold gradient-text">
            Year in Claude Code
          </h1>

          <div className="relative">
            <button
              onClick={handleShare}
              aria-label="Share stats"
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full hover:bg-amber-500/20 transition-colors"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* 공유 메뉴 드롭다운 */}
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
              >
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy to clipboard
                </button>
                <button
                  onClick={handleShareTwitter}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Share on X (Twitter)
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Toast 알림 */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

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
          <p className="text-amber-500/80 text-sm uppercase tracking-wider mb-6">
            Together since {format(stats.firstConversation, 'MMMM d, yyyy')}
          </p>

          <h2 className="text-3xl md:text-4xl font-medium text-gray-300 mb-2">
            Your Journey with Claude
          </h2>

          {/* Key number highlight */}
          <div className="mb-6">
            <span className="text-7xl md:text-9xl font-black gradient-text stat-number">
              {stats.activeDays}
            </span>
            <span className="text-2xl md:text-3xl text-gray-400 ml-2">days</span>
          </div>

          <p className="text-lg text-gray-500">
            <span className="text-white stat-number">{stats.totalConversations.toLocaleString()}</span>
            <span className="mx-1">conversations</span>
            <span className="text-gray-600 mx-2">·</span>
            <span className="text-white stat-number">{stats.projectCount}</span>
            <span className="mx-1">projects</span>
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
              label="Total Conversations"
              value={stats.totalConversations}
              suffix=""
              color="amber"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              icon={<Calendar className="w-6 h-6" />}
              label="Active Days"
              value={stats.activeDays}
              suffix=""
              color="blue"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              icon={<Flame className="w-6 h-6" />}
              label="Longest Streak"
              value={stats.longestStreak}
              suffix=" days"
              color="orange"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              icon={<FolderOpen className="w-6 h-6" />}
              label="Projects"
              value={stats.projectCount}
              suffix=""
              color="green"
            />
          </motion.div>
        </div>
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
          Activity Heatmap
        </h3>
        <YearHeatmap data={stats.weeklyHeatmap} />
      </motion.section>

      {/* Ad Slot - 히트맵과 월별 차트 사이 */}
      {AD_SLOTS.afterHeatmap && (
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <AdSlot slot={AD_SLOTS.afterHeatmap} format="horizontal" />
        </div>
      )}

      {/* Monthly Activity Chart */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 mt-16"
      >
        <h3 className="text-2xl font-bold text-white mb-6">
          📊 Monthly Activity
        </h3>
        <MonthlyChart data={stats.monthlyActivity} />
      </motion.section>

      {/* Time Analysis - 시간대별 분석 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 mt-16"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Clock className="w-6 h-6 text-indigo-400" />
          Activity by Time of Day
        </h3>
        <TimeAnalysisChart data={stats.timeAnalysis} />
      </motion.section>

      {/* Model Usage - 모델별 사용 통계 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 mt-16"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Cpu className="w-6 h-6 text-purple-400" />
          Model Usage
        </h3>
        <ModelUsageChart models={stats.modelUsage} />
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
              Top Tools
            </h3>
            <ToolUsageChart tools={stats.topTools} />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-blue-400" />
              Top Projects
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
          ✨ Fun Stats
        </h3>
        <FunStatsCard funStats={stats.funStats} peakDay={stats.peakDay} />
      </motion.section>

      {/* Ad Slot - Footer 위 */}
      {AD_SLOTS.beforeFooter && (
        <div className="max-w-6xl mx-auto px-4 mt-16">
          <AdSlot slot={AD_SLOTS.beforeFooter} format="auto" />
        </div>
      )}

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
            All data is processed locally in your browser. Nothing is sent to any server.
          </p>
        </div>
      </motion.footer>
    </div>
  )
}
