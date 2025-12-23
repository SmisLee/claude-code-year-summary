'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import { ClaudeStats } from '@/lib/types'
import { StatCard } from './StatCard'
import { YearHeatmap } from './YearHeatmap'
import { ToolUsageChart } from './ToolUsageChart'
import { ProjectBreakdown } from './ProjectBreakdown'
import { FunStatsCard } from './FunStatsCard'
import { MonthlyChart } from './MonthlyChart'
import { TimeAnalysisChart } from './TimeAnalysisChart'
import { ModelUsageChart } from './ModelUsageChart'
import { ProductivityStatsCard } from './ProductivityStatsCard'
import { CodeWorkPatternChart } from './CodeWorkPatternChart'
import { Toast } from './Toast'
import { AdSlot } from './AdSlot'
import { ThemeToggle } from './ThemeToggle'

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
  TrendingUp,
  GitCompare,
  Download,
  Image as ImageIcon,
  Link,
  Share,
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
  const [isCapturing, setIsCapturing] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

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

  const handleShare = () => {
    // 항상 드롭다운 메뉴를 먼저 표시 (커스텀 옵션 접근 가능하도록)
    setShowShareMenu(!showShareMenu)
  }

  // 네이티브 공유 (Web Share API)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: getShareText() })
      } catch (e) {
        // User cancelled - ignore
      }
    }
    setShowShareMenu(false)
  }

  // 공유 링크 생성
  const handleCopyShareLink = async () => {
    const params = new URLSearchParams({
      d: String(stats.activeDays),
      c: String(stats.totalConversations),
      p: String(stats.projectCount),
      s: String(stats.longestStreak),
      y: String(stats.firstConversation.getFullYear()),
    })

    const shareUrl = `${window.location.origin}?share=${btoa(params.toString())}`

    await navigator.clipboard.writeText(shareUrl)
    setToastMessage('Share link copied!')
    setShowToast(true)
    setShowShareMenu(false)
  }

  // 이미지로 저장
  const handleSaveAsImage = async () => {
    if (!summaryRef.current || isCapturing) return

    setIsCapturing(true)
    setShowShareMenu(false)

    try {
      // Hero 섹션만 캡처 (간략 버전)
      const heroSection = summaryRef.current.querySelector('.hero-capture-area') as HTMLElement
      if (!heroSection) {
        throw new Error('Hero section not found')
      }

      // gradient-text를 캡처용 단색으로 임시 변경 (html2canvas가 background-clip: text 미지원)
      const gradientElements = heroSection.querySelectorAll('.gradient-text')
      gradientElements.forEach((el) => {
        (el as HTMLElement).style.background = 'none';
        (el as HTMLElement).style.webkitBackgroundClip = 'unset';
        (el as HTMLElement).style.webkitTextFillColor = '#F59E0B';
        (el as HTMLElement).style.color = '#F59E0B';
      })

      // 스크롤 인디케이터 숨기기
      const scrollIndicator = heroSection.querySelector('.scroll-indicator') as HTMLElement
      if (scrollIndicator) {
        scrollIndicator.style.display = 'none'
      }

      const canvas = await html2canvas(heroSection, {
        backgroundColor: '#0a0a0a',
        scale: 2, // 고해상도
        useCORS: true,
        logging: false,
      })

      // 원래 스타일 복원
      gradientElements.forEach((el) => {
        (el as HTMLElement).style.background = '';
        (el as HTMLElement).style.webkitBackgroundClip = '';
        (el as HTMLElement).style.webkitTextFillColor = '';
        (el as HTMLElement).style.color = '';
      })
      if (scrollIndicator) {
        scrollIndicator.style.display = ''
      }

      // 이미지 다운로드
      const link = document.createElement('a')
      link.download = `claude-code-year-${stats.firstConversation.getFullYear()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      setToastMessage('Image saved!')
      setShowToast(true)
    } catch (error) {
      console.error('Failed to capture image:', error)
      setToastMessage('Failed to save image')
      setShowToast(true)
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <div ref={summaryRef} className="min-h-screen bg-[--bg-primary] pb-20 transition-colors">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-[--bg-primary]/80 border-b border-[--border-primary]"
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onReset}
            aria-label="Back to home"
            className="flex items-center gap-2 text-[--text-secondary] hover:text-[--text-primary] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>Back</span>
          </button>

          <h1 className="text-lg font-semibold gradient-text">
            Year in Claude Code
          </h1>

          <div className="flex items-center gap-3">
            <ThemeToggle />

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
                  className="absolute right-0 top-full mt-2 w-48 bg-[--bg-tertiary] border border-[--border-primary] rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[--text-primary] hover:bg-[--bg-card-hover] transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy as text
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[--text-primary] hover:bg-[--bg-card-hover] transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    Share on X (Twitter)
                  </button>
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <button
                      onClick={handleNativeShare}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[--text-primary] hover:bg-[--bg-card-hover] transition-colors border-t border-[--border-primary]"
                    >
                      <Share className="w-4 h-4" />
                      More options...
                    </button>
                  )}
                </motion.div>
              )}
            </div>
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
        className="relative py-20 px-4 text-center overflow-hidden hero-capture-area"
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

          <h2 className="text-3xl md:text-4xl font-medium text-[--text-secondary] mb-2">
            Your Journey with Claude
          </h2>

          {/* Key number highlight */}
          <div className="mb-6">
            <span className="text-7xl md:text-9xl font-black gradient-text stat-number">
              {stats.activeDays}
            </span>
            <span className="text-2xl md:text-3xl text-[--text-secondary] ml-2">days</span>
          </div>

          <p className="text-lg text-[--text-tertiary]">
            <span className="text-[--text-primary] stat-number">{stats.totalConversations.toLocaleString()}</span>
            <span className="mx-1">conversations</span>
            <span className="text-[--text-muted] mx-2">·</span>
            <span className="text-[--text-primary] stat-number">{stats.projectCount}</span>
            <span className="mx-1">projects</span>
          </p>
        </motion.div>

        {/* 스크롤 인디케이터 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 scroll-indicator"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1 text-[--text-muted]"
          >
            <span className="text-xs">Scroll to explore</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
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
        <h3 className="text-2xl font-bold text-[--text-primary] mb-6 flex items-center gap-3">
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
        <h3 className="text-2xl font-bold text-[--text-primary] mb-6">
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
        <h3 className="text-2xl font-bold text-[--text-primary] mb-6 flex items-center gap-3">
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
        <h3 className="text-2xl font-bold text-[--text-primary] mb-6 flex items-center gap-3">
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
            <h3 className="text-2xl font-bold text-[--text-primary] mb-6 flex items-center gap-3">
              <Terminal className="w-6 h-6 text-amber-400" />
              Top Tools
            </h3>
            <ToolUsageChart tools={stats.topTools} />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-[--text-primary] mb-6 flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-blue-400" />
              Top Projects
            </h3>
            <ProjectBreakdown projects={stats.topProjects} />
          </div>
        </div>
      </motion.section>

      {/* Productivity Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 mt-16"
      >
        <h3 className="text-2xl font-bold text-[--text-primary] mb-6 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-green-400" />
          Productivity Insights
        </h3>
        <ProductivityStatsCard stats={stats.productivityStats} />
      </motion.section>

      {/* Code Work Pattern */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 mt-16"
      >
        <h3 className="text-2xl font-bold text-[--text-primary] mb-6 flex items-center gap-3">
          <GitCompare className="w-6 h-6 text-cyan-400" />
          Your Coding Style
        </h3>
        <CodeWorkPatternChart pattern={stats.codeWorkPattern} />
      </motion.section>

      {/* Fun Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 mt-16"
      >
        <h3 className="text-2xl font-bold text-[--text-primary] mb-6">
          Fun Stats
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
        <div className="py-8 border-t border-[--border-primary]">
          <p className="text-[--text-secondary] text-sm">
            Made with ❤️ and Claude Code
          </p>
          <p className="text-[--text-muted] text-xs mt-2">
            All data is processed locally in your browser. Nothing is sent to any server.
          </p>
        </div>
      </motion.footer>
    </div>
  )
}
