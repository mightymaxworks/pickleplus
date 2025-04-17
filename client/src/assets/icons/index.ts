/**
 * PKL-278651-COMM-0007-ICONS
 * Icons Export Index
 * 
 * This file exports all custom SVG icons for the Pickle+ platform
 * for easy importing throughout the application.
 */

export { default as PickleballIcon } from './PickleballIcon';
export { default as PaddleIcon } from './PaddleIcon';
export { default as CourtIcon } from './CourtIcon';
export { default as TournamentBracketIcon } from './TournamentBracketIcon';
export { default as PlayerRatingIcon } from './PlayerRatingIcon';

// Export the IconProps interface for reuse
export interface IconProps {
  /** Size of the icon in pixels */
  size?: number;
  /** Color of the icon */
  color?: string;
  /** CSS class names */
  className?: string;
  /** Stroke width for the icon lines */
  strokeWidth?: number;
  /** Whether to fill the icon shapes with color */
  fill?: boolean;
  /** Additional props to pass to the SVG element */
  [key: string]: any;
}