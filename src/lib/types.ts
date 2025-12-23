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

  // 새로운 시각화 데이터
  modelUsage: ModelUsage[]          // 모델별 사용 통계
  timeAnalysis: TimeAnalysis        // 시간대별 분석
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

// 모델별 사용 통계
export interface ModelUsage {
  name: string        // opus, sonnet, haiku
  count: number       // 대화 수
  percentage: number  // 비율
  color: string       // 색상 코드
}

// 시간대별 활동 (24시간)
export interface HourlyActivity {
  hour: number        // 0-23
  count: number       // 해당 시간대 대화 수
}

// 요일×시간 2D 히트맵 데이터
export interface DayHourActivity {
  day: number         // 0-6 (일-토)
  hour: number        // 0-23
  count: number       // 해당 시간대 대화 수
}

// 시간 분석 통계
export interface TimeAnalysis {
  hourlyActivity: HourlyActivity[]      // 24시간 방사형 차트용
  dayHourMatrix: DayHourActivity[]      // 요일×시간 2D 히트맵용
  peakHour: number                      // 가장 활발한 시간
  peakDay: number                       // 가장 활발한 요일
}

export interface ParsedConversation {
  id: string
  timestamp: Date
  projectPath: string
  messageCount: number
  toolsUsed: string[]
}
