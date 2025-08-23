import { NextRequest, NextResponse } from 'next/server'
import { createWAHAClient, WAHAClient } from '@/lib/waha-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { sessionName } = body
    const wahaClient = createWAHAClient()

    // Generate a unique session name if none provided
    const finalSessionName = sessionName || WAHAClient.generateSessionName()

    // Construct webhook URL for this application
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const host = request.headers.get('host') || 'localhost:3001'
    const webhookUrl = `${protocol}://${host}/api/whatsapp/webhook`

    console.log(`🔗 Creating session ${finalSessionName} with webhook: ${webhookUrl}`)

    const session = await wahaClient.startSession(finalSessionName, webhookUrl)
    
    return NextResponse.json(session)
  } catch (error) {
    console.error('Failed to start WAHA session:', error)
    return NextResponse.json(
      { error: 'Failed to start WhatsApp session' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const wahaClient = createWAHAClient()
    const sessions = await wahaClient.getSessions()
    
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Failed to get WAHA sessions:', error)
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    )
  }
}