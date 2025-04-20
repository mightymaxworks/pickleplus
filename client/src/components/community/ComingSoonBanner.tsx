/**
 * PKL-278651-COMM-0031-CHLG-COMING-SOON
 * Community Challenge Feature Communication & Roadmap Implementation  
 * 
 * ComingSoonBanner Component
 * A visually appealing banner to indicate upcoming features with configurable messaging
 * and optional countdown/timeline information.
 * 
 * Implementation Date: April 20, 2025
 * Framework Version: 5.2
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Gift, Star, ArrowRight, Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface ComingSoonBannerProps {
  /** Title of the upcoming feature */
  title: string;
  /** Description of the upcoming feature */
  description: string;
  /** When the feature is expected to be available */
  releaseDate?: string;
  /** Icon to display - defaults to Calendar */
  icon?: 'calendar' | 'gift' | 'star' | 'clock' | 'bell';
  /** Optional action button text */
  actionText?: string;
  /** Optional action button handler */
  onAction?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Optional tag text to display */
  tagText?: string;
}

export function ComingSoonBanner({
  title,
  description,
  releaseDate,
  icon = 'calendar',
  actionText,
  onAction,
  className = '',
  tagText = 'Coming Soon',
}: ComingSoonBannerProps) {
  // Icon mapping
  const IconComponent = {
    calendar: Calendar,
    gift: Gift,
    star: Star,
    clock: Clock,
    bell: Bell,
  }[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 p-6 shadow-sm ${className}`}
    >
      {/* Background decorative elements */}
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-200 opacity-20"></div>
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-orange-300 opacity-10"></div>
      
      {/* Content container */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
        {/* Icon with animation */}
        <motion.div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500 border border-orange-200"
          whileHover={{ scale: 1.05, rotate: 5 }}
          initial={{ rotate: -5 }}
          animate={{ rotate: 0 }}
        >
          <IconComponent size={24} />
        </motion.div>
        
        {/* Text content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 font-medium">
              {tagText}
            </Badge>
          </div>
          <p className="text-gray-600 mb-2">{description}</p>
          {releaseDate && (
            <p className="text-sm text-orange-700 font-medium flex items-center">
              <Clock size={14} className="mr-1" />
              Expected: {releaseDate}
            </p>
          )}
        </div>
        
        {/* Action button */}
        {actionText && onAction && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={onAction}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
            >
              {actionText}
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </motion.div>
        )}
      </div>
      
      {/* Decorative animation */}
      <motion.div
        className="absolute bottom-1 right-2 text-orange-200"
        animate={{ rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Star size={20} />
      </motion.div>
    </motion.div>
  );
}