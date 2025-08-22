import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasFirecrawlKey: !!process.env.FIRECRAWL_API_KEY,
    hasFirecrawlUrl: !!process.env.FIRECRAWL_API_URL,
    firecrawlUrl: process.env.FIRECRAWL_API_URL || 'https://api.firecrawl.dev'
  })
}