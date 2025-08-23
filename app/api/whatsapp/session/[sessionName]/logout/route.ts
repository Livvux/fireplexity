import { NextRequest, NextResponse } from 'next/server'
import { createWAHAClient } from '@/lib/waha-client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionName: string }> }
) {
  try {
    const { sessionName } = await params
    const wahaClient = createWAHAClient()
    await wahaClient.logoutSession(sessionName)
    
    return NextResponse.json({ 
      success: true,
      message: 'Session logged out successfully'
    })
  } catch (error) {
    console.error('Failed to logout WAHA session:', error)
    return NextResponse.json(
      { error: 'Failed to logout session' },
      { status: 500 }
    )
  }
}