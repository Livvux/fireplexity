import fs from 'fs/promises'
import path from 'path'
import { MessageTemplate, QuickReply } from '@/types/whatsapp'

const DATA_DIR = path.join(process.cwd(), 'data')
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json')
const QUICK_REPLIES_FILE = path.join(DATA_DIR, 'quick-replies.json')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Template Management
export class TemplateManager {
  static async loadTemplates(): Promise<MessageTemplate[]> {
    await ensureDataDir()
    
    try {
      const data = await fs.readFile(TEMPLATES_FILE, 'utf-8')
      return JSON.parse(data)
    } catch {
      // Return default templates if file doesn't exist
      const defaultTemplates: MessageTemplate[] = [
        {
          id: '1',
          name: 'Welcome Message',
          category: 'Greetings',
          content: 'Hello {{name}}! Welcome to {{company}}. How can I help you today?',
          variables: ['name', 'company'],
          usage: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Meeting Reminder',
          category: 'Business',
          content: 'Hi {{name}}, this is a reminder about our meeting scheduled for {{date}} at {{time}}. See you soon!',
          variables: ['name', 'date', 'time'],
          usage: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Order Confirmation',
          category: 'Sales',
          content: 'Thank you for your order #{{orderNumber}}! Your order total is {{amount}} and will be delivered to {{address}} by {{deliveryDate}}.',
          variables: ['orderNumber', 'amount', 'address', 'deliveryDate'],
          usage: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '4',
          name: 'Support Response',
          category: 'Support',
          content: 'Hi {{name}}, thank you for contacting support. Your ticket #{{ticketId}} has been created. We\'ll get back to you within {{timeframe}}.',
          variables: ['name', 'ticketId', 'timeframe'],
          usage: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      await this.saveTemplates(defaultTemplates)
      return defaultTemplates
    }
  }

  static async saveTemplates(templates: MessageTemplate[]): Promise<void> {
    await ensureDataDir()
    await fs.writeFile(TEMPLATES_FILE, JSON.stringify(templates, null, 2))
  }

  static async getTemplate(id: string): Promise<MessageTemplate | null> {
    const templates = await this.loadTemplates()
    return templates.find(t => t.id === id) || null
  }

  static async createTemplate(template: Omit<MessageTemplate, 'id' | 'usage' | 'createdAt' | 'updatedAt'>): Promise<MessageTemplate> {
    const templates = await this.loadTemplates()
    
    const newTemplate: MessageTemplate = {
      ...template,
      id: Date.now().toString(),
      usage: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    templates.push(newTemplate)
    await this.saveTemplates(templates)
    
    return newTemplate
  }

  static async updateTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate | null> {
    const templates = await this.loadTemplates()
    const index = templates.findIndex(t => t.id === id)
    
    if (index === -1) return null
    
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date()
    }
    
    await this.saveTemplates(templates)
    return templates[index]
  }

  static async deleteTemplate(id: string): Promise<boolean> {
    const templates = await this.loadTemplates()
    const filteredTemplates = templates.filter(t => t.id !== id)
    
    if (filteredTemplates.length === templates.length) return false
    
    await this.saveTemplates(filteredTemplates)
    return true
  }

  static async incrementUsage(id: string): Promise<void> {
    const templates = await this.loadTemplates()
    const template = templates.find(t => t.id === id)
    
    if (template) {
      template.usage += 1
      template.updatedAt = new Date()
      await this.saveTemplates(templates)
    }
  }

  static async getTemplatesByCategory(category: string): Promise<MessageTemplate[]> {
    const templates = await this.loadTemplates()
    return templates.filter(t => t.category === category)
  }

  static async searchTemplates(query: string): Promise<MessageTemplate[]> {
    const templates = await this.loadTemplates()
    const lowercaseQuery = query.toLowerCase()
    
    return templates.filter(template => 
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.content.toLowerCase().includes(lowercaseQuery) ||
      template.category.toLowerCase().includes(lowercaseQuery)
    )
  }

  static extractVariables(content: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g
    const variables: string[] = []
    let match

    while ((match = variableRegex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    return variables
  }

  static processTemplate(template: MessageTemplate, variables: Record<string, string>): string {
    let processedContent = template.content

    template.variables.forEach(variable => {
      const value = variables[variable] || `{{${variable}}}`
      processedContent = processedContent.replace(
        new RegExp(`\\{\\{${variable}\\}\\}`, 'g'),
        value
      )
    })

    return processedContent
  }
}

// Quick Replies Management
export class QuickRepliesManager {
  static async loadQuickReplies(): Promise<QuickReply[]> {
    await ensureDataDir()
    
    try {
      const data = await fs.readFile(QUICK_REPLIES_FILE, 'utf-8')
      return JSON.parse(data)
    } catch {
      // Return default quick replies if file doesn't exist
      const defaultReplies: QuickReply[] = [
        {
          id: '1',
          text: 'Thank you for your message! I\'ll get back to you soon.',
          category: 'General',
          shortcut: '/thanks',
          usage: 0
        },
        {
          id: '2',
          text: 'I\'m currently away but will respond to your message as soon as possible.',
          category: 'Away',
          shortcut: '/away',
          usage: 0
        },
        {
          id: '3',
          text: 'Can you please provide more details about your request?',
          category: 'Questions',
          shortcut: '/details',
          usage: 0
        },
        {
          id: '4',
          text: 'Your order has been processed and will be delivered within 2-3 business days.',
          category: 'Orders',
          shortcut: '/delivered',
          usage: 0
        },
        {
          id: '5',
          text: 'Please contact our support team at support@company.com for technical assistance.',
          category: 'Support',
          shortcut: '/support',
          usage: 0
        },
        {
          id: '6',
          text: 'Yes, I can help you with that.',
          category: 'Affirmative',
          shortcut: '/yes',
          usage: 0
        },
        {
          id: '7',
          text: 'I\'m sorry, but I cannot assist with that request.',
          category: 'Negative',
          shortcut: '/no',
          usage: 0
        },
        {
          id: '8',
          text: 'Let me check on that for you and get back to you shortly.',
          category: 'General',
          shortcut: '/check',
          usage: 0
        }
      ]
      
      await this.saveQuickReplies(defaultReplies)
      return defaultReplies
    }
  }

  static async saveQuickReplies(replies: QuickReply[]): Promise<void> {
    await ensureDataDir()
    await fs.writeFile(QUICK_REPLIES_FILE, JSON.stringify(replies, null, 2))
  }

  static async getQuickReply(id: string): Promise<QuickReply | null> {
    const replies = await this.loadQuickReplies()
    return replies.find(r => r.id === id) || null
  }

  static async createQuickReply(reply: Omit<QuickReply, 'id' | 'usage'>): Promise<QuickReply> {
    const replies = await this.loadQuickReplies()
    
    const newReply: QuickReply = {
      ...reply,
      id: Date.now().toString(),
      usage: 0
    }

    replies.push(newReply)
    await this.saveQuickReplies(replies)
    
    return newReply
  }

  static async updateQuickReply(id: string, updates: Partial<QuickReply>): Promise<QuickReply | null> {
    const replies = await this.loadQuickReplies()
    const index = replies.findIndex(r => r.id === id)
    
    if (index === -1) return null
    
    replies[index] = { ...replies[index], ...updates }
    await this.saveQuickReplies(replies)
    
    return replies[index]
  }

  static async deleteQuickReply(id: string): Promise<boolean> {
    const replies = await this.loadQuickReplies()
    const filteredReplies = replies.filter(r => r.id !== id)
    
    if (filteredReplies.length === replies.length) return false
    
    await this.saveQuickReplies(filteredReplies)
    return true
  }

  static async incrementUsage(id: string): Promise<void> {
    const replies = await this.loadQuickReplies()
    const reply = replies.find(r => r.id === id)
    
    if (reply) {
      reply.usage += 1
      await this.saveQuickReplies(replies)
    }
  }

  static async getQuickRepliesByCategory(category: string): Promise<QuickReply[]> {
    const replies = await this.loadQuickReplies()
    return replies.filter(r => r.category === category)
  }

  static async searchQuickReplies(query: string): Promise<QuickReply[]> {
    const replies = await this.loadQuickReplies()
    const lowercaseQuery = query.toLowerCase()
    
    return replies.filter(reply => 
      reply.text.toLowerCase().includes(lowercaseQuery) ||
      reply.category.toLowerCase().includes(lowercaseQuery) ||
      reply.shortcut?.toLowerCase().includes(lowercaseQuery)
    )
  }

  static async getPopularReplies(limit: number = 5): Promise<QuickReply[]> {
    const replies = await this.loadQuickReplies()
    return replies
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit)
  }
}

// Utility functions
export function getUniqueCategories(templates: MessageTemplate[]): string[] {
  const categories = templates.map(t => t.category)
  return [...new Set(categories)].sort()
}

export function getQuickReplyCategories(replies: QuickReply[]): string[] {
  const categories = replies.map(r => r.category)
  return [...new Set(categories)].sort()
}

const templateExport = {
  TemplateManager,
  QuickRepliesManager,
  getUniqueCategories,
  getQuickReplyCategories
}

export default templateExport;