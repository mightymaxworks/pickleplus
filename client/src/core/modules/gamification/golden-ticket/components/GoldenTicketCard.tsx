/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Card Component
 * 
 * Card component that appears when a golden ticket is available.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGoldenTicket } from '../context/GoldenTicketContext';
import { Sparkles, Gift, ExternalLink, X } from 'lucide-react';

const GoldenTicketCard: React.FC = () => {
  const { currentTicket, isTicketVisible, hideTicket, claimTicket, isClaimLoading } = useGoldenTicket();
  const [isClaimed, setIsClaimed] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  
  const handleClaimTicket = async () => {
    const claim = await claimTicket();
    if (claim) {
      setIsClaimed(true);
    }
  };
  
  const handleRevealSponsor = () => {
    setIsRevealed(true);
  };
  
  if (!currentTicket || !isTicketVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="fixed bottom-5 right-5 z-50 max-w-sm"
    >
      <Card className="overflow-hidden border-4 border-yellow-400 shadow-xl bg-gradient-to-r from-amber-50 to-yellow-50 w-full max-w-[280px] sm:max-w-sm">
        <div className="absolute top-2 right-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 rounded-full" 
            onClick={hideTicket}
          >
            <X size={16} />
          </Button>
        </div>
        
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-amber-500 pb-2 px-3 sm:px-6">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="text-white" size={16} />
            <h3 className="text-lg sm:text-xl font-bold text-white">Golden Ticket</h3>
            <Sparkles className="text-white" size={16} />
          </div>
        </CardHeader>
        
        <CardContent className="pt-4 px-3 sm:px-6">
          {currentTicket.imageUrl && (
            <div className="flex justify-center mb-3">
              <img 
                src={currentTicket.imageUrl} 
                alt="Golden Ticket" 
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
              />
            </div>
          )}
          
          <h4 className="text-base sm:text-lg font-semibold text-amber-800 mb-1 break-words">{currentTicket.title}</h4>
          <p className="text-xs sm:text-sm text-gray-700 mb-3">{currentTicket.description}</p>
          
          <div className="bg-amber-50 border border-amber-100 rounded-md p-2 mb-3">
            <h5 className="font-medium text-amber-800 flex items-center text-sm">
              <Gift className="mr-1 text-amber-600 flex-shrink-0" size={14} />
              <span className="truncate">Prize</span>
            </h5>
            <p className="text-xs sm:text-sm text-gray-700">{currentTicket.prizeDescription}</p>
          </div>
          
          {isClaimed && isRevealed && (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-2 mb-3">
              <h5 className="font-medium text-blue-800 mb-1 text-sm">Sponsored By:</h5>
              <div className="flex items-center">
                {currentTicket.sponsorLogoUrl && (
                  <img 
                    src={currentTicket.sponsorLogoUrl} 
                    alt={currentTicket.sponsorName || 'Sponsor'} 
                    className="h-6 sm:h-8 object-contain mr-2 flex-shrink-0"
                  />
                )}
                <span className="text-sm font-medium truncate">{currentTicket.sponsorName}</span>
              </div>
              
              {currentTicket.promotionalImageUrl && (
                <div className="mt-3 border border-blue-200 rounded-md p-2 bg-blue-50/50">
                  <h6 className="text-xs font-medium text-blue-800 mb-1">Promotional Offer:</h6>
                  <div className="flex justify-center">
                    <img 
                      src={currentTicket.promotionalImageUrl} 
                      alt="Promotional offer" 
                      className="max-h-28 sm:max-h-32 w-auto object-contain"
                    />
                  </div>
                </div>
              )}
              
              {currentTicket.sponsorWebsite && (
                <a 
                  href={currentTicket.sponsorWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center justify-center mt-2"
                >
                  Visit website
                  <ExternalLink size={10} className="ml-1 flex-shrink-0" />
                </a>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 px-3 sm:px-6">
          {!isClaimed ? (
            <Button 
              onClick={handleClaimTicket} 
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600 text-sm sm:text-base"
              disabled={isClaimLoading}
            >
              {isClaimLoading ? 'Claiming...' : 'Claim Golden Ticket'}
            </Button>
          ) : !isRevealed ? (
            <Button 
              onClick={handleRevealSponsor} 
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600 text-sm sm:text-base"
            >
              Reveal Sponsor
            </Button>
          ) : (
            <Button 
              onClick={hideTicket} 
              variant="outline"
              className="w-full border-amber-200 text-amber-800 hover:bg-amber-50 text-sm sm:text-base"
            >
              Close
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default GoldenTicketCard;