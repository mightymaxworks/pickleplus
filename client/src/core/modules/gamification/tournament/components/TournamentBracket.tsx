/**
 * PKL-278651-GAME-0002-TOURN
 * Tournament Bracket Component
 * 
 * This component renders an interactive tournament bracket
 * that allows users to discover features through exploration.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Info, Trophy, Users, Clock, BarChart } from 'lucide-react';
import { BracketPosition, BracketPositionType } from '../types';

export interface TournamentBracketProps {
  rounds?: number;
  highlightPositions?: number[];
  discoveredPositions?: BracketPosition[];
  onPositionClick?: (position: BracketPosition) => void;
  animateUndiscovered?: boolean;
  className?: string;
}

/**
 * Icons for different bracket position types
 */
const POSITION_ICONS: Record<BracketPositionType, React.ReactNode> = {
  'single-elimination': <Trophy size={20} />,
  'round-robin': <Users size={20} />,
  'consolation': <Award size={20} />,
  'seeding': <BarChart size={20} />,
  'live-scoring': <Clock size={20} />,
  'leaderboard': <Info size={20} />
};

/**
 * Tournament Bracket Component
 * 
 * Interactive visualization of a tournament bracket structure
 * with discoverable positions that reveal tournament features.
 */
const TournamentBracket: React.FC<TournamentBracketProps> = ({
  rounds = 3,
  highlightPositions = [],
  discoveredPositions = [],
  onPositionClick,
  animateUndiscovered = true,
  className = ''
}) => {
  // State for hover feedback
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);
  
  // Generate a bracket structure based on rounds
  const bracketStructure = useMemo(() => {
    const structure: { round: number; position: number; x: number; y: number }[] = [];
    
    // Generate positions for each round
    for (let round = 1; round <= rounds; round++) {
      const matchesInRound = Math.pow(2, rounds - round);
      
      for (let match = 0; match < matchesInRound; match++) {
        const position = structure.length + 1;
        
        // Calculate x and y coordinates
        const x = (round - 1) / (rounds - 1);
        const y = match / matchesInRound + 1 / (matchesInRound * 2);
        
        structure.push({ round, position, x, y });
      }
    }
    
    return structure;
  }, [rounds]);
  
  // Generate sample bracket positions if not provided
  const bracketPositions = useMemo(() => {
    // If discovery positions are provided, use them
    if (discoveredPositions.length > 0) {
      return discoveredPositions;
    }
    
    // Otherwise, generate sample positions for demo
    const positions: BracketPosition[] = [
      {
        id: 1,
        code: 'TOURN-SINGLE-ELIM',
        type: 'single-elimination',
        name: 'Single Elimination Format',
        description: 'Tournament featuring knockout rounds where losers are eliminated.',
        coordinates: { x: 0.1, y: 0.3 },
        difficulty: 'easy',
        isDiscovered: false
      },
      {
        id: 2,
        code: 'TOURN-ROUND-ROBIN',
        type: 'round-robin',
        name: 'Round Robin Format',
        description: 'Everyone plays against everyone in the group stages.',
        coordinates: { x: 0.3, y: 0.7 },
        difficulty: 'medium',
        isDiscovered: false
      },
      {
        id: 3,
        code: 'TOURN-CONSOLATION',
        type: 'consolation',
        name: 'Consolation Brackets',
        description: 'Losers continue playing in a separate bracket for rankings.',
        coordinates: { x: 0.5, y: 0.2 },
        difficulty: 'medium',
        isDiscovered: false
      },
      {
        id: 4,
        code: 'TOURN-SEEDING',
        type: 'seeding',
        name: 'Skill-Based Seeding',
        description: 'Players are placed in brackets based on their skill ratings.',
        coordinates: { x: 0.7, y: 0.6 },
        difficulty: 'hard',
        isDiscovered: false
      },
      {
        id: 5,
        code: 'TOURN-LIVE-SCORING',
        type: 'live-scoring',
        name: 'Live Scoring Updates',
        description: 'Real-time match scores and updates throughout the tournament.',
        coordinates: { x: 0.8, y: 0.4 },
        difficulty: 'hard',
        isDiscovered: false
      },
      {
        id: 6,
        code: 'TOURN-LEADERBOARD',
        type: 'leaderboard',
        name: 'Tournament Leaderboards',
        description: 'Track your progress and rankings throughout the tournament.',
        coordinates: { x: 0.5, y: 0.8 },
        difficulty: 'hard',
        isDiscovered: false
      }
    ];
    
    return positions;
  }, [discoveredPositions]);
  
  // Handle bracket position click
  const handlePositionClick = useCallback((position: BracketPosition) => {
    if (onPositionClick) {
      onPositionClick(position);
    }
  }, [onPositionClick]);
  
  return (
    <div className={`relative w-full aspect-[16/9] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Bracket lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1 1" preserveAspectRatio="none">
        {bracketStructure.map((node, index) => {
          // Connect with next round if not final
          if (node.round < rounds) {
            const nextRound = bracketStructure.find(
              n => n.round === node.round + 1 && 
              Math.floor((node.position - 1) / 2) === Math.floor((n.position - 1) / 2)
            );
            
            if (nextRound) {
              return (
                <line
                  key={`line-${index}`}
                  x1={node.x}
                  y1={node.y}
                  x2={nextRound.x}
                  y2={nextRound.y}
                  stroke="#CBD5E1"
                  strokeWidth="0.003"
                  strokeDasharray={highlightPositions.includes(node.position) ? "0.01" : ""}
                />
              );
            }
          }
          return null;
        })}
      </svg>
      
      {/* Bracket nodes */}
      <div className="absolute inset-0">
        {bracketStructure.map((node) => (
          <div
            key={`node-${node.position}`}
            className="absolute w-3 h-3 bg-white border border-gray-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${node.x * 100}%`, 
              top: `${node.y * 100}%`,
              backgroundColor: highlightPositions.includes(node.position) ? '#4F46E5' : '#FFFFFF',
              borderColor: highlightPositions.includes(node.position) ? '#4338CA' : '#CBD5E1'
            }}
          />
        ))}
      </div>
      
      {/* Discovery positions */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {bracketPositions.map((position) => {
            const isHighlighted = hoveredPosition === position.id;
            const isDiscovered = position.isDiscovered;
            
            return (
              <motion.div
                key={`discovery-${position.id}`}
                className={`absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                  isDiscovered ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ 
                  left: `${position.coordinates.x * 100}%`, 
                  top: `${position.coordinates.y * 100}%` 
                }}
                animate={
                  animateUndiscovered && !isDiscovered
                    ? {
                        scale: [1, 1.05, 1],
                        transition: { 
                          repeat: Infinity, 
                          duration: 2,
                          repeatType: 'loop'
                        }
                      }
                    : {}
                }
                whileHover={{ scale: 1.1 }}
                onClick={() => handlePositionClick(position)}
                onMouseEnter={() => setHoveredPosition(position.id)}
                onMouseLeave={() => setHoveredPosition(null)}
              >
                <div className={`
                  w-full h-full rounded-full flex items-center justify-center
                  ${isDiscovered 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                    : position.difficulty === 'easy'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : position.difficulty === 'medium'
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white'
                        : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                  }
                  ${isHighlighted ? 'ring-4 ring-white ring-opacity-50' : ''}
                  shadow-md
                `}>
                  {POSITION_ICONS[position.type]}
                </div>
                
                {/* Tooltip */}
                <AnimatePresence>
                  {isHighlighted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white text-gray-900 p-2 rounded-md shadow-lg z-10 w-48"
                    >
                      <div className="font-bold text-sm">{position.name}</div>
                      {isDiscovered && (
                        <div className="text-xs mt-1 text-gray-600">
                          {position.description}
                        </div>
                      )}
                      {!isDiscovered && (
                        <div className="text-xs mt-1 text-gray-600">
                          Click to discover this tournament feature
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TournamentBracket;