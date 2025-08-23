'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { MessageFormatter } from '@/lib/message-formatter'
import { QuickReplies } from './quick-replies'
import { TemplateManager } from './template-manager'
import { Send, User, Smartphone, Settings, MessageSquare, CheckCircle, XCircle, Loader2, LogOut, Palette, FileText, Zap, ChevronUp, ChevronDown } from 'lucide-react'

interface Message {
  id: string
  content: string
  type: 'user' | 'assistant' | 'system' | 'whatsapp_sent' | 'whatsapp_error'
  timestamp: Date
  chatId?: string
  messageId?: string
}

interface WhatsAppChatProps {
  onLogout?: () => void
  sessionName: string
}

export function WhatsAppChat({ onLogout, sessionName }: WhatsAppChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [chatId, setChatId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<string>('WORKING')
  const [useRichEditor, setUseRichEditor] = useState(false)
  const [contacts, setContacts] = useState<string[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [templatesExpanded, setTemplatesExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    checkSessionStatus()
    const interval = setInterval(checkSessionStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkSessionStatus = async () => {
    try {
      const response = await fetch(`/api/whatsapp/session/${sessionName}`)
      if (response.ok) {
        const session = await response.json()
        setSessionStatus(session.status)
      }
    } catch (error) {
      console.error('Failed to check session status:', error)
    }
  }

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleQuickReplySelect = (replyText: string) => {
    setInput(replyText)
    setShowQuickReplies(false) // Collapse after selection
  }

  const handleTemplateProcessed = (processedText: string) => {
    setInput(processedText)
    setTemplatesExpanded(false) // Collapse after selection
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !chatId.trim() || isLoading) return

    if (sessionStatus !== 'WORKING') {
      addMessage({
        content: 'WhatsApp session is not active. Please check your connection.',
        type: 'system'
      })
      return
    }

    // Clean and validate the message
    const cleanedMessage = MessageFormatter.cleanForSending(input)
    const validation = MessageFormatter.validate(cleanedMessage, contacts)
    
    if (!validation.isValid) {
      addMessage({
        content: `Message validation failed: ${validation.errors.join(', ')}`,
        type: 'system'
      })
      return
    }

    const targetChatId = chatId.trim()
    const mentions = MessageFormatter.extractMentions(cleanedMessage)

    // Add user message
    addMessage({
      content: cleanedMessage,
      type: 'user',
      chatId: targetChatId
    })

    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/whatsapp/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: cleanedMessage,
          chatId: targetChatId,
          sessionName: sessionName,
          mentions: mentions.length > 0 ? mentions : undefined,
          formatted: useRichEditor // Flag to indicate if message contains formatting
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process message')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              switch (data.type) {
                case 'status':
                  addMessage({
                    content: data.message,
                    type: 'system'
                  })
                  break
                
                case 'ai_response':
                  addMessage({
                    content: data.content,
                    type: 'assistant'
                  })
                  break
                
                case 'whatsapp_sent':
                  addMessage({
                    content: `✅ Message sent to WhatsApp (${data.chatId}):\n"${data.content}"`,
                    type: 'whatsapp_sent',
                    chatId: data.chatId,
                    messageId: data.messageId
                  })
                  break
                
                case 'whatsapp_error':
                  addMessage({
                    content: `❌ Failed to send WhatsApp message: ${data.error}`,
                    type: 'whatsapp_error'
                  })
                  break
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      addMessage({
        content: 'Failed to process your message. Please try again.',
        type: 'system'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-5 h-5" />
      case 'assistant':
        return <MessageSquare className="w-5 h-5" />
      case 'whatsapp_sent':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'whatsapp_error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'system':
        return <Settings className="w-5 h-5 text-blue-600" />
      default:
        return <MessageSquare className="w-5 h-5" />
    }
  }

  const getMessageBgColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-600 text-white'
      case 'assistant':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      case 'whatsapp_sent':
        return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
      case 'whatsapp_error':
        return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
      case 'system':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
      default:
        return 'bg-gray-100 dark:bg-gray-800'
    }
  }

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                WhatsApp Agent
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Status: {sessionStatus === 'WORKING' ? '🟢 Connected' : '🔴 Disconnected'}
              </p>
            </div>
          </div>
          
          {/* Logout Button */}
          {onLogout && sessionStatus === 'WORKING' && (
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 border-b border-zinc-200 dark:border-zinc-800 rounded-none">
        <div className="space-y-3">
          <div>
            <label htmlFor="chatId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              WhatsApp Chat ID (phone number + @c.us)
            </label>
            <Input
              id="chatId"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g., 1234567890@c.us"
              className="w-full"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Format: international phone number without + symbol, followed by @c.us
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Smartphone className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              Ready to send WhatsApp messages
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              Enter a WhatsApp chat ID above and start a conversation. The AI will help you compose and send messages.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${getMessageBgColor(message.type)}`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {getMessageIcon(message.type)}
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.chatId && (
                    <span className="text-xs opacity-70">
                      → {message.chatId}
                    </span>
                  )}
                </div>
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-b-lg">
        <div className="space-y-3">
          {/* Editor Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant={useRichEditor ? "default" : "outline"}
                size="sm"
                onClick={() => setUseRichEditor(!useRichEditor)}
                disabled={isLoading}
                className="h-8"
              >
                <Palette className="w-3 h-3 mr-1" />
                {useRichEditor ? "Rich Editor" : "Simple Text"}
              </Button>
              
              <Button
                type="button"
                variant={showTemplates ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
                disabled={isLoading}
                className="h-8"
              >
                <FileText className="w-3 h-3 mr-1" />
                Templates
              </Button>

              <Button
                type="button"
                variant={showQuickReplies ? "default" : "outline"}
                size="sm"
                onClick={() => setShowQuickReplies(!showQuickReplies)}
                disabled={isLoading}
                className="h-8"
              >
                <Zap className="w-3 h-3 mr-1" />
                Quick Replies
              </Button>
              
              {useRichEditor && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Supports *bold*, _italic_, ~strikethrough~, `code`
                </span>
              )}
            </div>
          </div>

          {/* Message Input */}
          {useRichEditor ? (
            <div className="space-y-2">
              <RichTextEditor
                value={input}
                onChange={setInput}
                placeholder="Compose your WhatsApp message with rich formatting..."
                disabled={isLoading || !chatId.trim()}
                mentions={contacts}
                showPreview={true}
                maxLength={4096}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim() || !chatId.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI to help compose a WhatsApp message..."
                className="flex-1 min-h-[44px] max-h-32 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                disabled={isLoading || !chatId.trim()}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim() || !chatId.trim()}
                className="bg-green-600 hover:bg-green-700 h-[44px] px-4"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}

          {/* Templates Panel */}
          {showTemplates && (
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Message Templates
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setTemplatesExpanded(!templatesExpanded)}
                  className="h-6 w-6 p-0"
                >
                  {templatesExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </Button>
              </div>
              
              {templatesExpanded ? (
                <TemplateManager
                  onProcessedTemplate={handleTemplateProcessed}
                  disabled={isLoading || !chatId.trim()}
                  mode="select"
                />
              ) : (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Click to expand template selection
                </div>
              )}
            </div>
          )}

          {/* Quick Replies Panel */}
          {showQuickReplies && (
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
              <QuickReplies
                onReplySelect={handleQuickReplySelect}
                disabled={isLoading || !chatId.trim()}
              />
            </div>
          )}
        </div>
        
        {!chatId.trim() && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Please enter a WhatsApp chat ID first
          </p>
        )}
        
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          {useRichEditor 
            ? "Use the toolbar for formatting or Ctrl+B for bold, Ctrl+I for italic" 
            : "Press Enter to send, Shift+Enter for new line"
          }
        </p>
      </form>
    </div>
  )
}