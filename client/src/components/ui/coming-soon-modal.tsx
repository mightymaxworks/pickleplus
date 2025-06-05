/**
 * Coming Soon Modal Component
 * Displays an elegant modal for features that are not yet available
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Trophy, Sparkles } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'tournament' | 'player' | 'general';
  title?: string;
  description?: string;
}

const featureConfig = {
  tournament: {
    title: 'Tournament Discovery',
    description: 'Find and join tournaments in your area',
    icon: Trophy,
    features: [
      'Browse local tournaments',
      'Filter by skill level and format',
      'Instant registration',
      'Live bracket tracking',
      'Prize pool information'
    ],
    launchDate: 'Summer 2025'
  },
  player: {
    title: 'Player Search',
    description: 'Connect with players and build your network',
    icon: Users,
    features: [
      'Search players by location',
      'Filter by skill level',
      'Send match invitations',
      'View player profiles',
      'Build your connections'
    ],
    launchDate: 'Spring 2025'
  },
  general: {
    title: 'Coming Soon',
    description: 'This feature is currently in development',
    icon: Sparkles,
    features: [
      'Enhanced functionality',
      'Improved user experience',
      'New features and capabilities'
    ],
    launchDate: 'Coming Soon'
  }
};

export function ComingSoonModal({ 
  isOpen, 
  onClose, 
  feature, 
  title, 
  description 
}: ComingSoonModalProps) {
  const config = featureConfig[feature];
  const Icon = config.icon;
  
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
            <Icon className="h-8 w-8 text-orange-600" />
          </div>
          <DialogTitle className="text-xl font-bold">
            {displayTitle}
          </DialogTitle>
          <DialogDescription className="text-base">
            {displayDescription}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">Launch Timeline</span>
            </div>
            <Badge variant="outline" className="w-full justify-center bg-white">
              {config.launchDate}
            </Badge>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              What to Expect
            </h4>
            <ul className="space-y-2">
              {config.features.map((featureItem, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {featureItem}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-800">Stay Updated</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              We'll notify you when this feature becomes available
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={onClose}
            >
              Got it, thanks!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}