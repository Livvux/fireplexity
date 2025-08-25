import { NextRequest, NextResponse } from 'next/server'
import { addWebhookLog } from '@/lib/webhook-logger'

interface WAHAWebhookMessage {
  event: string
  session: string
  engine?: string
  payload?: {
    id?: string
    timestamp?: number
    from?: string
    fromMe?: boolean
    to?: string
    body?: string
    hasMedia?: boolean
    mimetype?: string
    filename?: string
    ack?: number
    ackName?: string
    location?: {
      latitude: number
      longitude: number
    }
    vCards?: Array<{
      displayName: string
      vcard: string
    }>
    _data?: {
      isNewMsg?: boolean
      isStatus?: boolean
      type?: string
    }
  }
}

interface WAHAWebhookStatus {
  event: string
  session: string
  me?: {
    id: string
    pushName: string
  }
  engine?: string
  status?: 'STOPPED' | 'STARTING' | 'SCAN_QR_CODE' | 'WORKING' | 'FAILED'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📱 WAHA Webhook received:', JSON.stringify(body, null, 2))

    // Validate the webhook payload
    if (!body.event || !body.session) {
      console.error('❌ Invalid webhook payload: missing event or session')
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    const webhookData = body as WAHAWebhookMessage | WAHAWebhookStatus

    // Log the webhook event
    addWebhookLog(webhookData.event, webhookData.session, webhookData)

    // Handle different webhook events
    switch (webhookData.event) {
      case 'message':
        await handleIncomingMessage(webhookData as WAHAWebhookMessage)
        break
      
      case 'session.status':
        await handleSessionStatus(webhookData as WAHAWebhookStatus)
        break
      
      case 'message.ack':
        await handleMessageAck(webhookData as WAHAWebhookMessage)
        break
      
      case 'state.change':
        console.log(`🔄 Session ${webhookData.session} state changed`)
        break
      
      default:
        console.log(`🔔 Unhandled webhook event: ${webhookData.event} for session: ${webhookData.session}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      event: webhookData.event,
      session: webhookData.session
    })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleIncomingMessage(data: WAHAWebhookMessage) {
  const { session, payload } = data
  
  if (!payload) {
    console.log('⚠️ Message webhook without payload')
    return
  }

  console.log(`💬 New message in session ${session}:`, {
    id: payload.id,
    from: payload.from,
    fromMe: payload.fromMe,
    to: payload.to,
    body: payload.body,
    hasMedia: payload.hasMedia,
    mimetype: payload.mimetype,
    filename: payload.filename,
    timestamp: payload.timestamp
  })

  // Here you can:
  // 1. Store the message in a database
  // 2. Trigger notifications to connected clients via WebSocket/SSE
  // 3. Process the message with AI if it's not from the bot
  // 4. Update conversation context

  if (!payload.fromMe && payload.body) {
    console.log(`🤖 Received message from ${payload.from}: "${payload.body}"`)
    
    // TODO: You could implement auto-reply logic here
    // TODO: Or forward to AI for processing
    // TODO: Or store in database for chat history
  }
}

async function handleSessionStatus(data: WAHAWebhookStatus) {
  const { session, status, me } = data
  
  console.log(`📊 Session ${session} status: ${status}`)
  
  if (me) {
    console.log(`👤 Session user info:`, me)
  }

  // Here you can:
  // 1. Update session status in database
  // 2. Notify connected clients about status changes
  // 3. Handle session failures or disconnections
  
  switch (status) {
    case 'WORKING':
      console.log(`✅ Session ${session} is now connected and working`)
      break
    case 'FAILED':
      console.log(`❌ Session ${session} has failed`)
      break
    case 'SCAN_QR_CODE':
      console.log(`📱 Session ${session} needs QR code scan`)
      break
    case 'STARTING':
      console.log(`🚀 Session ${session} is starting`)
      break
    case 'STOPPED':
      console.log(`⏹️ Session ${session} has stopped`)
      break
  }
}

async function handleMessageAck(data: WAHAWebhookMessage) {
  const { session, payload } = data
  
  if (!payload) return
  
  console.log(`✅ Message ACK in session ${session}:`, {
    id: payload.id,
    ack: payload.ack,
    ackName: payload.ackName
  })

  // ACK values:
  // 1 = Message sent
  // 2 = Message delivered
  // 3 = Message read
  
  // Here you can:
  // 1. Update message status in database
  // 2. Show delivery/read status in UI
}

// GET endpoint for webhook verification (some webhook services require this)
export async function GET() {
  return NextResponse.json({ 
    message: 'livvuxPlexity WhatsApp Webhook Endpoint',
    timestamp: new Date().toISOString()
  })
}