import { NextRequest, NextResponse } from 'next/server'
import { TemplateManager, QuickRepliesManager } from '@/lib/db/templates'

// POST /api/whatsapp/templates/process - Process template with variables or increment usage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, variables, action } = body

    if (action === 'increment') {
      // Increment usage count
      if (type === 'reply') {
        await QuickRepliesManager.incrementUsage(id)
      } else {
        await TemplateManager.incrementUsage(id)
      }

      return NextResponse.json({
        success: true,
        message: 'Usage count updated'
      })
    }

    // Process template with variables
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Template ID is required' 
        },
        { status: 400 }
      )
    }

    if (type === 'reply') {
      const reply = await QuickRepliesManager.getQuickReply(id)
      
      if (!reply) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Quick reply not found' 
          },
          { status: 404 }
        )
      }

      // Quick replies don't have variables, just return the text
      return NextResponse.json({
        success: true,
        data: {
          processed: reply.text,
          original: reply.text,
          variables: []
        }
      })
    } else {
      const template = await TemplateManager.getTemplate(id)
      
      if (!template) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Template not found' 
          },
          { status: 404 }
        )
      }

      // Process template with provided variables
      const processed = variables 
        ? TemplateManager.processTemplate(template, variables)
        : template.content

      // Find missing variables
      const missingVariables = template.variables.filter(variable => 
        !variables || !variables.hasOwnProperty(variable)
      )

      return NextResponse.json({
        success: true,
        data: {
          processed,
          original: template.content,
          variables: template.variables,
          missingVariables,
          allVariablesProvided: missingVariables.length === 0
        }
      })
    }
  } catch (error) {
    console.error('Template process error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process template' 
      },
      { status: 500 }
    )
  }
}

// GET /api/whatsapp/templates/process - Get template preview with sample variables
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Template ID is required' 
        },
        { status: 400 }
      )
    }

    if (type === 'reply') {
      const reply = await QuickRepliesManager.getQuickReply(id)
      
      if (!reply) {
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
        data: {
          content: reply.text,
          preview: reply.text,
          variables: [],
          hasVariables: false
        }
      })
    } else {
      const template = await TemplateManager.getTemplate(id)
      
      if (!template) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Template not found' 
          },
          { status: 404 }
        )
      }

      // Generate sample variables for preview
      const sampleVariables: Record<string, string> = {}
      template.variables.forEach(variable => {
        switch (variable.toLowerCase()) {
          case 'name':
            sampleVariables[variable] = 'John Doe'
            break
          case 'company':
            sampleVariables[variable] = 'Acme Corp'
            break
          case 'date':
            sampleVariables[variable] = new Date().toLocaleDateString()
            break
          case 'time':
            sampleVariables[variable] = new Date().toLocaleTimeString()
            break
          case 'amount':
            sampleVariables[variable] = '$99.99'
            break
          case 'address':
            sampleVariables[variable] = '123 Main St, City, State'
            break
          case 'phone':
            sampleVariables[variable] = '+1 (555) 123-4567'
            break
          case 'email':
            sampleVariables[variable] = 'john.doe@example.com'
            break
          case 'ordernumber':
          case 'order_number':
            sampleVariables[variable] = '#12345'
            break
          case 'ticketid':
          case 'ticket_id':
            sampleVariables[variable] = 'TICKET-001'
            break
          case 'deliverydate':
          case 'delivery_date':
            const deliveryDate = new Date()
            deliveryDate.setDate(deliveryDate.getDate() + 3)
            sampleVariables[variable] = deliveryDate.toLocaleDateString()
            break
          case 'timeframe':
            sampleVariables[variable] = '24 hours'
            break
          default:
            sampleVariables[variable] = `[${variable}]`
        }
      })

      const preview = TemplateManager.processTemplate(template, sampleVariables)

      return NextResponse.json({
        success: true,
        data: {
          content: template.content,
          preview,
          variables: template.variables,
          sampleVariables,
          hasVariables: template.variables.length > 0
        }
      })
    }
  } catch (error) {
    console.error('Template preview error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate template preview' 
      },
      { status: 500 }
    )
  }
}