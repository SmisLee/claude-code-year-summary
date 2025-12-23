'use client'

import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Folder, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { ClaudeStats } from '@/lib/types'
import { parseClaudeData } from '@/lib/parseClaudeData'

interface FileDropzoneProps {
  onDataParsed: (stats: ClaudeStats) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function FileDropzone({ onDataParsed, isLoading, setIsLoading }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsLoading(true)
    setError(null)
    setProgress('파일 분석 중...')

    try {
      const stats = await parseClaudeData(files, (msg) => setProgress(msg))
      onDataParsed(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일 처리 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
      setProgress('')
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
      animate={{
        scale: isDragOver ? 1.02 : 1,
        borderColor: isDragOver ? '#D97706' : '#374151',
      }}
      className={`
        relative cursor-pointer
        border-2 border-dashed rounded-3xl
        p-12 text-center
        transition-all duration-300
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
          <>
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            <p className="text-gray-300">{progress}</p>
          </>
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
              다시 시도
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
                {isDragOver ? '여기에 놓으세요!' : '~/.claude 폴더를 드래그하세요'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                또는 클릭하여 폴더 선택
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
              <CheckCircle className="w-4 h-4 text-green-500/70" />
              <span>프라이버시 보장 - 모든 처리는 브라우저에서 수행됩니다</span>
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

async function traverseFileTree(item: FileSystemEntry, files: File[]): Promise<void> {
  return new Promise((resolve) => {
    if (item.isFile) {
      (item as FileSystemFileEntry).file((file) => {
        // Only include JSON and MD files
        if (file.name.endsWith('.json') || file.name.endsWith('.md')) {
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
