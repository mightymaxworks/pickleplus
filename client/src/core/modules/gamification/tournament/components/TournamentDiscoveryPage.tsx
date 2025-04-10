/**
 * PKL-278651-GAME-0002-TOURN
 * Tournament Discovery Page
 * 
 * This component serves as the tournament feature preview page
 * with an interactive discovery experience.
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Gift, Trophy, Star, Crown, Info } from 'lucide-react';
import TournamentBracket from './TournamentBracket';
import { BracketPosition, TournamentReward } from '../types';
import { DiscoveryAlert, ProgressTracker } from '../../components';
import { useDiscoveryTracking } from '../../hooks';

/**
 * Tournament Discovery Page
 * 
 * Interactive page that showcases upcoming tournament features
 * and allows users to discover details through exploration.
 */
const TournamentDiscoveryPage: React.FC = () => {
  // State for discovery alerts
  const [showAlert, setShowAlert] = useState(false);
  const [currentReward, setCurrentReward] = useState<TournamentReward | null>(null);
  const [currentDiscovery, setCurrentDiscovery] = useState<string>('');
  
  // Use the discovery tracking hook for tournament campaign
  const {
    campaigns,
    currentCampaign,
    trackDiscovery,
    totalStats
  } = useDiscoveryTracking({
    campaignId: 1001, // Tournament campaign ID
    localStorageKey: 'pickle_plus_tournament_discoveries',
    onCampaignComplete: (campaignId) => {
      console.log(`Campaign ${campaignId} completed!`);
      // We would trigger the prize pool entry here in a full implementation
    }
  });
  
  // Generate sample tournament positions
  const [tournamentPositions, setTournamentPositions] = useState<BracketPosition[]>([
    {
      id: 1,
      code: 'TOURN-SINGLE-ELIM',
      type: 'single-elimination',
      name: 'Single Elimination Format',
      description: 'Tournament featuring knockout rounds where losers are eliminated.',
      coordinates: { x: 0.1, y: 0.3 },
      difficulty: 'easy',
      isDiscovered: false,
      reward: {
        id: 101,
        name: 'Tournament Scout',
        description: 'You discovered your first tournament feature!',
        type: 'xp',
        rarity: 'common',
        value: { xpAmount: 50 }
      }
    },
    {
      id: 2,
      code: 'TOURN-ROUND-ROBIN',
      type: 'round-robin',
      name: 'Round Robin Format',
      description: 'Everyone plays against everyone in the group stages.',
      coordinates: { x: 0.3, y: 0.7 },
      difficulty: 'medium',
      isDiscovered: false,
      reward: {
        id: 102,
        name: 'Format Expert',
        description: 'You\'re learning about tournament formats!',
        type: 'xp',
        rarity: 'uncommon',
        value: { xpAmount: 75 }
      }
    },
    {
      id: 3,
      code: 'TOURN-CONSOLATION',
      type: 'consolation',
      name: 'Consolation Brackets',
      description: 'Losers continue playing in a separate bracket for rankings.',
      coordinates: { x: 0.5, y: 0.2 },
      difficulty: 'medium',
      isDiscovered: false,
      reward: {
        id: 103,
        name: 'Bracket Master',
        description: 'You\'ve uncovered how our consolation brackets work!',
        type: 'xp',
        rarity: 'uncommon',
        value: { xpAmount: 75 }
      }
    },
    {
      id: 4,
      code: 'TOURN-SEEDING',
      type: 'seeding',
      name: 'Skill-Based Seeding',
      description: 'Players are placed in brackets based on their skill ratings.',
      coordinates: { x: 0.7, y: 0.6 },
      difficulty: 'hard',
      isDiscovered: false,
      reward: {
        id: 104,
        name: 'Seeding Specialist',
        description: 'You understand how tournament seeding works!',
        type: 'xp',
        rarity: 'rare',
        value: { xpAmount: 100 }
      }
    },
    {
      id: 5,
      code: 'TOURN-LIVE-SCORING',
      type: 'live-scoring',
      name: 'Live Scoring Updates',
      description: 'Real-time match scores and updates throughout the tournament.',
      coordinates: { x: 0.8, y: 0.4 },
      difficulty: 'hard',
      isDiscovered: false,
      reward: {
        id: 105,
        name: 'Score Tracker',
        description: 'You\'ve discovered live scoring features!',
        type: 'xp',
        rarity: 'rare',
        value: { xpAmount: 100 }
      }
    },
    {
      id: 6,
      code: 'TOURN-LEADERBOARD',
      type: 'leaderboard',
      name: 'Tournament Leaderboards',
      description: 'Track your progress and rankings throughout the tournament.',
      coordinates: { x: 0.5, y: 0.8 },
      difficulty: 'hard',
      isDiscovered: false,
      reward: {
        id: 106,
        name: 'Tournament Pioneer',
        description: 'You\'ve discovered all tournament features!',
        type: 'token',
        rarity: 'legendary',
        value: { tokenType: 'early_access' }
      }
    }
  ]);
  
  // Handle bracket position click
  const handlePositionClick = useCallback((position: BracketPosition) => {
    if (position.isDiscovered) {
      // If already discovered, just show the details
      setCurrentDiscovery(position.description);
      return;
    }
    
    // Mark as discovered in local state
    setTournamentPositions(prevPositions => 
      prevPositions.map(p => 
        p.id === position.id ? { ...p, isDiscovered: true } : p
      )
    );
    
    // Track discovery in the discovery system
    trackDiscovery(position.code);
    
    // Show reward alert
    if (position.reward) {
      setCurrentReward(position.reward);
      setCurrentDiscovery(position.description);
      setShowAlert(true);
    }
  }, [trackDiscovery]);
  
  // Calculate progress for the demo
  const discoveredCount = tournamentPositions.filter(p => p.isDiscovered).length;
  const totalPositions = tournamentPositions.length;
  const completionPercentage = Math.round((discoveredCount / totalPositions) * 100);
  const isComplete = discoveredCount === totalPositions;
  
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Page header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tournament System Coming Soon!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our upcoming tournament system by investigating the bracket below.
            Discover all features to earn exclusive early access!
          </p>
        </motion.div>
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left sidebar - Progress and stats */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Trophy className="mr-2 text-yellow-500" size={20} />
              Discovery Progress
            </h2>
            
            <ProgressTracker
              campaign={{
                id: 1001,
                name: "Tournament Explorer",
                description: "Discover all the upcoming tournament features",
                isActive: true,
                totalDiscoveries: totalPositions,
                discoveredCount: discoveredCount,
                completionPercentage: completionPercentage,
                isComplete: isComplete
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-lg p-4 border border-gray-200"
          >
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <Calendar className="mr-2 text-blue-500" size={18} />
              Tournament Preview
            </h3>
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                <span className="font-medium">Launch Date:</span>{" "}
                <span className="text-orange-600">Coming Soon</span>
              </p>
              <p>
                <span className="font-medium">Early Access:</span>{" "}
                Complete all discoveries to qualify
              </p>
              <p>
                <span className="font-medium">Prize Drawing:</span>{" "}
                Enter the drawing by finding all features
              </p>
            </div>
          </motion.div>
          
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200"
            >
              <div className="flex items-center">
                <Crown className="text-yellow-500 mr-2" size={20} />
                <h3 className="font-semibold text-lg">All Features Discovered!</h3>
              </div>
              <p className="text-sm text-gray-700 mt-2">
                Congratulations! You've been entered into our exclusive Early Access Prize Drawing!
              </p>
              <div className="mt-3 p-2 bg-white bg-opacity-60 rounded text-sm text-gray-600 border border-purple-100">
                <div className="flex items-center">
                  <Star className="text-purple-500 mr-1 flex-shrink-0" size={16} />
                  <span>Your entry has been recorded</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Main area - Tournament bracket */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">Tournament Bracket Preview</h2>
              <div className="ml-auto flex items-center text-sm text-gray-500">
                <Info size={14} className="mr-1" /> 
                Click on highlighted areas to discover features
              </div>
            </div>
            
            <TournamentBracket
              discoveredPositions={tournamentPositions}
              onPositionClick={handlePositionClick}
              animateUndiscovered={true}
              className="mb-4"
            />
            
            {currentDiscovery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md"
              >
                <h3 className="font-medium text-gray-900">Feature Details</h3>
                <p className="text-sm text-gray-600 mt-1">{currentDiscovery}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Discovery alerts */}
      {showAlert && currentReward && (
        <DiscoveryAlert
          title={`Tournament Feature Discovered!`}
          message={currentDiscovery}
          level="success"
          open={showAlert}
          autoHide={true}
          hideDelay={5000}
          reward={currentReward}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default TournamentDiscoveryPage;