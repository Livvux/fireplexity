'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  Music, 
  X, 
  AlertCircle,
  Loader2,
  FileText,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MediaFile {
  id: string
  file: File
  preview?: string
  type: 'image' | 'video' | 'audio' | 'document' | 'other'
  caption?: string
  error?: string
}

interface MediaUploaderProps {
  onFilesChange: (files: MediaFile[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  disabled?: boolean
  className?: string
  showCaption?: boolean
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]

const MAX_FILE_SIZE_MB = 64 // WhatsApp limit
const MAX_CAPTION_LENGTH = 1024

export function MediaUploader({
  onFilesChange,
  maxFiles = 10,
  maxFileSize = MAX_FILE_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
  className,
  showCaption = true
}: MediaUploaderProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileType = (file: File): MediaFile['type'] => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    if (file.type === 'application/pdf' || 
        file.type.includes('document') || 
        file.type.includes('text')) return 'document'
    return 'other'
  }

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'audio': return <Music className="w-5 h-5" />
      case 'document': return <FileText className="w-5 h-5" />
      default: return <File className="w-5 h-5" />
    }
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`
    }

    // Check file type
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'))
      }
      return file.type === type
    })

    if (!isAccepted) {
      return 'File type not supported'
    }

    return null
  }

  const createPreview = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })
    }
    return undefined
  }

  const processFiles = useCallback(async (fileList: FileList) => {
    if (disabled) return
    
    setIsProcessing(true)
    const newFiles: MediaFile[] = []

    for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
      const file = fileList[i]
      const error = validateFile(file)
      
      const mediaFile: MediaFile = {
        id: `${Date.now()}-${i}`,
        file,
        type: getFileType(file),
        error: error || undefined
      }

      if (!error) {
        mediaFile.preview = await createPreview(file)
      }

      newFiles.push(mediaFile)
    }

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
    setIsProcessing(false)
  }, [files, maxFiles, disabled, onFilesChange])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (fileList) {
      processFiles(fileList)
    }
    // Reset input value so same file can be selected again
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const fileList = e.dataTransfer.files
    if (fileList) {
      processFiles(fileList)
    }
  }

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const updateCaption = (fileId: string, caption: string) => {
    const updatedFiles = files.map(f => 
      f.id === fileId ? { ...f, caption } : f
    )
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver 
            ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
            : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500",
          disabled && "opacity-50 cursor-not-allowed",
          files.length >= maxFiles && "opacity-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          disabled={disabled || files.length >= maxFiles}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Processing files...
            </p>
          </div>
        ) : files.length >= maxFiles ? (
          <div className="flex flex-col items-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Maximum {maxFiles} files allowed
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-zinc-400" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Drop files here or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="text-green-600 hover:text-green-500 underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Max {maxFiles} files, {maxFileSize}MB each
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Attached Files ({files.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {files.map((mediaFile) => (
              <div
                key={mediaFile.id}
                className={cn(
                  "flex items-start space-x-3 p-3 border rounded-lg",
                  mediaFile.error 
                    ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                )}
              >
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {mediaFile.preview ? (
                    <img
                      src={mediaFile.preview}
                      alt={mediaFile.file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 rounded">
                      {getFileIcon(mediaFile.type)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {mediaFile.file.name}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(mediaFile.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatFileSize(mediaFile.file.size)} • {mediaFile.type}
                  </p>

                  {mediaFile.error && (
                    <div className="flex items-center space-x-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {mediaFile.error}
                      </p>
                    </div>
                  )}

                  {/* Caption Input */}
                  {showCaption && !mediaFile.error && (
                    <div className="mt-2">
                      <Textarea
                        placeholder="Add a caption (optional)"
                        value={mediaFile.caption || ''}
                        onChange={(e) => updateCaption(mediaFile.id, e.target.value)}
                        className="text-xs resize-none"
                        rows={2}
                        maxLength={MAX_CAPTION_LENGTH}
                      />
                      <p className="text-xs text-zinc-400 mt-1">
                        {(mediaFile.caption || '').length}/{MAX_CAPTION_LENGTH}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supported Formats */}
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        <p><strong>Supported formats:</strong> Images, Videos, Audio, PDF, Word documents, Text files</p>
      </div>
    </div>
  )
}

export default MediaUploader