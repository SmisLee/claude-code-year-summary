export interface ClaudeStats {
  // Core metrics
  totalConversations: number
  totalMessages: number
  totalTokens: number
  activeDays: number
  longestStreak: number
  currentStreak: number
  projectCount: number

  // Time-based data
  monthlyActivity: MonthlyActivity[]
  weeklyHeatmap: HeatmapData[]

  // Tool usage
  topTools: ToolUsage[]

  // Project breakdown
  topProjects: ProjectUsage[]

  // Fun statistics
  funStats: FunStats

  // Milestones
  firstConversation: Date
  peakDay: {
    date: Date
    conversations: number
  }
}

export interface MonthlyActivity {
  month: string
  conversations: number
  messages: number
}

export interface HeatmapData {
  date: string
  count: number
}

export interface ToolUsage {
  name: string
  count: number
  icon: string
}

export interface ProjectUsage {
  name: string
  conversations: number
  percentage: number
}

export interface FunStats {
  lateNightCoding: number // 자정 이후 코딩 횟수
  weekendWarrior: number  // 주말 코딩 일수
  earlyBird: number       // 오전 6시 이전 코딩 횟수
  longestSession: string  // 가장 긴 세션
  favoriteTime: string    // 가장 활동적인 시간대
  mostProductiveDay: string // 가장 생산적인 요일
}

export interface ParsedConversation {
  id: string
  timestamp: Date
  projectPath: string
  messageCount: number
  toolsUsed: string[]
}
