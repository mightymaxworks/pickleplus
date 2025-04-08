import React, { useState, useEffect } from 'react';
import { User } from '@shared/schema';
import { PicklePlusNewLogo } from '../icons/PicklePlusNewLogo';
import { Trophy, Scan, RotateCw, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface PlayerPassportProps {
  user: User;
}

export function PlayerPassport({ user }: PlayerPassportProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isExtraSmallScreen = useMediaQuery('(max-width: 480px)');
  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  
  // Function to get initials from display name
  const getInitials = () => {
    if (!user.displayName) return user.username.substring(0, 2).toUpperCase();
    
    const nameParts = user.displayName.split(' ');
    return nameParts.length > 1 
      ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();
  };
  
  // Generate a QR code containing user's passport ID
  const qrData = JSON.stringify({
    passportId: user.passportId || `PID-${user.id}`,
    username: user.username,
    timestamp: new Date().toISOString()
  });
  
  // Determine if user is a founding member
  const isFoundingMember = user.id === 1;
  
  // Reset flip state when switching to mobile to avoid broken layout
  useEffect(() => {
    if (isExtraSmallScreen && isFlipped) {
      setIsFlipped(false);
    }
  }, [isExtraSmallScreen, isFlipped]);
  
  // For extremely small screens, use a simpler layout
  if (isExtraSmallScreen) {
    return (
      <div className="w-full">
        <div className="relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl">
          {/* Top border accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[#FF5722] to-[#FF9800]"></div>
          
          {/* Header with orange gradient */}
          <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] p-3">
            <div className="flex justify-between items-center text-white">
              <div className="font-bold text-base">
                {isFoundingMember ? "Founding Member" : "Player Passport"}
              </div>
              <PicklePlusNewLogo className="h-6 w-auto" />
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
                <div className="text-xs text-white/90">
                  <div className="bg-white/20 rounded-full px-2 py-0.5 flex items-center inline-block">
                    <Trophy size={10} className="text-yellow-300 mr-1" />
                    {user.skillLevel || '3.5 Intermediate+'}
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
                onClick={() => {
                  // In a real app, this would show a QR code modal or redirect to a QR view
                  alert('This would show your QR code for scanning at events!');
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
        className={`preserve-3d relative ${isFlipped ? 'passport-card-rotate' : ''}`}
        style={{ minHeight: isSmallScreen ? '250px' : '300px' }}
      >
        {/* Front of passport */}
        <div className="absolute inset-0 backface-hidden w-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl">
          {/* Top border accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[#FF5722] to-[#FF9800]"></div>
          
          {/* Header with orange gradient */}
          <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] p-4">
            <div className="flex justify-between items-center text-white">
              <div className="font-bold text-lg">
                {isFoundingMember ? "Founding Member" : "Player Passport"}
              </div>
              <PicklePlusNewLogo className="h-8 w-auto" />
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
                <div className="text-sm text-white/90">
                  <div className="bg-white/20 rounded-full px-2 py-0.5 flex items-center inline-block">
                    <Trophy size={12} className="text-yellow-300 mr-1" />
                    {user.skillLevel || '3.5 Intermediate+'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats section with glass morphism effect */}
          <div className="p-4">
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
            
            <div className="mt-4 flex justify-center">
              <div className="text-center text-sm flex items-center text-gray-500 dark:text-gray-400">
                <Scan size={15} className="mr-1" />
                Tap card to view your Pickle+ digital passport QR code
              </div>
            </div>
          </div>
        </div>
        
        {/* Back of passport with QR code */}
        <div 
          className="absolute inset-0 backface-hidden w-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl"
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
          
          <div className={`p-6 flex flex-col items-center justify-center h-full ${isFoundingMember ? 'qr-gold-gradient' : 'qr-blue-gradient'}`}>
            <div className="mb-4 text-center">
              <div className={`font-bold text-lg mb-1 ${
                isFoundingMember 
                  ? 'gold-shimmer' 
                  : 'text-[#2196F3]'
              }`}>
                {isFoundingMember ? "Founding Member Pass" : "Pickle+ Digital Passport"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Your digital identity for check-ins, events, and connections</div>
            </div>
            
            {/* QR code with special border for founding members */}
            <div className={`bg-white p-4 rounded-xl shadow-lg mb-4 ${
              isFoundingMember 
                ? 'border-2 border-[#FFD700]' 
                : ''
            }`}>
              <QRCodeSVG
                value={qrData}
                size={isSmallScreen ? 140 : 180}
                bgColor={"#ffffff"}
                fgColor={isFoundingMember ? "#BF953F" : "#000000"}
                level={"L"}
                includeMargin={false}
              />
            </div>
            
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
              Passport ID: {user.passportId || `PID-${user.id}`}
            </div>
            
            {/* Special XP bonus notice for founding members */}
            {isFoundingMember && (
              <div className="text-center text-xs mt-1 mb-3 gold-shimmer font-medium">
                +10% XP Bonus on all activities
              </div>
            )}
            
            <button 
              className={`mt-2 flex items-center gap-1 transition-colors ${
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