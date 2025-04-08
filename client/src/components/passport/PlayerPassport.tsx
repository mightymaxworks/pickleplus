import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expand, QrCode, Share2, ChevronDown, Trophy, Award, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from '@shared/schema';
import PicklePlusWhiteLogo from '@/components/icons/PicklePlusWhiteLogo';

interface PlayerPassportProps {
  user: User;
  isFoundingMember: boolean;
}

export default function PlayerPassport({ user, isFoundingMember }: PlayerPassportProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isQRExpanded, setIsQRExpanded] = useState(false);

  // Get initials for user avatar
  const userInitials = user.username 
    ? user.username.substring(0, 2).toUpperCase() 
    : 'PB';
  
  // Get user rating from 'skill_level' if it exists, or default to 3.5
  const userRating = user.skill_level || 3.5;
  const ratingLabel = getRatingLabel(userRating);
  
  // Function to get appropriate label for rating
  function getRatingLabel(rating: number): string {
    if (rating < 2.5) return "Beginner";
    if (rating < 3.0) return "Beginner+"; 
    if (rating < 3.5) return "Intermediate";
    if (rating < 4.0) return "Intermediate+";
    if (rating < 4.5) return "Advanced";
    if (rating < 5.0) return "Advanced+";
    return "Pro";
  }
  
  // Generate QR code value
  const qrValue = `PICKLE+:${user.id}:${user.username}`;
  
  // Toggle card flip
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  // Open fullscreen view
  const showFullscreen = () => {
    setIsFullscreen(true);
  };
  
  // Open QR code modal
  const showQRCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQRExpanded(true);
  };

  // Main passport card component
  const PassportCard = ({ smaller = false }: { smaller?: boolean }) => (
    <div className={`${smaller ? 'w-full max-w-md' : 'w-full max-w-lg'} mx-auto perspective`}>
      <div 
        className={`preserve-3d relative ${isFlipped ? 'passport-card-rotate' : ''} transition-transform duration-500`}
        style={{ transformStyle: 'preserve-3d', height: smaller ? '240px' : '280px' }}
      >
        {/* Passport Front */}
        <div 
          className="bg-white rounded-xl shadow-lg overflow-hidden absolute inset-0 backface-hidden cursor-pointer"
          style={{ backfaceVisibility: 'hidden' }}
          onClick={handleFlip}
        >
          {/* Header with logo */}
          <div className={`
            bg-gradient-to-r 
            ${isFoundingMember ? 'from-[#FF5722] via-[#FF9800] to-[#FFD700]' : 'from-[#FF5722] to-[#FF9800]'} 
            pt-3 pb-5 px-5 text-white
          `}>
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">Player Passport</div>
              <PicklePlusWhiteLogo className="h-10 w-auto" />
            </div>
            
            {/* CourtIQ badge */}
            <div className="absolute top-16 right-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-1 animate-pulse"></div>
              Powered by CourtIQ™
            </div>
            
            {/* Player info */}
            <div className="flex items-center mt-2">
              <div className="h-16 w-16 rounded-full bg-white p-0.5 mr-3 shadow-lg">
                <div className={`
                  h-full w-full rounded-full 
                  ${isFoundingMember ? 'bg-gradient-to-r from-[#FFD700] to-[#FFC107]' : 'bg-gradient-to-r from-[#2196F3] to-[#03A9F4]'} 
                  flex items-center justify-center text-white font-bold text-xl
                `}>
                  {userInitials}
                </div>
              </div>
              <div>
                <div className="font-bold text-xl">{user.username}</div>
                <div className="flex items-center text-sm text-white/80 mt-0.5">
                  <div className="font-medium bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                    {userRating} {ratingLabel}
                  </div>
                  {isFoundingMember && (
                    <div className="flex items-center ml-2 bg-[#FFD700]/30 px-2 py-0.5 rounded-full">
                      <Star className="h-3 w-3 mr-1 text-[#FFD700]" />
                      <span className="text-[#FFD700] text-xs font-medium">Founding Member</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats section */}
          <div className="p-4 sm:p-6">
            {/* XP Progress */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <div className="font-bold text-gray-700">Level 5</div>
                <div className="text-[#FF5722] font-medium text-sm">520/1000 XP</div>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`
                    h-full rounded-full
                    ${isFoundingMember 
                      ? 'bg-gradient-to-r from-[#FF5722] via-[#FF9800] to-[#FFD700]' 
                      : 'bg-gradient-to-r from-[#FF5722] to-[#FF9800]'}
                  `} 
                  style={{ width: '52%' }}
                ></div>
              </div>
            </div>
            
            {/* CourtIQ metrics in a grid - smaller version shows fewer stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-[#FF5722]/10 border border-[#FF5722]/20 rounded-lg p-3 text-center">
                <div className="text-[#FF5722] font-bold text-lg mb-0.5">Lvl 5</div>
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
            
            {/* Only show activity badge on larger version */}
            {!smaller && (
              <div className="mt-4 flex items-center gap-2 bg-gradient-to-r from-[#2196F3]/5 to-[#03A9F4]/5 p-2 rounded-lg border border-[#2196F3]/10">
                <div className="bg-[#2196F3] rounded-full p-1 text-white">
                  <Trophy size={16} />
                </div>
                <div className="text-xs text-gray-700">Won mixed doubles tournament at Willow Park</div>
                <div className="text-[10px] text-[#2196F3] ml-auto font-medium">+100 RP</div>
              </div>
            )}

            {/* Hint to flip */}
            <div className="absolute bottom-2 right-2 text-gray-400 flex items-center text-xs">
              <span>Flip for more</span>
              <ChevronDown size={14} className="ml-1 animate-bounce" />
            </div>
          </div>
        </div>
        
        {/* Passport Back - QR Code and Achievements */}
        <div 
          className="bg-white rounded-xl shadow-lg overflow-hidden absolute inset-0 backface-hidden passport-card-back cursor-pointer"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          onClick={handleFlip}
        >
          <div className={`
            bg-gradient-to-r 
            ${isFoundingMember ? 'from-[#2196F3] via-[#03A9F4] to-[#FFD700]' : 'from-[#2196F3] to-[#03A9F4]'} 
            p-5 text-white
          `}>
            <div className="flex justify-between">
              <h3 className="font-bold text-xl">Player Passport</h3>
              <div className="text-white/90 text-sm">ID: #{user.id}</div>
            </div>
          </div>
          
          <div className="p-5 flex flex-col h-[calc(100%-72px)]">
            <div className="flex justify-between items-start mb-4">
              {/* QR Code */}
              <div 
                className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm cursor-pointer" 
                onClick={showQRCode}
              >
                <QRCode 
                  value={qrValue} 
                  size={smaller ? 80 : 100}
                  level="H"
                  renderAs="svg"
                  imageSettings={{
                    src: "/logo-small.png",
                    excavate: true,
                    height: smaller ? 16 : 20,
                    width: smaller ? 16 : 20,
                  }}
                />
                <div className="text-center mt-1 text-xs text-gray-500">
                  <div className="flex items-center justify-center">
                    <QrCode size={10} className="mr-1" />
                    <span>Tap to expand</span>
                  </div>
                </div>
              </div>
              
              {/* Achievements */}
              <div className="flex-1 ml-4">
                <div className="text-sm font-bold mb-2">Achievements</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-lg p-2 text-center">
                    <div className="bg-[#FFD700] text-white p-1.5 rounded-full mx-auto mb-1 w-7 h-7 flex items-center justify-center">
                      <Trophy size={14} />
                    </div>
                    <div className="text-[10px] text-gray-600">Champion</div>
                  </div>
                  <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-lg p-2 text-center">
                    <div className="bg-[#4CAF50] text-white p-1.5 rounded-full mx-auto mb-1 w-7 h-7 flex items-center justify-center">
                      <Award size={14} />
                    </div>
                    <div className="text-[10px] text-gray-600">Veteran</div>
                  </div>
                  <div className="bg-[#9C27B0]/10 border border-[#9C27B0]/20 rounded-lg p-2 text-center">
                    <div className="bg-[#9C27B0] text-white p-1.5 rounded-full mx-auto mb-1 w-7 h-7 flex items-center justify-center">
                      <Star size={14} />
                    </div>
                    <div className="text-[10px] text-gray-600">All-Star</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Matches - Only show on larger cards */}
            {!smaller && (
              <div className="mb-auto">
                <div className="text-sm font-bold mb-2">Recent Matches</div>
                <div className="space-y-2">
                  <div className="bg-gray-50 rounded-md p-2 flex justify-between items-center">
                    <div className="text-xs">vs. Sarah Johnson</div>
                    <div className="text-xs font-medium text-green-600">W 11-8</div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-2 flex justify-between items-center">
                    <div className="text-xs">vs. Mike Taylor</div>
                    <div className="text-xs font-medium text-green-600">W 11-7</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Location */}
            <div className="text-center mt-auto pt-2">
              <div className="inline-block bg-[#FF5722]/10 rounded-full px-3 py-1.5 text-xs">
                <div className="flex items-center">
                  <MapPin size={12} className="mr-1 text-[#FF5722]" />
                  <span className="text-gray-700">Westside Pickleball Club</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end mt-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            showQRCode(e);
          }}
        >
          <QrCode size={14} />
          <span>QR Code</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            // Implement share functionality here
            alert('Share functionality will be implemented');
          }}
        >
          <Share2 size={14} />
          <span>Share</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            showFullscreen();
          }}
        >
          <Expand size={14} />
          <span>Expand</span>
        </Button>
      </div>
    </div>
  );

  // QR Code Modal
  const QRCodeModal = () => (
    <Dialog open={isQRExpanded} onOpenChange={setIsQRExpanded}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center">
              <span>Passport QR Code</span>
              {isFoundingMember && (
                <div className="flex items-center ml-2 bg-[#FFD700]/20 px-2 py-0.5 rounded-full">
                  <Star className="h-3 w-3 mr-1 text-[#FFD700]" />
                  <span className="text-[#FFD700] text-xs font-medium">Founding Member</span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <QRCode 
              value={qrValue} 
              size={220}
              level="H"
              renderAs="svg"
              imageSettings={{
                src: "/logo-small.png",
                excavate: true,
                height: 40,
                width: 40,
              }}
            />
          </div>
          <div className="mt-4 text-center">
            <h3 className="font-bold text-lg">{user.username}</h3>
            <p className="text-gray-500">Player ID: #{user.id}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 w-full">
            <Button className="w-full" onClick={() => setIsQRExpanded(false)}>
              Close
            </Button>
            <Button className="w-full" variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Fullscreen Modal
  const FullscreenModal = () => (
    <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center">
              <span>Player Passport</span>
              {isFoundingMember && (
                <div className="flex items-center ml-2 bg-[#FFD700]/20 px-2 py-0.5 rounded-full">
                  <Star className="h-3 w-3 mr-1 text-[#FFD700]" />
                  <span className="text-[#FFD700] text-xs font-medium">Founding Member</span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="p-2">
          <PassportCard />
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <PassportCard smaller />
      <QRCodeModal />
      <FullscreenModal />
    </>
  );
}