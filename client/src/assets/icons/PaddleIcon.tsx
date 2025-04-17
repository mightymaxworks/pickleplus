/**
 * @component PaddleIcon
 * @layer UI
 * @version 1.0.0
 * @description Custom pickleball paddle icon with handle and texture
 */
import React from 'react';

interface PaddleIconProps {
  size?: number;
  color?: string;
  className?: string;
  fill?: boolean;
  accentColor?: string;
  rotation?: number;
}

export const PaddleIcon: React.FC<PaddleIconProps> = ({
  size = 24,
  color = "currentColor",
  className = "",
  fill = false,
  accentColor,
  rotation = 0
}) => {
  // Use primary color if accentColor is not provided
  const accent = accentColor || "#FF6600";
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
      data-component="paddle-icon"
    >
      {/* Paddle Handle */}
      <rect 
        x="10.5" 
        y="16" 
        width="3" 
        height="7" 
        rx="1.5" 
        fill={fill ? accent : "none"} 
        stroke={color} 
        strokeWidth="1.5" 
      />
      
      {/* Paddle Face */}
      <rect 
        x="5" 
        y="2" 
        width="14" 
        height="14" 
        rx="7" 
        fill={fill ? accent : "none"} 
        stroke={color} 
        strokeWidth="1.5" 
      />
      
      {/* Handle Grip Texture */}
      {!fill && (
        <>
          <line x1="11" y1="18" x2="13" y2="18" stroke={color} strokeWidth="0.75" />
          <line x1="11" y1="19.5" x2="13" y2="19.5" stroke={color} strokeWidth="0.75" />
          <line x1="11" y1="21" x2="13" y2="21" stroke={color} strokeWidth="0.75" />
        </>
      )}
      
      {/* Paddle Face Texture/Pattern */}
      <circle 
        cx="12" 
        cy="9" 
        r="4" 
        stroke={fill ? "#ffffff" : color} 
        strokeWidth="1" 
        strokeDasharray={fill ? "1 1" : "none"}
      />
      
      {/* Holes/Texture */}
      <g fill={fill ? "#ffffff" : color}>
        <circle cx="10" cy="7" r="0.5" />
        <circle cx="14" cy="7" r="0.5" />
        <circle cx="10" cy="11" r="0.5" />
        <circle cx="14" cy="11" r="0.5" />
        <circle cx="12" cy="5" r="0.5" />
        <circle cx="12" cy="13" r="0.5" />
        <circle cx="8" cy="9" r="0.5" />
        <circle cx="16" cy="9" r="0.5" />
      </g>
    </svg>
  );
};

export default PaddleIcon;