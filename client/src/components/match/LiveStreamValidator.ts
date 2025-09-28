/**
 * Simple live stream URL validator - no hooks, no complex state
 * Just validates URLs when explicitly called
 */

export interface StreamValidationResult {
  isValid: boolean;
  streamType?: 'youtube' | 'twitch' | 'vimeo' | 'direct';
  error?: string;
  embedUrl?: string;
}

// Extract video ID and create embed URL for different platforms
function processStreamUrl(url: string): { streamType: string; embedUrl: string } | null {
  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      streamType: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&controls=0&modestbranding=1&rel=0`
    };
  }

  // Twitch patterns
  const twitchRegex = /twitch\.tv\/(?:videos\/)?([a-zA-Z0-9_]+)/;
  const twitchMatch = url.match(twitchRegex);
  if (twitchMatch) {
    return {
      streamType: 'twitch',
      embedUrl: `https://player.twitch.tv/?channel=${twitchMatch[1]}&parent=${window.location.hostname}&autoplay=true`
    };
  }

  // Vimeo patterns
  const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return {
      streamType: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0`
    };
  }

  // Direct stream URLs (basic validation)
  if (url.includes('.m3u8') || url.includes('rtmp://') || url.includes('rtsp://')) {
    return {
      streamType: 'direct',
      embedUrl: url
    };
  }

  return null;
}

// Test if the stream URL is accessible and live
async function testStreamAvailability(embedUrl: string, streamType: string): Promise<boolean> {
  try {
    // For iframe-based streams, we'll use a different approach
    if (streamType === 'youtube') {
      // Use YouTube oEmbed API to check if video exists and is available
      const videoId = embedUrl.match(/embed\/([^?]+)/)?.[1];
      if (!videoId) return false;
      
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      return response.ok;
    }

    if (streamType === 'twitch') {
      // For Twitch, we'll assume it's valid if the URL format is correct
      // (Twitch API requires authentication for detailed checks)
      return true;
    }

    if (streamType === 'vimeo') {
      // Use Vimeo oEmbed API
      const videoId = embedUrl.match(/video\/(\d+)/)?.[1];
      if (!videoId) return false;
      
      const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
      return response.ok;
    }

    if (streamType === 'direct') {
      // For direct streams, try a HEAD request
      const response = await fetch(embedUrl, { method: 'HEAD' });
      return response.ok;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Simple function to validate a stream URL - no hooks, no state
 */
export async function validateStreamUrl(url: string): Promise<StreamValidationResult> {
  if (!url.trim()) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    // Parse and process the URL
    const streamInfo = processStreamUrl(url);
    
    if (!streamInfo) {
      return { 
        isValid: false, 
        error: 'Unsupported stream format. Please use YouTube, Twitch, Vimeo, or direct stream URLs.' 
      };
    }

    // Test if the stream is actually available
    const isAvailable = await testStreamAvailability(streamInfo.embedUrl, streamInfo.streamType);
    
    if (!isAvailable) {
      return { 
        isValid: false, 
        error: 'Stream URL is not accessible or video not found' 
      };
    }

    return {
      isValid: true,
      streamType: streamInfo.streamType as 'youtube' | 'twitch' | 'vimeo' | 'direct',
      embedUrl: streamInfo.embedUrl
    };

  } catch (error) {
    return { 
      isValid: false, 
      error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// Generate shareable viewer link for validated live streams
export function generateViewerLink(matchId: string, streamUrl: string): string {
  const baseUrl = window.location.origin;
  const encodedStreamUrl = encodeURIComponent(streamUrl);
  return `${baseUrl}/match/watch/${matchId}?stream=${encodedStreamUrl}`;
}

// Check if gaming features should be enabled based on validation
export function shouldEnableGamingFeatures(result: StreamValidationResult): boolean {
  return result.isValid && !!result.embedUrl;
}