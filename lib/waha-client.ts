export interface WAHASession {
  name: string
  status: 'STOPPED' | 'STARTING' | 'SCAN_QR_CODE' | 'WORKING' | 'FAILED'
  config?: {
    webhooks?: Array<{
      url: string
      events: string[]
    }>
  }
}

export interface WAHAMessage {
  chatId: string
  text: string
  session?: string
  reply_to?: string
  mentions?: string[]
  linkPreview?: boolean
}

export interface WAHAMediaMessage {
  chatId: string
  session?: string
  file: {
    mimetype: string
    filename: string
    data?: string // base64 encoded file data
    url?: string // or URL to file
  }
  caption?: string
  reply_to?: string
  mentions?: string[]
}

export interface WAHAMessageResponse {
  id: string
  chatId: string
  timestamp?: number
}

export interface WAHAChat {
  id: string
  name?: string
  isGroup?: boolean
}

export interface WAHAContact {
  id: string
  name?: string
  pushname?: string
}

export interface WAHAFileInfo {
  mimetype: string
  filename: string
  size: number
  data: string // base64 encoded
}

export interface WAHAQRResponse {
  qr?: string
  screenshot?: string
  base64?: string
}

export class WAHAClient {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.apiKey = apiKey
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`WAHA API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json()
    }
    
    return response.text() as T
  }

  async getSessions(): Promise<WAHASession[]> {
    return this.request<WAHASession[]>('/api/sessions')
  }

  async getSession(sessionName: string = 'default'): Promise<WAHASession> {
    return this.request<WAHASession>(`/api/sessions/${sessionName}`)
  }

  async getSessionSafe(sessionName: string = 'default'): Promise<WAHASession> {
    try {
      return await this.getSession(sessionName)
    } catch (error: unknown) {
      // If session doesn't exist, return default STOPPED status
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Session not found') || 
          errorMessage.includes('404') ||
          errorMessage.includes('Not Found')) {
        return {
          name: sessionName,
          status: 'STOPPED'
        }
      }
      // Re-throw other errors
      throw error
    }
  }

  async createOrUpdateSession(sessionName: string = 'default', webhookUrl?: string): Promise<WAHASession> {
    const config: { webhooks?: Array<{ url: string; events: string[] }> } = {}
    
    if (webhookUrl) {
      config.webhooks = [
        {
          url: webhookUrl,
          events: ['message', 'session.status']
        }
      ]
    }

    const sessionBody = {
      name: sessionName,
      config: Object.keys(config).length > 0 ? config : undefined
    }

    // First try to create a new session
    try {
      return await this.request<WAHASession>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionBody),
      })
    } catch (error: unknown) {
      // If session already exists, update it
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already exists') || errorMessage.includes('422')) {
        return this.request<WAHASession>(`/api/sessions/${sessionName}`, {
          method: 'PUT',
          body: JSON.stringify(sessionBody),
        })
      }
      throw error
    }
  }

  async startSession(sessionName: string = 'default', webhookUrl?: string): Promise<WAHASession> {
    return this.createOrUpdateSession(sessionName, webhookUrl)
  }

  static generateSessionName(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `livvuxPlexity_session_${timestamp}_${random}`
  }

  async stopSession(sessionName: string = 'default'): Promise<void> {
    await this.request(`/api/sessions/${sessionName}/stop`, {
      method: 'POST',
    })
  }

  async restartSession(sessionName: string = 'default'): Promise<void> {
    await this.request(`/api/sessions/${sessionName}/restart`, {
      method: 'POST',
    })
  }

  async logoutSession(sessionName: string = 'default'): Promise<void> {
    await this.request(`/api/sessions/${sessionName}/logout`, {
      method: 'POST',
    })
  }

  async deleteSession(sessionName: string = 'default'): Promise<void> {
    await this.request(`/api/sessions/${sessionName}`, {
      method: 'DELETE',
    })
  }

  async getQRCode(sessionName: string = 'default'): Promise<WAHAQRResponse> {
    try {
      return await this.request<WAHAQRResponse>(`/api/sessions/${sessionName}/auth/qr`)
    } catch (error) {
      // Try alternative endpoint for QR code
      const response = await fetch(`${this.baseUrl}/api/screenshot?session=${sessionName}&format=qr`, {
        headers: {
          'X-Api-Key': this.apiKey,
        },
      })
      
      if (response.ok) {
        if (response.headers.get('content-type')?.includes('image')) {
          // If we get an image response, convert to base64
          const buffer = await response.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          return { base64 }
        } else {
          return response.json()
        }
      }
      
      throw error
    }
  }

  async getScreenshot(sessionName: string = 'default'): Promise<string> {
    return this.request<string>(`/api/screenshot?session=${sessionName}`, {
      headers: {
        'Accept': 'image/png',
      },
    })
  }

  async sendText(message: WAHAMessage): Promise<WAHAMessageResponse> {
    const payload = {
      session: message.session || 'default',
      chatId: message.chatId,
      text: message.text,
      ...( message.reply_to && { reply_to: message.reply_to }),
      ...( message.mentions && { mentions: message.mentions }),
      ...( message.linkPreview !== undefined && { linkPreview: message.linkPreview }),
    }

    return this.request('/api/sendText', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async sendImage(message: WAHAMediaMessage): Promise<WAHAMessageResponse> {
    const payload = {
      session: message.session || 'default',
      chatId: message.chatId,
      file: message.file,
      ...( message.caption && { caption: message.caption }),
      ...( message.reply_to && { reply_to: message.reply_to }),
      ...( message.mentions && { mentions: message.mentions }),
    }

    return this.request('/api/sendImage', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async sendFile(message: WAHAMediaMessage): Promise<WAHAMessageResponse> {
    const payload = {
      session: message.session || 'default',
      chatId: message.chatId,
      file: message.file,
      ...( message.caption && { caption: message.caption }),
      ...( message.reply_to && { reply_to: message.reply_to }),
      ...( message.mentions && { mentions: message.mentions }),
    }

    return this.request('/api/sendFile', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async sendVideo(message: WAHAMediaMessage): Promise<WAHAMessageResponse> {
    const payload = {
      session: message.session || 'default',
      chatId: message.chatId,
      file: message.file,
      ...( message.caption && { caption: message.caption }),
      ...( message.reply_to && { reply_to: message.reply_to }),
      ...( message.mentions && { mentions: message.mentions }),
    }

    return this.request('/api/sendVideo', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async sendAudio(message: WAHAMediaMessage): Promise<WAHAMessageResponse> {
    const payload = {
      session: message.session || 'default',
      chatId: message.chatId,
      file: message.file,
      ...( message.caption && { caption: message.caption }),
      ...( message.reply_to && { reply_to: message.reply_to }),
      ...( message.mentions && { mentions: message.mentions }),
    }

    return this.request('/api/sendAudio', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Convert File to base64 for WAHA API
   */
  static async fileToBase64(file: File): Promise<WAHAFileInfo> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64Data = result.split(',')[1] // Remove data:type;base64, prefix
        
        resolve({
          mimetype: file.type,
          filename: file.name,
          size: file.size,
          data: base64Data
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Send media file based on its type
   */
  async sendMedia(file: File, chatId: string, caption?: string, sessionName: string = 'default'): Promise<WAHAMessageResponse> {
    const fileInfo = await WAHAClient.fileToBase64(file)
    
    const mediaMessage: WAHAMediaMessage = {
      chatId,
      session: sessionName,
      file: {
        mimetype: fileInfo.mimetype,
        filename: fileInfo.filename,
        data: fileInfo.data
      },
      caption
    }

    // Determine which API endpoint to use based on file type
    if (file.type.startsWith('image/')) {
      return this.sendImage(mediaMessage)
    } else if (file.type.startsWith('video/')) {
      return this.sendVideo(mediaMessage)
    } else if (file.type.startsWith('audio/')) {
      return this.sendAudio(mediaMessage)
    } else {
      // Send as file/document for other types
      return this.sendFile(mediaMessage)
    }
  }

  async getChats(sessionName: string = 'default'): Promise<WAHAChat[]> {
    return this.request<WAHAChat[]>(`/api/sessions/${sessionName}/chats`)
  }

  async getContacts(sessionName: string = 'default'): Promise<WAHAContact[]> {
    return this.request<WAHAContact[]>(`/api/sessions/${sessionName}/contacts`)
  }

  async getSessionInfo(sessionName: string = 'default'): Promise<WAHASession> {
    return this.request(`/api/sessions/${sessionName}/me`)
  }
}

export function createWAHAClient(): WAHAClient {
  const baseUrl = process.env.WAHA_BASE_URL
  const apiKey = process.env.WAHA_API_KEY

  if (!baseUrl || !apiKey) {
    throw new Error('WAHA_BASE_URL and WAHA_API_KEY must be set in environment variables')
  }

  return new WAHAClient(baseUrl, apiKey)
}

export default WAHAClient