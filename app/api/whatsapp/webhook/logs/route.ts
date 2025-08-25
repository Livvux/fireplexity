import { NextRequest, NextResponse } from 'next/server'
import { getWebhookLogs, clearWebhookLogs } from '@/lib/webhook-logger'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const session = searchParams.get('session')
  const limit = parseInt(searchParams.get('limit') || '20')

  const result = getWebhookLogs(session || undefined, limit)

  return NextResponse.json(result)
}

export async function DELETE() {
  clearWebhookLogs()
  return NextResponse.json({ message: 'Webhook logs cleared' })
}