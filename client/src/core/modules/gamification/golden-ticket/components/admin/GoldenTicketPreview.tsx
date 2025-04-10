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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
    setIsRevealed(true);
  };
  
  const resetState = () => {
    setIsClaimed(false);
    setIsRevealed(false);
  };
  
  // Determine image URL to use
  const imageUrl = ticketData.promotionalImageUrl || 
    (ticketData.promotionalImagePath ? `/${ticketData.promotionalImagePath}` : null);
    
  // Debug logging for sponsor logo info
  useEffect(() => {
    if (ticketData.sponsor) {
      console.log('GoldenTicketPreview - Sponsor logo info:', {
        name: ticketData.sponsor.name,
        logoPath: ticketData.sponsor.logoPath,
        formattedLogoPath: ticketData.sponsor.logoPath ? 
          (ticketData.sponsor.logoPath.startsWith('/') ? 
            ticketData.sponsor.logoPath : 
            `/${ticketData.sponsor.logoPath}`) : null
      });
    }
  }, [ticketData.sponsor]);
  
  const previewCard = (
    <Card className="overflow-hidden border-4 border-yellow-400 shadow-xl bg-gradient-to-r from-amber-50 to-yellow-50 max-w-sm mx-auto">
      <CardHeader className="bg-gradient-to-r from-yellow-400 to-amber-500 pb-2">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="text-white" size={18} />
          <h3 className="text-xl font-bold text-white">Golden Ticket</h3>
          <Sparkles className="text-white" size={18} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {imageUrl && (
          <div className="flex justify-center mb-3">
            <img 
              src={imageUrl} 
              alt="Golden Ticket" 
              className="w-24 h-24 object-contain"
            />
          </div>
        )}
        
        <h4 className="text-lg font-semibold text-amber-800 mb-1">{ticketData.title || 'Ticket Title'}</h4>
        <p className="text-sm text-gray-700 mb-3">{ticketData.description || 'Ticket description would appear here.'}</p>
        
        <div className="bg-amber-50 border border-amber-100 rounded-md p-2 mb-3">
          <h5 className="font-medium text-amber-800 flex items-center text-sm">
            <Gift className="mr-1 text-amber-600" size={14} />
            Prize
          </h5>
          <p className="text-sm text-gray-700">{ticketData.rewardDescription || 'Reward description would appear here.'}</p>
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
                  className="h-8 object-contain mr-2"
                  onError={(e) => {
                    console.error('Error loading sponsor logo:', e);
                    console.log('Logo path was:', ticketData.sponsor?.logoPath);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="text-sm font-medium">{ticketData.sponsor.name}</span>
            </div>
            
            {ticketData.sponsor.website && (
              <a 
                href={ticketData.sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center mt-1"
              >
                Visit website
                <ExternalLink size={10} className="ml-1" />
              </a>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        {!isClaimed ? (
          <Button 
            onClick={handleClaimTicket} 
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600"
          >
            Claim Golden Ticket
          </Button>
        ) : !isRevealed ? (
          <Button 
            onClick={handleRevealSponsor} 
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600"
          >
            Reveal Sponsor
          </Button>
        ) : (
          <Button 
            onClick={resetState} 
            variant="outline"
            className="w-full border-amber-200 text-amber-800 hover:bg-amber-50"
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Golden Ticket Preview</DialogTitle>
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