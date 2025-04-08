import { useState, useRef, useEffect } from "react";
import { User } from "@shared/schema";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Trophy, Award, Star, MapPin, Share2, Maximize2, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PicklePlusWhiteLogo } from "@/components/icons/PicklePlusWhiteLogo";

interface PlayerPassportProps {
  user: User;
}

export default function PlayerPassport({ user }: PlayerPassportProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Generate a dynamic QR code value based on the user ID
  const qrValue = `pickle-plus://passport/${user.id}/${user.passportId || "default"}`;
  
  // Toggle flip animation
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  // Handle passport expansion
  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Determine user skill level display
  const skillLevelDisplay = user.skillLevel || "Unrated";
  
  // Check if user is a founding member for special styling
  const isFoundingMember = user.isFoundingMember;
  
  // Handling clicks outside the expanded passport to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);
  
  // For expanded view, render full-screen modal
  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <motion.div 
          ref={cardRef}
          className="w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`preserve-3d ${isFlipped ? 'passport-card-rotate' : ''}`}>
            {/* Front of passport */}
            <div className={`passport-card-face bg-white rounded-xl shadow-2xl overflow-hidden ${isFlipped ? 'backface-hidden' : ''}`}>
              {/* Header with logo */}
              <div className={`bg-gradient-to-r ${isFoundingMember ? 'from-[#FF5722] to-[#FFD700]' : 'from-[#FF5722] to-[#FF9800]'} pt-4 pb-6 px-5 text-white relative`}>
                <div className="flex justify-between items-center">
                  <div className="font-bold text-lg">Player Passport</div>
                  <PicklePlusWhiteLogo className="h-10 w-auto" />
                  {isFoundingMember && (
                    <div className="absolute top-4 right-16 text-yellow-300">
                      <Sparkles size={20} />
                    </div>
                  )}
                </div>
                
                {/* CourtIQ badge */}
                <div className="absolute top-16 right-3 bg-black/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center">
                  <div className="w-2 h-2 bg-blue-300 rounded-full mr-1 animate-pulse"></div>
                  Powered by CourtIQ™
                </div>
                
                {/* Player info */}
                <div className="flex items-center mt-2">
                  <div className={`h-16 w-16 rounded-full bg-white p-0.5 mr-3 shadow-lg ${isFoundingMember ? 'border-2 border-yellow-300' : ''}`}>
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4] flex items-center justify-center text-white font-bold text-xl">
                      {user.avatarInitials || user.username.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-xl">{user.displayName || user.username}</div>
                    <div className="flex items-center text-sm text-white/80 mt-0.5">
                      <div className="font-medium bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                        {skillLevelDisplay}
                      </div>
                      {isFoundingMember && (
                        <div className="ml-2 flex items-center text-yellow-300 font-medium">
                          <Sparkles size={14} className="mr-1" />
                          Founding Member
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats section */}
              <div className="p-5">
                {/* XP Progress */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-bold text-gray-700">Level {user.level || 1}</div>
                    <div className="text-[#FF5722] font-medium text-sm">{user.xp || 0}/1000 XP</div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`${isFoundingMember ? 'bg-gradient-to-r from-[#FF5722] to-[#FFD700]' : 'bg-gradient-to-r from-[#FF5722] to-[#FF9800]'} h-full rounded-full`} 
                      style={{ width: `${Math.min(((user.xp || 0) % 1000) / 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* CourtIQ metrics in a grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#FF5722]/10 border border-[#FF5722]/20 rounded-lg p-3 text-center">
                    <div className="text-[#FF5722] font-bold text-lg mb-0.5">Lvl {user.level || 1}</div>
                    <div className="text-xs text-gray-600">CourtIQ XP</div>
                  </div>
                  <div className="bg-[#2196F3]/10 border border-[#2196F3]/20 rounded-lg p-3 text-center">
                    <div className="text-[#2196F3] font-bold text-lg mb-0.5">{user.rankingPoints || 0}</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                  <div className="bg-[#673AB7]/10 border border-[#673AB7]/20 rounded-lg p-3 text-center">
                    <div className="text-[#673AB7] font-bold text-lg mb-0.5">
                      {user.rankingPoints && user.rankingPoints > 2000 ? '7th' : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">Rank</div>
                  </div>
                </div>
                
                {/* Additional stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-lg p-2 text-center">
                    <div className="text-[#4CAF50] font-bold text-lg">{user.totalTournaments || 0}</div>
                    <div className="text-xs text-gray-600">Tournaments</div>
                  </div>
                  <div className="bg-[#FF9800]/10 border border-[#FF9800]/20 rounded-lg p-2 text-center">
                    <div className="text-[#FF9800] font-bold text-lg">{user.totalMatches || 0}</div>
                    <div className="text-xs text-gray-600">Matches</div>
                  </div>
                </div>
                
                {/* Passport actions */}
                <div className="flex justify-between items-center mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleFlip}
                    className="text-gray-500"
                  >
                    <Trophy size={16} className="mr-1" />
                    Achievements
                  </Button>
                  
                  <Button 
                    size="sm" 
                    onClick={handleExpand}
                    className="text-white bg-gray-800 hover:bg-gray-700"
                  >
                    <Maximize2 size={16} className="mr-1" />
                    Minimize
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Back of passport */}
            <div className={`passport-card-face passport-card-back bg-white rounded-xl shadow-2xl overflow-hidden ${!isFlipped ? 'backface-hidden' : ''}`}>
              <div className={`bg-gradient-to-r ${isFoundingMember ? 'from-[#2196F3] to-[#FFD700]' : 'from-[#2196F3] to-[#03A9F4]'} p-5 text-white`}>
                <h3 className="font-bold text-xl">Passport QR Code</h3>
              </div>
              
              <div className="p-5 flex flex-col items-center">
                {/* QR Code */}
                <div className={`bg-white p-4 rounded-xl shadow-md mb-4 ${isFoundingMember ? 'border-2 border-yellow-300' : 'border border-gray-200'}`}>
                  <QRCodeSVG 
                    value={qrValue} 
                    size={180} 
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "/pickle-icon.png",
                      height: 36,
                      width: 36,
                      excavate: true,
                    }}
                  />
                </div>
                
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Scan this QR code to connect with {user.displayName || user.username} or for tournament check-in.
                </p>
                
                {/* Action buttons */}
                <div className="flex space-x-2 mb-4">
                  <Button variant="outline" size="sm" className="text-gray-600">
                    <Share2 size={16} className="mr-1" />
                    Share
                  </Button>
                  
                  <Button variant="outline" size="sm" className="text-gray-600" onClick={handleFlip}>
                    <Trophy size={16} className="mr-1" />
                    Stats
                  </Button>
                </div>
                
                {/* Footer info */}
                {user.location && (
                  <div className="text-center mt-2">
                    <div className="inline-block bg-[#FF5722]/10 rounded-full px-3 py-2 text-sm">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1 text-[#FF5722]" />
                        <span className="text-gray-700">{user.location}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Passport ID */}
                <div className="text-xs text-gray-400 mt-4">
                  Passport ID: {user.passportId || `${user.id}-${user.username.substring(0, 4)}`}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Regular card view
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="preserve-3d h-full relative passport-card hover:passport-card-hover">
          {/* Front of passport */}
          <div className={`passport-card-face bg-white ${isFlipped ? 'backface-hidden' : ''}`}>
            {/* Header with logo */}
            <div className={`bg-gradient-to-r ${isFoundingMember ? 'from-[#FF5722] to-[#FFD700]' : 'from-[#FF5722] to-[#FF9800]'} pt-3 pb-5 px-4 text-white relative`}>
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg">Player Passport</div>
                <PicklePlusWhiteLogo className="h-8 w-auto" />
                {isFoundingMember && (
                  <div className="absolute top-3 right-14 text-yellow-300">
                    <Sparkles size={16} />
                  </div>
                )}
              </div>
              
              {/* CourtIQ badge */}
              <div className="absolute top-14 right-2 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full mr-1 animate-pulse"></div>
                CourtIQ™
              </div>
              
              {/* Player info */}
              <div className="flex items-center mt-2">
                <div className={`h-14 w-14 rounded-full bg-white p-0.5 mr-3 shadow-lg ${isFoundingMember ? 'border-2 border-yellow-300' : ''}`}>
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-[#2196F3] to-[#03A9F4] flex items-center justify-center text-white font-bold text-lg">
                    {user.avatarInitials || user.username.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-lg">{user.displayName || user.username}</div>
                  <div className="flex items-center text-xs text-white/80 mt-0.5">
                    <div className="font-medium bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                      {skillLevelDisplay}
                    </div>
                    {isFoundingMember && (
                      <div className="ml-2 flex items-center text-yellow-300 font-medium text-xs">
                        <Sparkles size={12} className="mr-0.5" />
                        Founding
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats section */}
            <div className="p-4">
              {/* XP Progress */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-gray-700 text-sm">Level {user.level || 1}</div>
                  <div className="text-[#FF5722] font-medium text-xs">{user.xp || 0}/1000 XP</div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`${isFoundingMember ? 'bg-gradient-to-r from-[#FF5722] to-[#FFD700]' : 'bg-gradient-to-r from-[#FF5722] to-[#FF9800]'} h-full rounded-full`} 
                    style={{ width: `${Math.min(((user.xp || 0) % 1000) / 10, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* CourtIQ metrics in a grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-[#FF5722]/10 border border-[#FF5722]/20 rounded-lg p-2 text-center">
                  <div className="text-[#FF5722] font-bold text-base">Lvl {user.level || 1}</div>
                  <div className="text-xs text-gray-600">XP</div>
                </div>
                <div className="bg-[#2196F3]/10 border border-[#2196F3]/20 rounded-lg p-2 text-center">
                  <div className="text-[#2196F3] font-bold text-base">{user.rankingPoints || 0}</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
                <div className="bg-[#673AB7]/10 border border-[#673AB7]/20 rounded-lg p-2 text-center">
                  <div className="text-[#673AB7] font-bold text-base">
                    {user.rankingPoints && user.rankingPoints > 2000 ? '7th' : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">Rank</div>
                </div>
              </div>
              
              {/* Passport actions */}
              <div className="flex justify-between items-center mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleFlip}
                  className="text-gray-500 text-xs h-8"
                >
                  <Trophy size={14} className="mr-1" />
                  Flip
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={handleExpand}
                  className="text-white bg-gray-800 hover:bg-gray-700 text-xs h-8"
                >
                  <Maximize2 size={14} className="mr-1" />
                  Expand
                </Button>
              </div>
            </div>
          </div>
          
          {/* Back of passport */}
          <div className={`passport-card-face passport-card-back bg-white ${!isFlipped ? 'backface-hidden' : ''}`}>
            <div className={`bg-gradient-to-r ${isFoundingMember ? 'from-[#2196F3] to-[#FFD700]' : 'from-[#2196F3] to-[#03A9F4]'} p-3 text-white`}>
              <h3 className="font-bold text-lg">Passport QR Code</h3>
            </div>
            
            <div className="p-4 flex flex-col items-center">
              {/* QR Code */}
              <div className={`bg-white p-2 rounded-lg shadow-md mb-3 ${isFoundingMember ? 'border-2 border-yellow-300' : 'border border-gray-200'}`}>
                <QRCodeSVG 
                  value={qrValue} 
                  size={130}
                  level="M"
                  includeMargin={true}
                />
              </div>
              
              <p className="text-xs text-gray-600 mb-3 text-center">
                Scan to connect or check in at tournaments
              </p>
              
              {/* Action buttons */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-gray-600 text-xs h-8">
                  <Share2 size={14} className="mr-1" />
                  Share
                </Button>
                
                <Button variant="outline" size="sm" className="text-gray-600 text-xs h-8" onClick={handleFlip}>
                  <Trophy size={14} className="mr-1" />
                  Stats
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}