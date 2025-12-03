import { NextResponse } from 'next/server'

interface YouTubeLiveResponse {
  isLive: boolean
  videoId: string | null
  title: string | null
  channelUrl: string
}

export async function GET() {
  try {
    // Fetch the channel's live page to check for active stream
    const channelLiveUrl = `https://www.youtube.com/@SejmRP_PL/live`
    
    const response = await fetch(channelLiveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      next: { revalidate: 60 } // Cache for 1 minute
    })
    
    if (!response.ok) {
      console.error('YouTube fetch failed:', response.status)
      return NextResponse.json({
        isLive: false,
        videoId: null,
        title: null,
        channelUrl: 'https://www.youtube.com/@SejmRP_PL',
      } as YouTubeLiveResponse)
    }
    
    const html = await response.text()
    
    // Debug: Check if we're getting redirected to a video page
    // When live, the /live URL redirects to the actual video
    
    // Look for video ID in the page - multiple patterns
    let videoId: string | null = null
    let title: string | null = null
    let isLive = false
    
    // Pattern 1: Look for videoId in ytInitialPlayerResponse or ytInitialData
    const videoIdPatterns = [
      /"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/,
      /watch\?v=([a-zA-Z0-9_-]{11})/,
      /\/embed\/([a-zA-Z0-9_-]{11})/,
      /"video_id"\s*:\s*"([a-zA-Z0-9_-]{11})"/,
    ]
    
    for (const pattern of videoIdPatterns) {
      const match = html.match(pattern)
      if (match) {
        videoId = match[1]
        break
      }
    }
    
    // Check for live indicators
    const livePatterns = [
      /"isLive"\s*:\s*true/,
      /"isLiveNow"\s*:\s*true/,
      /"isLiveContent"\s*:\s*true/,
      /BADGE_STYLE_TYPE_LIVE_NOW/,
      /"liveBroadcastDetails"/,
    ]
    
    for (const pattern of livePatterns) {
      if (pattern.test(html)) {
        isLive = true
        break
      }
    }
    
    // Try to get title
    const titlePatterns = [
      /"title"\s*:\s*"([^"]+)"/,
      /<title>([^<]+)<\/title>/,
    ]
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern)
      if (match && !match[1].includes('YouTube')) {
        title = match[1].replace(/\\u0026/g, '&').replace(/\\"/g, '"')
        break
      }
    }
    
    console.log('YouTube Live check:', { videoId, isLive, title: title?.substring(0, 50) })
    
    return NextResponse.json({
      isLive: isLive && videoId !== null,
      videoId: isLive ? videoId : null,
      title,
      channelUrl: 'https://www.youtube.com/@SejmRP_PL',
    } as YouTubeLiveResponse)
    
  } catch (error) {
    console.error('YouTube Live API error:', error)
    return NextResponse.json({
      isLive: false,
      videoId: null,
      title: null,
      channelUrl: 'https://www.youtube.com/@SejmRP_PL',
    } as YouTubeLiveResponse)
  }
}
