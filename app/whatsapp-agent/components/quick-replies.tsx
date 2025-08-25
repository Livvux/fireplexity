'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Zap, 
  Search, 
  // Plus, // Not used
  // Filter, // Not used 
  Clock,
  Tag,
  ChevronDown,
  ChevronRight,
  Star
} from 'lucide-react'
import { QuickReply } from '@/types/whatsapp'
import { cn } from '@/lib/utils'

interface QuickRepliesProps {
  onReplySelect: (reply: string) => void
  disabled?: boolean
  className?: string
}

export function QuickReplies({ onReplySelect, disabled = false, className }: QuickRepliesProps) {
  const [replies, setReplies] = useState<QuickReply[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['General']))
  const [showPopular, setShowPopular] = useState(false)

  // Load quick replies on component mount
  useEffect(() => {
    loadQuickReplies()
  }, [])

  const loadQuickReplies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/whatsapp/templates?type=replies')
      const data = await response.json()
      
      if (data.success) {
        setReplies(data.data)
        setCategories(['all', ...data.categories])
      }
    } catch (error) {
      console.error('Failed to load quick replies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReplyClick = async (reply: QuickReply) => {
    if (disabled) return

    // Increment usage count
    try {
      await fetch('/api/whatsapp/templates/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reply',
          id: reply.id,
          action: 'increment'
        })
      })
    } catch (error) {
      console.error('Failed to increment usage:', error)
    }

    onReplySelect(reply.text)
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Filter replies based on search and category
  const filteredReplies = replies.filter(reply => {
    const matchesSearch = !searchQuery || 
      reply.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reply.shortcut?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || reply.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Group replies by category
  const groupedReplies = filteredReplies.reduce((acc, reply) => {
    if (!acc[reply.category]) {
      acc[reply.category] = []
    }
    acc[reply.category].push(reply)
    return acc
  }, {} as Record<string, QuickReply[]>)

  // Sort replies by usage within categories
  Object.keys(groupedReplies).forEach(category => {
    groupedReplies[category].sort((a, b) => b.usage - a.usage)
  })

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <div className="text-sm text-zinc-500">Loading quick replies...</div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Quick Replies
          </h3>
          <Badge variant="secondary" className="text-xs">
            {filteredReplies.length}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={showPopular ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowPopular(!showPopular)}
            className="h-6 text-xs"
          >
            <Star className="w-3 h-3 mr-1" />
            Popular
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-zinc-400" />
          <Input
            placeholder="Search replies or shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
            disabled={disabled}
          />
        </div>
        
        {categories.length > 2 && (
          <div className="flex items-center space-x-1 overflow-x-auto pb-1">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                disabled={disabled}
                className="h-6 px-2 text-xs whitespace-nowrap"
              >
                {category === 'all' ? 'All' : category}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Replies List */}
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {showPopular ? (
            // Show popular replies (top 10 by usage)
            <div className="space-y-1">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                Most Used
              </div>
              {filteredReplies
                .sort((a, b) => b.usage - a.usage)
                .slice(0, 10)
                .map(reply => (
                  <QuickReplyButton
                    key={reply.id}
                    reply={reply}
                    onClick={handleReplyClick}
                    disabled={disabled}
                  />
                ))
              }
            </div>
          ) : (
            // Show grouped by categories
            Object.entries(groupedReplies).map(([category, categoryReplies]) => (
              <div key={category} className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCategory(category)}
                  className="h-6 w-full justify-start p-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  disabled={disabled}
                >
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="w-3 h-3 mr-1" />
                  ) : (
                    <ChevronRight className="w-3 h-3 mr-1" />
                  )}
                  <Tag className="w-3 h-3 mr-1" />
                  {category}
                  <Badge variant="outline" className="ml-auto h-4 px-1 text-xs">
                    {categoryReplies.length}
                  </Badge>
                </Button>
                
                {expandedCategories.has(category) && (
                  <div className="space-y-1 ml-4">
                    {categoryReplies.map(reply => (
                      <QuickReplyButton
                        key={reply.id}
                        reply={reply}
                        onClick={handleReplyClick}
                        disabled={disabled}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          {filteredReplies.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {searchQuery ? 'No replies match your search' : 'No quick replies found'}
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface QuickReplyButtonProps {
  reply: QuickReply
  onClick: (reply: QuickReply) => void
  disabled?: boolean
}

function QuickReplyButton({ reply, onClick, disabled }: QuickReplyButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onClick(reply)}
      disabled={disabled}
      className="w-full justify-start h-auto p-2 text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {reply.text}
          </span>
          {reply.usage > 0 && (
            <div className="flex items-center space-x-1 ml-2">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">{reply.usage}</span>
            </div>
          )}
        </div>
        {reply.shortcut && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-zinc-500 truncate">{reply.shortcut}</span>
          </div>
        )}
      </div>
    </Button>
  )
}

export default QuickReplies