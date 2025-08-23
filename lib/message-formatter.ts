/**
 * WhatsApp Message Formatter
 * Handles WhatsApp-specific markdown formatting and validation
 */

export interface FormattedMessage {
  text: string
  preview: string
  isValid: boolean
  characterCount: number
  errors: string[]
}

export interface FormatAction {
  type: 'bold' | 'italic' | 'strikethrough' | 'code' | 'mention'
  start: number
  end: number
  text?: string
}

export class MessageFormatter {
  private static readonly MAX_LENGTH = 4096
  private static readonly MENTION_PATTERN = /@(\d+)/g
  
  /**
   * Format text with WhatsApp markdown
   */
  static formatText(text: string, action: FormatAction): string {
    const { type, start, end } = action
    const selectedText = text.substring(start, end)
    
    if (!selectedText) return text
    
    let formattedText: string
    
    switch (type) {
      case 'bold':
        formattedText = `*${selectedText}*`
        break
      case 'italic':
        formattedText = `_${selectedText}_`
        break
      case 'strikethrough':
        formattedText = `~${selectedText}~`
        break
      case 'code':
        formattedText = selectedText.includes('\n') 
          ? `\`\`\`${selectedText}\`\`\``
          : `\`${selectedText}\``
        break
      case 'mention':
        // Mentions are handled separately in the component
        formattedText = selectedText
        break
      default:
        formattedText = selectedText
    }
    
    return text.substring(0, start) + formattedText + text.substring(end)
  }
  
  /**
   * Convert markdown to HTML for preview
   */
  static toHtml(text: string): string {
    let html = text
      // Bold
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~(.*?)~/g, '<del>$1</del>')
      // Inline code
      .replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code class="code-block">$1</code></pre>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Mentions
      .replace(this.MENTION_PATTERN, '<span class="mention">@$1</span>')
    
    return html
  }
  
  /**
   * Validate message content
   */
  static validate(text: string, mentions?: string[]): FormattedMessage {
    const errors: string[] = []
    const characterCount = text.length
    
    // Check length
    if (characterCount > this.MAX_LENGTH) {
      errors.push(`Message exceeds maximum length of ${this.MAX_LENGTH} characters`)
    }
    
    if (characterCount === 0) {
      errors.push('Message cannot be empty')
    }
    
    // Validate mentions format
    if (mentions && mentions.length > 0) {
      const mentionMatches = text.match(this.MENTION_PATTERN)
      const mentionNumbers = mentionMatches?.map(m => m.replace('@', '')) || []
      
      // Check if all mentions in text are in the mentions array
      for (const number of mentionNumbers) {
        if (!mentions.some(mention => mention.includes(number))) {
          errors.push(`Mention @${number} is not in the contact list`)
        }
      }
    }
    
    // Check for unclosed markdown
    const boldCount = (text.match(/\*/g) || []).length
    const italicCount = (text.match(/_/g) || []).length
    const strikeCount = (text.match(/~/g) || []).length
    const codeCount = (text.match(/`/g) || []).length
    
    if (boldCount % 2 !== 0) {
      errors.push('Unclosed bold formatting (*)')
    }
    if (italicCount % 2 !== 0) {
      errors.push('Unclosed italic formatting (_)')
    }
    if (strikeCount % 2 !== 0) {
      errors.push('Unclosed strikethrough formatting (~)')
    }
    if (codeCount % 2 !== 0) {
      errors.push('Unclosed code formatting (`)')
    }
    
    return {
      text,
      preview: this.toHtml(text),
      isValid: errors.length === 0,
      characterCount,
      errors
    }
  }
  
  /**
   * Extract mentions from text
   */
  static extractMentions(text: string): string[] {
    const matches = text.match(this.MENTION_PATTERN)
    return matches ? matches.map(match => match.replace('@', '') + '@c.us') : []
  }
  
  /**
   * Apply formatting shortcuts (Ctrl+B, Ctrl+I, etc.)
   */
  static applyShortcut(text: string, selectionStart: number, selectionEnd: number, shortcut: string): {
    newText: string
    newSelectionStart: number
    newSelectionEnd: number
  } {
    let action: FormatAction | null = null
    
    switch (shortcut) {
      case 'bold':
        action = { type: 'bold', start: selectionStart, end: selectionEnd }
        break
      case 'italic':
        action = { type: 'italic', start: selectionStart, end: selectionEnd }
        break
      case 'code':
        action = { type: 'code', start: selectionStart, end: selectionEnd }
        break
      case 'strikethrough':
        action = { type: 'strikethrough', start: selectionStart, end: selectionEnd }
        break
    }
    
    if (!action) {
      return { newText: text, newSelectionStart: selectionStart, newSelectionEnd: selectionEnd }
    }
    
    const newText = this.formatText(text, action)
    const addedChars = newText.length - text.length
    
    return {
      newText,
      newSelectionStart: selectionStart,
      newSelectionEnd: selectionEnd + addedChars
    }
  }
  
  /**
   * Clean text for sending (remove extra whitespace, etc.)
   */
  static cleanForSending(text: string): string {
    return text
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .replace(/[ \t]+$/gm, '') // Remove trailing whitespace
  }
  
  /**
   * Check if text contains media placeholders
   */
  static hasMediaPlaceholder(text: string): boolean {
    return text.includes('[📎 Media attached]') || text.includes('[🖼️ Image attached]')
  }
  
  /**
   * Add media placeholder to text
   */
  static addMediaPlaceholder(text: string, mediaType: string): string {
    const placeholder = mediaType.startsWith('image/') ? '[🖼️ Image attached]' : '[📎 Media attached]'
    return text ? `${text}\n\n${placeholder}` : placeholder
  }
}

export default MessageFormatter