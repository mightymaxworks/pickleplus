import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PicklePlusNewLogo } from '@/components/icons/PicklePlusNewLogo';
import { Trophy, Scan, RotateCw } from 'lucide-react';
import { User } from '@shared/schema';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
                <div className={`h-full w-full rounded-full flex items-center justify-center text-white font-bold text-base ${
                  isFoundingMember 
                    ? 'bg-gradient-to-r from-[#BF953F] to-[#FBF5B7] via-[#AA771C]' 
                    : 'bg-gradient-to-r from-[#2196F3] to-[#03A9F4]'
                }`}>
                  {getInitials()}
                </div>
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
              Level {user.level || 5} • {user.xp || 520} XP
            </div>
            
            {/* XP Progress Bar */}
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-full"
                style={{ width: `${Math.min((user.xp || 520) / 10, 100)}%` }}
              ></div>
            </div>
            
            {/* Simple stats */}
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
                <div className="font-bold text-sm text-blue-600 dark:text-blue-400">1,248</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">Matches</div>
                <div className="font-bold text-sm text-green-600 dark:text-green-400">{user.totalMatches || 24}</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">Rank</div>
                <div className="font-bold text-sm text-purple-600 dark:text-purple-400">7th</div>
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
                <div className={`h-full w-full rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  isFoundingMember 
                    ? 'bg-gradient-to-r from-[#BF953F] to-[#FBF5B7] via-[#AA771C]' 
                    : 'bg-gradient-to-r from-[#2196F3] to-[#03A9F4]'
                }`}>
                  {getInitials()}
                </div>
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
              Level {user.level || 5} • {user.xp || 520} XP
            </div>
            
            {/* XP Progress Bar */}
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-full"
                style={{ width: `${Math.min((user.xp || 520) / 10, 100)}%` }}
              ></div>
            </div>
            
            {/* Simple stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
                <div className="font-bold text-blue-600 dark:text-blue-400">1,248</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Matches</div>
                <div className="font-bold text-green-600 dark:text-green-400">{user.totalMatches || 24}</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Rank</div>
                <div className="font-bold text-purple-600 dark:text-purple-400">7th</div>
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