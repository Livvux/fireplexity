import { NextRequest, NextResponse } from 'next/server'
import { createWAHAClient } from '@/lib/waha-client'

export async function POST(request: NextRequest) {
  try {
    const { chatId, text, sessionName = 'default' } = await request.json()
    
    if (!chatId || !text) {
      return NextResponse.json(
        { error: 'chatId and text are required' },
        { status: 400 }
      )
    }

    const wahaClient = createWAHAClient()
    const result = await wahaClient.sendText({
      chatId,
      text,
      session: sessionName,
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}