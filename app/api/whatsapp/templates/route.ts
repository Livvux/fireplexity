import { NextRequest, NextResponse } from 'next/server'
import { TemplateManager, QuickRepliesManager } from '@/lib/db/templates'
import { MessageTemplate, QuickReply } from '@/types/whatsapp'

// GET /api/whatsapp/templates - Get all templates or quick replies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'templates' or 'replies'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const popular = searchParams.get('popular') === 'true'

    if (type === 'replies') {
      let replies: QuickReply[] = []

      if (popular) {
        const limit = parseInt(searchParams.get('limit') || '5', 10)
        replies = await QuickRepliesManager.getPopularReplies(limit)
      } else if (search) {
        replies = await QuickRepliesManager.searchQuickReplies(search)
      } else if (category) {
        replies = await QuickRepliesManager.getQuickRepliesByCategory(category)
      } else {
        replies = await QuickRepliesManager.loadQuickReplies()
      }

      // Get categories for the response
      const allReplies = await QuickRepliesManager.loadQuickReplies()
      const categories = [...new Set(allReplies.map(r => r.category))].sort()

      return NextResponse.json({
        success: true,
        data: replies,
        categories,
        total: replies.length
      })
    } else {
      // Default to templates
      let templates: MessageTemplate[] = []

      if (search) {
        templates = await TemplateManager.searchTemplates(search)
      } else if (category) {
        templates = await TemplateManager.getTemplatesByCategory(category)
      } else {
        templates = await TemplateManager.loadTemplates()
      }

      // Get categories for the response
      const allTemplates = await TemplateManager.loadTemplates()
      const categories = [...new Set(allTemplates.map(t => t.category))].sort()

      return NextResponse.json({
        success: true,
        data: templates,
        categories,
        total: templates.length
      })
    }
  } catch (error) {
    console.error('Templates GET error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch templates' 
      },
      { status: 500 }
    )
  }
}

// POST /api/whatsapp/templates - Create new template or quick reply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    if (type === 'reply') {
      // Create quick reply
      const { text, category, shortcut } = data
      
      if (!text || !category) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Text and category are required' 
          },
          { status: 400 }
        )
      }

      const newReply = await QuickRepliesManager.createQuickReply({
        text,
        category,
        shortcut
      })

      return NextResponse.json({
        success: true,
        data: newReply,
        message: 'Quick reply created successfully'
      })
    } else {
      // Create template
      const { name, category, content } = data
      
      if (!name || !category || !content) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Name, category, and content are required' 
          },
          { status: 400 }
        )
      }

      // Extract variables from content
      const variables = TemplateManager.extractVariables(content)

      const newTemplate = await TemplateManager.createTemplate({
        name,
        category,
        content,
        variables
      })

      return NextResponse.json({
        success: true,
        data: newTemplate,
        message: 'Template created successfully'
      })
    }
  } catch (error) {
    console.error('Templates POST error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create template' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/whatsapp/templates - Update template or quick reply
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID is required' 
        },
        { status: 400 }
      )
    }

    if (type === 'reply') {
      const updatedReply = await QuickRepliesManager.updateQuickReply(id, updates)
      
      if (!updatedReply) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Quick reply not found' 
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: updatedReply,
        message: 'Quick reply updated successfully'
      })
    } else {
      // Update variables if content changed
      if (updates.content) {
        updates.variables = TemplateManager.extractVariables(updates.content)
      }

      const updatedTemplate = await TemplateManager.updateTemplate(id, updates)
      
      if (!updatedTemplate) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Template not found' 
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: updatedTemplate,
        message: 'Template updated successfully'
      })
    }
  } catch (error) {
    console.error('Templates PUT error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update template' 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/whatsapp/templates - Delete template or quick reply
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID is required' 
        },
        { status: 400 }
      )
    }

    let deleted = false
    
    if (type === 'reply') {
      deleted = await QuickRepliesManager.deleteQuickReply(id)
    } else {
      deleted = await TemplateManager.deleteTemplate(id)
    }

    if (!deleted) {
      return NextResponse.json(
        { 
          success: false, 
          error: `${type === 'reply' ? 'Quick reply' : 'Template'} not found` 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${type === 'reply' ? 'Quick reply' : 'Template'} deleted successfully`
    })
  } catch (error) {
    console.error('Templates DELETE error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete template' 
      },
      { status: 500 }
    )
  }
}