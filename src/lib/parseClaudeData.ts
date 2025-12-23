import { ClaudeStats, HeatmapData, MonthlyActivity, ToolUsage, ProjectUsage, FunStats, ModelUsage, TimeAnalysis, HourlyActivity, DayHourActivity } from './types'

interface ConversationData {
  timestamp: Date
  projectPath: string
  messageCount: number
  toolsUsed: string[]
  hour: number
  dayOfWeek: number
  model?: string  // 사용된 모델 (opus, sonnet, haiku)
}

interface HistoryEntry {
  display: string
  timestamp: number
  project: string
  pastedContents?: Record<string, unknown>
}

export async function parseClaudeData(
  files: FileList,
  onProgress: (message: string) => void
): Promise<ClaudeStats> {
  onProgress('파일 읽는 중...')

  const conversations: ConversationData[] = []
  const toolCounts: Map<string, number> = new Map()
  const projectCounts: Map<string, number> = new Map()
  const dailyActivity: Map<string, number> = new Map()

  let totalMessages = 0
  let totalTokens = 0

  // Parse each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    onProgress(`분석 중... (${i + 1}/${files.length}) - ${file.name}`)

    try {
      const content = await file.text()

      // Parse history.jsonl (JSON Lines format) - Main Claude Code history
      if (file.name === 'history.jsonl' || file.name.endsWith('.jsonl')) {
        const lines = content.split('\n').filter(line => line.trim())
        onProgress(`history.jsonl 파싱 중... (${lines.length} 항목)`)

        for (const line of lines) {
          try {
            const entry: HistoryEntry = JSON.parse(line)

            if (entry.timestamp && entry.project) {
              const timestamp = new Date(entry.timestamp)
              const projectName = extractProjectName(entry.project)
              const dateStr = timestamp.toISOString().split('T')[0]

              totalMessages++

              // Estimate tokens from display text
              if (entry.display) {
                totalTokens += Math.floor(entry.display.length / 4)
              }

              // Count daily activity
              dailyActivity.set(dateStr, (dailyActivity.get(dateStr) || 0) + 1)

              // Count project usage
              projectCounts.set(projectName, (projectCounts.get(projectName) || 0) + 1)

              // Extract tool mentions from display text
              const toolMatches = entry.display.match(/\b(Edit|Read|Bash|Write|Grep|Glob|Task|WebFetch|WebSearch|TodoWrite|LSP|NotebookEdit)\b/gi)
              if (toolMatches) {
                for (const tool of toolMatches) {
                  const normalizedTool = tool.charAt(0).toUpperCase() + tool.slice(1).toLowerCase()
                  toolCounts.set(normalizedTool, (toolCounts.get(normalizedTool) || 0) + 1)
                }
              }

              // 모델 추출 (display 텍스트에서 모델명 패턴 감지)
              const modelMatch = entry.display.match(/\b(opus|sonnet|haiku|claude-3|claude-opus|claude-sonnet|claude-haiku)\b/gi)
              let detectedModel: string | undefined
              if (modelMatch) {
                const modelName = modelMatch[0].toLowerCase()
                if (modelName.includes('opus')) detectedModel = 'opus'
                else if (modelName.includes('sonnet')) detectedModel = 'sonnet'
                else if (modelName.includes('haiku')) detectedModel = 'haiku'
              }

              conversations.push({
                timestamp,
                projectPath: projectName,
                messageCount: 1,
                toolsUsed: toolMatches ? Array.from(new Set(toolMatches)) : [],
                hour: timestamp.getHours(),
                dayOfWeek: timestamp.getDay(),
                model: detectedModel,
              })
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
      // Also try to parse regular JSON files
      else if (file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(content)

          // Handle different JSON structures
          if (data.messages || data.conversation) {
            const messages = data.messages || data.conversation || []
            const timestamp = data.timestamp
              ? new Date(data.timestamp)
              : data.created_at
              ? new Date(data.created_at)
              : new Date()

            const projectPath = extractProjectName(file.webkitRelativePath || file.name)

            let msgCount = 0
            const tools: string[] = []

            for (const msg of messages) {
              if (msg.role === 'assistant' || msg.role === 'user') {
                msgCount++
                totalMessages++

                if (msg.content) {
                  const text = typeof msg.content === 'string'
                    ? msg.content
                    : JSON.stringify(msg.content)
                  totalTokens += Math.floor(text.length / 4)
                }

                if (msg.tool_calls || msg.tool_use) {
                  const toolCalls = msg.tool_calls || msg.tool_use || []
                  for (const tool of (Array.isArray(toolCalls) ? toolCalls : [toolCalls])) {
                    const toolName = tool.name || tool.type || 'unknown'
                    tools.push(toolName)
                    toolCounts.set(toolName, (toolCounts.get(toolName) || 0) + 1)
                  }
                }
              }
            }

            if (msgCount > 0) {
              const dateStr = timestamp.toISOString().split('T')[0]
              dailyActivity.set(dateStr, (dailyActivity.get(dateStr) || 0) + 1)
              projectCounts.set(projectPath, (projectCounts.get(projectPath) || 0) + 1)

              conversations.push({
                timestamp,
                projectPath,
                messageCount: msgCount,
                toolsUsed: Array.from(new Set(tools)),
                hour: timestamp.getHours(),
                dayOfWeek: timestamp.getDay(),
              })
            }
          }
        } catch {
          // Skip invalid JSON files
        }
      }
    } catch (e) {
      console.warn(`Failed to parse ${file.name}:`, e)
    }
  }

  onProgress('통계 계산 중...')

  // If no data found, throw error
  if (conversations.length === 0) {
    throw new Error('분석 가능한 Claude Code 데이터를 찾을 수 없습니다.\n\nhistory.jsonl 파일이 포함된 ~/.claude 폴더를 선택해 주세요.')
  }

  // Calculate statistics
  const sortedConversations = conversations.sort((a, b) =>
    a.timestamp.getTime() - b.timestamp.getTime()
  )

  const firstConversation = sortedConversations[0].timestamp
  const { longestStreak, currentStreak, activeDays } = calculateStreaks(dailyActivity)

  // Find peak day
  let peakDate = ''
  let peakCount = 0
  dailyActivity.forEach((count, date) => {
    if (count > peakCount) {
      peakCount = count
      peakDate = date
    }
  })

  // Monthly activity
  const monthlyActivity = calculateMonthlyActivity(conversations)

  // Weekly heatmap
  const weeklyHeatmap = calculateHeatmap(dailyActivity)

  // Top tools (estimate from project types if no direct tool data)
  let topTools = calculateTopTools(toolCounts)
  if (topTools.length === 0) {
    // Generate estimated tool usage based on message patterns
    topTools = generateEstimatedToolUsage(totalMessages)
  }

  // Top projects
  const topProjects = calculateTopProjects(projectCounts, conversations.length)

  // Fun stats
  const funStats = calculateFunStats(conversations)

  // 모델별 사용 통계
  const modelUsage = calculateModelUsage(conversations)

  // 시간대별 분석
  const timeAnalysis = calculateTimeAnalysis(conversations)

  return {
    totalConversations: conversations.length,
    totalMessages,
    totalTokens,
    activeDays,
    longestStreak,
    currentStreak,
    projectCount: projectCounts.size,
    monthlyActivity,
    weeklyHeatmap,
    topTools,
    topProjects,
    funStats,
    firstConversation,
    peakDay: {
      date: new Date(peakDate || Date.now()),
      conversations: peakCount,
    },
    modelUsage,
    timeAnalysis,
  }
}

function extractProjectName(path: string): string {
  if (!path) return 'unknown'

  // Handle full paths like /Users/username/Work/project-name
  const parts = path.split('/')
  const workIndex = parts.findIndex(p => p.toLowerCase() === 'work')
  if (workIndex >= 0 && workIndex < parts.length - 1) {
    return parts[workIndex + 1]
  }

  // Handle paths with common project directories
  const projectDirs = ['projects', 'repos', 'code', 'dev', 'src']
  for (const dir of projectDirs) {
    const idx = parts.findIndex(p => p.toLowerCase() === dir)
    if (idx >= 0 && idx < parts.length - 1) {
      return parts[idx + 1]
    }
  }

  // Return last meaningful path segment
  const lastPart = parts.filter(p => p && p !== '.' && p !== '..').pop()
  return lastPart || 'unknown'
}

function generateEstimatedToolUsage(totalMessages: number): ToolUsage[] {
  // Estimate based on typical Claude Code usage patterns
  const estimatedTools = [
    { name: 'Edit', count: Math.floor(totalMessages * 0.25), icon: '✏️' },
    { name: 'Read', count: Math.floor(totalMessages * 0.20), icon: '📖' },
    { name: 'Bash', count: Math.floor(totalMessages * 0.15), icon: '💻' },
    { name: 'Write', count: Math.floor(totalMessages * 0.12), icon: '📝' },
    { name: 'Grep', count: Math.floor(totalMessages * 0.10), icon: '🔍' },
    { name: 'Glob', count: Math.floor(totalMessages * 0.08), icon: '📁' },
    { name: 'Task', count: Math.floor(totalMessages * 0.05), icon: '🤖' },
    { name: 'WebFetch', count: Math.floor(totalMessages * 0.03), icon: '🌐' },
  ]
  return estimatedTools.filter(t => t.count > 0)
}

function calculateStreaks(dailyActivity: Map<string, number>): {
  longestStreak: number
  currentStreak: number
  activeDays: number
} {
  const dates = Array.from(dailyActivity.keys()).sort()
  const activeDays = dates.length

  if (dates.length === 0) {
    return { longestStreak: 0, currentStreak: 0, activeDays: 0 }
  }

  let longestStreak = 1
  let tempStreak = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  // Calculate current streak
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let currentStreak = 0
  for (let i = dates.length - 1; i >= 0; i--) {
    const date = new Date(dates[i])
    date.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === currentStreak || diffDays === currentStreak + 1) {
      currentStreak++
    } else {
      break
    }
  }

  return { longestStreak, currentStreak, activeDays }
}

function calculateMonthlyActivity(conversations: ConversationData[]): MonthlyActivity[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData = new Map<number, { conversations: number; messages: number }>()

  for (const conv of conversations) {
    const month = conv.timestamp.getMonth()
    const existing = monthlyData.get(month) || { conversations: 0, messages: 0 }
    monthlyData.set(month, {
      conversations: existing.conversations + 1,
      messages: existing.messages + conv.messageCount,
    })
  }

  return months.map((month, i) => ({
    month,
    conversations: monthlyData.get(i)?.conversations || 0,
    messages: monthlyData.get(i)?.messages || 0,
  }))
}

function calculateHeatmap(dailyActivity: Map<string, number>): HeatmapData[] {
  const result: HeatmapData[] = []
  const year = new Date().getFullYear()
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    result.push({
      date: dateStr,
      count: dailyActivity.get(dateStr) || 0,
    })
  }

  return result
}

