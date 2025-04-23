/**
 * PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker
 * 
 * BounceStatusTicker - A modern ticker component that displays real-time information
 * about pickleball tips, recent community joins, and achievement unlocks.
 * 
 * @version 2.0.0
 * @framework Framework5.3
 */

import { useState, useEffect } from 'react';
import { Lightbulb, Trophy, UserPlus, Award, Calendar } from 'lucide-react';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

// Import CSS for ticker animations and styles
import './bounce-status-ticker.css';

interface BounceStatusTickerProps {
  className?: string;
  compact?: boolean;
}

// PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker
// Types for community activity and pickleball tips
interface PickleballTip {
  id: number;
  tipContent: string;
  source?: string;
  isActive: boolean;
  displayPriority: number;
}

interface CommunityActivity {
  type: 'join' | 'achievement';
  userId: number;
  username: string;
  displayName?: string;
  timestamp: string;
  achievementName?: string;
}

type TickerItem = 
  | { type: 'tip'; content: string; source?: string }
  | { type: 'activity'; activity: CommunityActivity };

export const BounceStatusTicker = ({ 
  className = '',
  compact = false
}: BounceStatusTickerProps) => {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Fetch community activity and pickleball tips
    const fetchTickerContent = async () => {
      setIsLoading(true);
      
      try {
        // Fetch pickleball tips from API
        const tipsResponse = await fetch('/api/referrals/tips');
        let tips: PickleballTip[] = [];
        
        if (tipsResponse.ok) {
          const tipsData = await tipsResponse.json();
          tips = tipsData.tips || [];
        }
        
        // Get fallback tips if API fails or returns empty array
        if (tips.length === 0) {
          tips = getDefaultPickleballTips();
        }
        
        // Fetch community activity (recent joins and achievements)
        const activityResponse = await fetch('/api/referrals/activity');
        let activity: CommunityActivity[] = [];
        
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          activity = activityData.activity || [];
        }
        
        // Get fallback activity if API fails or returns empty array
        if (activity.length === 0) {
          activity = getDefaultCommunityActivity();
        }
        
        // Combine tips and activity into a unified ticker items array
        const tickerItemsArray: TickerItem[] = [
          ...tips.map(tip => ({ 
            type: 'tip' as const, 
            content: tip.tipContent,
            source: tip.source
          })),
          ...activity.map(act => ({ 
            type: 'activity' as const, 
            activity: act 
          }))
        ];
        
        // Shuffle the array to mix tips and activity
        const shuffledItems = shuffleArray([...tickerItemsArray]);
        
        setTickerItems(shuffledItems);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching ticker content:', error);
        
        // Use default content if API fails
        const defaultTips = getDefaultPickleballTips().map(tip => ({ 
          type: 'tip' as const, 
          content: tip.tipContent,
          source: tip.source
        }));
        
        const defaultActivity = getDefaultCommunityActivity().map(act => ({ 
          type: 'activity' as const, 
          activity: act 
        }));
        
        setTickerItems([...defaultTips, ...defaultActivity]);
        setIsLoading(false);
      }
    };

    fetchTickerContent();

    // Rotate items every 3 seconds for tips, 5 seconds for activity
    const intervalId = setInterval(() => {
      setCurrentItemIndex((prevIndex) => {
        // Calculate next index
        const nextIndex = prevIndex === tickerItems.length - 1 ? 0 : prevIndex + 1;
        
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  // Helper function to get default pickleball tips if API fails
  const getDefaultPickleballTips = (): PickleballTip[] => {
    return [
      { 
        id: 1, 
        tipContent: "For better control, hold your paddle with a continental grip.", 
        isActive: true, 
        displayPriority: 10 
      },
      { 
        id: 2, 
        tipContent: "Keep your non-dominant hand up for balance during shots.", 
        isActive: true, 
        displayPriority: 10 
      },
      { 
        id: 3, 
        tipContent: "When serving, aim deep to push your opponent back.", 
        isActive: true, 
        displayPriority: 10 
      },
      { 
        id: 4, 
        tipContent: "The third shot drop is essential for transitioning to the net.", 
        source: "Coach Mike's Tips", 
        isActive: true, 
        displayPriority: 10 
      },
      { 
        id: 5, 
        tipContent: "Practice dinking to improve your soft game at the kitchen line.", 
        isActive: true, 
        displayPriority: 10 
      }
    ];
  };

  // Helper function to get default community activity if API fails
  const getDefaultCommunityActivity = (): CommunityActivity[] => {
    return [
      {
        type: 'join',
        userId: 123,
        username: 'picklemaster',
        displayName: 'Sarah Jones',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString() // 15 minutes ago
      },
      {
        type: 'achievement',
        userId: 456,
        username: 'dinkingqueen',
        displayName: 'Tracy Williams',
        achievementName: 'First Steps',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString() // 30 minutes ago
      },
      {
        type: 'join',
        userId: 789,
        username: 'smashking',
        displayName: 'Robert Chen',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString() // 2 hours ago
      }
    ];
  };

  // Helper function to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Function to format activity message
  const formatActivityMessage = (activity: CommunityActivity): string => {
    if (activity.type === 'join') {
      return `${activity.displayName || activity.username} joined Pickle+`;
    } else if (activity.type === 'achievement') {
      return `${activity.displayName || activity.username} earned the "${activity.achievementName}" achievement`;
    }
    return '';
  };

  // Function to format time ago
  const formatTimeAgo = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-r from-green-900/90 to-green-800/90 dark:from-green-900 dark:to-black rounded-md shadow-md border border-green-700/30 dark:border-green-700/50 ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-600"></div>
        <div className="flex items-center justify-center px-4 py-3">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-green-700 h-8 w-8"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-2 bg-green-700 rounded w-3/4"></div>
              <div className="h-2 bg-green-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tickerItems.length === 0) {
    return null;
  }

  const currentItem = tickerItems[currentItemIndex];

  // Compact view for smaller devices
  if (compact) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-r from-green-900/90 to-green-800/90 dark:from-green-900 dark:to-black rounded-md shadow-md border border-green-700/30 dark:border-green-700/50 ${className}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-600"></div>
        <div className="flex items-center px-3 py-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
            <div className="text-xs text-lime-400 font-mono">LIVE</div>
          </div>
          <div className="ml-2 text-white text-xs truncate">
            {currentItem.type === 'tip' ? (
              <span>Pickle Tip: {truncateText(currentItem.content, 30)}</span>
            ) : (
              <span>Community: {truncateText(formatActivityMessage(currentItem.activity), 30)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative overflow-hidden bg-gradient-to-r from-green-900/90 to-green-800/90 dark:from-green-900 dark:to-black rounded-md shadow-md border border-green-700/30 dark:border-green-700/50 ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-600"></div>
      <div className="absolute top-1 right-2 flex items-center gap-1 z-10">
        <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
        <div className="text-xs text-lime-400 font-mono">LIVE</div>
      </div>
      <div className="flex items-center px-4 py-3">
        <div className="mr-3 bg-gradient-to-r from-lime-500 to-green-600 p-1.5 rounded-full text-white">
          {currentItem.type === 'tip' ? (
            <Lightbulb size={16} />
          ) : currentItem.activity.type === 'join' ? (
            <UserPlus size={16} />
          ) : (
            <Award size={16} />
          )}
        </div>
        <div className="relative overflow-hidden flex-1">
          {currentItem.type === 'tip' ? (
            <div className="ticker-item">
              <span className="text-lime-400 font-medium mr-2">PICKLE TIP:</span>
              <span className="text-white text-sm">
                {currentItem.content}
                {currentItem.source && <span className="text-lime-200 ml-1 italic text-xs"> - {currentItem.source}</span>}
              </span>
            </div>
          ) : (
            <div className="ticker-item">
              <span className="text-lime-400 font-medium mr-2">
                {currentItem.activity.type === 'join' ? 'NEW PLAYER:' : 'ACHIEVEMENT:'}
              </span>
              <span className="text-white text-sm">
                {formatActivityMessage(currentItem.activity)}
                <span className="text-lime-200 ml-1 italic text-xs">
                  {formatTimeAgo(currentItem.activity.timestamp)}
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="hidden md:flex items-center ml-3 pl-3 border-l border-green-700/30">
          <button 
            onClick={() => {
              setLocation('/refer');
            }}
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

// Helper function to truncate text for compact view
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export default BounceStatusTicker;