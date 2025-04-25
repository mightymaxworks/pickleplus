/**
 * PKL-278651-SAGE-0009-VIDEO - YouTube Integration Service
 * 
 * This service handles YouTube video integration for pickleball drills
 * Part of Sprint 4: Enhanced Training Plans & Video Integration
 */

import { PickleballDrill } from "@shared/schema/drills";

interface VideoTimestamp {
  label: string;
  time: number; // seconds
  description?: string;
}

interface VideoDetails {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  timestamps: VideoTimestamp[];
}

/**
 * Service for handling YouTube video operations
 */
export class YouTubeService {
  /**
   * Constructs a YouTube embed URL for a given video ID
   * @param videoId YouTube video ID
   * @param startAt Optional start time in seconds
   * @param autoplay Whether to autoplay the video
   * @returns Full YouTube embed URL
   */
  getEmbedUrl(videoId: string, startAt?: number, autoplay: boolean = false): string {
    let url = `https://www.youtube.com/embed/${videoId}?rel=0`;
    
    if (startAt !== undefined && startAt > 0) {
      url += `&start=${Math.floor(startAt)}`;
    }
    
    if (autoplay) {
      url += "&autoplay=1";
    }
    
    return url;
  }
  
  /**
   * Gets a direct thumbnail URL for a YouTube video
   * @param videoId YouTube video ID
   * @param quality Thumbnail quality ('default', 'medium', 'high', 'standard', 'maxres')
   * @returns Thumbnail URL
   */
  getThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string {
    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
  }
  
  /**
   * Extracts video ID from a YouTube URL
   * @param url Full YouTube URL
   * @returns YouTube video ID or null if invalid URL
   */
  extractVideoId(url: string): string | null {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }
  
  /**
   * Formats video timestamp object from drill data
   * @param drill Drill object with timestamps
   * @returns Formatted timestamps for video player
   */
  formatTimestampsFromDrill(drill: PickleballDrill): VideoTimestamp[] {
    const timestamps: VideoTimestamp[] = [];
    const rawTimestamps = drill.videoTimestamps as Record<string, number> || {};
    
    // Setup timestamp
    if (rawTimestamps.setup) {
      timestamps.push({
        label: 'Setup',
        time: rawTimestamps.setup,
        description: 'How to set up the drill'
      });
    }
    
    // Add execution steps timestamps
    if (drill.executionSteps && drill.executionSteps.length > 0) {
      drill.executionSteps.forEach((step, index) => {
        const stepKey = `step${index + 1}`;
        if (rawTimestamps[stepKey]) {
          timestamps.push({
            label: `Step ${index + 1}`,
            time: rawTimestamps[stepKey],
            description: step.substring(0, 50) + (step.length > 50 ? '...' : '')
          });
        }
      });
    }
    
    // Add success demonstration timestamp
    if (rawTimestamps.success) {
      timestamps.push({
        label: 'Success Demo',
        time: rawTimestamps.success,
        description: 'What success looks like'
      });
    }
    
    // Add common mistakes timestamp
    if (rawTimestamps.mistakes) {
      timestamps.push({
        label: 'Common Mistakes',
        time: rawTimestamps.mistakes,
        description: 'Mistakes to avoid'
      });
    }
    
    return timestamps;
  }
  
  /**
   * Get complete video details for a drill
   * @param drill Pickleball drill with video data
   * @returns Video details object
   */
  getDrillVideoDetails(drill: PickleballDrill): VideoDetails | null {
    if (!drill.primaryVideoId) {
      return null;
    }
    
    return {
      videoId: drill.primaryVideoId,
      title: drill.name,
      description: drill.setupInstructions.substring(0, 200) + '...',
      thumbnailUrl: this.getThumbnailUrl(drill.primaryVideoId),
      timestamps: this.formatTimestampsFromDrill(drill)
    };
  }
}

export const youtubeService = new YouTubeService();