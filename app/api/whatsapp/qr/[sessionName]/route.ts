import { NextRequest, NextResponse } from 'next/server'
import { createWAHAClient } from '@/lib/waha-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionName: string }> }
) {
  try {
    const { sessionName } = await params
    const wahaClient = createWAHAClient()
    const qrData = await wahaClient.getQRCode(sessionName)
    
    return NextResponse.json(qrData)
  } catch (error) {
    console.error('Failed to get QR code:', error)
    return NextResponse.json(
      { error: 'Failed to get QR code' },
      { status: 500 }
    )
  }
}