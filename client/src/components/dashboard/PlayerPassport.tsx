import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Trophy, Award, Star } from 'lucide-react';
import { User } from '@shared/schema';
import { OfficialPicklePlusWhiteLogo } from '@/components/icons/OfficialPicklePlusLogo';

interface PlayerPassportProps {
  user: User;
}

export function PlayerPassport({ user }: PlayerPassportProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Generate a QR code containing user's passport ID
  const qrData = JSON.stringify({
    passportId: user.passportId || `PID-${user.id}`,
    username: user.username,
    timestamp: new Date().toISOString()
  });

  // Function to get initials from display name
  const getInitials = () => {
    if (!user.displayName) return user.username.substring(0, 2).toUpperCase();
    
    const nameParts = user.displayName.split(' ');
    return nameParts.length > 1 
      ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full max-w-sm mx-auto perspective">
      <motion.div 
        className={`preserve-3d cursor-pointer relative ${isFlipped ? 'passport-card-rotate' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.8s' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front of passport */}
        <motion.div 
          className="bg-white rounded-xl shadow-xl overflow-hidden absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Header with logo */}
          <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] pt-3 pb-5 px-5 text-white">
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">Player Passport</div>
              <OfficialPicklePlusWhiteLogo className="h-10 w-auto" />
            </div>
            
            {/* CourtIQ badge */}
            <div className="absolute top-16 right-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-1 animate-pulse"></div>
              Powered by CourtIQ™
            </div>
            
            {/* Player info */}
            <div className="flex items-center mt-2">
              <div className="h-16 w-16 rounded-full bg-white p-0.5 mr-3 shadow-lg">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4] flex items-center justify-center text-white font-bold text-xl">
                  {getInitials()}
                </div>
              </div>
              <div>
                <div className="font-bold text-xl">{user.displayName || user.username}</div>
                <div className="flex items-center text-sm text-white/80 mt-0.5">
                  <div className="font-medium bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                    {user.skillLevel || '3.5 Intermediate+'} 
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats section */}
          <div className="p-4 sm:p-6">
            {/* XP Progress */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <div className="font-bold text-gray-700">Level {user.level || 5}</div>
                <div className="text-[#FF5722] font-medium text-sm">{user.xp || 520}/1000 XP</div>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] h-full rounded-full" 
                  style={{ width: `${Math.min((user.xp || 520) / 10, 100)}%` }}
                ></div>
              </div>
            </div>
            
            {/* CourtIQ metrics in a grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-[#FF5722]/10 border border-[#FF5722]/20 rounded-lg p-3 text-center">
                <div className="text-[#FF5722] font-bold text-lg mb-0.5">Lvl {user.level || 5}</div>
                <div className="text-xs text-gray-600">CourtIQ XP</div>
              </div>
              <div className="bg-[#2196F3]/10 border border-[#2196F3]/20 rounded-lg p-3 text-center">
                <div className="text-[#2196F3] font-bold text-lg mb-0.5">1,248</div>
                <div className="text-xs text-gray-600">CourtIQ Rating</div>
              </div>
              <div className="bg-[#673AB7]/10 border border-[#673AB7]/20 rounded-lg p-3 text-center">
                <div className="text-[#673AB7] font-bold text-lg mb-0.5">7th</div>
                <div className="text-xs text-gray-600">CourtIQ Rank</div>
              </div>
            </div>
            
            {/* Additional stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-lg p-2 text-center">
                <div className="text-[#4CAF50] font-bold text-lg">{user.totalTournaments || 3}</div>
                <div className="text-xs text-gray-600">Tournaments</div>
              </div>
              <div className="bg-[#FF9800]/10 border border-[#FF9800]/20 rounded-lg p-2 text-center">
                <div className="text-[#FF9800] font-bold text-lg">{user.totalMatches || 24}</div>
                <div className="text-xs text-gray-600">Matches Played</div>
              </div>
            </div>
            
            {/* Tap to view QR hint */}
            <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
              <div className="flex items-center">
                <span>Tap passport to view QR code</span>
                <div className="ml-1 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 animate-pulse">
                  →
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Back of passport with QR code */}
        <motion.div 
          className="bg-white rounded-xl shadow-xl overflow-hidden absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="bg-gradient-to-r from-[#2196F3] to-[#03A9F4] p-5 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl">Player Passport</h3>
              <OfficialPicklePlusWhiteLogo className="h-10 w-auto" />
            </div>
            
            <div className="text-sm mt-1 opacity-80">Scan to connect or check in at tournaments</div>
          </div>
          
          <div className="p-5 flex flex-col items-center">
            <div className="bg-white p-3 rounded-lg shadow-md mb-4">
              <QRCodeSVG 
                value={qrData}
                size={180}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "/icon-192.png",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            
            <div className="text-center mb-4">
              <div className="text-sm font-bold text-gray-700">{user.displayName || user.username}</div>
              <div className="text-xs text-gray-500">Passport ID: {user.passportId || `PID-${user.id}`}</div>
            </div>
            
            <div className="w-full grid grid-cols-3 gap-3 mb-4">
              <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-lg p-3 text-center">
                <div className="bg-[#FFD700] text-white p-2 rounded-full mx-auto mb-2 w-8 h-8 flex items-center justify-center">
                  <Trophy size={16} />
                </div>
                <div className="text-xs text-gray-600">Champion</div>
              </div>
              <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-lg p-3 text-center">
                <div className="bg-[#4CAF50] text-white p-2 rounded-full mx-auto mb-2 w-8 h-8 flex items-center justify-center">
                  <Award size={16} />
                </div>
                <div className="text-xs text-gray-600">Veteran</div>
              </div>
              <div className="bg-[#9C27B0]/10 border border-[#9C27B0]/20 rounded-lg p-3 text-center">
                <div className="bg-[#9C27B0] text-white p-2 rounded-full mx-auto mb-2 w-8 h-8 flex items-center justify-center">
                  <Star size={16} />
                </div>
                <div className="text-xs text-gray-600">All-Star</div>
              </div>
            </div>
            
            {/* Location */}
            <div className="text-center mt-2">
              <div className="inline-block bg-[#FF5722]/10 rounded-full px-3 py-2 text-sm">
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1 text-[#FF5722]" />
                  <span className="text-gray-700">{user.location || 'Westside Pickleball Club'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}