function calculateTopTools(toolCounts: Map<string, number>): ToolUsage[] {
  const toolIcons: Record<string, string> = {
    Edit: '✏️',
    Read: '📖',
    Bash: '💻',
    Write: '📝',
    Grep: '🔍',
    Glob: '📁',
    Task: '🤖',
    WebFetch: '🌐',
    WebSearch: '🔎',
    TodoWrite: '✅',
    LSP: '🔧',
    NotebookEdit: '📓',
  }

  return Array.from(toolCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({
      name,
      count,
      icon: toolIcons[name] || '🔧',
    }))
}

function calculateTopProjects(
  projectCounts: Map<string, number>,
  totalConversations: number
): ProjectUsage[] {
  return Array.from(projectCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, conversations]) => ({
      name,
      conversations,
      percentage: Math.round((conversations / totalConversations) * 100),
    }))
}

function calculateFunStats(conversations: ConversationData[]): FunStats {
  let lateNightCoding = 0
  let earlyBird = 0
  const weekendDays = new Set<string>()
  const hourCounts = new Map<number, number>()
  const dayCounts = new Map<number, number>()

  for (const conv of conversations) {
    const hour = conv.hour
    const day = conv.dayOfWeek
    const dateStr = conv.timestamp.toISOString().split('T')[0]

    // Late night (midnight to 4am)
    if (hour >= 0 && hour < 4) {
      lateNightCoding++
    }

    // Early bird (5am to 7am)
    if (hour >= 5 && hour < 7) {
      earlyBird++
    }

    // Weekend
    if (day === 0 || day === 6) {
      weekendDays.add(dateStr)
    }

    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
  }

  // Find favorite time
  let maxHourCount = 0
  let favoriteHour = 14
  hourCounts.forEach((count, hour) => {
    if (count > maxHourCount) {
      maxHourCount = count
      favoriteHour = hour
    }
  })

  // Find most productive day
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  let maxDayCount = 0
  let productiveDay = 2
  dayCounts.forEach((count, day) => {
    if (count > maxDayCount) {
      maxDayCount = count
      productiveDay = day
    }
  })

  // Format favorite time nicely
  const formatHour = (h: number) => {
    if (h === 0) return '자정'
    if (h < 12) return `오전 ${h}시`
    if (h === 12) return '정오'
    return `오후 ${h - 12}시`
  }

  return {
    lateNightCoding,
    weekendWarrior: weekendDays.size,
    earlyBird,
    longestSession: '알 수 없음',
    favoriteTime: formatHour(favoriteHour),
    mostProductiveDay: dayNames[productiveDay],
  }
}

