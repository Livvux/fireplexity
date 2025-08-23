import { NextRequest, NextResponse } from 'next/server'
import { createWAHAClient } from '@/lib/waha-client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionName: string }> }
) {
  try {
    const { sessionName } = await params
    const wahaClient = createWAHAClient()
    await wahaClient.restartSession(sessionName)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to restart WAHA session:', error)
    return NextResponse.json(
      { error: 'Failed to restart session' },
      { status: 500 }
    )
  }
}