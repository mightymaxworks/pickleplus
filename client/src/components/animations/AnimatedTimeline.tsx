import { motion } from 'framer-motion';
import { Award, Calendar, Star, Zap, Users, BarChart3, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  version: string;
  date: string;
  title: string;
  description: string;
  highlights: string[];
  icon: 'calendar' | 'star' | 'zap' | 'award' | 'users' | 'chart' | 'trophy';
  badgeText?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface AnimatedTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function AnimatedTimeline({ items, className = '' }: AnimatedTimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Central line */}
      <div className="absolute left-8 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#673AB7] via-[#2196F3] to-[#4CAF50] z-0"></div>
      
      {/* Timeline items */}
      <div className="relative z-10">
        {items.map((item, index) => (
          <TimelineItemComponent 
            key={item.version} 
            item={item} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function TimelineItemComponent({ 
  item, 
  index 
}: { 
  item: TimelineItem; 
  index: number;
}) {
  return (
    <motion.div 
      className="flex mb-8 sm:mb-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {/* Icon container */}
      <div className="relative flex-shrink-0">
        <div className="w-16 h-16 rounded-full bg-white border-2 border-[#673AB7] flex items-center justify-center text-lg font-medium shadow-md z-10">
          {getIcon(item.icon)}
        </div>
      </div>
      
      {/* Content */}
      <div className="ml-6 flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h3 className="text-xl font-bold">{item.title}</h3>
          {item.badgeText && (
            <Badge variant={item.badgeVariant || 'default'}>
              {item.badgeText}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <div className="font-medium">{item.version}</div>
          <div className="w-1 h-1 bg-gray-300 rounded-full mx-2"></div>
          <div>{item.date}</div>
        </div>
        
        <p className="text-gray-700 mb-3">{item.description}</p>
        
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <ul className="space-y-1.5">
            {item.highlights.map((highlight, i) => (
              <li key={i} className="flex items-start">
                <div className="text-[#673AB7] mr-2 flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function getIcon(icon: TimelineItem['icon']) {
  switch (icon) {
    case 'calendar':
      return <Calendar className="h-6 w-6 text-[#673AB7]" />;
    case 'star':
      return <Star className="h-6 w-6 text-[#673AB7]" />;
    case 'zap':
      return <Zap className="h-6 w-6 text-[#673AB7]" />;
    case 'award':
      return <Award className="h-6 w-6 text-[#673AB7]" />;
    case 'users':
      return <Users className="h-6 w-6 text-[#673AB7]" />;
    case 'chart':
      return <BarChart3 className="h-6 w-6 text-[#673AB7]" />;
    case 'trophy':
      return <Trophy className="h-6 w-6 text-[#673AB7]" />;
    default:
      return <Calendar className="h-6 w-6 text-[#673AB7]" />;
  }
}