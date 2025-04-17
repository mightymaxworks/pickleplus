/**
 * @component PickleballIcon
 * @layer UI
 * @version 1.0.0
 * @description Custom pickleball icon with detailed hole pattern
 */
import React from 'react';

interface PickleballIconProps {
  size?: number;
  color?: string;
  className?: string;
  fill?: boolean;
  highlightColor?: string;
}

export const PickleballIcon: React.FC<PickleballIconProps> = ({
  size = 24,
  color = "currentColor",
  className = "",
  fill = false,
  highlightColor
}) => {
  // Use primary color if highlightColor is not provided
  const highlight = highlightColor || "#FF6600";
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-component="pickleball-icon"
    >
      {/* Main ball circle */}
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        fill={fill ? highlight : "none"} 
        stroke={color} 
        strokeWidth="1.5" 
      />
      
      {/* Inner pattern */}
      <g stroke={fill ? "#ffffff" : color} strokeWidth="1.2">
        {/* Vertical line */}
        <line x1="12" y1="2.5" x2="12" y2="21.5" />
        
        {/* Horizontal line */}
        <line x1="2.5" y1="12" x2="21.5" y2="12" />
        
        {/* Diagonal lines */}
        <line x1="5" y1="5" x2="19" y2="19" />
        <line x1="19" y1="5" x2="5" y2="19" />
      </g>
      
      {/* Holes */}
      <g fill={fill ? "#ffffff" : color}>
        <circle cx="12" cy="6" r="1.2" />
        <circle cx="12" cy="18" r="1.2" />
        <circle cx="6" cy="12" r="1.2" />
        <circle cx="18" cy="12" r="1.2" />
        <circle cx="7.5" cy="7.5" r="1" />
        <circle cx="16.5" cy="16.5" r="1" />
        <circle cx="16.5" cy="7.5" r="1" />
        <circle cx="7.5" cy="16.5" r="1" />
      </g>
    </svg>
  );
};

export default PickleballIcon;