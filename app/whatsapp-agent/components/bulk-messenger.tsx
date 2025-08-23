'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { 
  Users, 
  Send, 
  Search, 
  Upload,
  Download,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  UserPlus,
  X,
  Eye,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { WhatsAppContact, MessageTemplate, BulkMessage } from '@/types/whatsapp'
import { MessageFormatter } from '@/lib/message-formatter'
import { cn } from '@/lib/utils'

interface BulkMessengerProps {
  sessionName: string
  disabled?: boolean
  className?: string
}

interface ContactSelection {
  contact: WhatsAppContact
  selected: boolean
  variables?: Record<string, string>
}

export function BulkMessenger({ sessionName, disabled = false, className }: BulkMessengerProps) {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [contactVariables, setContactVariables] = useState<Record<string, Record<string, string>>>({})
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [useCustomMessage, setUseCustomMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [sendProgress, setSendProgress] = useState({ sent: 0, failed: 0, total: 0 })
  const [bulkJob, setBulkJob] = useState<BulkMessage | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadContacts()
    loadTemplates()
  }, [])

  const loadContacts = async () => {
    try {
      setIsLoading(true)
      // Mock data for now - replace with actual API call to get contacts
      const mockContacts: WhatsAppContact[] = [
        {
          id: '1',
          number: '1234567890',
          name: 'John Doe',
          isMe: false,
          isGroup: false,
          isWAContact: true,
          isMyContact: true,
          isBlocked: false
        },
        {
          id: '2', 
          number: '0987654321',
          name: 'Jane Smith',
          isMe: false,
          isGroup: false,
          isWAContact: true,
          isMyContact: true,
          isBlocked: false
        }
        // Add more mock contacts as needed
      ]
      setContacts(mockContacts)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/whatsapp/templates?type=templates')
      const data = await response.json()
      
      if (data.success) {
        setTemplates(data.data)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const handleContactToggle = (contactId: string) => {
    const newSelected = new Set(selectedContacts)
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
      // Remove variables for deselected contact
      const newVariables = { ...contactVariables }
      delete newVariables[contactId]
      setContactVariables(newVariables)
    } else {
      newSelected.add(contactId)
      // Initialize variables for selected contact
      if (selectedTemplate && selectedTemplate.variables.length > 0) {
        const contact = contacts.find(c => c.id === contactId)
        if (contact) {
          setContactVariables(prev => ({
            ...prev,
            [contactId]: initializeVariables(selectedTemplate, contact)
          }))
        }
      }
    }
    setSelectedContacts(newSelected)
  }

  const initializeVariables = (template: MessageTemplate, contact: WhatsAppContact): Record<string, string> => {
    const variables: Record<string, string> = {}
    
    template.variables.forEach(variable => {
      switch (variable.toLowerCase()) {
        case 'name':
          variables[variable] = contact.name || contact.number
          break
        case 'phone':
          variables[variable] = contact.number
          break
        default:
          variables[variable] = ''
      }
    })
    
    return variables
  }

  const handleSelectAll = () => {
    const filtered = getFilteredContacts()
    if (selectedContacts.size === filtered.length) {
      // Deselect all
      setSelectedContacts(new Set())
      setContactVariables({})
    } else {
      // Select all filtered contacts
      const newSelected = new Set(filtered.map(c => c.id))
      setSelectedContacts(newSelected)
      
      // Initialize variables for all selected contacts
      if (selectedTemplate && selectedTemplate.variables.length > 0) {
        const newVariables: Record<string, Record<string, string>> = {}
        filtered.forEach(contact => {
          newVariables[contact.id] = initializeVariables(selectedTemplate, contact)
        })
        setContactVariables(newVariables)
      }
    }
  }

  const getFilteredContacts = () => {
    return contacts.filter(contact => 
      !searchQuery || 
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.number.includes(searchQuery)
    )
  }

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setUseCustomMessage(false)
    
    // Initialize variables for already selected contacts
    const newVariables: Record<string, Record<string, string>> = {}
    selectedContacts.forEach(contactId => {
      const contact = contacts.find(c => c.id === contactId)
      if (contact) {
        newVariables[contactId] = initializeVariables(template, contact)
      }
    })
    setContactVariables(newVariables)
  }

  const updateContactVariable = (contactId: string, variable: string, value: string) => {
    setContactVariables(prev => ({
      ...prev,
      [contactId]: {
        ...prev[contactId],
        [variable]: value
      }
    }))
  }

  const handleSendBulkMessage = async () => {
    if (selectedContacts.size === 0) {
      alert('Please select at least one contact')
      return
    }

    if (!useCustomMessage && !selectedTemplate) {
      alert('Please select a template or write a custom message')
      return
    }

    if (useCustomMessage && !customMessage.trim()) {
      alert('Please enter a custom message')
      return
    }

    setIsSending(true)
    setSendProgress({ sent: 0, failed: 0, total: selectedContacts.size })

    try {
      const selectedContactsList = Array.from(selectedContacts).map(id => 
        contacts.find(c => c.id === id)!
      )

      // Send messages one by one with delay to avoid rate limiting
      let sent = 0
      let failed = 0

      for (const contact of selectedContactsList) {
        try {
          let messageText = ''
          
          if (useCustomMessage) {
            messageText = MessageFormatter.cleanForSending(customMessage)
          } else if (selectedTemplate) {
            const variables = contactVariables[contact.id] || {}
            const validation = MessageFormatter.validate(selectedTemplate.content, [])
            
            if (validation.isValid) {
              // Process template with variables
              const response = await fetch('/api/whatsapp/templates/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: selectedTemplate.id,
                  variables
                })
              })
              
              const data = await response.json()
              if (data.success) {
                messageText = data.data.processed
              } else {
                throw new Error('Failed to process template')
              }
            } else {
              throw new Error('Template validation failed')
            }
          }

          // Send message via WhatsApp
          const response = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: `${contact.number}@c.us`,
              text: messageText,
              sessionName
            })
          })

          if (response.ok) {
            sent++
          } else {
            failed++
          }

          setSendProgress({ sent, failed, total: selectedContacts.size })
          
          // Add delay between messages (2 seconds)
          if (sent + failed < selectedContacts.size) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }

        } catch (error) {
          console.error(`Failed to send message to ${contact.name}:`, error)
          failed++
          setSendProgress({ sent, failed, total: selectedContacts.size })
        }
      }

      // Show completion message
      alert(`Bulk messaging completed!\nSent: ${sent}\nFailed: ${failed}`)

    } catch (error) {
      console.error('Bulk messaging error:', error)
      alert('Failed to send bulk messages')
    } finally {
      setIsSending(false)
    }
  }

  const filteredContacts = getFilteredContacts()
  const allSelected = filteredContacts.length > 0 && selectedContacts.size === filteredContacts.length

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Bulk Messenger
          </h2>
          <Badge variant="secondary">
            {selectedContacts.size} of {contacts.length} selected
          </Badge>
        </div>

        {/* CSV Import */}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Select Contacts
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="h-7"
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-zinc-400" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {/* Contacts List */}
          <ScrollArea className="h-96 border border-zinc-200 dark:border-zinc-700 rounded-lg">
            <div className="p-3 space-y-2">
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className={cn(
                    "flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors",
                    selectedContacts.has(contact.id)
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  )}
                  onClick={() => handleContactToggle(contact.id)}
                >
                  <div className={cn(
                    "w-4 h-4 border-2 rounded flex-shrink-0",
                    selectedContacts.has(contact.id)
                      ? "bg-blue-600 border-blue-600"
                      : "border-zinc-300 dark:border-zinc-600"
                  )}>
                    {selectedContacts.has(contact.id) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {contact.name || contact.number}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {contact.number}
                    </p>
                  </div>
                </div>
              ))}

              {filteredContacts.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    No contacts found
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Message Composition */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Message Content
          </h3>

          {/* Message Type Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={!useCustomMessage ? "default" : "outline"}
              size="sm"
              onClick={() => setUseCustomMessage(false)}
              className="h-7"
            >
              Use Template
            </Button>
            <Button
              variant={useCustomMessage ? "default" : "outline"}
              size="sm"
              onClick={() => setUseCustomMessage(true)}
              className="h-7"
            >
              Custom Message
            </Button>
          </div>

          {useCustomMessage ? (
            <div className="space-y-3">
              <RichTextEditor
                value={customMessage}
                onChange={setCustomMessage}
                placeholder="Enter your bulk message..."
                disabled={disabled || isSending}
                showPreview={true}
                maxLength={4096}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Template Selection */}
              <ScrollArea className="h-32 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                <div className="p-2 space-y-1">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={cn(
                        "p-2 rounded cursor-pointer transition-colors",
                        selectedTemplate?.id === template.id
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      )}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{template.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                        {template.content}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Variable Fields for Selected Contacts */}
              {selectedTemplate && selectedTemplate.variables.length > 0 && selectedContacts.size > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Personalize Variables
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="h-6 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </Button>
                  </div>

                  <ScrollArea className="h-48 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                    <div className="p-3 space-y-4">
                      {Array.from(selectedContacts).map(contactId => {
                        const contact = contacts.find(c => c.id === contactId)!
                        return (
                          <div key={contactId} className="space-y-2 border-b border-zinc-200 dark:border-zinc-700 pb-3 last:border-b-0">
                            <div className="text-sm font-medium">
                              {contact.name || contact.number}
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {selectedTemplate.variables.map(variable => (
                                <Input
                                  key={`${contactId}-${variable}`}
                                  placeholder={`${variable} for ${contact.name || contact.number}`}
                                  value={contactVariables[contactId]?.[variable] || ''}
                                  onChange={(e) => updateContactVariable(contactId, variable, e.target.value)}
                                  className="h-7 text-xs"
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Send Button */}
          <div className="space-y-3">
            {isSending && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Sending Messages...
                  </span>
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    {sendProgress.sent + sendProgress.failed}/{sendProgress.total}
                  </span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-green-600">✓ {sendProgress.sent} sent</span>
                  <span className="text-red-600">✗ {sendProgress.failed} failed</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleSendBulkMessage}
              disabled={disabled || isSending || selectedContacts.size === 0 || (!useCustomMessage && !selectedTemplate) || (useCustomMessage && !customMessage.trim())}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending... ({sendProgress.sent}/{sendProgress.total})
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to {selectedContacts.size} Contact{selectedContacts.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkMessenger