import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store for webhook logs (in production, use a database)
interface WebhookLog {
  id: string
  timestamp: Date
  event: string
  session: string
  payload: any
}

// Store recent webhook events (last 100)
const webhookLogs: WebhookLog[] = []
const MAX_LOGS = 100

export function addWebhookLog(event: string, session: string, payload: any) {
  const log: WebhookLog = {
    id: Date.now().toString(),
    timestamp: new Date(),
    event,
    session,
    payload
  }

  webhookLogs.unshift(log)
  
  // Keep only the most recent logs
  if (webhookLogs.length > MAX_LOGS) {
    webhookLogs.splice(MAX_LOGS)
  }

  return log
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const session = searchParams.get('session')
  const limit = parseInt(searchParams.get('limit') || '20')

  let filteredLogs = webhookLogs

  if (session) {
    filteredLogs = webhookLogs.filter(log => log.session === session)
  }

  const recentLogs = filteredLogs.slice(0, limit)

  return NextResponse.json({
    logs: recentLogs,
    total: filteredLogs.length,
    sessions: [...new Set(webhookLogs.map(log => log.session))]
  })
}

export async function DELETE() {
  webhookLogs.length = 0
  return NextResponse.json({ message: 'Webhook logs cleared' })
}