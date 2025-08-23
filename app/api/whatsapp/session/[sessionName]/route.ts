import { NextRequest, NextResponse } from 'next/server'
import { createWAHAClient } from '@/lib/waha-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionName: string }> }
) {
  const { sessionName } = await params
  
  try {
    const wahaClient = createWAHAClient()
    const session = await wahaClient.getSession(sessionName)
    
    return NextResponse.json(session)
  } catch (error: any) {
    console.error('Failed to get WAHA session:', error)
    
    // If session doesn't exist (404), return default STOPPED status
    if (error?.message?.includes('Session not found') || 
        error?.message?.includes('404') ||
        error?.message?.includes('Not Found')) {
      return NextResponse.json({
        name: sessionName,
        status: 'STOPPED'
      })
    }
    
    // For other errors, return 500
    return NextResponse.json(
      { error: 'Failed to get session status' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionName: string }> }
) {
  try {
    const { sessionName } = await params
    const wahaClient = createWAHAClient()
    await wahaClient.deleteSession(sessionName)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete WAHA session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}