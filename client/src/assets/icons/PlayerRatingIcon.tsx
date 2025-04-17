/**
 * @component PlayerRatingIcon
 * @layer UI
 * @version 1.0.0
 * @description Dynamic player rating visualization that can show different rating levels
 */
import React from 'react';

interface PlayerRatingIconProps {
  size?: number;
  color?: string;
  className?: string;
  rating?: number;
  maxRating?: number;
  showValue?: boolean;
  fillColor?: string;
}

export const PlayerRatingIcon: React.FC<PlayerRatingIconProps> = ({
  size = 24,
  color = "currentColor",
  className = "",
  rating = 3.5,
  maxRating = 5.0,
  showValue = false,
  fillColor
}) => {
  // Use primary color if fillColor is not provided
  const fill = fillColor || "#FF6600";
  
  // Normalize rating between 0 and 1 for calculations
  const normalizedRating = Math.min(Math.max(rating, 0), maxRating) / maxRating;
  
  // Calculate which segments to fill based on normalized rating
  // We'll use 5 segments for the visualization
  const segmentFills = [];
  for (let i = 0; i < 5; i++) {
    // Each segment represents 20% of the max rating
    const segmentThreshold = (i + 1) / 5;
    if (normalizedRating >= segmentThreshold) {
      // Full segment
      segmentFills.push(1);
    } else if (normalizedRating > (i / 5) && normalizedRating < segmentThreshold) {
      // Partial segment
      segmentFills.push((normalizedRating - (i / 5)) * 5);
    } else {
      // Empty segment
      segmentFills.push(0);
    }
  }
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-component="player-rating-icon"
    >
      {/* Background Circle */}
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.2" />
      
      {/* Rating Segments */}
      <g transform="translate(12, 12)">
        {/* First segment (0-20%) */}
        <path
          d="M0,0 L10,0 A10,10 0 0 1 5,8.66 z"
          fill={segmentFills[0] > 0 ? fill : "none"}
          fillOpacity={segmentFills[0]}
          stroke={color}
          strokeWidth="1"
        />
        
        {/* Second segment (20-40%) */}
        <path
          d="M0,0 L5,8.66 A10,10 0 0 1 -5,8.66 z"
          fill={segmentFills[1] > 0 ? fill : "none"}
          fillOpacity={segmentFills[1]}
          stroke={color}
          strokeWidth="1"
        />
        
        {/* Third segment (40-60%) */}
        <path
          d="M0,0 L-5,8.66 A10,10 0 0 1 -10,0 z"
          fill={segmentFills[2] > 0 ? fill : "none"}
          fillOpacity={segmentFills[2]}
          stroke={color}
          strokeWidth="1"
        />
        
        {/* Fourth segment (60-80%) */}
        <path
          d="M0,0 L-10,0 A10,10 0 0 1 -5,-8.66 z"
          fill={segmentFills[3] > 0 ? fill : "none"}
          fillOpacity={segmentFills[3]}
          stroke={color}
          strokeWidth="1"
        />
        
        {/* Fifth segment (80-100%) */}
        <path
          d="M0,0 L-5,-8.66 A10,10 0 0 1 10,0 z"
          fill={segmentFills[4] > 0 ? fill : "none"}
          fillOpacity={segmentFills[4]}
          stroke={color}
          strokeWidth="1"
        />
      </g>
      
      {/* Rating Value */}
      {showValue && (
        <text
          x="12"
          y="13"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={size * 0.25}
          fontWeight="bold"
        >
          {rating.toFixed(1)}
        </text>
      )}
    </svg>
  );
};

export default PlayerRatingIcon;