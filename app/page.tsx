'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { SearchComponent } from './search'
import { ChatInterface } from './chat-interface'
import { SearchResult, NewsResult, ImageResult } from './types'
import { Part } from '@/types/lovable'
import { Button } from '@/components/ui/button'
import { AuroraText } from '@/components/ui/aurora-text'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
// import { ErrorDisplay } from '@/components/error-display' // Not used
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LogoutButton } from '@/components/auth/logout-button'

interface MessageData {
  sources: SearchResult[]
  newsResults?: NewsResult[]
  imageResults?: ImageResult[]
  followUpQuestions: string[]
  ticker?: string
}

export default function LivvuxPlexityPage() {
  const [sources, setSources] = useState<SearchResult[]>([])
  const [newsResults, setNewsResults] = useState<NewsResult[]>([])
  const [imageResults, setImageResults] = useState<ImageResult[]>([])
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const [searchStatus, setSearchStatus] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const lastDataLength = useRef(0)
  const [messageData, setMessageData] = useState<Map<number, MessageData>>(new Map())
  const currentMessageIndex = useRef(0)
  const [currentTicker, setCurrentTicker] = useState<string | null>(null)
  const [firecrawlApiKey, setFirecrawlApiKey] = useState<string>('')
  const [hasApiKey, setHasApiKey] = useState<boolean>(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false)
  const [, setIsCheckingEnv] = useState<boolean>(true)
  const [pendingQuery, setPendingQuery] = useState<string>('')
  const [input, setInput] = useState<string>('')

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/fireplexity/search',
      body: firecrawlApiKey ? { firecrawlApiKey } : undefined
    })
  })
  
  // Single consolidated effect for handling streaming data
  useEffect(() => {
    // Handle response start
    if (status === 'streaming' && messages.length > 0) {
      const assistantMessages = messages.filter(m => m.role === 'assistant')
      const newIndex = assistantMessages.length
      
      // Only clear if we're starting a new message
      if (newIndex !== currentMessageIndex.current) {
        setSearchStatus('')
        setSources([])
        setNewsResults([])
        setImageResults([])
        setFollowUpQuestions([])
        setCurrentTicker(null)
        currentMessageIndex.current = newIndex
        lastDataLength.current = 0  // Reset data tracking for new message
      }
    }
    
    // Handle data parts from messages
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (!lastMessage.parts || lastMessage.parts.length === 0) return
      
      // Check if we've already processed this data
      const partsLength = lastMessage.parts.length
      if (partsLength === lastDataLength.current) return
      lastDataLength.current = partsLength
      
      // Process ALL parts to accumulate data
      let hasSourceData = false
      let latestSources: SearchResult[] = []
      let latestNewsResults: NewsResult[] = []
      let latestImageResults: ImageResult[] = []
      let latestTicker: string | null = null
      let latestFollowUpQuestions: string[] = []
      let latestStatus: string | null = null
      
      lastMessage.parts.forEach((part: Part) => {
        // Handle different data part types
        if (part.type === 'data-sources' && part.data) {
          hasSourceData = true
          const data = part.data as { sources?: SearchResult[]; newsResults?: NewsResult[]; imageResults?: ImageResult[] };
          // Use the latest data from this part
          if (data.sources) latestSources = data.sources
          if (data.newsResults) latestNewsResults = data.newsResults
          if (data.imageResults) latestImageResults = data.imageResults
        }
        
        if (part.type === 'data-ticker' && part.data) {
          const data = part.data as { symbol: string };
          latestTicker = data.symbol
        }
        
        if (part.type === 'data-followup' && part.data) {
          const data = part.data as { questions: string[] };
          if (data.questions) latestFollowUpQuestions = data.questions
        }
        
        if (part.type === 'data-status' && part.data) {
          const data = part.data as { message: string };
          latestStatus = data.message || ''
        }
      })
      
      // Apply updates
      if (hasSourceData) {
        setSources(latestSources)
        setNewsResults(latestNewsResults)
        setImageResults(latestImageResults)
      }
      if (latestTicker !== null) setCurrentTicker(latestTicker)
      if (latestFollowUpQuestions.length > 0) setFollowUpQuestions(latestFollowUpQuestions)
      if (latestStatus !== null) setSearchStatus(latestStatus)
      
      // Update message data map
      if (hasSourceData || latestTicker !== null || latestFollowUpQuestions.length > 0) {
        setMessageData(prevMap => {
          const newMap = new Map(prevMap)
          const existingData = newMap.get(currentMessageIndex.current) || { sources: [], followUpQuestions: [] }
          newMap.set(currentMessageIndex.current, {
            ...existingData,
            ...(hasSourceData && { 
              sources: latestSources,
              newsResults: latestNewsResults,
              imageResults: latestImageResults
            }),
            ...(latestTicker !== null && { ticker: latestTicker }),
            ...(latestFollowUpQuestions.length > 0 && { followUpQuestions: latestFollowUpQuestions })
          })
          return newMap
        })
      }
    }
  }, [status, messages])

  // Check for environment variables on mount
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch('/api/fireplexity/check-env')
        const data = await response.json()
        
        if (data.hasFirecrawlKey) {
          setHasApiKey(true)
        } else {
          // Check localStorage for user's API key
          const storedKey = localStorage.getItem('firecrawl-api-key')
          if (storedKey) {
            setFirecrawlApiKey(storedKey)
            setHasApiKey(true)
          }
        }
      } catch {
        // Error checking environment
      } finally {
        setIsCheckingEnv(false)
      }
    }
    
    checkApiKey()
  }, [])

  const handleApiKeySubmit = () => {
    if (firecrawlApiKey.trim()) {
      localStorage.setItem('firecrawl-api-key', firecrawlApiKey)
      setHasApiKey(true)
      setShowApiKeyModal(false)
      toast.success('API key saved successfully!')
      
      // If there's a pending query, submit it
      if (pendingQuery) {
        sendMessage({ text: pendingQuery })
        setPendingQuery('')
      }
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    
    // Check if we have an API key
    if (!hasApiKey) {
      setPendingQuery(input)
      setShowApiKeyModal(true)
      return
    }
    
    setHasSearched(true)
    // Don't clear data here - wait for new data to arrive
    // This prevents layout jump
    sendMessage({ text: input })
    setInput('')
  }
  
  // Wrapped submit handler for chat interface
  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    
    // Check if we have an API key
    if (!hasApiKey) {
      setPendingQuery(input)
      setShowApiKeyModal(true)
      return
    }
    
    // Store current data in messageData before new query
    if (messages.length > 0 && sources.length > 0) {
      const assistantMessages = messages.filter(m => m.role === 'assistant')
      const lastAssistantIndex = assistantMessages.length - 1
      if (lastAssistantIndex >= 0) {
        const newMap = new Map(messageData)
        newMap.set(lastAssistantIndex, {
          sources: sources,
          newsResults: newsResults,
          imageResults: imageResults,
          followUpQuestions: followUpQuestions,
          ticker: currentTicker || undefined
        })
        setMessageData(newMap)
      }
    }
    
    // Don't clear data here - wait for new data to arrive
    // The useEffect will clear when it detects a new assistant message starting
    sendMessage({ text: input })
    setInput('')
  }

  const handleNewChat = () => {
    // Reload the page to reset all chat state
    window.location.reload()
  }

  const isChatActive = hasSearched || messages.length > 0

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with logo - fixed width to prevent jumping */}
      <header className="px-4 sm:px-6 lg:px-8 py-1 mt-2">
        <div className="max-w-[1216px] mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center"
          >
            <svg 
              width="120" 
              height="24" 
              viewBox="0 0 200 40" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-auto"
            >
              {/* Fire icon */}
              <path 
                d="M23.3606 12.8281C21.8137 13.2873 20.6476 14.3261 19.7936 15.4544C19.6102 15.6966 19.228 15.5146 19.3008 15.2178C20.936 8.49401 18.7759 2.90556 12.0422 0.154735C11.7006 0.0147436 11.345 0.321324 11.4346 0.679702C14.4977 12.9779 1.61412 11.9406 3.24224 25.8823C3.27024 26.1217 3.00145 26.2855 2.80546 26.1455C2.19509 25.7073 1.51332 24.7932 1.04575 24.1506C0.908555 23.9616 0.611769 24.0148 0.548773 24.2402C0.176391 25.5869 0 26.8553 0 28.1152C0 33.0149 2.51847 37.328 6.33048 39.8283C6.54887 39.9711 6.82886 39.7667 6.75466 39.5161C6.55867 38.8581 6.44808 38.1638 6.43968 37.4456C6.43968 37.0046 6.46768 36.5539 6.53627 36.1339C6.69587 35.0784 7.06265 34.0732 7.67862 33.1577C9.79111 29.9869 14.0259 26.9239 13.3497 22.7647C13.3063 22.5015 13.6171 22.328 13.8131 22.5085C16.7964 25.2342 17.3871 28.9005 16.8972 32.1889C16.8552 32.4745 17.2135 32.6271 17.3941 32.4031C17.8505 31.832 18.4077 31.3308 19.0138 30.9542C19.165 30.8604 19.3666 30.9318 19.424 31.0998C19.7614 32.0811 20.2626 33.0023 20.7358 33.9234C21.3013 35.0308 21.6023 36.2949 21.5547 37.6332C21.5309 38.2842 21.4231 38.9141 21.2425 39.5133C21.1655 39.7667 21.4427 39.9781 21.6653 39.8325C25.4801 37.3322 28 33.0191 28 28.1166C28 26.4129 27.7018 24.7428 27.1376 23.1777C25.9547 19.8949 22.9533 17.4297 23.712 13.1515C23.7484 12.9471 23.5594 12.7693 23.3606 12.8281Z" 
                fill="#FA5D19"
              />
              
              {/* livvuxPlexity text */}
              <text 
                x="35" 
                y="28" 
                fontFamily="Arial, sans-serif" 
                fontSize="18" 
                fontWeight="600" 
                className="fill-zinc-900 dark:fill-white"
              >
                livvuxPlexity
              </text>
            </svg>
          </Link>
          
          {/* Navigation Menu */}
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/wordpress-agent"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              WordPress Agent
            </Link>
            <Link
              href="/whatsapp-agent"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              WhatsApp Agent
            </Link>
            <Link
              href="/lovable"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              Lovable
            </Link>
            <div className="flex items-center space-x-4">
              {isChatActive && (
                <Button
                  onClick={handleNewChat}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 border-zinc-300 hover:border-orange-300 dark:border-zinc-600 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              )}
              <ThemeToggle />
              <LogoutButton variant="ghost" />
            </div>
          </nav>
        </div>
      </header>

      {/* Hero section - matching other pages */}
      <div className={`px-4 sm:px-6 lg:px-8 pt-16 pb-8 ${isChatActive ? 'hidden' : 'block'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-[3rem] lg:text-[4rem] font-medium tracking-tight leading-tight">
            <span className="block">
              <AuroraText className="text-[3rem] lg:text-[4rem] font-medium tracking-tight leading-tight">
                livvuxPlexity v2
              </AuroraText>
            </span>
            <span className="text-[#262626] dark:text-white block text-[3rem] lg:text-[4rem] font-medium -mt-2">
              Search & Scrape
            </span>
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Multi-source search with AI-powered insights, news, and images
          </p>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-full">
          {!isChatActive ? (
            <SearchComponent 
              handleSubmit={handleSearch}
              input={input}
              handleInputChange={(e) => setInput(e.target.value)}
              isLoading={status === 'streaming'}
            />
          ) : (
            <ChatInterface 
              messages={messages}
              sources={sources}
              newsResults={newsResults}
              imageResults={imageResults}
              followUpQuestions={followUpQuestions}
              searchStatus={searchStatus}
              isLoading={status === 'streaming'}
              input={input}
              handleInputChange={(e) => setInput(e.target.value)}
              handleSubmit={handleChatSubmit}
              messageData={messageData}
              currentTicker={currentTicker}
            />
          )}
        </div>
      </div>

      
      {/* API Key Modal */}
      <Dialog open={showApiKeyModal} onOpenChange={setShowApiKeyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firecrawl API Key Required</DialogTitle>
            <DialogDescription>
              To use livvuxPlexity search, you need a Firecrawl API key. Get one for free at{' '}
              <a 
                href="https://www.firecrawl.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 underline"
              >
                firecrawl.dev
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Enter your Firecrawl API key"
              value={firecrawlApiKey}
              onChange={(e) => setFirecrawlApiKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleApiKeySubmit()
                }
              }}
              className="h-12"
            />
            <Button onClick={handleApiKeySubmit} variant="orange" className="w-full">
              Save API Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}