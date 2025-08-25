'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  // Eye, // Not used
  Copy,
  // Tag, // Not used
  Clock,
  Variable,
  Save,
  X,
  AlertCircle,
  Check
} from 'lucide-react'
import { MessageTemplate } from '@/types/whatsapp'
import { cn } from '@/lib/utils'

interface TemplateManagerProps {
  // onTemplateSelect?: (template: MessageTemplate, variables?: Record<string, string>) => void // Not used
  onProcessedTemplate?: (processed: string) => void
  disabled?: boolean
  className?: string
  mode?: 'select' | 'manage'
}

export function TemplateManager({ 
  onProcessedTemplate,
  disabled = false, 
  className,
  mode = 'select'
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [previewText, setPreviewText] = useState('')
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    content: ''
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      loadTemplatePreview(selectedTemplate.id)
      // Initialize variables with empty strings
      const initVars: Record<string, string> = {}
      selectedTemplate.variables.forEach(variable => {
        initVars[variable] = variables[variable] || ''
      })
      setVariables(initVars)
    }
  }, [selectedTemplate, variables])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/whatsapp/templates?type=templates')
      const data = await response.json()
      
      if (data.success) {
        setTemplates(data.data)
        setCategories(['all', ...data.categories])
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTemplatePreview = async (id: string) => {
    try {
      const response = await fetch(`/api/whatsapp/templates/process?id=${id}`)
      const data = await response.json()
      
      if (data.success) {
        setPreviewText(data.data.preview)
      }
    } catch (error) {
      console.error('Failed to load template preview:', error)
    }
  }

  const processTemplate = async (template: MessageTemplate) => {
    try {
      const response = await fetch('/api/whatsapp/templates/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: template.id,
          variables
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const processed = data.data.processed
        onProcessedTemplate?.(processed)
        
        // Increment usage
        await fetch('/api/whatsapp/templates/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: template.id,
            action: 'increment'
          })
        })
        
        // Refresh templates to show updated usage
        loadTemplates()
      }
    } catch (error) {
      console.error('Failed to process template:', error)
    }
  }

  const handleCreateTemplate = async () => {
    if (!editForm.name || !editForm.category || !editForm.content) return

    try {
      const response = await fetch('/api/whatsapp/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'template',
          name: editForm.name,
          category: editForm.category,
          content: editForm.content
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsCreating(false)
        setEditForm({ name: '', category: '', content: '' })
        loadTemplates()
      }
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate || !editForm.name || !editForm.category || !editForm.content) return

    try {
      const response = await fetch('/api/whatsapp/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'template',
          id: selectedTemplate.id,
          name: editForm.name,
          category: editForm.category,
          content: editForm.content
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsEditing(false)
        setSelectedTemplate(null)
        loadTemplates()
      }
    } catch (error) {
      console.error('Failed to update template:', error)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/whatsapp/templates?type=template&id=${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSelectedTemplate(null)
        loadTemplates()
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const startEdit = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setEditForm({
      name: template.name,
      category: template.category,
      content: template.content
    })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setIsCreating(false)
    setSelectedTemplate(null)
    setEditForm({ name: '', category: '', content: '' })
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const allVariablesFilled = selectedTemplate ? 
    selectedTemplate.variables.every(variable => variables[variable]?.trim()) : 
    true

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <div className="text-sm text-zinc-500">Loading templates...</div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Message Templates
          </h3>
          <Badge variant="secondary" className="text-xs">
            {filteredTemplates.length}
          </Badge>
        </div>
        
        {mode === 'manage' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
            disabled={disabled}
            className="h-7"
          >
            <Plus className="w-3 h-3 mr-1" />
            New Template
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-zinc-400" />
          <Input
            placeholder="Search templates..."
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

      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              {isCreating ? 'Create New Template' : 'Edit Template'}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEdit}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Template name"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="h-8 text-xs"
            />
            <Input
              placeholder="Category"
              value={editForm.category}
              onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>
          
          <Textarea
            placeholder="Template content (use {{variable}} for placeholders)"
            value={editForm.content}
            onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
            className="text-xs resize-none"
            rows={3}
          />
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={cancelEdit}
              className="h-7"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={isCreating ? handleCreateTemplate : handleUpdateTemplate}
              disabled={!editForm.name || !editForm.category || !editForm.content}
              className="h-7"
            >
              <Save className="w-3 h-3 mr-1" />
              {isCreating ? 'Create' : 'Update'}
            </Button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Template List */}
        <div className="space-y-2">
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className={cn(
                    "border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 cursor-pointer transition-colors",
                    selectedTemplate?.id === template.id 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "hover:border-zinc-300 dark:hover:border-zinc-600"
                  )}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {template.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                        {template.content}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        {template.variables.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Variable className="w-3 h-3 text-zinc-400" />
                            <span className="text-xs text-zinc-500">
                              {template.variables.length} vars
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span className="text-xs text-zinc-500">
                            {template.usage} uses
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {mode === 'manage' && (
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEdit(template)
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTemplate(template.id)
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {searchQuery ? 'No templates match your search' : 'No templates found'}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Template Preview/Editor */}
        {selectedTemplate && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Template Preview</h4>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(previewText)}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
            
            {selectedTemplate.variables.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Variables ({selectedTemplate.variables.length})
                </div>
                {selectedTemplate.variables.map(variable => (
                  <Input
                    key={variable}
                    placeholder={`Enter ${variable}`}
                    value={variables[variable] || ''}
                    onChange={(e) => setVariables(prev => ({
                      ...prev,
                      [variable]: e.target.value
                    }))}
                    className="h-7 text-xs"
                  />
                ))}
              </div>
            )}
            
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                Preview
              </div>
              <div className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
                {previewText || selectedTemplate.content}
              </div>
            </div>
            
            {mode === 'select' && (
              <Button
                onClick={() => processTemplate(selectedTemplate)}
                disabled={disabled || !allVariablesFilled}
                className="w-full h-8"
              >
                {allVariablesFilled ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Use Template
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Fill All Variables
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TemplateManager