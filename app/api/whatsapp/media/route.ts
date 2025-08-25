import { NextRequest, NextResponse } from 'next/server'
import { createWAHAClient } from '@/lib/waha-client'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chatId = formData.get('chatId') as string
    const sessionName = formData.get('sessionName') as string || 'default'
    const caption = formData.get('caption') as string || ''
    const files = formData.getAll('files') as File[]

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId is required' },
        { status: 400 }
      )
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'At least one file is required' },
        { status: 400 }
      )
    }

    const wahaClient = createWAHAClient()
    const results = []

    // Send each file
    for (const file of files) {
      try {
        // Validate file size (64MB WhatsApp limit)
        if (file.size > 64 * 1024 * 1024) {
          results.push({
            filename: file.name,
            error: 'File size exceeds 64MB limit',
            success: false
          })
          continue
        }

        // Send the media file
        const result = await wahaClient.sendMedia(file, chatId, caption, sessionName)
        
        results.push({
          filename: file.name,
          messageId: result.id || 'unknown',
          success: true,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('video/') ? 'video' :
                file.type.startsWith('audio/') ? 'audio' : 'file'
        })
      } catch (error) {
        console.error(`Failed to send media file ${file.name}:`, error)
        results.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Failed to send file',
          success: false
        })
      }
    }

    // Return results summary
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      summary: {
        total: results.length,
        successful,
        failed
      },
      results,
      chatId,
      sessionName
    })

  } catch (error) {
    console.error('Media upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error while processing media files' },
      { status: 500 }
    )
  }
}

// Alternative endpoint for sending individual media with metadata
export async function PUT(request: NextRequest) {
  try {
    const { chatId, sessionName = 'default', file, caption, mentions } = await request.json()

    if (!chatId || !file) {
      return NextResponse.json(
        { error: 'chatId and file are required' },
        { status: 400 }
      )
    }

    // Validate file object structure
    if (!file.data || !file.mimetype || !file.filename) {
      return NextResponse.json(
        { error: 'File must include data (base64), mimetype, and filename' },
        { status: 400 }
      )
    }

    const wahaClient = createWAHAClient()

    // Create media message object
    const mediaMessage = {
      chatId,
      session: sessionName,
      file: {
        mimetype: file.mimetype,
        filename: file.filename,
        data: file.data
      },
      caption,
      mentions
    }

    let result
    // Send based on file type
    if (file.mimetype.startsWith('image/')) {
      result = await wahaClient.sendImage(mediaMessage)
    } else if (file.mimetype.startsWith('video/')) {
      result = await wahaClient.sendVideo(mediaMessage)
    } else if (file.mimetype.startsWith('audio/')) {
      result = await wahaClient.sendAudio(mediaMessage)
    } else {
      result = await wahaClient.sendFile(mediaMessage)
    }

    return NextResponse.json({
      success: true,
      messageId: result.id || 'unknown',
      chatId,
      filename: file.filename,
      type: file.mimetype.split('/')[0]
    })

  } catch (error) {
    console.error('Media send error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to send media',
        success: false 
      },
      { status: 500 }
    )
  }
}