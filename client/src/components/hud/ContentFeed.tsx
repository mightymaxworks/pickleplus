import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Play, FileText, Trophy, BookOpen, Clock, Eye, ThumbsUp, MessageCircle, Sparkles, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ContentType = 'all' | 'videos' | 'assessments' | 'tournaments' | 'articles';
type PrivacyLevel = 'Public' | 'Friends' | 'Team' | 'Private';

interface ContentItem {
  id: string;
  type: 'video' | 'assessment' | 'tournament' | 'article';
  title: string;
  description: string;
  author: string;
  authorRole?: string; // 'Coach', 'Player', 'Admin'
  timestamp: string;
  thumbnail?: string;
  privacy: PrivacyLevel;
  stats: {
    views?: number;
    likes?: number;
    comments?: number;
    duration?: string; // for videos
  };
  tags?: string[];
  isPriority?: boolean; // Intelligent prioritization
  isRelevant?: boolean; // Personalized for user
}

interface ContentFeedProps {
  items: ContentItem[];
  className?: string;
}

const contentFilters: Array<{
  value: ContentType;
  label: string;
  icon: typeof Play;
}> = [
  { value: 'all', label: 'All', icon: Filter },
  { value: 'videos', label: 'Videos', icon: Play },
  { value: 'assessments', label: 'Assessments', icon: FileText },
  { value: 'tournaments', label: 'Tournaments', icon: Trophy },
  { value: 'articles', label: 'Articles', icon: BookOpen }
];

const typeConfig = {
  video: {
    icon: Play,
    color: '#f97316',
    label: 'Video',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)'
  },
  assessment: {
    icon: FileText,
    color: '#3b82f6',
    label: 'Assessment',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  },
  tournament: {
    icon: Trophy,
    color: '#fbbf24',
    label: 'Tournament',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
  },
  article: {
    icon: BookOpen,
    color: '#10b981',
    label: 'Article',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  }
};

function ContentCard({ item }: { item: ContentItem }) {
  const config = typeConfig[item.type];
  const Icon = config.icon;
  const primaryGradient = 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative cursor-pointer"
      data-testid={`content-card-${item.id}`}
    >
      {/* Hexagonal Container */}
      <div 
        className="relative bg-black/40 backdrop-blur-sm transition-all duration-300"
        style={{
          clipPath: 'polygon(0% 5%, 5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%)'
        }}
      >
        {/* Hover Glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{
            background: item.isPriority ? primaryGradient : config.gradient,
            clipPath: 'polygon(0% 5%, 5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%)'
          }}
        />

        {/* Priority Highlight */}
        {item.isPriority && (
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: primaryGradient,
              clipPath: 'polygon(0% 5%, 5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%)'
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            {/* Type Icon */}
            <div 
              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: `${config.color}22`,
                border: `1px solid ${config.color}44`
              }}
            >
              <Icon 
                className="w-5 h-5"
                style={{ color: config.color }}
              />
            </div>

            {/* Title & Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-white line-clamp-2 group-hover:text-[#f97316] transition-colors">
                  {item.title}
                </h4>
                {item.isPriority && (
                  <Sparkles className="flex-shrink-0 w-4 h-4 text-[#f97316] animate-pulse" />
                )}
              </div>
              
              <p className="text-sm text-white/60 line-clamp-2 mb-2">
                {item.description}
              </p>

              {/* Author */}
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="font-medium text-white/80">{item.author}</span>
                {item.authorRole && (
                  <>
                    <span>•</span>
                    <span 
                      className="px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${config.color}22`,
                        color: config.color
                      }}
                    >
                      {item.authorRole}
                    </span>
                  </>
                )}
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.timestamp}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge 
                  key={tag}
                  className="text-[10px] bg-white/10 text-white/70 border-white/20 hover:bg-white/20 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge className="text-[10px] bg-white/10 text-white/70 border-white/20">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-4 text-xs text-white/60">
              {item.stats.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {item.stats.views}
                </div>
              )}
              {item.stats.likes !== undefined && (
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  {item.stats.likes}
                </div>
              )}
              {item.stats.comments !== undefined && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {item.stats.comments}
                </div>
              )}
              {item.stats.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.stats.duration}
                </div>
              )}
            </div>

            {/* Privacy Badge */}
            <Badge 
              className="text-[10px]"
              style={{
                background: `${config.color}22`,
                color: config.color,
                borderColor: `${config.color}44`
              }}
            >
              {item.privacy}
            </Badge>
          </div>
        </div>

        {/* Scan Line Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/3 to-transparent"
          animate={{ y: ['-100%', '200%'] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            repeatDelay: 4,
            ease: "linear" 
          }}
          style={{ 
            pointerEvents: 'none',
            clipPath: 'polygon(0% 5%, 5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%)'
          }}
        />
      </div>

      {/* Relevant Badge (outside card) */}
      {item.isRelevant && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-20"
          style={{
            background: primaryGradient,
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)'
          }}
        >
          <Sparkles className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ContentFeed({ items, className = '' }: ContentFeedProps) {
  const [activeFilter, setActiveFilter] = useState<ContentType>('all');
  const primaryGradient = 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)';

  // Filter items based on active filter
  const filteredItems = activeFilter === 'all' 
    ? items 
    : items.filter(item => {
        if (activeFilter === 'videos') return item.type === 'video';
        if (activeFilter === 'assessments') return item.type === 'assessment';
        if (activeFilter === 'tournaments') return item.type === 'tournament';
        if (activeFilter === 'articles') return item.type === 'article';
        return true;
      });

  // Sort by priority and relevance
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    if (a.isRelevant && !b.isRelevant) return -1;
    if (!a.isRelevant && b.isRelevant) return 1;
    return 0;
  });

  return (
    <div className={`space-y-4 ${className}`} data-testid="content-feed">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#f97316] via-[#ec4899] to-[#a855f7] rounded-full" />
            Content Feed
          </h3>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Sparkles className="w-3 h-3" />
            <span>Personalized</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {contentFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.value;
            
            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white/80'
                }`}
                style={{
                  clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)'
                }}
                data-testid={`filter-${filter.value}`}
              >
                {/* Background */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isActive ? 'opacity-20' : 'opacity-0 hover:opacity-10'
                  }`}
                  style={{
                    background: primaryGradient,
                    clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)'
                  }}
                />
                
                {/* Border for active */}
                {isActive && (
                  <div 
                    className="absolute inset-0 opacity-40"
                    style={{
                      background: primaryGradient,
                      clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)',
                      padding: '1px'
                    }}
                  />
                )}

                {/* Content */}
                <Icon className="relative z-10 w-4 h-4" />
                <span className="relative z-10">{filter.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {sortedItems.length > 0 ? (
              sortedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ContentCard item={item} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-white/40">
                <Filter className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No {activeFilter === 'all' ? '' : activeFilter} content available</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="h-[1px] bg-gradient-to-r from-transparent via-[#f97316] to-transparent origin-left"
      />
    </div>
  );
}
