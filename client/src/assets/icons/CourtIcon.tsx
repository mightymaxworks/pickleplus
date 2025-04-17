/**
 * @component CourtIcon
 * @layer UI
 * @version 1.0.0
 * @description Pickleball court layout icon with customizable colors
 */
import React from 'react';

interface CourtIconProps {
  size?: number;
  color?: string;
  className?: string;
  courtColor?: string;
  lineColor?: string;
  netColor?: string;
  kitchenColor?: string;
  showPlayers?: boolean;
  playerColor?: string;
}

export const CourtIcon: React.FC<CourtIconProps> = ({
  size = 24,
  color = "currentColor",
  className = "",
  courtColor = "#88d498",
  lineColor,
  netColor,
  kitchenColor = "rgba(255, 102, 0, 0.15)",
  showPlayers = false,
  playerColor
}) => {
  // Default colors based on the main color if not specified
  const lines = lineColor || color;
  const net = netColor || color;
  const players = playerColor || "#FF6600";
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-component="court-icon"
    >
      {/* Court background */}
      <rect x="2" y="4" width="20" height="16" fill={courtColor} />
      
      {/* Court outline */}
      <rect x="2" y="4" width="20" height="16" stroke={lines} strokeWidth="1" fill="none" />
      
      {/* Center line */}
      <line x1="12" y1="4" x2="12" y2="20" stroke={lines} strokeWidth="0.75" strokeDasharray="0.5 0.5" />
      
      {/* Net */}
      <rect x="11.5" y="4" width="1" height="16" fill={net} />
      
      {/* Kitchen zones (non-volley zones) */}
      <rect x="2" y="4" width="7" height="7" fill={kitchenColor} />
      <rect x="2" y="13" width="7" height="7" fill={kitchenColor} />
      <rect x="15" y="4" width="7" height="7" fill={kitchenColor} />
      <rect x="15" y="13" width="7" height="7" fill={kitchenColor} />
      
      {/* Kitchen lines */}
      <line x1="9" y1="4" x2="9" y2="20" stroke={lines} strokeWidth="0.75" />
      <line x1="15" y1="4" x2="15" y2="20" stroke={lines} strokeWidth="0.75" />
      <line x1="2" y1="11" x2="9" y2="11" stroke={lines} strokeWidth="0.75" />
      <line x1="15" y1="11" x2="22" y2="11" stroke={lines} strokeWidth="0.75" />
      <line x1="2" y1="13" x2="9" y2="13" stroke={lines} strokeWidth="0.75" />
      <line x1="15" y1="13" x2="22" y2="13" stroke={lines} strokeWidth="0.75" />
      
      {/* Players if enabled */}
      {showPlayers && (
        <>
          {/* Team 1 - Side 1 */}
          <circle cx="5.5" cy="8" r="1" fill={players} />
          <circle cx="5.5" cy="16" r="1" fill={players} />
          
          {/* Team 2 - Side 2 */}
          <circle cx="18.5" cy="8" r="1" fill={players} />
          <circle cx="18.5" cy="16" r="1" fill={players} />
        </>
      )}
    </svg>
  );
};

export default CourtIcon;