/**
 * @component TournamentBracketIcon
 * @layer UI
 * @version 1.0.0
 * @description Custom tournament bracket visualization icon
 */
import React from 'react';

interface TournamentBracketIconProps {
  size?: number;
  color?: string;
  className?: string;
  fill?: boolean;
  highlightColor?: string;
  highlightPosition?: 'none' | 'final' | 'semifinal' | 'quarterfinal';
}

export const TournamentBracketIcon: React.FC<TournamentBracketIconProps> = ({
  size = 24,
  color = "currentColor",
  className = "",
  fill = false,
  highlightColor,
  highlightPosition = 'none'
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
      data-component="tournament-bracket-icon"
    >
      {/* Round 1 - Quarterfinals */}
      <line 
        x1="3" y1="4" x2="8" y2="4" 
        stroke={highlightPosition === 'quarterfinal' ? highlight : color} 
        strokeWidth="1.5" 
      />
      <line 
        x1="3" y1="8" x2="8" y2="8" 
        stroke={highlightPosition === 'quarterfinal' ? highlight : color} 
        strokeWidth="1.5" 
      />
      <line 
        x1="3" y1="16" x2="8" y2="16" 
        stroke={highlightPosition === 'quarterfinal' ? highlight : color} 
        strokeWidth="1.5" 
      />
      <line 
        x1="3" y1="20" x2="8" y2="20" 
        stroke={highlightPosition === 'quarterfinal' ? highlight : color} 
        strokeWidth="1.5" 
      />
      
      {/* Round 2 - Semifinals */}
      <line 
        x1="8" y1="4" x2="8" y2="8" 
        stroke={highlightPosition === 'quarterfinal' || highlightPosition === 'semifinal' ? highlight : color} 
        strokeWidth="1.5" 
      />
      <line 
        x1="8" y1="16" x2="8" y2="20" 
        stroke={highlightPosition === 'quarterfinal' || highlightPosition === 'semifinal' ? highlight : color} 
        strokeWidth="1.5" 
      />
      <line 
        x1="8" y1="6" x2="14" y2="6" 
        stroke={highlightPosition === 'semifinal' ? highlight : color} 
        strokeWidth="1.5" 
      />
      <line 
        x1="8" y1="18" x2="14" y2="18" 
        stroke={highlightPosition === 'semifinal' ? highlight : color} 
        strokeWidth="1.5" 
      />
      
      {/* Round 3 - Finals */}
      <line 
        x1="14" y1="6" x2="14" y2="18" 
        stroke={highlightPosition === 'semifinal' || highlightPosition === 'final' ? highlight : color} 
        strokeWidth="1.5" 
      />
      <line 
        x1="14" y1="12" x2="19" y2="12" 
        stroke={highlightPosition === 'final' ? highlight : color} 
        strokeWidth="1.5" 
      />
      
      {/* Team/Player Dots */}
      <circle 
        cx="2" cy="4" r="1.25" 
        fill={highlightPosition === 'quarterfinal' ? highlight : (fill ? color : "none")} 
        stroke={color} 
        strokeWidth="0.75" 
      />
      <circle 
        cx="2" cy="8" r="1.25" 
        fill={highlightPosition === 'quarterfinal' ? highlight : (fill ? color : "none")} 
        stroke={color} 
        strokeWidth="0.75" 
      />
      <circle 
        cx="2" cy="16" r="1.25" 
        fill={highlightPosition === 'quarterfinal' ? highlight : (fill ? color : "none")} 
        stroke={color} 
        strokeWidth="0.75" 
      />
      <circle 
        cx="2" cy="20" r="1.25" 
        fill={highlightPosition === 'quarterfinal' ? highlight : (fill ? color : "none")} 
        stroke={color} 
        strokeWidth="0.75" 
      />
      
      {/* Semifinalists */}
      <circle 
        cx="11" cy="6" r="1.25" 
        fill={highlightPosition === 'semifinal' ? highlight : (fill ? color : "none")} 
        stroke={color} 
        strokeWidth="0.75" 
      />
      <circle 
        cx="11" cy="18" r="1.25" 
        fill={highlightPosition === 'semifinal' ? highlight : (fill ? color : "none")} 
        stroke={color} 
        strokeWidth="0.75" 
      />
      
      {/* Winner */}
      <circle 
        cx="20" cy="12" r="1.5" 
        fill={highlightPosition === 'final' ? highlight : (fill ? color : "none")} 
        stroke={color} 
        strokeWidth="0.75" 
      />
      
      {/* Trophy for winner */}
      {highlightPosition === 'final' && (
        <g transform="translate(19.5, 9.5) scale(0.06)">
          <path 
            d="M8,21h8 M12,21v-4 M7,6c0-3,0-5,5-5s5,2,5,5c0,4-4,7-4,7h-2c0,0-4-3-4-7z M19,6c2,0,2-2,2-2c0-2-2-2-2-2h-2 M5,6c-2,0-2-2-2-2c0-2,2-2,2-2h2" 
            stroke={highlight} 
            strokeWidth="15" 
            fill="none" 
            strokeLinecap="round" 
          />
        </g>
      )}
    </svg>
  );
};

export default TournamentBracketIcon;