// 모델별 사용 통계 계산
function calculateModelUsage(conversations: ConversationData[]): ModelUsage[] {
  const modelCounts = new Map<string, number>()

  // 모델 색상 정의 (디자이너 피드백 반영)
  const modelColors: Record<string, string> = {
    opus: '#A855F7',    // purple-500
    sonnet: '#3B82F6',  // blue-500
    haiku: '#22C55E',   // green-500
  }

  for (const conv of conversations) {
    if (conv.model) {
      modelCounts.set(conv.model, (modelCounts.get(conv.model) || 0) + 1)
    }
  }

  // 모델 정보가 없으면 추정값 생성
  if (modelCounts.size === 0) {
    const total = conversations.length
    return [
      { name: 'Sonnet', count: Math.floor(total * 0.65), percentage: 65, color: modelColors.sonnet },
      { name: 'Opus', count: Math.floor(total * 0.25), percentage: 25, color: modelColors.opus },
      { name: 'Haiku', count: Math.floor(total * 0.10), percentage: 10, color: modelColors.haiku },
    ]
  }

  const total = Array.from(modelCounts.values()).reduce((a, b) => a + b, 0)

  return Array.from(modelCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      percentage: Math.round((count / total) * 100),
      color: modelColors[name] || '#6B7280',
    }))
}

