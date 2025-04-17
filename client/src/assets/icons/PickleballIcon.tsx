/**
 * PKL-278651-COMM-0007-ICONS
 * PickleballIcon Component
 * 
 * Custom SVG icon of a pickleball with Framework 5.1 semantic identifiers
 * for testing and debugging.
 */
import React from 'react';

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

/**
 * A custom pickleball icon component
 */
export const PickleballIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 1.5,
  fill = false,
  ...props
}) => {
  // Fill style based on fill prop
  const fillStyle = fill ? color : 'none';
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fillStyle}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      data-testid="pickleball-icon"
      data-component="PickleballIcon"
      {...props}
    >
      {/* Main ball circle */}
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        fill={fill ? color + '20' : 'none'} 
        stroke={color}
      />
      
      {/* Holes pattern */}
      <circle cx="12" cy="7" r="0.8" fill={color} />
      <circle cx="12" cy="17" r="0.8" fill={color} />
      <circle cx="7" cy="12" r="0.8" fill={color} />
      <circle cx="17" cy="12" r="0.8" fill={color} />
      <circle cx="9" cy="9" r="0.8" fill={color} />
      <circle cx="15" cy="15" r="0.8" fill={color} />
      <circle cx="9" cy="15" r="0.8" fill={color} />
      <circle cx="15" cy="9" r="0.8" fill={color} />
      
      {/* Motion lines */}
      <path 
        d="M22,12 C22,6.5 17.5,2 12,2" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6} 
        strokeDasharray="1,3" 
      />
      <path 
        d="M12,22 C6.5,22 2,17.5 2,12" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6} 
        strokeDasharray="1,3" 
      />
    </svg>
  );
};

export default PickleballIcon;