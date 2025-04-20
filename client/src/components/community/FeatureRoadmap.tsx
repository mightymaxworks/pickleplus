/**
 * PKL-278651-COMM-0031-CHLG-COMING-SOON
 * Community Challenge Feature Communication & Roadmap Implementation  
 * 
 * FeatureRoadmap Component
 * A timeline visualization of upcoming features with status indicators
 * 
 * Implementation Date: April 20, 2025
 * Framework Version: 5.2
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Rocket, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type FeatureStatus = 'available' | 'in-progress' | 'planned';

export interface RoadmapFeature {
  id: string;
  name: string;
  description: string;
  status: FeatureStatus;
  expectedDate?: string;
  statusMessage?: string;
}

export interface FeatureRoadmapProps {
  features: RoadmapFeature[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function FeatureRoadmap({
  features,
  title = 'Feature Roadmap',
  subtitle = 'Here\'s what\'s coming next to Pickle+',
  className = '',
}: FeatureRoadmapProps) {
  // Status Icon Map
  const StatusIcon = {
    'available': () => <CheckCircle className="h-5 w-5 text-green-500" />,
    'in-progress': () => <Clock className="h-5 w-5 text-blue-500" />,
    'planned': () => <CalendarDays className="h-5 w-5 text-orange-500" />,
  };

  // Status Badge Map
  const StatusBadge = {
    'available': ({ children }: { children: React.ReactNode }) => (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        {children}
      </Badge>
    ),
    'in-progress': ({ children }: { children: React.ReactNode }) => (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {children}
      </Badge>
    ),
    'planned': ({ children }: { children: React.ReactNode }) => (
      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
        {children}
      </Badge>
    ),
  };

  // Status Text Map
  const statusText = {
    'available': 'Available Now',
    'in-progress': 'In Development',
    'planned': 'Coming Soon',
  };

  return (
    <Card className={`p-6 border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      
      {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
      
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Timeline items */}
        {features.map((feature, index) => {
          const StatusIconComponent = StatusIcon[feature.status];
          const StatusBadgeComponent = StatusBadge[feature.status];
          
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative mb-8 last:mb-0 pl-10"
            >
              {/* Timeline icon */}
              <motion.div 
                className="absolute left-0 p-1 rounded-full bg-white z-10"
                whileHover={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <StatusIconComponent />
              </motion.div>
              
              {/* Feature information */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{feature.name}</h3>
                  <StatusBadgeComponent>{statusText[feature.status]}</StatusBadgeComponent>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                
                <div className="flex justify-between items-center text-xs">
                  {feature.expectedDate && (
                    <div className="flex items-center text-gray-500">
                      <CalendarDays className="h-3.5 w-3.5 mr-1" />
                      <span>Expected: {feature.expectedDate}</span>
                    </div>
                  )}
                  
                  {feature.statusMessage && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center text-primary cursor-help">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                            <span>Status details</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{feature.statusMessage}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <Separator className="my-6" />
      
      <div className="text-center text-sm text-gray-500">
        <p>This roadmap is subject to change based on user feedback and priorities.</p>
        <p className="mt-1">Last updated: April 20, 2025</p>
      </div>
    </Card>
  );
}