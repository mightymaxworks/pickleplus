import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PicklePlusNewLogo } from '@/components/icons/PicklePlusNewLogo';
import { Trophy, Scan, RotateCw, Loader2 } from 'lucide-react';
import { User } from '@shared/schema';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useUserGlobalRankingPosition } from '@/hooks/use-pcp-global-rankings';
import { useMatchStatistics } from '@/hooks/use-match-statistics';

// Import default avatar
import defaultAvatarPath from "@assets/Untitled design (51).png";

interface PlayerPassportProps {
  user: User;
}

export function PlayerPassport({ user }: PlayerPassportProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isExtraSmallScreen = useMediaQuery('(max-width: 350px)');
  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  const [cardHeight, setCardHeight] = useState(isSmallScreen ? 350 : 400);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  
  // Fetch real data from API
  const { data: rankingPosition, isLoading: isRankingLoading } = useUserGlobalRankingPosition(user.id);
  const { data: matchStats, isLoading: isMatchStatsLoading } = useMatchStatistics({ userId: user.id });
  
  // Get actual XP data - use fresh values over stale user object
  const userXp = user.xp || 0;
  const userLevel = user.level || 1;
  
  /**
   * PKL-278651-XP-0006-EXTEND - Extended XP Percentage Calculation
   * Calculate the correct XP percentage based on our new 100-level system
   * This matches the extended calculation in DashboardContent.tsx
   */
  const calculateXpPercentage = (xp: number, level: number) => {
    // If no XP, return 0
    if (!xp) return 0;
    
    /**
     * Get XP required for a specific level
     * This function exactly mirrors the one in DashboardContent.tsx
     * to ensure consistent calculations across the application
     */
    const getXpRequiredForLevel = (level: number): number => {
      // Define explicit thresholds for early levels (for backward compatibility)
      const earlyLevels: { [key: number]: number } = {
        1: 0,
        2: 100,
        3: 250,
        4: 500,
        5: 750,
        10: 1000,
        15: 2000,
        20: 4000
      };
      
      if (level in earlyLevels) {
        return earlyLevels[level];
      }
      
      // For levels 1-20, use the existing progression if defined
      if (level <= 20) {
        // Linear interpolation between defined points
        const lowerBound = 
          Object.keys(earlyLevels)
            .map(Number)
            .filter(l => l <= level)
            .sort((a, b) => b - a)[0] || 1;
            
        const upperBound = 
          Object.keys(earlyLevels)
            .map(Number)
            .filter(l => l > level)
            .sort((a, b) => a - b)[0] || 20;
        
        const lowerXP = earlyLevels[lowerBound];
        const upperXP = earlyLevels[upperBound];
        
        // Linear interpolation
        return Math.round(
          lowerXP + (upperXP - lowerXP) * (level - lowerBound) / (upperBound - lowerBound)
        );
      }
      
      // For levels 21-40, moderate growth: 1000 + 100 * (level - 20)^2
      if (level <= 40) {
        return 4000 + 100 * Math.pow(level - 20, 2);
      }
      
      // For levels 41-60, faster growth: quadratic formula with steeper coefficient
      if (level <= 60) {
        return 4000 + 100 * Math.pow(20, 2) + 200 * Math.pow(level - 40, 2);
      }
      
      // For levels 61-80, even faster growth
      if (level <= 80) {
        const base = 4000 + 100 * Math.pow(20, 2) + 200 * Math.pow(20, 2);
        return base + 300 * Math.pow(level - 60, 2);
      }
      
      // For levels 81-100, most challenging growth
      const base = 4000 + 100 * Math.pow(20, 2) + 200 * Math.pow(20, 2) + 300 * Math.pow(20, 2);
      return base + 500 * Math.pow(level - 80, 2);
    };
    
    // Get current level thresholds
    const currentLevelXp = getXpRequiredForLevel(level);
    const nextLevelXp = getXpRequiredForLevel(level + 1);
    
    // Calculate xp progress percentage
    const totalForLevel = nextLevelXp - currentLevelXp;
    const currentProgress = xp - currentLevelXp;
    
    return Math.min(Math.max(0, Math.floor((currentProgress / totalForLevel) * 100)), 100);
  };
  
  const xpProgressPercent = calculateXpPercentage(userXp, userLevel);
  
  // Debug log function to help us identify sizing issues
  const logDimensions = () => {
    if (frontRef.current && backRef.current) {
      console.log('Passport Card Dimensions:');
      console.log('Front height:', frontRef.current.scrollHeight);
      console.log('Back height:', backRef.current.scrollHeight);
    }
  };
  
  // Use fixed heights based on screen size
  useEffect(() => {
    let fixedHeight;
    if (isExtraSmallScreen) {
      fixedHeight = 330;
    } else if (isSmallScreen) {
      fixedHeight = 370;
    } else {
      fixedHeight = 440;
    }
    setCardHeight(fixedHeight);
    
    // Debug logging to check component heights
    const timer = setTimeout(() => {
      logDimensions();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isSmallScreen, isExtraSmallScreen]);
  
  // Load avatar URL from localStorage
  useEffect(() => {
    if (user?.id) {
      const cachedAvatarUrl = localStorage.getItem(`user_avatar_${user.id}`);
      if (cachedAvatarUrl) {
        setLocalAvatarUrl(cachedAvatarUrl);
      } else if (user.avatarUrl) {
        // If no cached avatar but user has an avatarUrl, cache it for future use
        localStorage.setItem(`user_avatar_${user.id}`, user.avatarUrl);
        setLocalAvatarUrl(user.avatarUrl);
      } else {
        setLocalAvatarUrl(null);
      }
    }
  }, [user?.id, user?.avatarUrl]);

  // Check if user is a founding member
  const isFoundingMember = user.isFoundingMember || false;
  
  // Generate QR code data
  const qrData = JSON.stringify({
    id: user.id,
    username: user.username,
    passportId: user.passportId || `${user.id}`,
    memberType: isFoundingMember ? 'founding' : 'standard'
  });
  
  // Function to get user initials
  const getInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user.username.substring(0, 2).toUpperCase();
  };
  
  // Function to get the appropriate suffix for rankings (1st, 2nd, 3rd, etc.)
  const getRankSuffix = (rank: number): string => {
    if (rank % 100 >= 11 && rank % 100 <= 13) {
      return 'th';
    }
    
    switch (rank % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  // For extra small screens, use a simpler non-flippable passport
  if (isExtraSmallScreen) {
    return (
      <div className="w-full">
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl">
          {/* Top border accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[#FF5722] to-[#FF9800]"></div>
          
          {/* Header with orange gradient */}
          <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] p-3">
            <div className="flex justify-between items-center text-white">
              <div className="font-bold text-base">
                {isFoundingMember ? "Founding Member" : "Player Passport"}
              </div>
              <PicklePlusNewLogo height="24px" width="auto" preserveAspectRatio={true} />
            </div>
            
            {/* Player info */}
            <div className="flex items-center mt-2">
              <div className="h-12 w-12 rounded-full bg-white p-0.5 mr-2 shadow">
                {localAvatarUrl || user.avatarUrl ? (
                  <div className="h-full w-full rounded-full overflow-hidden">
                    <img 
                      src={(localAvatarUrl || user.avatarUrl) as string} 
                      alt={user.username || ''} 
                      className="h-full w-full object-cover"
                      key={(localAvatarUrl || user.avatarUrl) || 'small-avatar-key'} // Force re-render when URL changes
                    />
                  </div>
                ) : (
                  <div className="h-full w-full rounded-full overflow-hidden bg-yellow-100">
                    <img 
                      src={defaultAvatarPath} 
                      alt={user.username || "User"} 
                      className="h-full w-full object-contain"
                      key="default-avatar"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <div className="font-bold text-base text-white truncate max-w-[140px]">
                  {user.displayName || user.username}
                </div>
                <div className="flex flex-wrap gap-1 text-xs text-white/90">
                  {user.duprRating ? (
                    <div className="bg-white/20 rounded-full px-2 py-0.5 flex items-center inline-block">
                      <Trophy size={10} className="text-yellow-300 mr-1" />
                      DUPR {user.duprRating}
                    </div>
                  ) : (
                    <div className="bg-white/20 rounded-full px-2 py-0.5 flex items-center inline-block">
                      <Trophy size={10} className="text-yellow-300 mr-1" />
                      CourtIQ™ Player
                    </div>
                  )}
                  <div className="bg-white/20 rounded-full px-2 py-0.5 inline-block text-xs">
                    {user.passportId ? user.passportId.replace(/PKL-|-/g, '') : user.id}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats section */}
          <div className="p-3">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Level {userLevel} • {userXp} XP
            </div>
            
            {/* XP Progress Bar */}
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-full"
                style={{ width: `${xpProgressPercent}%` }}
              ></div>
            </div>
            
            {/* Simple stats */}
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
                {isRankingLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                ) : (
                  <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                    {rankingPosition?.status === "not_ranked" 
                      ? "Ready for Action!" 
                      : rankingPosition?.status === "insufficient_data"
                        ? "Play to Earn!" 
                        : (rankingPosition?.rankingPoints?.toLocaleString() || "Get Started!")}
                  </div>
                )}
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">Matches</div>
                {isMatchStatsLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="font-bold text-sm text-green-600 dark:text-green-400">
                    {matchStats?.totalMatches || 0}
                  </div>
                )}
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">Rank</div>
                {isRankingLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
                  </div>
                ) : (
                  <div className="font-bold text-sm text-purple-600 dark:text-purple-400">
                    {rankingPosition?.rank 
                      ? `${rankingPosition.rank}${getRankSuffix(rankingPosition.rank)}` 
                      : rankingPosition?.status === "not_ranked" 
                        ? "Coming Soon!" 
                        : rankingPosition?.status === "insufficient_data" 
                          ? "In Progress" 
                          : "Join Now!"}
                  </div>
                )}
              </div>
            </div>
            
            {/* QR Code button for mobile */}
            <div className="mt-3 flex justify-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                className="flex items-center justify-center gap-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-2 rounded-lg w-full"
              >
                <Scan size={14} />
                <span>View Passport QR Code</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For normal screens, use the flippable passport
  return (
    <div className="w-full perspective cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
      <div 
        className={`relative transition-transform duration-700 preserve-3d ${isFlipped ? 'passport-card-rotate' : ''}`}
        style={{ height: `${cardHeight}px` }}
      >
        {/* Front of passport */}
        <div ref={frontRef} className="absolute inset-0 backface-hidden w-full flex flex-col bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl">
          {/* Top border accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[#FF5722] to-[#FF9800]"></div>
          
          {/* Header with orange gradient */}
          <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] p-4">
            <div className="flex justify-between items-center text-white">
              <div className="font-bold text-lg">
                {isFoundingMember ? "Founding Member" : "Player Passport"}
              </div>
              <PicklePlusNewLogo height="32px" width="auto" preserveAspectRatio={true} />
            </div>
            
            {/* Player info */}
            <div className="flex items-center mt-3">
              <div className="h-16 w-16 rounded-full bg-white p-0.5 mr-3 shadow">
                {localAvatarUrl || user.avatarUrl ? (
                  <div className="h-full w-full rounded-full overflow-hidden">
                    <img 
                      src={(localAvatarUrl || user.avatarUrl) as string} 
                      alt={user.username || ''} 
                      className="h-full w-full object-cover"
                      key={(localAvatarUrl || user.avatarUrl) || 'large-avatar-key'} // Force re-render when URL changes
                    />
                  </div>
                ) : (
                  <div className="h-full w-full rounded-full overflow-hidden bg-yellow-100">
                    <img 
                      src={defaultAvatarPath} 
                      alt={user.username || "User"} 
                      className="h-full w-full object-contain"
                      key="default-avatar"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <div className="font-bold text-lg text-white">
                  {user.displayName || user.username}
                </div>
                <div className="flex flex-wrap gap-1 text-sm text-white/90">
                  {user.duprRating ? (
                    <div className="bg-white/20 rounded-full px-2 py-0.5 flex items-center inline-block">
                      <Trophy size={12} className="text-yellow-300 mr-1" />
                      DUPR {user.duprRating}
                    </div>
                  ) : (
                    <div className="bg-white/20 rounded-full px-2 py-0.5 flex items-center inline-block">
                      <Trophy size={12} className="text-yellow-300 mr-1" />
                      CourtIQ™ Player
                    </div>
                  )}
                  <div className="bg-white/20 rounded-full px-2 py-0.5 inline-block text-xs">
                    {user.passportId ? user.passportId.replace(/PKL-|-/g, '') : user.id}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats section with glass morphism effect */}
          <div className="p-4 flex-grow flex flex-col">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Level {userLevel} • {userXp} XP
            </div>
            
            {/* XP Progress Bar */}
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-full"
                style={{ width: `${xpProgressPercent}%` }}
              ></div>
            </div>
            
            {/* Simple stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
                {isRankingLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                ) : (
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {rankingPosition?.status === "not_ranked" 
                      ? "Ready for Action!" 
                      : rankingPosition?.status === "insufficient_data"
                        ? "Play to Earn!" 
                        : (rankingPosition?.rankingPoints?.toLocaleString() || "Get Started!")}
                  </div>
                )}
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Matches</div>
                {isMatchStatsLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="font-bold text-green-600 dark:text-green-400">
                    {matchStats?.totalMatches || 0}
                  </div>
                )}
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Rank</div>
                {isRankingLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
                  </div>
                ) : (
                  <div className="font-bold text-purple-600 dark:text-purple-400">
                    {rankingPosition?.rank 
                      ? `${rankingPosition.rank}${getRankSuffix(rankingPosition.rank)}` 
                      : rankingPosition?.status === "not_ranked" 
                        ? "Coming Soon!" 
                        : rankingPosition?.status === "insufficient_data" 
                          ? "In Progress" 
                          : "Join Now!"}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-auto flex justify-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                className="flex items-center justify-center gap-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-2 rounded-lg w-full"
              >
                <Scan size={14} />
                <span>View Passport QR Code</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Back of passport with QR code */}
        <div 
          ref={backRef}
          className="absolute inset-0 backface-hidden w-full flex flex-col bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
          {/* Top border accent - Gold for founding members, blue for regular members */}
          <div className={`h-1 w-full bg-gradient-to-r ${
            isFoundingMember
              ? 'from-[#BF953F] to-[#FBF5B7]'
              : 'from-[#2196F3] to-[#03A9F4]'
          }`}></div>
          
          {/* Founding member corner accents */}
          {isFoundingMember && (
            <>
              <div className="absolute top-0 left-0 w-8 h-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#FFD700]"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD700]"></div>
              </div>
              <div className="absolute top-0 right-0 w-8 h-8">
                <div className="absolute top-0 right-0 w-full h-1 bg-[#FFD700]"></div>
                <div className="absolute top-0 right-0 w-1 h-full bg-[#FFD700]"></div>
              </div>
              <div className="absolute bottom-0 left-0 w-8 h-8">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFD700]"></div>
                <div className="absolute bottom-0 left-0 w-1 h-full bg-[#FFD700]"></div>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8">
                <div className="absolute bottom-0 right-0 w-full h-1 bg-[#FFD700]"></div>
                <div className="absolute bottom-0 right-0 w-1 h-full bg-[#FFD700]"></div>
              </div>
            </>
          )}
          
          <div className={`p-3 flex-grow flex flex-col items-center h-full ${isFoundingMember ? 'qr-gold-gradient' : 'qr-blue-gradient'}`}>
            <div className="mb-2 text-center">
              <div className={`font-bold text-base sm:text-lg mb-0.5 ${
                isFoundingMember 
                  ? 'gold-shimmer' 
                  : 'text-[#2196F3]'
              }`}>
                {isFoundingMember ? "Founding Member Pass" : "Pickle+ Passport"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Scan to connect with players</div>
            </div>
            
            {/* QR code with special border for founding members */}
            <div className={`bg-white p-2 rounded-xl shadow-lg mb-2 ${
              isFoundingMember 
                ? 'border-2 border-[#FFD700]' 
                : ''
            }`}>
              <QRCodeSVG
                value={qrData}
                size={isExtraSmallScreen ? 100 : isSmallScreen ? 120 : 150}
                bgColor={"#ffffff"}
                fgColor={isFoundingMember ? "#BF953F" : "#000000"}
                level={"L"}
                includeMargin={false}
              />
            </div>
            
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              Passport Code: {user.passportId ? user.passportId.replace(/PKL-|-/g, '') : user.id}
            </div>
            
            {/* Special XP bonus notice for founding members */}
            {isFoundingMember && (
              <div className="text-center text-xs mt-1 mb-1 gold-shimmer font-medium">
                +10% XP Bonus
              </div>
            )}
            
            {/* Flex spacer */}
            <div className="flex-grow"></div>
            
            <button 
              className={`mt-auto flex items-center gap-1 transition-colors ${
                isFoundingMember
                  ? 'text-[#BF953F] hover:text-[#FFD700]'
                  : 'text-blue-500 hover:text-blue-700'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              <RotateCw size={14} />
              <span>Flip back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}