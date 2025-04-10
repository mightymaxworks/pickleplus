/**
 * PKL-278651-GAME-0003-DISC
 * Tournament Feature Detail Component
 * 
 * This component displays detailed information about tournament features
 * in a visually appealing and informative way.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Clock,
  Rocket,
  Award
} from 'lucide-react';
import { TournamentFeatureDetail } from '../data/tournamentFeatureDetails';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TournamentFeatureDetailProps {
  feature: TournamentFeatureDetail;
  onClose: () => void;
}

const TournamentFeatureDetailComponent: React.FC<TournamentFeatureDetailProps> = ({ 
  feature, 
  onClose 
}) => {
  const launchDate = new Date(feature.launchDate);
  const isLaunching = new Date() < launchDate;
  
  // Format date as Month Day, Year
  const formattedDate = launchDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
        <h2 className="text-2xl font-bold">{feature.title}</h2>
        <p className="text-orange-50 mt-1">{feature.shortDescription}</p>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">About This Feature</h3>
          <p className="text-gray-700">{feature.fullDescription}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
            <CheckCircle2 className="mr-2 text-green-500" size={18} />
            Key Features
          </h3>
          <ul className="space-y-2">
            {feature.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
                  ✓
                </span>
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center text-gray-700 mb-2 sm:mb-0">
            <Calendar className="mr-2 text-orange-500" size={18} />
            <span>
              <span className="font-medium">Launch Date:</span>{" "}
              {formattedDate}
            </span>
          </div>
          
          <div className="flex space-x-2">
            {feature.demoAvailable && (
              <Button variant="outline" size="sm" className="flex items-center">
                <ExternalLink size={14} className="mr-1" />
                View Demo
              </Button>
            )}
            
            <Button variant="default" size="sm" onClick={onClose}>
              Got it
            </Button>
          </div>
        </div>
        
        {isLaunching && (
          <div className="mt-4 bg-orange-50 p-3 rounded-md border border-orange-100 flex items-center">
            <Rocket className="text-orange-500 mr-2 flex-shrink-0" size={18} />
            <p className="text-sm text-orange-800">
              This feature is launching soon! Complete all discoveries to get priority access.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TournamentFeatureDetailComponent;