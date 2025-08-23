'use client'

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Eye, 
  EyeOff, 
  Type,
  AlertCircle,
  Check
} from 'lucide-react'
import { MessageFormatter, FormattedMessage } from '@/lib/message-formatter'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  mentions?: string[]
  className?: string
  showPreview?: boolean
  maxLength?: number
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Type your message...",
  disabled = false,
  mentions = [],
  className,
  showPreview = true,
  maxLength = 4096
}: RichTextEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [validation, setValidation] = useState<FormattedMessage | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Validate message on value change
  useEffect(() => {
    if (value) {
      const result = MessageFormatter.validate(value, mentions)
      setValidation(result)
    } else {
      setValidation(null)
    }
  }, [value, mentions])

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue.length <= maxLength) {
      onChange(newValue)
    }
  }

  const getSelection = () => {
    const textarea = textareaRef.current
    if (!textarea) return { start: 0, end: 0 }
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd
    }
  }

  const applyFormatting = (type: 'bold' | 'italic' | 'strikethrough' | 'code') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { start, end } = getSelection()
    
    if (start === end) {
      // No selection - insert markers at cursor position
      let markers = { start: '', end: '' }
      switch (type) {
        case 'bold':
          markers = { start: '*', end: '*' }
          break
        case 'italic':
          markers = { start: '_', end: '_' }
          break
        case 'strikethrough':
          markers = { start: '~', end: '~' }
          break
        case 'code':
          markers = { start: '`', end: '`' }
          break
      }
      
      const newValue = value.substring(0, start) + markers.start + markers.end + value.substring(start)
      onChange(newValue)
      
      // Position cursor between markers
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + markers.start.length, start + markers.start.length)
      }, 0)
    } else {
      // Apply formatting to selection
      const formatted = MessageFormatter.formatText(value, { type, start, end })
      onChange(formatted)
      
      setTimeout(() => {
        textarea.focus()
        const newEnd = end + (formatted.length - value.length)
        textarea.setSelectionRange(start, newEnd)
      }, 0)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          applyFormatting('bold')
          break
        case 'i':
          e.preventDefault()
          applyFormatting('italic')
          break
        case 'u': // Strikethrough (since WhatsApp doesn't have underline)
          e.preventDefault()
          applyFormatting('strikethrough')
          break
        case '`':
          e.preventDefault()
          applyFormatting('code')
          break
        case 'Enter':
          e.preventDefault()
          if (validation?.isValid) {
            // Trigger send action (handled by parent component)
            const event = new CustomEvent('send', { detail: { message: value } })
            textareaRef.current?.dispatchEvent(event)
          }
          break
      }
    }
  }

  const insertMention = (contact: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { start } = getSelection()
    const phoneNumber = contact.replace('@c.us', '')
    const mention = `@${phoneNumber} `
    
    const newValue = value.substring(0, start) + mention + value.substring(start)
    onChange(newValue)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + mention.length, start + mention.length)
    }, 0)
  }

  const getCharacterCountColor = () => {
    const count = validation?.characterCount || 0
    if (count > maxLength * 0.9) return 'text-red-500'
    if (count > maxLength * 0.8) return 'text-yellow-500'
    return 'text-zinc-500'
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Formatting Toolbar */}
      <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded-t-lg border border-b-0 border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyFormatting('bold')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyFormatting('italic')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyFormatting('strikethrough')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Strikethrough (Ctrl+U)"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyFormatting('code')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Code (Ctrl+`)"
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-2" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            disabled={disabled}
            title="Formatting help"
          >
            <Type className="h-3 w-3 mr-1" />
            *bold* _italic_ ~strike~ `code`
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {showPreview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title={isPreviewMode ? "Edit mode" : "Preview mode"}
            >
              {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
          
          {/* Character count */}
          <span className={cn("text-xs", getCharacterCountColor())}>
            {validation?.characterCount || 0}/{maxLength}
          </span>
        </div>
      </div>

      {/* Text Input or Preview */}
      <div className="relative">
        {isPreviewMode && validation ? (
          <div 
            className="min-h-[100px] p-3 border border-zinc-200 dark:border-zinc-700 rounded-b-lg bg-white dark:bg-zinc-900 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: validation.preview }}
          />
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[100px] resize-none rounded-t-none border-t-0 focus:ring-0 focus:border-zinc-300 dark:focus:border-zinc-600"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
            }}
          />
        )}
      </div>

      {/* Validation Messages */}
      {validation && validation.errors.length > 0 && (
        <div className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700 dark:text-red-300">
            <ul className="list-none space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Success indicator for valid messages */}
      {validation && validation.isValid && value.trim() && (
        <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-700 dark:text-green-300">
            Message is ready to send
          </span>
        </div>
      )}

      {/* Mentions suggestion (could be expanded) */}
      {mentions.length > 0 && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span>Available mentions: </span>
          {mentions.slice(0, 3).map((mention, index) => (
            <button
              key={index}
              type="button"
              onClick={() => insertMention(mention)}
              disabled={disabled}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mx-1 underline"
            >
              @{mention.replace('@c.us', '')}
            </button>
          ))}
          {mentions.length > 3 && <span>... and {mentions.length - 3} more</span>}
        </div>
      )}

      <style jsx>{`
        .prose code.inline-code {
          background: rgb(245 245 245);
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 0.875em;
        }
        .prose .dark code.inline-code {
          background: rgb(39 39 42);
        }
        .prose pre code.code-block {
          background: rgb(245 245 245);
          padding: 12px;
          border-radius: 6px;
          display: block;
          white-space: pre-wrap;
        }
        .prose .dark pre code.code-block {
          background: rgb(39 39 42);
        }
        .prose .mention {
          color: rgb(59 130 246);
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor