'use client'

import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Folder, Loader2, CheckCircle, AlertCircle, Circle, FileText, BarChart3 } from 'lucide-react'
import { ClaudeStats } from '@/lib/types'
import { parseClaudeData } from '@/lib/parseClaudeData'

type LoadingStep = 'reading' | 'parsing' | 'calculating' | 'done'

interface FileDropzoneProps {
  onDataParsed: (stats: ClaudeStats) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function FileDropzone({ onDataParsed, isLoading, setIsLoading }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('reading')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsLoading(true)
    setError(null)
    setLoadingStep('reading')
    setProgress('Reading files...')

    try {
      const stats = await parseClaudeData(files, (msg) => {
        setProgress(msg)
        // Update step based on progress
        if (msg.includes('Reading')) setLoadingStep('reading')
        else if (msg.includes('Analyzing') || msg.includes('Parsing')) setLoadingStep('parsing')
        else if (msg.includes('Calculating')) setLoadingStep('calculating')
      })
      setLoadingStep('done')
      onDataParsed(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing files')
    } finally {
      setIsLoading(false)
      setProgress('')
      setLoadingStep('reading')
    }
  }, [onDataParsed, setIsLoading])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const items = e.dataTransfer.items
    if (items) {
      // Handle directory drop
      const files: File[] = []
      const promises: Promise<void>[] = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry()
        if (item) {
          promises.push(traverseFileTree(item, files))
        }
      }

      Promise.all(promises).then(() => {
        const dt = new DataTransfer()
        files.forEach(file => dt.items.add(file))
        handleFiles(dt.files)
      })
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  return (
    <motion.div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      role="button"
      tabIndex={0}
      aria-label="Upload Claude Code data folder"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
      animate={{
        scale: isDragOver ? 1.02 : 1,
        borderColor: isDragOver ? '#D97706' : '#374151',
      }}
      className={`
        relative cursor-pointer
        border-2 border-dashed rounded-3xl
        p-12 text-center
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]
        ${isDragOver ? 'bg-amber-500/5' : 'bg-gray-900/50'}
        ${error ? 'border-red-500/50' : ''}
        hover:border-amber-500/50 hover:bg-gray-900/80
      `}
    >
      <input
        ref={inputRef}
        type="file"
        // @ts-ignore - webkitdirectory is a valid attribute
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4">
        {isLoading ? (
          <div className="w-full max-w-xs">
            {/* Step-by-step progress */}
            <div className="space-y-3">
              <LoadingStepItem
                icon={<FileText className="w-4 h-4" />}
                label="Reading files"
                isActive={loadingStep === 'reading'}
                isCompleted={['parsing', 'calculating', 'done'].includes(loadingStep)}
              />
              <LoadingStepItem
                icon={<Folder className="w-4 h-4" />}
                label="Analyzing data"
                isActive={loadingStep === 'parsing'}
                isCompleted={['calculating', 'done'].includes(loadingStep)}
              />
              <LoadingStepItem
                icon={<BarChart3 className="w-4 h-4" />}
                label="Calculating stats"
                isActive={loadingStep === 'calculating'}
                isCompleted={loadingStep === 'done'}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">{progress}</p>
          </div>
        ) : error ? (
          <>
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setError(null)
              }}
              className="text-sm text-gray-400 hover:text-white underline"
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <motion.div
              animate={{ y: isDragOver ? -5 : 0 }}
              className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl"
            >
              {isDragOver ? (
                <Folder className="w-12 h-12 text-amber-500" />
              ) : (
                <Upload className="w-12 h-12 text-amber-500" />
              )}
            </motion.div>

            <div>
              <p className="text-lg text-white font-medium">
                {isDragOver ? 'Drop it here!' : 'Drag your ~/.claude folder here'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                or click to select folder
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
              <CheckCircle className="w-4 h-4 text-green-500/70" />
              <span>Privacy guaranteed - all processing happens in your browser</span>
            </div>
          </>
        )}
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-amber-500/30 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-amber-500/30 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-amber-500/30 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-amber-500/30 rounded-br-lg" />
    </motion.div>
  )
}

// 로딩 단계 아이템 컴포넌트
function LoadingStepItem({
  icon,
  label,
  isActive,
  isCompleted,
}: {
  icon: React.ReactNode
  label: string
  isActive: boolean
  isCompleted: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: isActive || isCompleted ? 1 : 0.5 }}
      className="flex items-center gap-3"
    >
      <div
        className={`
          flex items-center justify-center w-8 h-8 rounded-full transition-colors
          ${isCompleted ? 'bg-green-500/20 text-green-500' : ''}
          ${isActive ? 'bg-amber-500/20 text-amber-500' : ''}
          ${!isActive && !isCompleted ? 'bg-gray-800 text-gray-600' : ''}
        `}
      >
        {isCompleted ? (
          <CheckCircle className="w-4 h-4" />
        ) : isActive ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon
        )}
      </div>
      <span
        className={`
          text-sm transition-colors
          ${isCompleted ? 'text-green-500' : ''}
          ${isActive ? 'text-amber-500' : ''}
          ${!isActive && !isCompleted ? 'text-gray-600' : ''}
        `}
      >
        {label}
      </span>
    </motion.div>
  )
}

async function traverseFileTree(item: FileSystemEntry, files: File[]): Promise<void> {
  return new Promise((resolve) => {
    if (item.isFile) {
      (item as FileSystemFileEntry).file((file) => {
        // Only include JSON and JSONL files
        if (file.name.endsWith('.json') || file.name.endsWith('.jsonl')) {
          files.push(file)
        }
        resolve()
      })
    } else if (item.isDirectory) {
      const dirReader = (item as FileSystemDirectoryEntry).createReader()
      dirReader.readEntries(async (entries) => {
        for (const entry of entries) {
          await traverseFileTree(entry, files)
        }
        resolve()
      })
    } else {
      resolve()
    }
  })
}
