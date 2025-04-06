/**
 * CourtIQ™ Design System
 * 
 * Main export file for the design system components, tokens, and utilities.
 */

// Export tokens
export { colors } from './tokens/colors';
export { textStyles, fontFamilies, fontSizes, fontWeights, lineHeights } from './tokens/typography';

// Export hooks
export { useRatingData, useRatingDetail, useRatingTiers } from './hooks/useRatingData';
export type { RatingData, RatingTier, RatingWithHistory } from './hooks/useRatingData';

export { useRankingHistory } from './hooks/useRankingData';
export type { RankingHistory } from './hooks/useRankingData';

export { useXPData } from './hooks/useXPData';
export type { XPData, XPLevel, XPMultiplier, XPActivity } from './hooks/useXPData';

// Export components 
// Rating components
export { RatingBadge } from './components/rating/RatingBadge';
export { RatingCard } from './components/rating/RatingCard';

// CourtIQ Dashboard components
export { RankingCard } from './components/courtiq/RankingCard';
export { XPCard } from './components/courtiq/XPCard';
export { CourtIQDashboard } from './components/courtiq/CourtIQDashboard';