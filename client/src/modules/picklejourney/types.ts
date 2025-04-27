/**
 * PKL-278651-JOUR-001: PickleJourney™ Types
 * 
 * Types used throughout the PickleJourney emotionally intelligent journaling system.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

/**
 * Emotional states used to track user's emotions
 * These states represent a blend of emotional and motivational states
 * relevant to pickleball players' journey
 */
export type EmotionalState = 
  | 'frustrated-disappointed' // Negative emotions after setbacks
  | 'anxious-uncertain'       // Anxiety or uncertainty about performance
  | 'neutral-focused'         // Neutral, baseline state of engagement
  | 'excited-proud'           // Positive emotions after success
  | 'determined-growth';      // Growth-oriented mindset

/**
 * The result of an emotion detection process
 */
export interface EmotionDetectionResult {
  /** The primary detected emotional state */
  primaryEmotion: EmotionalState;
  
  /** Confidence level (0.0-1.0) in the emotion detection */
  confidence: number;
  
  /** When the detection occurred */
  timestamp: Date;
  
  /** Source of the emotion detection */
  source: 'user-reported' | 'text-analysis' | 'interaction-pattern' | 'performance-related';
}

/**
 * Journal entry visibility level
 */
export type JournalVisibility = 
  | 'private'        // Only visible to the user
  | 'coach-shared'   // Shared with user's coach
  | 'team-shared'    // Shared with user's team
  | 'public';        // Visible to all users

/**
 * Structure of a journal entry
 */
export interface JournalEntry {
  /** Unique ID (generated client-side for now) */
  id?: string;
  
  /** Entry title */
  title: string;
  
  /** Main content of the journal entry */
  content: string;
  
  /** The emotional state associated with this entry */
  emotionalState: EmotionalState;
  
  /** When the entry was created */
  createdAt: Date;
  
  /** The visibility level of this entry */
  visibility: JournalVisibility;
  
  /** Optional tags for categorization */
  tags?: string[];
  
  /** Whether the entry has been analyzed for emotional patterns */
  analyzed?: boolean;
  
  /** Optional match ID if the entry is related to a specific match */
  matchId?: string;
  
  /** Optional list of media attachments */
  media?: Array<{
    type: 'image' | 'video',
    url: string
  }>;
}

/**
 * Structure for emotional patterns derived from journal entries
 */
export interface EmotionalPatternAnalysis {
  /** The dominant emotional state in the analyzed period */
  dominantEmotion: EmotionalState;
  
  /** Distribution of emotional states */
  distribution: Record<EmotionalState, number>;
  
  /** Transition patterns between emotional states */
  transitions: Array<{
    from: EmotionalState;
    to: EmotionalState;
    frequency: number;
  }>;
  
  /** Correlation between emotional states and performance */
  performanceCorrelation?: Record<EmotionalState, number>;
  
  /** The date range analyzed */
  analyzedPeriod: {
    from: Date;
    to: Date;
  };
}

/**
 * Chart data point for emotional journey visualization
 */
export interface EmotionalDataPoint {
  /** The date represented */
  date: Date;
  
  /** Formatted date string for display */
  formattedDate: string;
  
  /** Numeric value derived from emotional state */
  value: number;
  
  /** Raw numeric value before any smoothing */
  rawValue: number | null;
  
  /** Number of entries for this date */
  entryCount: number;
}