/**
 * PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker
 * PKL-278651-COMM-0007.1 - Content and Speed Improvements
 * 
 * Simplified BounceStatusTicker - A scrolling ticker that shows pickleball tips
 * and community activity with contextual content based on page.
 * 
 * @version 1.1.0
 * @framework Framework5.3
 * @lastModified 2025-04-24
 */

import { useState, useEffect } from 'react';
import { Lightbulb, UserPlus } from 'lucide-react';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import './bounce-status-ticker.css';

interface BounceStatusTickerProps {
  className?: string;
  compact?: boolean;
}

// Type definitions
interface PickleballTip {
  id: number;
  tip: string; // Match the property name from the server response
  priority?: number;
  source?: string;
}

interface CommunityActivity {
  type: 'join' | 'achievement';
  username: string;
  displayName?: string;
  timestamp: string;
  achievementName?: string;
}

export const BounceStatusTicker = ({ 
  className = '',
  compact = false
}: BounceStatusTickerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tickerText, setTickerText] = useState('');
  const [, setLocation] = useLocation();
  const [currentPath, setCurrentPath] = useState('/');

  // Update current path for contextual messages
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  // Helper function to get contextual messages based on current page
  const getContextualMessages = (path: string): string[] => {
    // Default action-oriented messages that apply everywhere
    const actionMessages = [
      '🔥 Record matches regularly to improve your CourtIQ™ score',
      '💪 Complete your player profile to get matched with compatible partners',
      '🌟 Earn XP by participating in community events and tournaments'
    ];
    
    // Page-specific contextual messages
    if (path.includes('/dashboard')) {
      return [
        '📊 Your win rate is displayed in the statistics card below',
        '📈 CourtIQ™ ratings update after every 5 matches you play',
        ...actionMessages
      ];
    } else if (path.includes('/matches')) {
      return [
        '🏆 Record your matches to track your progress over time',
        '📱 Use the quick match button to log matches in seconds',
        '📊 Match history shows your performance trends',
        ...actionMessages
      ];
    } else if (path.includes('/refer')) {
      return [
        '🎁 Earn 20-40 XP for each friend who joins with your referral code',
        '🏅 Refer 5 friends to earn the "Influencer" badge and 50 XP',
        '🏆 Reach 30 referrals to become a "Community Legend"',
        ...actionMessages
      ];
    } else if (path.includes('/profile')) {
      return [
        '🔄 Update your preferences to find better match partners',
        '📝 A complete profile increases your visibility in the community',
        '🏆 Showcase your achievements on your profile page',
        ...actionMessages
      ];
    } else {
      return actionMessages;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch tips
        const tipsResponse = await fetch('/api/referrals/tips');
        const tipsData = tipsResponse.ok ? await tipsResponse.json() : { tips: [] };
        
        // Fetch activity
        const activityResponse = await fetch('/api/referrals/activity');
        const activityData = activityResponse.ok ? await activityResponse.json() : { activity: [] };
        
        // Get contextual messages for current page
        const contextualMessages = getContextualMessages(currentPath);
        
        // Format the ticker text
        let text = '';
        
        // Add contextual messages first
        contextualMessages.forEach(message => {
          text += `${message} • `;
        });
        
        // Add tips
        if (tipsData && Array.isArray(tipsData) && tipsData.length > 0) {
          // Randomize the tips order
          const shuffledTips = [...tipsData].sort(() => 0.5 - Math.random());
          
          // Use the randomized tips
          shuffledTips.forEach((tip: PickleballTip) => {
            text += `${tip.tip || ''} • `;
          });
        } else {
          // Fallback tips
          text += 'Keep your paddle up and ready between shots for quicker reactions • ';
          text += 'Position yourself in the middle of the court when your partner is returning serve • ';
          text += 'For better control, hold your paddle with a continental grip • ';
          text += 'Practice third shot drops to improve your transition game • ';
        }
        
        // Add activity
        if (activityData.activity && activityData.activity.length > 0) {
          activityData.activity.forEach((activity: CommunityActivity) => {
            if (activity.type === 'join') {
              text += `${activity.displayName || activity.username} joined Pickle+ • `;
            } else if (activity.type === 'achievement') {
              text += `${activity.displayName || activity.username} earned "${activity.achievementName}" • `;
            }
          });
        }
        
        setTickerText(text);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching ticker data:', error);
        // Fallback text with contextual messages
        const contextualMessages = getContextualMessages(currentPath);
        let fallbackText = '';
        contextualMessages.forEach(message => {
          fallbackText += `${message} • `;
        });
        fallbackText += 'Keep your paddle up and ready between shots for quicker reactions • Practice dinking to improve your soft game at the kitchen line • ';
        setTickerText(fallbackText);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentPath]);

  if (isLoading) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-r from-green-900/90 to-green-800/90 rounded-md shadow-md border border-green-700/30 ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-600"></div>
        <div className="flex items-center p-3">
          <div className="animate-pulse h-4 w-3/4 bg-green-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Simple version for compact view
  if (compact) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-r from-green-900/90 to-green-800/90 rounded-md shadow-md border border-green-700/30 ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-600"></div>
        <div className="flex items-center p-2">
          <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
          <div className="ticker-container ml-2 text-white text-xs">
            <div className="ticker-content">{tickerText}</div>
          </div>
        </div>
      </div>
    );
  }

  // Standard view
  return (
    <div className={`relative overflow-hidden bg-gradient-to-r from-green-900/90 to-green-800/90 rounded-md shadow-md border border-green-700/30 ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-600"></div>
      <div className="absolute top-1 right-2 flex items-center gap-1 z-10">
        <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
        <div className="text-xs text-lime-400 font-mono">LIVE</div>
      </div>
      <div className="flex items-center px-4 py-3">
        <div className="mr-3 bg-gradient-to-r from-lime-500 to-green-600 p-1.5 rounded-full text-white">
          <Lightbulb size={16} />
        </div>
        <div className="ticker-container flex-1 h-6">
          <div className="ticker-content text-white text-sm">{tickerText}</div>
        </div>
        <div className="hidden md:flex items-center ml-3 pl-3 border-l border-green-700/30">
          <button 
            onClick={() => setLocation('/refer')}
            className="ml-2 text-xs text-white bg-green-600 hover:bg-green-700 transition-colors px-2 py-1 rounded flex items-center"
          >
            <UserPlus size={12} className="mr-1" />
            Refer Friends
          </button>
        </div>
      </div>
    </div>
  );
};

export default BounceStatusTicker;