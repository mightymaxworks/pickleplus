/**
 * PKL-278651-COMM-0007-ICONS
 * PaddleIcon Component
 * 
 * Custom SVG icon of a pickleball paddle with Framework 5.1 semantic identifiers
 * for testing and debugging.
 */
import React from 'react';
import { IconProps } from './index';

/**
 * A custom pickleball paddle icon component
 */
export const PaddleIcon: React.FC<IconProps> = ({
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
      data-testid="paddle-icon"
      data-component="PaddleIcon"
      {...props}
    >
      {/* Paddle handle */}
      <rect 
        x="10.5" 
        y="16" 
        width="3" 
        height="6" 
        rx="1" 
        fill={fillStyle} 
        stroke={color}
      />
      
      {/* Paddle body */}
      <path 
        d="M5,4 C5,2.89543 5.89543,2 7,2 H17 C18.1046,2 19,2.89543 19,4 V12 C19,13.1046 18.1046,14 17,14 H7 C5.89543,14 5,13.1046 5,12 V4 Z" 
        fill={fill ? color + '20' : 'none'} 
        stroke={color}
      />
      
      {/* Paddle texture */}
      <path 
        d="M8.5,5.5 L15.5,5.5 M8.5,8 L15.5,8 M8.5,10.5 L15.5,10.5" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6}
      />

      {/* Paddle holes */}
      <circle cx="12" cy="6" r="0.6" fill={color} />
      <circle cx="12" cy="8" r="0.6" fill={color} />
      <circle cx="12" cy="10" r="0.6" fill={color} />
      <circle cx="10" cy="6" r="0.6" fill={color} />
      <circle cx="14" cy="6" r="0.6" fill={color} />
      <circle cx="10" cy="10" r="0.6" fill={color} />
      <circle cx="14" cy="10" r="0.6" fill={color} />
      
      {/* Grip wrap */}
      <path 
        d="M11,16.5 L13,16.5 M11,17.5 L13,17.5 M11,18.5 L13,18.5 M11,19.5 L13,19.5 M11,20.5 L13,20.5" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6}
      />
      
      {/* Motion line */}
      <path 
        d="M19,8 C21,10 21.5,13 20,15" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6} 
        strokeDasharray="1,2" 
        fill="none"
      />
    </svg>
  );
};

export default PaddleIcon;