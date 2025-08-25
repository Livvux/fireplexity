export interface SearchResult {
  url: string
  title: string
  description?: string
  content?: string
  publishedDate?: string
  author?: string
  markdown?: string
  image?: string
  favicon?: string
  siteName?: string
}

export interface NewsResult {
  url: string
  title: string
  description?: string
  publishedDate?: string
  date?: string  // Added for compatibility with the API schema
  source?: string
  image?: string
}

export interface ImageResult {
  url?: string
  title?: string
  alt?: string
  source?: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  position?: number
  thumbnail?: string
}