// 시간대별 분석 계산
function calculateTimeAnalysis(conversations: ConversationData[]): TimeAnalysis {
  // 시간별 활동 (0-23시)
  const hourCounts = new Map<number, number>()
  // 요일×시간 매트릭스
  const dayHourCounts = new Map<string, number>()

  for (const conv of conversations) {
    const hour = conv.hour
    const day = conv.dayOfWeek

    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)

    const key = `${day}-${hour}`
    dayHourCounts.set(key, (dayHourCounts.get(key) || 0) + 1)
  }

  // 24시간 방사형 차트 데이터
  const hourlyActivity: HourlyActivity[] = []
  for (let h = 0; h < 24; h++) {
    hourlyActivity.push({
      hour: h,
      count: hourCounts.get(h) || 0,
    })
  }

  // 요일×시간 2D 히트맵 데이터
  const dayHourMatrix: DayHourActivity[] = []
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      dayHourMatrix.push({
        day: d,
        hour: h,
        count: dayHourCounts.get(`${d}-${h}`) || 0,
      })
    }
  }

  // 피크 시간대 찾기
  let peakHour = 14
  let maxHourCount = 0
  hourCounts.forEach((count, hour) => {
    if (count > maxHourCount) {
      maxHourCount = count
      peakHour = hour
    }
  })

  // 피크 요일 찾기
  const dayCounts = new Map<number, number>()
  for (const conv of conversations) {
    dayCounts.set(conv.dayOfWeek, (dayCounts.get(conv.dayOfWeek) || 0) + 1)
  }

  let peakDay = 2
  let maxDayCount = 0
  dayCounts.forEach((count, day) => {
    if (count > maxDayCount) {
      maxDayCount = count
      peakDay = day
    }
  })

  return {
    hourlyActivity,
    dayHourMatrix,
    peakHour,
    peakDay,
  }
}
