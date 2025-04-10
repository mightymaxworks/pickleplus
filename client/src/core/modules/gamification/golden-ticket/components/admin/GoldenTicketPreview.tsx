/**
 * PKL-278651-GAME-0005-GOLD-ENH
 * Golden Ticket Preview Component
 * 
 * A simplified version of the GoldenTicketCard for previewing in the admin panel.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Gift, ExternalLink, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Sponsor } from '@shared/golden-ticket.schema';

interface PreviewTicketData {
  title: string;
  description: string;
  rewardDescription: string;
  promotionalImageUrl?: string | null;
  promotionalImagePath?: string | null;
  sponsor?: Sponsor | null;
}

interface GoldenTicketPreviewProps {
  ticketData: PreviewTicketData;
  trigger?: React.ReactNode;
}

const GoldenTicketPreview: React.FC<GoldenTicketPreviewProps> = ({ ticketData, trigger }) => {
  const [isClaimed, setIsClaimed] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  
  const handleClaimTicket = () => {
    setIsClaimed(true);
  };
  
  const handleRevealSponsor = () => {
    console.log('Revealing sponsor:', ticketData.sponsor);
    console.log('Logo path was:', ticketData.sponsor?.logoPath);
    console.log('Promotional image info:', {
      promotionalImageUrl,
      promotionalImagePath: ticketData.promotionalImagePath,
      hasPromotionalImage: !!promotionalImageUrl
    });
    setIsRevealed(true);
  };
  
  const resetState = () => {
    setIsClaimed(false);
    setIsRevealed(false);
  };
  
  // Determine image URLs to use with proper path formatting
  const promotionalImageUrl = ticketData.promotionalImageUrl ? 
    // If there's a direct URL, use it
    ticketData.promotionalImageUrl : 
    // Otherwise try to use the file path
    (ticketData.promotionalImagePath ? 
      // Make sure the path starts with a slash for proper URL formatting
      (ticketData.promotionalImagePath.startsWith('/') ? 
        ticketData.promotionalImagePath : 
        `/${ticketData.promotionalImagePath}`) : 
      // No image available
      null);
    
  // Debug logging for image paths and sponsor info
  useEffect(() => {
    console.log('GoldenTicketPreview - DEBUG FULL TICKET DATA:', ticketData);
    console.log('GoldenTicketPreview - Promotional Image Details:', {
      originalUrl: ticketData.promotionalImageUrl,
      originalPath: ticketData.promotionalImagePath,
      formattedImageUrl: promotionalImageUrl,
      hasUrl: !!ticketData.promotionalImageUrl,
      hasPath: !!ticketData.promotionalImagePath,
      finalResult: promotionalImageUrl
    });
    
    if (ticketData.sponsor) {
      const formattedLogoPath = ticketData.sponsor.logoPath ? 
        (ticketData.sponsor.logoPath.startsWith('/') ? 
          ticketData.sponsor.logoPath : 
          `/${ticketData.sponsor.logoPath}`) : 
        null;
      
      console.log('GoldenTicketPreview - Sponsor logo info:', {
        name: ticketData.sponsor.name,
        originalLogoPath: ticketData.sponsor.logoPath,
        formattedLogoPath: formattedLogoPath,
        hasLogoPath: !!ticketData.sponsor.logoPath
      });
    }
  }, [ticketData]);
  
  const previewCard = (
    <Card className="overflow-hidden border-4 border-yellow-400 shadow-xl bg-gradient-to-r from-amber-50 to-yellow-50 w-full max-w-sm mx-auto">
      <CardHeader className="bg-gradient-to-r from-yellow-400 to-amber-500 pb-2 px-3 sm:px-6">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="text-white" size={18} />
          <h3 className="text-xl font-bold text-white">Golden Ticket</h3>
          <Sparkles className="text-white" size={18} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 px-3 sm:px-6">
        {promotionalImageUrl && (
          <div className="flex justify-center mb-3">
            <img 
              src={promotionalImageUrl} 
              alt="Golden Ticket" 
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
            />
          </div>
        )}
        
        <h4 className="text-lg font-semibold text-amber-800 mb-1 break-words">{ticketData.title || 'Ticket Title'}</h4>
        <p className="text-xs sm:text-sm text-gray-700 mb-3">{ticketData.description || 'Ticket description would appear here.'}</p>
        
        <div className="bg-amber-50 border border-amber-100 rounded-md p-2 mb-3">
          <h5 className="font-medium text-amber-800 flex items-center text-sm">
            <Gift className="mr-1 text-amber-600 flex-shrink-0" size={14} />
            <span className="truncate">Prize</span>
          </h5>
          <p className="text-xs sm:text-sm text-gray-700">{ticketData.rewardDescription || 'Reward description would appear here.'}</p>
        </div>
        
        {ticketData.sponsor && isClaimed && isRevealed && (
          <div className="bg-blue-50 border border-blue-100 rounded-md p-2 mb-3">
            <h5 className="font-medium text-blue-800 mb-1 text-sm">Sponsored By:</h5>
            <div className="flex items-center">
              {ticketData.sponsor.logoPath && (
                <img 
                  src={ticketData.sponsor.logoPath.startsWith('/') ? 
                      ticketData.sponsor.logoPath : 
                      `/${ticketData.sponsor.logoPath}`} 
                  alt={ticketData.sponsor.name} 
                  className="h-6 sm:h-8 object-contain mr-2 flex-shrink-0"
                  onError={(e) => {
                    console.error('Error loading sponsor logo:', e);
                    console.log('Logo path was:', ticketData.sponsor?.logoPath);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="text-sm font-medium truncate">{ticketData.sponsor.name}</span>
            </div>
            
            {/* Show promotional image when sponsor is revealed */}
            {promotionalImageUrl && (
              <div className="mt-3 border border-blue-200 rounded-md p-2 bg-blue-50/50">
                <h6 className="text-xs font-medium text-blue-800 mb-1">Promotional Offer:</h6>
                <div className="flex justify-center">
                  <img 
                    src={promotionalImageUrl} 
                    alt="Promotional offer" 
                    className="max-h-28 sm:max-h-32 w-auto object-contain"
                    onError={(e) => {
                      console.error('Error loading promotional image:', e);
                      console.log('Promotional image path was:', promotionalImageUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1 text-center italic line-clamp-2">
                  {ticketData.rewardDescription || 'Special offer from our sponsor'}
                </p>
              </div>
            )}
            
            {ticketData.sponsor.website && (
              <a 
                href={ticketData.sponsor.website}
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
          >
            Claim Golden Ticket
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
            onClick={resetState} 
            variant="outline"
            className="w-full border-amber-200 text-amber-800 hover:bg-amber-50 text-sm sm:text-base"
          >
            Reset Preview
          </Button>
        )}
      </CardFooter>
    </Card>
  );
  
  if (trigger) {
    return (
      <Dialog onOpenChange={open => !open && resetState()}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-md w-[95vw] sm:w-auto p-4 sm:p-6 max-h-[95vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-center text-lg sm:text-xl font-bold">Golden Ticket Preview</DialogTitle>
            <DialogDescription className="text-center text-xs sm:text-sm">
              Preview how the golden ticket will appear to users
            </DialogDescription>
          </DialogHeader>
          {previewCard}
        </DialogContent>
      </Dialog>
    );
  }
  
  // If no trigger is provided, just return the card
  return previewCard;
};

export default GoldenTicketPreview;