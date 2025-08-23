import { NextRequest } from 'next/server'
import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { createWAHAClient } from '@/lib/waha-client'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, sessionName = 'default' } = await request.json()

    if (!message || !chatId) {
      return new Response(
        JSON.stringify({ error: 'Message and chatId are required' }),
        { status: 400 }
      )
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send status update
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'status',
              message: 'Processing your request with AI...'
            })}\n\n`)
          )

          // Get AI response
          const { text: aiResponse } = await generateText({
            model: groq('llama-3.1-8b-instant'),
            messages: [
              {
                role: 'system',
                content: `You are a helpful WhatsApp assistant. You help users send messages through WhatsApp. 
                
Key instructions:
- Be concise and helpful
- If the user wants to send a WhatsApp message, format your response to include the message content
- If the user asks questions, provide helpful answers
- Always be friendly and professional
- Keep responses appropriate for WhatsApp messaging
- If sending a message, keep it under 4000 characters (WhatsApp limit)

Current context: User is using a WhatsApp agent to send messages to ${chatId}`
              },
              {
                role: 'user',
                content: message
              }
            ],
            temperature: 0.7,
          })

          // Send AI response
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'ai_response',
              content: aiResponse
            })}\n\n`)
          )

          // Check if this looks like a message to send
          const shouldSend = message.toLowerCase().includes('send') || 
                           message.toLowerCase().includes('message') ||
                           message.toLowerCase().includes('tell') ||
                           message.toLowerCase().includes('say')

          if (shouldSend) {
            try {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'status',
                  message: 'Sending message via WhatsApp...'
                })}\n\n`)
              )

              const wahaClient = createWAHAClient()
              const result = await wahaClient.sendText({
                chatId,
                text: aiResponse,
                session: sessionName,
              })

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'whatsapp_sent',
                  success: true,
                  chatId,
                  messageId: result.id || 'unknown',
                  content: aiResponse
                })}\n\n`)
              )
            } catch (whatsappError) {
              console.error('Failed to send WhatsApp message:', whatsappError)
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'whatsapp_error',
                  error: 'Failed to send WhatsApp message. Please check your session status.'
                })}\n\n`)
              )
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'done'
            })}\n\n`)
          )

        } catch (error) {
          console.error('AI processing error:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: 'Failed to process your request'
            })}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('WhatsApp chat error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}