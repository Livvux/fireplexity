// WhatsApp-specific types and interfaces

export interface WhatsAppMessage {
  id: string
  content: string
  type: 'user' | 'assistant' | 'system' | 'whatsapp_sent' | 'whatsapp_error' | 'media'
  timestamp: Date
  chatId?: string
  messageId?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'audio' | 'document'
  caption?: string
  mentions?: string[]
}

export interface WhatsAppContact {
  id: string
  number: string
  name?: string
  pushname?: string
  avatar?: string
  isMe: boolean
  isGroup: boolean
  isWAContact: boolean
  isMyContact: boolean
  isBlocked: boolean
  tags?: string[]
  customFields?: Record<string, string>
  lastSeen?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface WhatsAppChat {
  id: string
  chatId: string
  type: 'individual' | 'group'
  name?: string
  avatar?: string
  lastMessageAt?: Date
  unreadCount: number
  isArchived: boolean
  isPinned: boolean
  participants?: WhatsAppContact[]
}

export interface WhatsAppGroup extends WhatsAppChat {
  type: 'group'
  description?: string
  participants: WhatsAppContact[]
  admins: string[]
  owner: string
  createdAt: Date
  inviteLink?: string
  settings: {
    onlyAdminsCanMessage: boolean
    onlyAdminsCanEditInfo: boolean
    onlyAdminsCanAddMembers: boolean
  }
}

export interface MediaAttachment {
  id: string
  file: File
  preview?: string
  type: 'image' | 'video' | 'audio' | 'document' | 'other'
  caption?: string
  error?: string
  uploaded: boolean
  messageId?: string
}

export interface MessageTemplate {
  id: string
  name: string
  category: string
  content: string
  variables: string[]
  usage: number
  createdAt: Date
  updatedAt: Date
}

export interface QuickReply {
  id: string
  text: string
  category: string
  shortcut?: string
  usage: number
}

export interface BulkMessage {
  id: string
  template: MessageTemplate
  contacts: WhatsAppContact[]
  status: 'pending' | 'sending' | 'completed' | 'failed'
  progress: {
    total: number
    sent: number
    failed: number
  }
  createdAt: Date
  scheduledAt?: Date
  completedAt?: Date
  errors: string[]
}

export interface ScheduledMessage {
  id: string
  chatId: string
  content: string
  mediaAttachments?: MediaAttachment[]
  scheduledAt: Date
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: Date
  }
  createdAt: Date
  error?: string
}

export interface ContactTag {
  id: string
  name: string
  color: string
  description?: string
  contactCount: number
  createdAt: Date
}

export interface WhatsAppSession {
  name: string
  status: 'STOPPED' | 'STARTING' | 'SCAN_QR_CODE' | 'WORKING' | 'FAILED'
  qrCode?: string
  profileName?: string
  profilePicture?: string
  connectedAt?: Date
  lastActivity?: Date
}

export interface ChatFilter {
  search?: string
  type?: 'all' | 'individual' | 'group'
  tags?: string[]
  archived?: boolean
  unreadOnly?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface MessageFilter {
  search?: string
  fromMe?: boolean
  hasMedia?: boolean
  mediaType?: 'image' | 'video' | 'audio' | 'document'
  dateRange?: {
    start: Date
    end: Date
  }
  mentions?: boolean
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'vcard'
  includeMessages: boolean
  includeMedia: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  contacts?: string[]
  chats?: string[]
}

export interface ImportResult {
  total: number
  imported: number
  failed: number
  duplicates: number
  errors: Array<{
    row: number
    field: string
    error: string
  }>
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface MediaUploadResponse {
  summary: {
    total: number
    successful: number
    failed: number
  }
  results: Array<{
    filename: string
    messageId?: string
    error?: string
    success: boolean
    type?: string
  }>
  chatId: string
  sessionName: string
}

export interface BulkMessageResponse {
  jobId: string
  status: 'started'
  total: number
  estimated: {
    duration: number // in seconds
    completion: Date
  }
}

// Webhook payload types
export interface WebhookMessage {
  id: string
  timestamp: number
  from: string
  fromMe: boolean
  to: string
  body: string
  hasMedia: boolean
  ack: number
  ackName: 'PENDING' | 'SERVER' | 'DEVICE' | 'READ' | 'PLAYED'
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact'
  _data: any
}

export interface WebhookSessionStatus {
  name: string
  status: WhatsAppSession['status']
  timestamp: number
}

