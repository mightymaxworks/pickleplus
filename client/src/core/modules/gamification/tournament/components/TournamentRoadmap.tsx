/**
 * PKL-278651-GAME-0003-DISC
 * Tournament Roadmap Component
 * 
 * This component displays the tournament feature launch roadmap.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Trophy, Zap, CheckCircle2, Award } from 'lucide-react';
import { getAllTournamentFeatures } from '../data/tournamentFeatureDetails';
import { Badge } from '@/components/ui/badge';

interface TournamentRoadmapProps {
  className?: string;
}

/**
 * Tournament Roadmap Component
 * 
 * Visual timeline of upcoming tournament feature releases
 */
const TournamentRoadmap: React.FC<TournamentRoadmapProps> = ({ className = '' }) => {
  // Sort features by launch date
  const features = React.useMemo(() => {
    return getAllTournamentFeatures()
      .sort((a, b) => new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime());
  }, []);
  
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold flex items-center mb-4">
        <CalendarDays className="mr-2 text-blue-500" size={18} />
        Tournament Feature Roadmap
      </h3>
      
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200"></div>
        
        {/* Timeline items */}
        <div className="space-y-8 relative">
          {features.map((feature, index) => {
            const launchDate = new Date(feature.launchDate);
            const formattedDate = launchDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
            
            // Check if the feature is already launched
            const isLaunched = new Date() > launchDate;
            
            return (
              <motion.div 
                key={feature.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start ml-2"
              >
                {/* Timeline marker */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLaunched ? 'bg-green-100' : 'bg-orange-100'} z-10 mr-3 -ml-3`}>
                  {isLaunched ? (
                    <CheckCircle2 size={14} className="text-green-600" />
                  ) : (
                    <Clock size={14} className="text-orange-600" />
                  )}
                </div>
                
                {/* Content */}
                <div className={`flex-1 p-3 rounded-lg shadow-sm border ${isLaunched ? 'bg-green-50 border-green-100' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <Badge variant="outline" className={isLaunched ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {isLaunched ? 'Launched' : formattedDate}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{feature.shortDescription}</p>
                </div>
              </motion.div>
            );
          })}
          
          {/* Final item - Tournament System Full Launch */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: features.length * 0.1 }}
            className="flex items-start ml-2"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-purple-100 z-10 mr-3 -ml-3">
              <Trophy size={14} className="text-purple-600" />
            </div>
            
            <div className="flex-1 p-3 rounded-lg shadow-sm border border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">Full Tournament System Launch</h4>
                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                  June 30
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Complete tournament system with all features integrated and available to all users.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100">
        <p className="text-sm text-blue-800 flex items-center">
          <Award className="text-blue-500 mr-2 flex-shrink-0" size={18} />
          Discover all features to earn priority access and special early access benefits!
        </p>
      </div>
    </div>
  );
};

export default TournamentRoadmap;