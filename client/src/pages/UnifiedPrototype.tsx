import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IdCard,
  Trophy, 
  BarChart3, 
  UserCog, 
  Gamepad2,
  Users,
  Gift,
  Star,
  MapPin,
  Target,
  TrendingUp,
  Medal,
  Camera,
  Edit,
  Check,
  X,
  ChevronRight,
  Dumbbell,
  Shield,
  BellRing,
  Wifi,
  WifiOff,
  Crown,
  Award,
  Zap,
  Activity,
  Scan,
  Upload,
  RotateCw,
  Save,
  Sparkles,
  CheckCircle,
  Swords,
  Eye,
  EyeOff,
  UserPlus,
  User,
  Timer,
  Send,
  Filter,
  Search,
  Copy,
  QrCode
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useNotificationSocket } from '@/lib/hooks/useNotificationSocket';
import PassportPhotoUpload from '@/components/passport/PassportPhotoUpload';
import PassportHero, { PlayerData, PlayerTier, tierConfig, getTierStyling, formatPassportCode } from '@/components/passport/PassportHero';
import HexagonalStats from '@/components/hud/HexagonalStats';
import InteractiveLeaderboard from '@/components/hud/InteractiveLeaderboard';
import ContentFeed from '@/components/hud/ContentFeed';
import BattleLogHistory from '@/components/hud/BattleLogHistory';
import SmartChallengeModal from '@/components/hud/SmartChallengeModal';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Passport Code Utilities are now imported from PassportHero component

// Micro-Feedback Components
function ReactionFloat({ icon: Icon, text, color, show, onComplete }: {
  icon: any;
  text: string;
  color: string;
  show: boolean;
  onComplete: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -50, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.6 }}
          transition={{ duration: 1.2, onComplete }}
          className={`absolute z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-white/20 backdrop-blur-sm pointer-events-none ${color}`}
        >
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PressRipple({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [ripples, setRipples] = useState<Array<{id: number; x: number; y: number}>>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    if (onClick) onClick();
  };

  return (
    <div className="relative overflow-hidden" onClick={handleClick}>
      {children}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute pointer-events-none"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)'
          }}
        />
      ))}
    </div>
  );
}

function ShimmerStat({ children, trigger }: { children: React.ReactNode; trigger: boolean }) {
  return (
    <motion.div
      animate={{ 
        borderColor: trigger ? ['#f97316', '#fb923c', '#f97316'] : '#374151',
        boxShadow: trigger ? '0 0 20px rgba(249, 115, 22, 0.3)' : 'none'
      }}
      transition={{ duration: 0.8 }}
      className="border-2 rounded-lg p-3"
    >
      {children}
    </motion.div>
  );
}

// Types from our previous implementations (PlayerData and PlayerTier are now imported from PassportHero)

interface RankedPlayer {
  id: string;
  name: string;
  tier: PlayerTier;
  rankingPoints: number;
  rank: number;
  location: string;
  recentChange: number;
  winRate: number;
  matchesPlayed: number;
  avatar?: string;
}

type TabMode = 'passport' | 'play' | 'rankings' | 'profile';

// Arena-related types
type PlayerStatus = 'online' | 'in-match' | 'available' | 'away' | 'offline';
type MatchType = 'singles' | 'doubles-looking' | 'doubles-team';

interface ArenaPlayer {
  id: string;
  name: string;
  tier: 'recreational' | 'competitive' | 'elite' | 'professional';
  rankingPoints: number;
  status: PlayerStatus;
  location: string;
  distance: number; // km away
  avatar?: string;
  matchType: MatchType;
  partner?: { name: string; id: string }; // For doubles teams
  winRate: number;
  isOnline: boolean;
  lastSeen: string;
  preferredFormat?: 'singles' | 'doubles' | 'both';
}

interface ChallengeRequest {
  id: string;
  fromPlayer: ArenaPlayer;
  toPlayer: ArenaPlayer;
  matchType: MatchType;
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

// tierConfig is now imported from PassportHero component

// Mock data with more complete rankings for 4-8 display
const mockPlayer: PlayerData = {
  id: 'current',
  name: 'Alex Chen',
  tier: 'elite',
  rankingPoints: 1247,
  picklePoints: 89,
  globalRank: 847,
  localRank: 23,
  passportCode: 'HVGN0BW0',
  recentChange: +34,
  winRate: 0.73,
  nextMilestone: {
    tier: 'Professional',
    pointsNeeded: 553,
  },
};

// Mock leaderboard data for InteractiveLeaderboard with multi-ranking
const mockLeaderboardPlayers = [
  {
    id: '1',
    name: 'Sarah Martinez',
    tier: 'professional' as const,
    location: 'Vancouver, BC',
    distance: 2.3,
    isChallengeable: true,
    gender: 'female' as const,
    rankings: {
      singlesRank: 1,
      singlesPoints: 2156,
      singlesWins: 138,
      singlesLosses: 18,
      doublesRank: 3,
      doublesPoints: 1876,
      doublesWins: 94,
      doublesLosses: 21,
      mixedRank: 2,
      mixedPoints: 1998,
      mixedWins: 112,
      mixedLosses: 19
    }
  },
  {
    id: '2',
    name: 'Mike Johnson',
    tier: 'professional' as const,
    location: 'Burnaby, BC',
    distance: 5.1,
    isChallengeable: false,
    gender: 'male' as const,
    rankings: {
      singlesRank: 2,
      singlesPoints: 2089,
      singlesWins: 145,
      singlesLosses: 22,
      doublesRank: 1,
      doublesPoints: 2143,
      doublesWins: 156,
      doublesLosses: 18,
      mixedRank: 4,
      mixedPoints: 1823,
      mixedWins: 98,
      mixedLosses: 26
    }
  },
  {
    id: '3',
    name: 'Emma Wilson',
    tier: 'professional' as const,
    location: 'Richmond, BC',
    distance: 3.7,
    isChallengeable: true,
    gender: 'female' as const,
    rankings: {
      singlesRank: 3,
      singlesPoints: 1892,
      singlesWins: 98,
      singlesLosses: 19,
      doublesRank: 12,
      doublesPoints: 1456,
      doublesWins: 67,
      doublesLosses: 34,
      mixedRank: 1,
      mixedPoints: 2087,
      mixedWins: 134,
      mixedLosses: 15
    }
  },
  {
    id: '4',
    name: 'David Kim',
    tier: 'elite' as const,
    location: 'Vancouver, BC',
    distance: 1.2,
    isChallengeable: true,
    gender: 'male' as const,
    rankings: {
      singlesRank: 4,
      singlesPoints: 1523,
      singlesWins: 89,
      singlesLosses: 24,
      doublesRank: 2,
      doublesPoints: 1954,
      doublesWins: 112,
      doublesLosses: 23,
      mixedRank: 7,
      mixedPoints: 1589,
      mixedWins: 67,
      mixedLosses: 31
    }
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    tier: 'elite' as const,
    location: 'Surrey, BC',
    distance: 12.5,
    isChallengeable: true,
    gender: 'female' as const,
    rankings: {
      singlesRank: 5,
      singlesPoints: 1456,
      singlesWins: 74,
      singlesLosses: 26,
      doublesRank: 4,
      doublesPoints: 1723,
      doublesWins: 91,
      doublesLosses: 24,
      mixedRank: 3,
      mixedPoints: 1878,
      mixedWins: 104,
      mixedLosses: 21
    }
  },
  {
    id: 'current',
    name: 'Alex Chen',
    tier: 'elite' as const,
    location: 'Vancouver, BC',
    distance: 0,
    isChallengeable: false,
    gender: 'male' as const,
    rankings: {
      singlesRank: 6,
      singlesPoints: 1247,
      singlesWins: 73,
      singlesLosses: 27,
      doublesRank: 5,
      doublesPoints: 1698,
      doublesWins: 82,
      doublesLosses: 28,
      mixedRank: 6,
      mixedPoints: 1654,
      mixedWins: 76,
      mixedLosses: 29
    }
  },
  {
    id: '7',
    name: 'James Lee',
    tier: 'elite' as const,
    location: 'Coquitlam, BC',
    distance: 8.9,
    isChallengeable: true,
    gender: 'male' as const,
    rankings: {
      singlesRank: 7,
      singlesPoints: 1198,
      singlesWins: 71,
      singlesLosses: 29,
      doublesRank: 6,
      doublesPoints: 1621,
      doublesWins: 87,
      doublesLosses: 29,
      mixedRank: 9,
      mixedPoints: 1543,
      mixedWins: 78,
      mixedLosses: 34
    }
  },
  {
    id: '8',
    name: 'Maria Garcia',
    tier: 'elite' as const,
    location: 'New Westminster, BC',
    distance: 6.4,
    isChallengeable: true,
    gender: 'female' as const,
    rankings: {
      singlesRank: 8,
      singlesPoints: 1134,
      singlesWins: 69,
      singlesLosses: 31,
      doublesRank: 7,
      doublesPoints: 1587,
      doublesWins: 83,
      doublesLosses: 30,
      mixedRank: 8,
      mixedPoints: 1612,
      mixedWins: 88,
      mixedLosses: 28
    }
  }
];

// Mock content feed data
const mockContentFeed = [
  {
    id: '1',
    type: 'video' as const,
    title: 'Advanced Third Shot Drop Technique',
    description: 'Master the third shot drop with proper form and placement strategies',
    author: 'Coach Sarah Martinez',
    authorRole: 'Coach',
    timestamp: '2 hours ago',
    privacy: 'Public' as const,
    stats: {
      views: 234,
      likes: 45,
      comments: 12,
      duration: '8:42'
    },
    tags: ['Technique', 'Drops', 'Advanced'],
    isPriority: true,
    isRelevant: true
  },
  {
    id: '2',
    type: 'assessment' as const,
    title: 'Your Q1 2025 Skill Assessment Results',
    description: 'Comprehensive review of your technical, tactical, physical, and mental skills',
    author: 'Coach Mike Johnson',
    authorRole: 'Coach',
    timestamp: '1 day ago',
    privacy: 'Private' as const,
    stats: {
      views: 3
    },
    tags: ['Assessment', 'Progress', 'Skills'],
    isPriority: true,
    isRelevant: true
  },
  {
    id: '3',
    type: 'tournament' as const,
    title: 'Vancouver Open Championship 2025',
    description: 'Elite division highlights and championship match recap',
    author: 'Tournament Director',
    authorRole: 'Admin',
    timestamp: '3 days ago',
    privacy: 'Public' as const,
    stats: {
      views: 1256,
      likes: 187,
      comments: 43
    },
    tags: ['Tournament', 'Elite', 'Vancouver'],
    isRelevant: true
  },
  {
    id: '4',
    type: 'article' as const,
    title: 'Mental Game: Staying Focused Under Pressure',
    description: 'Learn techniques to maintain composure during critical match points',
    author: 'Dr. Emma Wilson',
    authorRole: 'Coach',
    timestamp: '5 days ago',
    privacy: 'Public' as const,
    stats: {
      views: 892,
      likes: 156,
      comments: 28
    },
    tags: ['Mental Game', 'Strategy', 'Performance'],
    isPriority: false,
    isRelevant: true
  },
  {
    id: '5',
    type: 'video' as const,
    title: 'Footwork Drills for Better Court Coverage',
    description: 'Essential footwork patterns to improve speed and positioning',
    author: 'Coach David Kim',
    authorRole: 'Coach',
    timestamp: '1 week ago',
    privacy: 'Friends' as const,
    stats: {
      views: 145,
      likes: 32,
      comments: 8,
      duration: '12:15'
    },
    tags: ['Footwork', 'Drills', 'Fundamentals'],
    isRelevant: false
  }
];

// Mock match history data
const mockMatchHistory = [
  {
    id: '1',
    result: 'victory' as const,
    opponent: {
      name: 'David Kim',
      rankingPoints: 1523,
      tier: 'elite' as const
    },
    score: { player: 11, opponent: 7 },
    pointsChange: 34,
    date: 'Today',
    location: 'Vancouver Community Center',
    matchType: 'singles' as const,
    duration: '28 min'
  },
  {
    id: '2',
    result: 'victory' as const,
    opponent: {
      name: 'Lisa Anderson',
      rankingPoints: 1456,
      tier: 'elite' as const
    },
    score: { player: 11, opponent: 9 },
    pointsChange: 28,
    date: 'Yesterday',
    location: 'Richmond Sports Complex',
    matchType: 'singles' as const,
    duration: '35 min'
  },
  {
    id: '3',
    result: 'defeat' as const,
    opponent: {
      name: 'Emma Wilson',
      rankingPoints: 1892,
      tier: 'professional' as const
    },
    score: { player: 8, opponent: 11 },
    pointsChange: -15,
    date: '2 days ago',
    location: 'Burnaby Lake Park',
    matchType: 'singles' as const,
    duration: '42 min'
  },
  {
    id: '4',
    result: 'victory' as const,
    opponent: {
      name: 'James Lee',
      rankingPoints: 1198,
      tier: 'elite' as const
    },
    score: { player: 11, opponent: 6 },
    pointsChange: 22,
    date: '3 days ago',
    location: 'Vancouver Community Center',
    matchType: 'singles' as const,
    duration: '25 min'
  },
  {
    id: '5',
    result: 'victory' as const,
    opponent: {
      name: 'Maria Garcia',
      rankingPoints: 1134,
      tier: 'elite' as const
    },
    score: { player: 11, opponent: 8 },
    pointsChange: 19,
    date: '5 days ago',
    location: 'Surrey Recreation Center',
    matchType: 'singles' as const,
    duration: '31 min'
  }
];

const mockRankings: RankedPlayer[] = [
  {
    id: '1',
    name: 'Sarah Martinez',
    tier: 'professional',
    rankingPoints: 2156,
    rank: 1,
    location: 'Vancouver, BC',
    recentChange: +47,
    winRate: 0.89,
    matchesPlayed: 156,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616c179e845?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '2', 
    name: 'Mike Johnson',
    tier: 'professional',
    rankingPoints: 2089,
    rank: 2,
    location: 'Toronto, ON',
    recentChange: -12,
    winRate: 0.87,
    matchesPlayed: 203,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Alex Chen',
    tier: 'elite',
    rankingPoints: 1647,
    rank: 3,
    location: 'Vancouver, BC',
    recentChange: +23,
    winRate: 0.82,
    matchesPlayed: 134,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  // Ranks 4-8 for card display
  {
    id: '4',
    name: 'Jessica Liu',
    tier: 'elite',
    rankingPoints: 1523,
    rank: 4,
    location: 'Vancouver, BC',
    recentChange: +15,
    winRate: 0.79,
    matchesPlayed: 98,
  },
  {
    id: '5',
    name: 'David Kim',
    tier: 'elite',
    rankingPoints: 1456,
    rank: 5,
    location: 'Richmond, BC',
    recentChange: -8,
    winRate: 0.74,
    matchesPlayed: 112,
  },
  {
    id: '6',
    name: 'Maria Santos',
    tier: 'elite',
    rankingPoints: 1398,
    rank: 6,
    location: 'Burnaby, BC',
    recentChange: +22,
    winRate: 0.81,
    matchesPlayed: 87,
  },
  {
    id: '7',
    name: 'Robert Wilson',
    tier: 'competitive',
    rankingPoints: 1367,
    rank: 7,
    location: 'Surrey, BC',
    recentChange: +5,
    winRate: 0.77,
    matchesPlayed: 134,
  },
  {
    id: '8',
    name: 'Linda Chang',
    tier: 'competitive',
    rankingPoints: 1298,
    rank: 8,
    location: 'Vancouver, BC',
    recentChange: -3,
    winRate: 0.73,
    matchesPlayed: 156,
  },
  // Additional players for row display
  {
    id: '9',
    name: 'Tom Anderson',
    tier: 'competitive',
    rankingPoints: 1276,
    rank: 9,
    location: 'Coquitlam, BC',
    recentChange: +12,
    winRate: 0.69,
    matchesPlayed: 89,
  },
  {
    id: '10',
    name: 'Lisa Park',
    tier: 'competitive',
    rankingPoints: 1254,
    rank: 10,
    location: 'Vancouver, BC',
    recentChange: +7,
    winRate: 0.71,
    matchesPlayed: 102,
  },
];

// Notifications Header Component with WebSocket Integration
function NotificationsHeader({ 
  player, 
  notifications, 
  connected, 
  onTriggerDemo 
}: { 
  player: PlayerData;
  notifications: Array<{id: string; type: string; message: string; timestamp: Date; read: boolean}>;
  connected: boolean;
  onTriggerDemo: () => void;
}) {
  const { toast } = useToast();
  const config = tierConfig[player.tier];
  const TierIcon = config.icon;
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div 
      className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-4 sticky top-0 z-50"
    >
      <div className="flex items-center justify-between">
        {/* Player Identity */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-full flex items-center justify-center`}>
            <TierIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">{player.name}</div>
            <div className="text-slate-400 text-sm flex items-center gap-2">
              <IdCard className="h-3 w-3" />
              <span>{player.passportCode}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(player.passportCode);
                  toast({ title: "Passport code copied!", duration: 2000 });
                }}
                className="hover:text-slate-300 transition-colors"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* WebSocket Status & Notifications */}
        <div className="flex items-center gap-3">
          {/* WebSocket Connection Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-green-400">
              <Wifi className="h-4 w-4" />
              <span className="text-xs">Live</span>
            </div>
          </div>

          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-white hover:bg-slate-700"
            onClick={onTriggerDemo}
          >
            <BellRing className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Recent Notifications Preview */}
          {notifications.slice(0, 2).map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-48"
            >
              <Badge 
                className={`text-xs transition-all ${
                  notification.type === 'match_request' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                  notification.type === 'ranking_update' ? 'bg-green-500/20 text-green-300 border-green-400/30' :
                  notification.type === 'challenge' ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' :
                  'bg-purple-500/20 text-purple-300 border-purple-400/30'
                }`}
              >
                {notification.message.slice(0, 30)}...
              </Badge>
            </motion.div>
          ))}
          
          {notifications.length === 0 && (
            <div className="text-slate-400 text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              All caught up!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Avatar component with fallback for broken/missing images
function PlayerAvatar({ 
  player, 
  size = 'w-12 h-12',
  iconSize = 'h-6 w-6',
  border = ''
}: { 
  player: RankedPlayer;
  size?: string;
  iconSize?: string;
  border?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const config = tierConfig[player.tier];
  
  if (!player.avatar || imageError) {
    return (
      <div className={`${size} bg-gradient-to-r ${config.color} rounded-full flex items-center justify-center ${border}`}>
        <config.icon className={`${iconSize} text-white`} />
      </div>
    );
  }
  
  return (
    <img 
      src={player.avatar} 
      alt={player.name}
      className={`${size} rounded-full object-cover ${border}`}
      onError={() => setImageError(true)}
    />
  );
}

// PlayerRankingCard Component (for ranks 4-8) - Wrapped with forwardRef for Framer Motion
const PlayerRankingCard = React.forwardRef<HTMLDivElement, { 
  player: RankedPlayer; 
  showDetails?: boolean;
  isPodium?: boolean;
}>(({ player, showDetails = false, isPodium = false }, ref) => {
  const config = tierConfig[player.tier];
  const initials = player.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800 border-slate-700 rounded-lg border overflow-hidden hover:bg-slate-700/50 transition-colors cursor-pointer ${
        isPodium ? 'shadow-lg' : ''
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          {/* Rank */}
          <div className="flex-shrink-0">
            {player.rank <= 3 ? (
              <div className="text-2xl">
                <Medal className={`h-6 w-6 ${player.rank === 1 ? 'text-yellow-400' : player.rank === 2 ? 'text-slate-400' : 'text-amber-600'}`} />
              </div>
            ) : (
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">#{player.rank}</span>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-12 h-12">
            <PlayerAvatar player={player} />
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold truncate">{player.name}</div>
            <div className="text-slate-400 text-sm flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {player.location}
            </div>
          </div>

          {/* Recent Change */}
          <Badge 
            className={`text-xs ${
              player.recentChange > 0 
                ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                : player.recentChange < 0
                ? 'bg-red-500/20 text-red-300 border-red-400/30'
                : 'bg-gray-500/20 text-gray-300 border-gray-400/30'
            }`}
          >
            {player.recentChange > 0 ? '+' : ''}{player.recentChange}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-white">{player.rankingPoints.toLocaleString()}</div>
            <div className="text-slate-400 text-xs">Points</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{(player.winRate * 100).toFixed(0)}%</div>
            <div className="text-slate-400 text-xs">Win Rate</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{player.matchesPlayed}</div>
            <div className="text-slate-400 text-xs">Matches</div>
          </div>
        </div>

        {/* Tier Badge */}
        <div className="mt-3">
          <Badge className={`text-xs ${config.name === 'Professional' ? 'bg-orange-500/20 text-orange-300' : 
            config.name === 'Elite' ? 'bg-purple-500/20 text-purple-300' : 
            'bg-blue-500/20 text-blue-300'}`}>
            {config.name}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
});

// Add display name for debugging
PlayerRankingCard.displayName = 'PlayerRankingCard';

// Navigation Tabs Component
function NavigationTabs({ activeTab, onTabChange }: { activeTab: TabMode; onTabChange: (tab: TabMode) => void }) {
  const tabs = [
    { id: 'passport' as TabMode, label: 'Passport', icon: IdCard },
    { id: 'play' as TabMode, label: 'Play', icon: Activity },
    { id: 'rankings' as TabMode, label: 'Rankings', icon: Trophy },
    { id: 'profile' as TabMode, label: 'Profile', icon: UserCog },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 z-50">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 p-4 flex flex-col items-center gap-1 transition-colors ${
                activeTab === tab.id 
                  ? 'text-orange-400 bg-orange-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// QR Code Modal Component
function QRCodeModal({ 
  isOpen, 
  onClose, 
  passportCode 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  passportCode: string; 
}) {
  if (!isOpen) return null;

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 rounded-lg p-6 max-w-sm w-full border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Passport QR Code</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center">
          <div className="bg-white p-4 rounded-lg mb-4 mx-auto w-fit">
            {/* Enhanced QR code visualization */}
            <div className="w-32 h-32 bg-white relative">
              {/* QR Code Pattern Simulation */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-px">
                {Array.from({ length: 64 }, (_, i) => (
                  <div 
                    key={i}
                    className={`${
                      // Create a pattern that looks like a QR code
                      (i % 3 === 0 || i % 7 === 0 || i % 11 === 0 || 
                       Math.floor(i / 8) % 2 === i % 2 ||
                       [0, 7, 56, 63, 8, 15, 48, 55].includes(i)) 
                        ? 'bg-black' 
                        : 'bg-white'
                    }`}
                  />
                ))}
              </div>
              {/* Corner position markers */}
              <div className="absolute top-1 left-1 w-4 h-4 border-2 border-black">
                <div className="w-2 h-2 bg-black m-px"></div>
              </div>
              <div className="absolute top-1 right-1 w-4 h-4 border-2 border-black">
                <div className="w-2 h-2 bg-black m-px"></div>
              </div>
              <div className="absolute bottom-1 left-1 w-4 h-4 border-2 border-black">
                <div className="w-2 h-2 bg-black m-px"></div>
              </div>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Scan this QR code to connect with this player
          </p>
          <div className="font-mono text-white bg-slate-800 px-3 py-2 rounded text-sm">
            {formatPassportCode(passportCode)}
          </div>
          
          {/* Close button at bottom */}
          <Button 
            onClick={onClose}
            className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Passport Mode Content - Full passport display
function PassportModeContent({ 
  player, 
  passportPhoto, 
  onPhotoUpload,
  leaderboardPlayers,
  contentFeedItems,
  matchHistory
}: { 
  player: PlayerData;
  passportPhoto?: string;
  onPhotoUpload: (photoData: string) => void;
  leaderboardPlayers?: any[];
  contentFeedItems?: any[];
  matchHistory?: any[];
}) {
  const { toast } = useToast();
  const [codeRevealed, setCodeRevealed] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeOpponent, setChallengeOpponent] = useState<any>(null);
  const [suggestedMatchType, setSuggestedMatchType] = useState<'singles' | 'doubles' | 'mixed'>('singles');

  const handleCopy = () => {
    navigator.clipboard.writeText(player.passportCode);
    toast({ 
      title: "Passport code copied!", 
      description: `${formatPassportCode(player.passportCode)} copied to clipboard`,
      duration: 2000 
    });
  };

  const handleShowQR = () => {
    setShowQRModal(true);
  };

  return (
    <div className="space-y-6">
      {/* 3-Column Gaming HUD Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Passport Hero - Player Identity */}
        <div className="lg:col-span-1 space-y-6" data-testid="column-hero">
          <PassportHero 
            player={player}
            codeRevealed={codeRevealed}
            passportPhoto={passportPhoto}
            onToggleReveal={() => setCodeRevealed(!codeRevealed)}
            onCopy={handleCopy}
            onShowQR={handleShowQR}
            onPhotoUpload={onPhotoUpload}
          />
        </div>

        {/* Column 2: HUD Components - Stats & Competition */}
        <div className="lg:col-span-1 space-y-6" data-testid="column-hud">
          {/* Battle Stats - Gaming HUD Style */}
          <HexagonalStats 
            stats={{
              wins: Math.round((player.winRate || 0.73) * 100),
              losses: 100 - Math.round((player.winRate || 0.73) * 100),
              winRate: (player.winRate || 0.73) * 100,
              totalMatches: 100,
              currentStreak: 5,
              bestStreak: 12
            }}
          />

          {/* Interactive Leaderboard with Challenge System */}
          <InteractiveLeaderboard
            players={leaderboardPlayers || []}
            currentPlayerId={player.id}
            currentPlayerGender="male"
            onChallenge={(challengedPlayer, suggestedType) => {
              setChallengeOpponent(challengedPlayer);
              setSuggestedMatchType(suggestedType);
              setShowChallengeModal(true);
            }}
          />
        </div>

        {/* Column 3: Content Feed & Battle Log */}
        <div className="lg:col-span-1 space-y-6" data-testid="column-content">
          {/* Personalized Content Feed */}
          <ContentFeed items={contentFeedItems || []} />

          {/* Battle Log - Match History */}
          <BattleLogHistory matches={matchHistory || []} />
        </div>
      </div>
      
      {/* Smart Challenge Modal */}
      {challengeOpponent && (
        <SmartChallengeModal
          isOpen={showChallengeModal}
          onClose={() => setShowChallengeModal(false)}
          opponent={{
            id: challengeOpponent.id,
            name: challengeOpponent.name,
            gender: challengeOpponent.gender,
            rankings: challengeOpponent.rankings
          }}
          currentPlayer={{
            id: player.id,
            name: player.name,
            gender: 'male',
            rankings: mockLeaderboardPlayers.find(p => p.id === 'current')?.rankings || {
              singlesRank: 6,
              singlesPoints: 1247,
              singlesWins: 73,
              singlesLosses: 27,
              doublesRank: 5,
              doublesPoints: 1698,
              doublesWins: 82,
              doublesLosses: 28,
              mixedRank: 6,
              mixedPoints: 1654,
              mixedWins: 76,
              mixedLosses: 29
            }
          }}
          suggestedMatchType={suggestedMatchType}
          availablePartners={[
            { id: 'p1', name: 'Chris Martinez', gender: 'male', doublesRank: 8, mixedRank: 12 },
            { id: 'p2', name: 'Jordan Smith', gender: 'male', doublesRank: 11, mixedRank: 9 },
            { id: 'p3', name: 'Taylor Wilson', gender: 'female', doublesRank: 6, mixedRank: 7 },
            { id: 'p4', name: 'Sam Chen', gender: 'female', doublesRank: 9, mixedRank: 11 }
          ]}
          onChallengeSubmit={(matchType, partnerId) => {
            const partnerName = partnerId 
              ? [
                  { id: 'p1', name: 'Chris Martinez' },
                  { id: 'p2', name: 'Jordan Smith' },
                  { id: 'p3', name: 'Taylor Wilson' },
                  { id: 'p4', name: 'Sam Chen' }
                ].find(p => p.id === partnerId)?.name 
              : null;
            
            toast({
              title: "Challenge Sent!",
              description: partnerId 
                ? `${matchType.charAt(0).toUpperCase() + matchType.slice(1)} challenge sent to ${challengeOpponent.name} with partner ${partnerName}. They have 24h to respond.`
                : `${matchType.charAt(0).toUpperCase() + matchType.slice(1)} challenge sent to ${challengeOpponent.name}. They have 24h to respond.`,
              duration: 4000
            });
            setShowChallengeModal(false);
          }}
          onFindPartner={() => {
            toast({
              title: "Partner Discovery",
              description: "Opening partner search...",
              duration: 2000
            });
          }}
        />
      )}
      
      {/* QR Code Modal */}
      <QRCodeModal 
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        passportCode={player.passportCode}
      />
    </div>
  );
}

// Gaming-Style Player Card Component
function ArenaPlayerCard({ player, onChallenge, onViewProfile, onPartnerUp, myPlayerId }: {
  player: ArenaPlayer;
  onChallenge: (player: ArenaPlayer, matchType: MatchType) => void;
  onViewProfile: (player: ArenaPlayer) => void;
  onPartnerUp: (player: ArenaPlayer) => void;
  myPlayerId: string;
}) {
  const config = tierConfig[player.tier];
  const statusConfig = {
    online: { color: 'bg-green-500', text: 'Online', pulse: true },
    available: { color: 'bg-green-400', text: 'Available', pulse: true },
    'in-match': { color: 'bg-red-500', text: 'In Match', pulse: false },
    away: { color: 'bg-yellow-500', text: 'Away', pulse: false },
    offline: { color: 'bg-gray-500', text: 'Offline', pulse: false },
  };

  const status = statusConfig[player.status];
  const TierIcon = config.icon;
  const isChallengeable = player.status === 'online' || player.status === 'available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className={`p-4 border border-slate-600 bg-gradient-to-br ${config.color} hover:border-orange-400 transition-all`}>
        {/* Status Indicator */}
        <div className="absolute -top-2 -right-2">
          <div className={`w-4 h-4 rounded-full ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
        </div>

        <div className="text-white">
          {/* Player Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                <TierIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-lg">{player.name}</div>
                <div className="text-xs opacity-75">{config.name}</div>
                <div className="flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {player.distance < 1 ? `${Math.round(player.distance * 1000)}m` : `${player.distance}km`}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold">{player.rankingPoints.toLocaleString()}</div>
              <div className="text-xs opacity-75">Ranking Points</div>
            </div>
          </div>

          {/* Match Type & Partner Info */}
          <div className="mb-3">
            {player.matchType === 'doubles-team' && player.partner ? (
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                <Users className="h-4 w-4" />
                <span className="text-sm">Team with {player.partner.name}</span>
              </div>
            ) : player.matchType === 'doubles-looking' ? (
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                <UserPlus className="h-4 w-4" />
                <span className="text-sm">Looking for doubles partner</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                <User className="h-4 w-4" />
                <span className="text-sm">Singles player</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="text-center p-2 bg-black/20 rounded">
              <div className="font-bold">{Math.round(player.winRate * 100)}%</div>
              <div className="opacity-75">Win Rate</div>
            </div>
            <div className="text-center p-2 bg-black/20 rounded">
              <div className="font-bold">{status.text}</div>
              <div className="opacity-75">Status</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => onViewProfile(player)}
              variant="outline"
              size="sm"
              className="flex-1 text-white border-white/30 hover:bg-white/10"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            {isChallengeable && player.id !== myPlayerId ? (
              player.matchType === 'doubles-looking' ? (
                <Button
                  onClick={() => onPartnerUp(player)}
                  size="sm"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Partner Up
                </Button>
              ) : (
                <Button
                  onClick={() => onChallenge(player, player.matchType)}
                  size="sm"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Swords className="h-4 w-4 mr-1" />
                  Challenge
                </Button>
              )
            ) : (
              <Button
                disabled
                size="sm"
                className="flex-1 opacity-50"
              >
                <Timer className="h-4 w-4 mr-1" />
                {player.status === 'in-match' ? 'In Match' : 'Unavailable'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Enhanced Challenge Modal with smart doubles detection and match preview
function ChallengeModal({ player, isOpen, onClose, onSendChallenge, myPartner }: {
  player: ArenaPlayer | null;
  isOpen: boolean;
  onClose: () => void;
  onSendChallenge: (matchType: MatchType, message: string) => void;
  myPartner: ArenaPlayer | null;
}) {
  const [selectedType, setSelectedType] = useState<MatchType>('singles');
  const [message, setMessage] = useState('');

  // Smart type detection based on target player and user's partner status
  const getAvailableMatchTypes = () => {
    const types = [{ type: 'singles' as MatchType, label: 'Singles Match', icon: User }];
    
    if (player?.matchType === 'doubles-team' && myPartner) {
      // User has partner, challenging doubles team = Team vs Team
      types.push({ type: 'doubles-team' as MatchType, label: `Team Match (You + ${myPartner.name} vs ${player.name} + ${player.partner?.name})`, icon: Users });
    } else if (player?.matchType === 'doubles-team' && !myPartner) {
      // User has no partner, need to find one first
      types.push({ type: 'doubles-looking' as MatchType, label: 'Find Partner First, Then Challenge Team', icon: UserPlus });
    } else if (player?.matchType === 'doubles-looking') {
      // Target is looking for partner
      types.push({ type: 'doubles-looking' as MatchType, label: 'Partner Up & Play Together', icon: UserPlus });
    }
    
    return types;
  };

  if (!player) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full"
          >
            <Card className="p-6 bg-slate-800 border-slate-700">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Swords className="h-6 w-6 text-orange-400" />
                  <h2 className="text-xl font-bold text-white">Challenge {player.name}</h2>
                </div>
                <p className="text-slate-400">Send a match challenge</p>
              </div>

              <div className="space-y-4">
                {/* Smart Match Type Selection */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Match Type</label>
                  <div className="space-y-2">
                    {getAvailableMatchTypes().map(({ type, label, icon: Icon }) => (
                      <Button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        variant={selectedType === type ? 'default' : 'outline'}
                        className="w-full justify-start text-left"
                      >
                        <Icon className="h-4 w-4 mr-2 shrink-0" />
                        <span className="truncate">{label}</span>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Context-aware helper text */}
                  {player?.matchType === 'doubles-team' && !myPartner && (
                    <p className="text-xs text-orange-400 mt-2">
                      💡 You need a doubles partner to challenge this team
                    </p>
                  )}
                  {player?.matchType === 'doubles-team' && myPartner && (
                    <p className="text-xs text-green-400 mt-2">
                      🎾 Perfect! Team vs Team match ready
                    </p>
                  )}
                </div>

                {/* Match Preview */}
                {selectedType === 'doubles-team' && myPartner && player?.partner && (
                  <div className="p-4 bg-slate-900/50 border border-orange-500/30 rounded-lg">
                    <div className="text-center mb-3">
                      <h3 className="text-white font-medium flex items-center justify-center gap-2">
                        <Trophy className="h-4 w-4 text-orange-400" />
                        Match Preview
                      </h3>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      {/* Team 1 */}
                      <div className="text-center">
                        <div className="bg-blue-500/20 rounded-lg p-3 mb-2">
                          <Users className="h-6 w-6 text-blue-400 mx-auto" />
                        </div>
                        <div className="text-white font-medium text-sm">Your Team</div>
                        <div className="text-blue-400 text-xs">You & {myPartner.name}</div>
                      </div>
                      
                      {/* VS */}
                      <div className="text-orange-400 font-bold text-lg">VS</div>
                      
                      {/* Team 2 */}
                      <div className="text-center">
                        <div className="bg-red-500/20 rounded-lg p-3 mb-2">
                          <Users className="h-6 w-6 text-red-400 mx-auto" />
                        </div>
                        <div className="text-white font-medium text-sm">Their Team</div>
                        <div className="text-red-400 text-xs">{player.name} & {player.partner.name}</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedType === 'singles' && (
                  <div className="p-4 bg-slate-900/50 border border-purple-500/30 rounded-lg">
                    <div className="text-center mb-3">
                      <h3 className="text-white font-medium flex items-center justify-center gap-2">
                        <User className="h-4 w-4 text-purple-400" />
                        Singles Match Preview
                      </h3>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="bg-blue-500/20 rounded-lg p-3 mb-2">
                          <User className="h-6 w-6 text-blue-400 mx-auto" />
                        </div>
                        <div className="text-blue-400 text-sm">You</div>
                      </div>
                      
                      <div className="text-purple-400 font-bold text-lg">VS</div>
                      
                      <div className="text-center">
                        <div className="bg-red-500/20 rounded-lg p-3 mb-2">
                          <User className="h-6 w-6 text-red-400 mx-auto" />
                        </div>
                        <div className="text-red-400 text-sm">{player.name}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Challenge Message</label>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ready for a match?"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 text-white border-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => onSendChallenge(selectedType, message)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Challenge
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Play Mode Content with Full Arena Integration
function PlayModeContent() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [arenaMode, setArenaMode] = useState<'lobby' | 'challenges' | 'doubles'>('lobby');
  const [selectedPlayer, setSelectedPlayer] = useState<ArenaPlayer | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challenges, setChallenges] = useState<ChallengeRequest[]>([]);
  const [myPartner, setMyPartner] = useState<ArenaPlayer | null>(null); // Track if user already has a partner
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterMatchType, setFilterMatchType] = useState<string>('all');

  // Mock current player
  const myPlayerId = 'current-player';

  // Mock arena players (nearby/online)
  const [arenaPlayers, setArenaPlayers] = useState<ArenaPlayer[]>([
    {
      id: '1',
      name: 'Sarah Martinez',
      tier: 'elite',
      rankingPoints: 1456,
      status: 'online',
      location: 'Downtown Sports Complex',
      distance: 0.8,
      matchType: 'singles',
      winRate: 0.82,
      isOnline: true,
      lastSeen: 'now',
      preferredFormat: 'singles'
    },
    {
      id: '2',
      name: 'Mike Johnson',
      tier: 'competitive',
      rankingPoints: 892,
      status: 'available',
      location: 'Riverside Community Center',
      distance: 1.2,
      matchType: 'doubles-team',
      partner: { name: 'Lisa Chen', id: 'lisa_chen' },
      winRate: 0.67,
      isOnline: true,
      lastSeen: '2 min ago',
      preferredFormat: 'doubles'
    },
    {
      id: '3',
      name: 'Emma Davis',
      tier: 'recreational',
      rankingPoints: 234,
      status: 'online',
      location: 'Westside Courts',
      distance: 0.5,
      matchType: 'doubles-looking',
      winRate: 0.45,
      isOnline: true,
      lastSeen: 'now',
      preferredFormat: 'doubles'
    },
    {
      id: '4',
      name: 'James Wilson',
      tier: 'professional',
      rankingPoints: 2134,
      status: 'in-match',
      location: 'Elite Training Center',
      distance: 2.1,
      matchType: 'singles',
      winRate: 0.91,
      isOnline: true,
      lastSeen: '1 hour ago',
      preferredFormat: 'both'
    },
    {
      id: '5',
      name: 'Anna Schmidt',
      tier: 'elite',
      rankingPoints: 1323,
      status: 'available',
      location: 'North Park Courts',
      distance: 0.3,
      matchType: 'doubles-team',
      partner: { name: 'David Kim', id: 'david_kim' },
      winRate: 0.78,
      isOnline: true,
      lastSeen: 'now',
      preferredFormat: 'doubles'
    }
  ]);

  const handleChallenge = (player: ArenaPlayer, matchType: MatchType) => {
    setSelectedPlayer(player);
    setShowChallengeModal(true);
  };

  const handleSendChallenge = (matchType: MatchType, message: string) => {
    if (!selectedPlayer) return;

    // Handle different challenge scenarios with match preview
    if (matchType === 'doubles-team' && myPartner) {
      // Team vs Team - go directly to match recording with context
      const matchData = {
        team1: {
          player1: { name: 'You', id: myPlayerId },
          player2: { name: myPartner.name, id: myPartner.id }
        },
        team2: {
          player1: { name: selectedPlayer.name, id: selectedPlayer.id },
          player2: { name: selectedPlayer.partner?.name || 'Partner', id: selectedPlayer.partner?.id || 'partner' }
        },
        matchType: 'doubles',
        challengeMessage: message
      };
      
      // Store match context for the recording page
      sessionStorage.setItem('pendingMatch', JSON.stringify(matchData));
      sessionStorage.setItem('realPlayerNames', JSON.stringify({
        team1Player1: 'You',
        team1Player2: myPartner.name,
        team2Player1: selectedPlayer.name,
        team2Player2: selectedPlayer.partner?.name || 'Partner'
      }));
      
      toast({
        title: "🎮 Team Challenge Ready!",
        description: `Starting team match: You & ${myPartner.name} vs ${selectedPlayer.name} & ${selectedPlayer.partner?.name}`,
        duration: 3000,
      });
      
      setTimeout(() => {
        setLocation('/match-arena');
      }, 1500);
      
    } else {
      // Regular challenge
      const newChallenge: ChallengeRequest = {
        id: Date.now().toString(),
        fromPlayer: {
          id: myPlayerId,
          name: 'You',
          tier: 'elite',
          rankingPoints: 1247,
          status: 'online',
          location: 'Current',
          distance: 0,
          matchType: matchType,
          winRate: 0.73,
          isOnline: true,
          lastSeen: 'now'
        },
        toPlayer: selectedPlayer,
        matchType,
        message: message || 'Ready for a match?',
        timestamp: new Date(),
        status: 'pending'
      };

      setChallenges(prev => [...prev, newChallenge]);
      
      const feedback = {
        'singles': `Singles challenge sent to ${selectedPlayer.name}`,
        'doubles-looking': `Partnership request sent to ${selectedPlayer.name}`,
        'doubles-team': `Team challenge sent to ${selectedPlayer.name}'s team`
      };
      
      toast({
        title: "🎯 Challenge Sent!",
        description: feedback[matchType] || `Challenge sent to ${selectedPlayer.name}`,
        duration: 3000,
      });

      setTimeout(() => setArenaMode('challenges'), 500);
    }
    
    setShowChallengeModal(false);
    setSelectedPlayer(null);
  };

  // Filter players based on criteria
  const filteredPlayers = arenaPlayers.filter(player => {
    const tierMatch = filterTier === 'all' || player.tier === filterTier;
    const matchTypeMatch = filterMatchType === 'all' || player.matchType === filterMatchType;
    return tierMatch && matchTypeMatch;
  });

  return (
    <div className="space-y-6">
      {/* Arena Mode Tabs */}
      <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
        <Button
          onClick={() => setArenaMode('lobby')}
          variant={arenaMode === 'lobby' ? 'default' : 'ghost'}
          className="flex-1"
        >
          <Gamepad2 className="h-4 w-4 mr-2" />
          Lobby
        </Button>
        <Button
          onClick={() => setArenaMode('challenges')}
          variant={arenaMode === 'challenges' ? 'default' : 'ghost'}
          className="flex-1 relative"
        >
          <Swords className="h-4 w-4 mr-2" />
          Challenges
          {challenges.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-orange-500">
              {challenges.length}
            </Badge>
          )}
        </Button>
        <Button
          onClick={() => setArenaMode('doubles')}
          variant={arenaMode === 'doubles' ? 'default' : 'ghost'}
          className="flex-1"
        >
          <Users className="h-4 w-4 mr-2" />
          Doubles
        </Button>
      </div>

      {/* Arena Content */}
      {arenaMode === 'lobby' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-white text-sm">Filter:</span>
              </div>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger className="w-[120px] bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="recreational">Recreational</SelectItem>
                  <SelectItem value="competitive">Competitive</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterMatchType} onValueChange={setFilterMatchType}>
                <SelectTrigger className="w-[140px] bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="singles">Singles</SelectItem>
                  <SelectItem value="doubles-looking">Looking for Partner</SelectItem>
                  <SelectItem value="doubles-team">Doubles Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Players Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlayers.map(player => (
              <ArenaPlayerCard
                key={player.id}
                player={player}
                onChallenge={handleChallenge}
                onViewProfile={() => {}}
                onPartnerUp={(player) => {
                  toast({
                    title: "🤝 Partnership Request Sent!",
                    description: `Sending partnership request to ${player.name}...`,
                    duration: 2000,
                  });
                }}
                myPlayerId={myPlayerId}
              />
            ))}
          </div>
        </div>
      )}

      {arenaMode === 'challenges' && (
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Swords className="h-5 w-5 mr-2 text-orange-400" />
            Active Challenges
          </h3>
          {challenges.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No active challenges</p>
              <p className="text-slate-500 text-sm">Challenge players from the lobby to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.map(challenge => (
                <div key={challenge.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <div className="text-white font-medium">
                      {challenge.matchType === 'singles' ? 'Singles' : 'Doubles'} Challenge to {challenge.toPlayer.name}
                    </div>
                    <div className="text-slate-400 text-sm">{challenge.message}</div>
                  </div>
                  <Badge variant="outline" className="text-orange-400 border-orange-400">
                    {challenge.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {arenaMode === 'doubles' && (
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            Doubles Partners
          </h3>
          {myPartner ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Current Partner</div>
                    <div className="text-blue-400">{myPartner.name}</div>
                  </div>
                </div>
                <Button
                  onClick={() => setMyPartner(null)}
                  variant="outline"
                  size="sm"
                  className="text-white border-slate-600"
                >
                  Leave Team
                </Button>
              </div>
              <Button
                onClick={() => setArenaMode('lobby')}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                <Swords className="h-4 w-4 mr-2" />
                Find Teams to Challenge
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No current doubles partner</p>
              <Button
                onClick={() => setArenaMode('lobby')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Find Partner
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Challenge Modal */}
      <ChallengeModal
        player={selectedPlayer}
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        onSendChallenge={handleSendChallenge}
        myPartner={myPartner}
      />
    </div>
  );
}

// Rankings Mode Content - Enhanced with real data integration
function RankingsModeContent({ player }: { player: PlayerData }) {
  const [selectedFormat, setSelectedFormat] = useState('singles'); // singles, doubles, mixed-doubles
  const [selectedGender, setSelectedGender] = useState('men'); // men, women
  const [selectedView, setSelectedView] = useState('global'); // local, regional, global
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch real rankings data from API with format and gender specifications
  const { data: leaderboardData, isLoading: isLoadingLeaderboard, error: leaderboardError } = useQuery({
    queryKey: ['/api/enhanced-leaderboard', selectedFormat, selectedGender, selectedView],
    queryFn: () => {
      // Convert new format structure to API format
      let apiFormat = selectedFormat;
      if (selectedFormat === 'doubles') {
        apiFormat = selectedGender === 'men' ? 'mens-doubles' : 'womens-doubles';
      } else if (selectedFormat === 'mixed-doubles') {
        apiFormat = selectedGender === 'men' ? 'mixed-doubles-men' : 'mixed-doubles-women';
      }
      
      const params = new URLSearchParams({
        format: apiFormat,
        gender: selectedGender,
        division: 'open', // Default to open division
        view: selectedView
      });
      return fetch(`/api/enhanced-leaderboard?${params}`).then(res => res.json());
    },
    enabled: true
  });
  
  // Fetch user's position in rankings
  const { data: userPosition, isLoading: isLoadingPosition } = useQuery({
    queryKey: ['/api/multi-rankings/position', selectedFormat, selectedGender],
    queryFn: () => {
      const params = new URLSearchParams({
        format: selectedFormat,
        gender: selectedGender
      });
      return fetch(`/api/multi-rankings/position?${params}`).then(res => res.json());
    },
    enabled: true
  });
  
  // Transform API data to match component interface
  const transformLeaderboardData = (apiData: any[]): RankedPlayer[] => {
    if (!apiData || !Array.isArray(apiData)) return [];
    
    return apiData.map((entry, index) => ({
      id: entry.id || entry.user_id || `player-${index}`,
      name: entry.name || entry.username || `Player ${index + 1}`,
      tier: mapScoreToTier(entry.ranking_points || entry.points || 0),
      rankingPoints: entry.ranking_points || entry.points || 0,
      rank: entry.rank || index + 1,
      location: entry.location || 'Unknown',
      recentChange: entry.recent_change || entry.point_change || 0,
      winRate: entry.win_rate || (entry.wins && entry.matches ? entry.wins / entry.matches : 0.5),
      matchesPlayed: entry.matches_played || entry.matches || 0,
      avatar: entry.avatar || undefined
    }));
  };
  
  // Map ranking points to tier
  const mapScoreToTier = (points: number): PlayerTier => {
    if (points >= 1800) return 'professional';
    if (points >= 1000) return 'elite';
    if (points >= 300) return 'competitive';
    return 'recreational';
  };
  
  // Use real data only - no demo fallbacks
  const allRankings = isLoadingLeaderboard 
    ? [] // Show empty while loading, no mock data
    : transformLeaderboardData(leaderboardData?.leaderboard || leaderboardData?.players || leaderboardData || []);
  
  // Use only real data
  const rankings = allRankings;
  
  // Filter rankings based on search
  const filteredRankings = rankings.filter(rankedPlayer => 
    rankedPlayer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rankedPlayer.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Split rankings for hybrid display
  const podiumPlayers = filteredRankings.slice(0, 3);
  const cardPlayers = filteredRankings.slice(3, 8);
  const rowPlayers = filteredRankings.slice(8);

  return (
    <div className="space-y-6">
      {/* Data Source Indicator & Loading State */}
      {isLoadingLeaderboard && (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
            <span>Loading live rankings data...</span>
          </div>
        </Card>
      )}
      
      {/* Data Source Badge */}
      <div className="flex items-center justify-between mb-4">
        <Badge className={`${!isLoadingLeaderboard && allRankings.length > 0 ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'} border-none`}>
          {!isLoadingLeaderboard && allRankings.length > 0 ? '🔄 Live Rankings Data' : '🎮 Demo Rankings Data'}
        </Badge>
        {leaderboardError && (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-none">
            ⚠️ Using Demo Data
          </Badge>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IdCard className="h-4 w-4 text-slate-400" />
        </div>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search players by name or location..."
          className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category & View Filters */}
      <div className="space-y-3">
        <div className="space-y-2">
          {/* Format Selection */}
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {[
              { key: 'singles', label: 'Singles' },
              { key: 'doubles', label: 'Doubles' },
              { key: 'mixed-doubles', label: 'Mixed Doubles' }
            ].map((format) => (
              <Button
                key={format.key}
                size="sm"
                variant={selectedFormat === format.key ? 'default' : 'ghost'}
                className={`flex-1 text-xs ${
                  selectedFormat === format.key 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'text-white hover:bg-slate-700'
                }`}
                onClick={() => setSelectedFormat(format.key)}
              >
                {format.label}
              </Button>
            ))}
          </div>
          
          {/* Gender Selection */}
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {[
              { key: 'men', label: 'Men' },
              { key: 'women', label: 'Women' }
            ].map((gender) => (
              <Button
                key={gender.key}
                size="sm"
                variant={selectedGender === gender.key ? 'default' : 'ghost'}
                  className={`flex-1 text-xs ${
                    selectedGender === gender.key 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'text-white hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedGender(gender.key)}
                >
                  {gender.label}
                </Button>
              ))}
            </div>
        </div>

        <div className="flex gap-2">
          {['Local', 'Regional', 'Global'].map((view) => (
            <Button
              key={view}
              size="sm"
              variant={selectedView.toLowerCase() === view.toLowerCase() ? 'default' : 'outline'}
              className={`flex-1 text-xs ${
                selectedView.toLowerCase() === view.toLowerCase() 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'text-white border-slate-600 hover:bg-slate-700'
              }`}
              onClick={() => setSelectedView(view.toLowerCase())}
            >
              {view}
            </Button>
          ))}
        </div>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="text-slate-400 text-sm">
          Found {filteredRankings.length} player{filteredRankings.length !== 1 ? 's' : ''} matching "{searchQuery}"
        </div>
      )}

      {/* No Results */}
      {searchQuery && filteredRankings.length === 0 && (
        <Card className="p-8 bg-slate-800 border-slate-700 text-center">
          <IdCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No players found</h3>
          <p className="text-slate-400">Try adjusting your search terms</p>
        </Card>
      )}

      {/* Your Position */}
      <Card className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400">
        <div className="text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Your Position</h3>
            <Badge className="bg-white/20 text-white text-xs">+{player.recentChange} this week</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">#{player.globalRank}</div>
              <div className="text-orange-100 text-xs">Global</div>
            </div>
            <div>
              <div className="text-xl font-bold">#{player.localRank}</div>
              <div className="text-orange-100 text-xs">Local</div>
            </div>
            <div>
              <div className="text-xl font-bold">{player.rankingPoints}</div>
              <div className="text-orange-100 text-xs">Points</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Top 3 Podium */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Trophy className="h-4 w-4 mr-2 text-orange-400" />
          Local Leaders
        </h3>
        <div className="flex justify-center items-end gap-4 mb-4">
          {/* 2nd place */}
          <div className="w-20 text-center">
            <div className="w-12 h-12 mx-auto mb-2">
              {podiumPlayers[1] && <PlayerAvatar player={podiumPlayers[1]} />}
            </div>
            <div className="text-2xl mb-1">🥈</div>
            <div className="text-white text-sm font-medium">{podiumPlayers[1]?.name.split(' ')[0]}</div>
            <div className="text-slate-400 text-xs">{podiumPlayers[1]?.rankingPoints}</div>
          </div>
          
          {/* 1st place - elevated */}
          <div className="w-24 text-center -mt-4">
            <div className="w-16 h-16 mx-auto mb-2">
              {podiumPlayers[0] && <PlayerAvatar player={podiumPlayers[0]} size="w-16 h-16" iconSize="h-8 w-8" border="border-2 border-yellow-400" />}
            </div>
            <div className="mb-1">
              <Medal className="h-8 w-8 text-yellow-400 mx-auto" />
            </div>
            <div className="text-white font-bold">{podiumPlayers[0]?.name.split(' ')[0]}</div>
            <div className="text-slate-400 text-sm">{podiumPlayers[0]?.rankingPoints}</div>
          </div>
          
          {/* 3rd place */}
          <div className="w-20 text-center">
            <div className="w-12 h-12 mx-auto mb-2">
              {podiumPlayers[2] && <PlayerAvatar player={podiumPlayers[2]} />}
            </div>
            <div className="text-2xl mb-1">🥉</div>
            <div className="text-white text-sm font-medium">{podiumPlayers[2]?.name.split(' ')[0]}</div>
            <div className="text-slate-400 text-xs">{podiumPlayers[2]?.rankingPoints}</div>
          </div>
        </div>
      </Card>

      {/* Leading Contenders (4-8) */}
      {cardPlayers.length > 0 && (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Medal className="h-4 w-4 mr-2 text-orange-400" />
            Leading Contenders
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {cardPlayers.map((rankedPlayer) => (
                <PlayerRankingCard
                  key={rankedPlayer.id}
                  player={rankedPlayer}
                />
              ))}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {/* Players Around You */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <Target className="h-4 w-4 mr-2 text-orange-400" />
          Players Near You
        </h3>
        <div className="space-y-2">
          {[
            { name: 'David Kim', rank: 22, points: 1251, change: '+3' },
            { name: 'You', rank: 23, points: 1247, change: '+34', isYou: true },
            { name: 'Lisa Zhang', rank: 24, points: 1243, change: '-2' },
          ].map((contextPlayer, i) => (
            <div key={i} className={`flex items-center justify-between p-2 rounded ${
              contextPlayer.isYou ? 'bg-orange-500/20 border border-orange-400/30' : 'bg-slate-700/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`font-bold ${contextPlayer.isYou ? 'text-orange-300' : 'text-white'}`}>
                  #{contextPlayer.rank}
                </div>
                <div>
                  <div className={`font-medium ${contextPlayer.isYou ? 'text-orange-200' : 'text-white'}`}>
                    {contextPlayer.name}
                  </div>
                  <div className="text-slate-400 text-xs">{contextPlayer.points.toLocaleString()} points</div>
                </div>
              </div>
              <Badge className={contextPlayer.change.startsWith('+') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                {contextPlayer.change}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
          <BarChart3 className="h-4 w-4 mr-2" />
          Full Rankings
        </Button>
        <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
          <Users className="h-4 w-4 mr-2" />
          Challenge Player
        </Button>
      </div>
    </div>
  );
}

// Profile Mode Content - Comprehensive version with all fields
function ProfileModeContent({ player }: { player: PlayerData }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const config = tierConfig[player.tier];
  const TierIcon = config.icon;

  const [profile, setProfile] = useState({
    // Basic Info
    displayName: player.name,
    email: 'alex.chen@example.com',
    firstName: 'Alex',
    lastName: 'Chen',
    location: 'Vancouver, BC',
    bio: 'Passionate pickleball player always looking to improve.',
    dateOfBirth: '1990-03-15',
    gender: 'male',
    
    // Playing Profile
    skillLevel: '4.0',
    playingStyle: 'Aggressive baseline',
    dominantHand: 'right',
    preferredPosition: 'Right side',
    preferredFormat: 'Doubles',
    playingSince: '3 years',
    regularSchedule: 'Weekends, Tuesday evenings',
    
    // Equipment
    paddleBrand: 'Selkirk',
    paddleModel: 'Amped Epic',
    backupPaddleBrand: 'JOOLA',
    backupPaddleModel: 'Ben Johns Hyperion',
    apparelBrand: 'HEAD',
    shoesBrand: 'K-Swiss',
    
    // Physical
    height: 175,
    reach: 180,
    fitnessLevel: 'Good',
    
    // Skill Assessment (1-10)
    forehandStrength: 7,
    backhandStrength: 6,
    servePower: 8,
    dinkAccuracy: 7,
    thirdShotConsistency: 6,
    courtCoverage: 8,
    
    // Preferences
    preferredSurface: 'Outdoor courts',
    indoorOutdoorPreference: 'both',
    competitiveIntensity: 7,
    lookingForPartners: true,
    mentorshipInterest: false,
    preferredMatchDuration: '1-2 hours',
    travelRadiusKm: 25,
    
    // External Ratings
    duprRating: '4.2',
    utprRating: '4.1',
    wprRating: '',
    
    // Privacy
    privacyProfile: 'standard',
    languagePreference: 'en',
  });

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Skill Assessment Slider Component
  const SkillSlider = ({ label, value, field }: { label: string; value: number; field: string }) => (
    <div className="p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white font-medium">{label}</div>
        <div className="text-white font-bold text-lg">{value}</div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(newValue) => updateProfile(field, newValue[0])}
        min={1}
        max={10}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>Poor (1)</span>
        <span>Excellent (10)</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className={`p-6 bg-gradient-to-r ${config.color} border border-white/20 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        <div className="relative text-white text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
              <TierIcon className="h-10 w-10" />
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-1">{profile.displayName}</h2>
          <Badge className="bg-white/30 text-white px-3 py-1">
            {config.name} Player
          </Badge>
        </div>
      </Card>

      {/* Basic Information */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <IdCard className="h-4 w-4 mr-2 text-orange-400" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">First Name</label>
            <Input
              value={profile.firstName}
              onChange={(e) => updateProfile('firstName', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Last Name</label>
            <Input
              value={profile.lastName}
              onChange={(e) => updateProfile('lastName', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Email</label>
            <Input
              value={profile.email}
              onChange={(e) => updateProfile('email', e.target.value)}
              type="email"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Location</label>
            <Input
              value={profile.location}
              onChange={(e) => updateProfile('location', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Birth Date</label>
            <Input
              value={profile.dateOfBirth}
              onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
              type="date"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Gender</label>
            <Select value={profile.gender} onValueChange={(value) => updateProfile('gender', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="male" className="text-white">Male</SelectItem>
                <SelectItem value="female" className="text-white">Female</SelectItem>
                <SelectItem value="other" className="text-white">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-400 mb-1 block">Bio</label>
            <Textarea
              value={profile.bio}
              onChange={(e) => updateProfile('bio', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Playing Profile */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Gamepad2 className="h-4 w-4 mr-2 text-orange-400" />
          Playing Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Skill Level</label>
            <Select value={profile.skillLevel} onValueChange={(value) => updateProfile('skillLevel', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="2.0" className="text-white">2.0 - Beginner</SelectItem>
                <SelectItem value="2.5" className="text-white">2.5 - Novice</SelectItem>
                <SelectItem value="3.0" className="text-white">3.0 - Beginner+</SelectItem>
                <SelectItem value="3.5" className="text-white">3.5 - Intermediate</SelectItem>
                <SelectItem value="4.0" className="text-white">4.0 - Advanced</SelectItem>
                <SelectItem value="4.5" className="text-white">4.5 - Expert</SelectItem>
                <SelectItem value="5.0+" className="text-white">5.0+ - Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Playing Style</label>
            <Select value={profile.playingStyle} onValueChange={(value) => updateProfile('playingStyle', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="Aggressive baseline" className="text-white">Aggressive Baseline</SelectItem>
                <SelectItem value="Defensive baseline" className="text-white">Defensive Baseline</SelectItem>
                <SelectItem value="Net rusher" className="text-white">Net Rusher</SelectItem>
                <SelectItem value="All-court" className="text-white">All-Court</SelectItem>
                <SelectItem value="Counter puncher" className="text-white">Counter Puncher</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Dominant Hand</label>
            <Select value={profile.dominantHand} onValueChange={(value) => updateProfile('dominantHand', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="right" className="text-white">Right</SelectItem>
                <SelectItem value="left" className="text-white">Left</SelectItem>
                <SelectItem value="ambidextrous" className="text-white">Ambidextrous</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Preferred Position</label>
            <Select value={profile.preferredPosition} onValueChange={(value) => updateProfile('preferredPosition', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="Left side" className="text-white">Left Side (Forehand)</SelectItem>
                <SelectItem value="Right side" className="text-white">Right Side (Backhand)</SelectItem>
                <SelectItem value="Either" className="text-white">Either Side</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Preferred Format</label>
            <Select value={profile.preferredFormat} onValueChange={(value) => updateProfile('preferredFormat', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="Singles" className="text-white">Singles</SelectItem>
                <SelectItem value="Doubles" className="text-white">Doubles</SelectItem>
                <SelectItem value="Mixed doubles" className="text-white">Mixed Doubles</SelectItem>
                <SelectItem value="Any" className="text-white">Any Format</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Playing Since</label>
            <Input
              value={profile.playingSince}
              onChange={(e) => updateProfile('playingSince', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="e.g., 2 years, 6 months"
            />
          </div>
        </div>
      </Card>

      {/* Skill Assessment */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Target className="h-4 w-4 mr-2 text-orange-400" />
          Skill Assessment
        </h3>
        <div className="space-y-4">
          <SkillSlider label="Forehand Strength" value={profile.forehandStrength} field="forehandStrength" />
          <SkillSlider label="Backhand Strength" value={profile.backhandStrength} field="backhandStrength" />
          <SkillSlider label="Serve Power" value={profile.servePower} field="servePower" />
          <SkillSlider label="Dink Accuracy" value={profile.dinkAccuracy} field="dinkAccuracy" />
          <SkillSlider label="Third Shot Consistency" value={profile.thirdShotConsistency} field="thirdShotConsistency" />
          <SkillSlider label="Court Coverage" value={profile.courtCoverage} field="courtCoverage" />
        </div>
      </Card>

      {/* Equipment */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Shield className="h-4 w-4 mr-2 text-orange-400" />
          Equipment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Paddle Brand</label>
            <Select value={profile.paddleBrand} onValueChange={(value) => updateProfile('paddleBrand', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="Selkirk" className="text-white">Selkirk</SelectItem>
                <SelectItem value="JOOLA" className="text-white">JOOLA</SelectItem>
                <SelectItem value="HEAD" className="text-white">HEAD</SelectItem>
                <SelectItem value="SHOT3" className="text-white">SHOT3</SelectItem>
                <SelectItem value="DragonFly" className="text-white">DragonFly</SelectItem>
                <SelectItem value="Paddletek" className="text-white">Paddletek</SelectItem>
                <SelectItem value="Engage" className="text-white">Engage</SelectItem>
                <SelectItem value="Franklin" className="text-white">Franklin</SelectItem>
                <SelectItem value="Gamma" className="text-white">Gamma</SelectItem>
                <SelectItem value="Other" className="text-white">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Paddle Model</label>
            <Select value={profile.paddleModel} onValueChange={(value) => updateProfile('paddleModel', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {profile.paddleBrand === 'Selkirk' && (
                  <>
                    <SelectItem value="Amped Epic" className="text-white">Amped Epic</SelectItem>
                    <SelectItem value="Amped Omni" className="text-white">Amped Omni</SelectItem>
                    <SelectItem value="Power Air" className="text-white">Power Air</SelectItem>
                    <SelectItem value="Vanguard 2.0" className="text-white">Vanguard 2.0</SelectItem>
                  </>
                )}
                {profile.paddleBrand === 'JOOLA' && (
                  <>
                    <SelectItem value="Ben Johns Hyperion" className="text-white">Ben Johns Hyperion</SelectItem>
                    <SelectItem value="Perseus" className="text-white">Perseus</SelectItem>
                    <SelectItem value="Solaire" className="text-white">Solaire</SelectItem>
                    <SelectItem value="Vision" className="text-white">Vision</SelectItem>
                  </>
                )}
                {profile.paddleBrand === 'HEAD' && (
                  <>
                    <SelectItem value="Extreme Elite" className="text-white">Extreme Elite</SelectItem>
                    <SelectItem value="Radical Elite" className="text-white">Radical Elite</SelectItem>
                    <SelectItem value="Gravity" className="text-white">Gravity</SelectItem>
                  </>
                )}
                {profile.paddleBrand === 'SHOT3' && (
                  <>
                    <SelectItem value="Shockwave Pro" className="text-white">Shockwave Pro</SelectItem>
                    <SelectItem value="Elite Series" className="text-white">Elite Series</SelectItem>
                    <SelectItem value="Competition" className="text-white">Competition</SelectItem>
                  </>
                )}
                {profile.paddleBrand === 'DragonFly' && (
                  <>
                    <SelectItem value="Dynamo Pro" className="text-white">Dynamo Pro</SelectItem>
                    <SelectItem value="Thunder Elite" className="text-white">Thunder Elite</SelectItem>
                    <SelectItem value="Phoenix Series" className="text-white">Phoenix Series</SelectItem>
                  </>
                )}
                <SelectItem value="Other" className="text-white">Other / Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Backup Paddle Brand</label>
            <Select value={profile.backupPaddleBrand} onValueChange={(value) => updateProfile('backupPaddleBrand', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="Selkirk" className="text-white">Selkirk</SelectItem>
                <SelectItem value="JOOLA" className="text-white">JOOLA</SelectItem>
                <SelectItem value="HEAD" className="text-white">HEAD</SelectItem>
                <SelectItem value="SHOT3" className="text-white">SHOT3</SelectItem>
                <SelectItem value="DragonFly" className="text-white">DragonFly</SelectItem>
                <SelectItem value="Paddletek" className="text-white">Paddletek</SelectItem>
                <SelectItem value="Engage" className="text-white">Engage</SelectItem>
                <SelectItem value="Franklin" className="text-white">Franklin</SelectItem>
                <SelectItem value="Gamma" className="text-white">Gamma</SelectItem>
                <SelectItem value="None" className="text-white">None</SelectItem>
                <SelectItem value="Other" className="text-white">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Apparel Brand</label>
            <Select value={profile.apparelBrand} onValueChange={(value) => updateProfile('apparelBrand', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="HEAD" className="text-white">HEAD</SelectItem>
                <SelectItem value="Nike" className="text-white">Nike</SelectItem>
                <SelectItem value="Adidas" className="text-white">Adidas</SelectItem>
                <SelectItem value="Under Armour" className="text-white">Under Armour</SelectItem>
                <SelectItem value="Lululemon" className="text-white">Lululemon</SelectItem>
                <SelectItem value="Wilson" className="text-white">Wilson</SelectItem>
                <SelectItem value="Fila" className="text-white">Fila</SelectItem>
                <SelectItem value="Other" className="text-white">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Shoes Brand</label>
            <Select value={profile.shoesBrand} onValueChange={(value) => updateProfile('shoesBrand', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="K-Swiss" className="text-white">K-Swiss</SelectItem>
                <SelectItem value="ASICS" className="text-white">ASICS</SelectItem>
                <SelectItem value="Nike" className="text-white">Nike</SelectItem>
                <SelectItem value="Adidas" className="text-white">Adidas</SelectItem>
                <SelectItem value="New Balance" className="text-white">New Balance</SelectItem>
                <SelectItem value="HEAD" className="text-white">HEAD</SelectItem>
                <SelectItem value="Wilson" className="text-white">Wilson</SelectItem>
                <SelectItem value="Fila" className="text-white">Fila</SelectItem>
                <SelectItem value="Other" className="text-white">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Physical Profile */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Dumbbell className="h-4 w-4 mr-2 text-orange-400" />
          Physical Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Height (cm)</label>
            <Input
              value={profile.height}
              onChange={(e) => updateProfile('height', Number(e.target.value))}
              type="number"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Reach (cm)</label>
            <Input
              value={profile.reach}
              onChange={(e) => updateProfile('reach', Number(e.target.value))}
              type="number"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Fitness Level</label>
            <Select value={profile.fitnessLevel} onValueChange={(value) => updateProfile('fitnessLevel', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="Excellent" className="text-white">Excellent</SelectItem>
                <SelectItem value="Good" className="text-white">Good</SelectItem>
                <SelectItem value="Average" className="text-white">Average</SelectItem>
                <SelectItem value="Fair" className="text-white">Fair</SelectItem>
                <SelectItem value="Poor" className="text-white">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* External Ratings */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Trophy className="h-4 w-4 mr-2 text-orange-400" />
          External Ratings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">DUPR Rating</label>
            <Input
              value={profile.duprRating}
              onChange={(e) => updateProfile('duprRating', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="e.g., 4.2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">UTPR Rating</label>
            <Input
              value={profile.utprRating}
              onChange={(e) => updateProfile('utprRating', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="e.g., 4.1"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">WPR Rating</label>
            <Input
              value={profile.wprRating}
              onChange={(e) => updateProfile('wprRating', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="e.g., 4.0"
            />
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <UserCog className="h-4 w-4 mr-2 text-orange-400" />
          Preferences
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Preferred Surface</label>
              <Select value={profile.preferredSurface} onValueChange={(value) => updateProfile('preferredSurface', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Outdoor courts" className="text-white">Outdoor Courts</SelectItem>
                  <SelectItem value="Indoor courts" className="text-white">Indoor Courts</SelectItem>
                  <SelectItem value="Both" className="text-white">Both Indoor/Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Match Duration</label>
              <Select value={profile.preferredMatchDuration} onValueChange={(value) => updateProfile('preferredMatchDuration', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="30 minutes" className="text-white">30 minutes</SelectItem>
                  <SelectItem value="1 hour" className="text-white">1 hour</SelectItem>
                  <SelectItem value="1-2 hours" className="text-white">1-2 hours</SelectItem>
                  <SelectItem value="2+ hours" className="text-white">2+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Looking for Partners</div>
              <div className="text-sm text-slate-400">Open to playing with new people</div>
            </div>
            <Switch
              checked={profile.lookingForPartners}
              onCheckedChange={(checked) => updateProfile('lookingForPartners', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Mentorship Interest</div>
              <div className="text-sm text-slate-400">Open to coaching opportunities</div>
            </div>
            <Switch
              checked={profile.mentorshipInterest}
              onCheckedChange={(checked) => updateProfile('mentorshipInterest', checked)}
            />
          </div>
          
          <SkillSlider label="Competitive Intensity" value={profile.competitiveIntensity} field="competitiveIntensity" />
          
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Travel Radius (km)</label>
            <Input
              value={profile.travelRadiusKm}
              onChange={(e) => updateProfile('travelRadiusKm', Number(e.target.value))}
              type="number"
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="How far will you travel?"
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40"
          >
            <Button
              size="lg"
              onClick={() => setHasUnsavedChanges(false)}
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg px-8"
            >
              Save Changes
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UnifiedPrototype() {
  const [location, setLocation] = useLocation();
  const { user: authUser } = useAuth();
  
  // Auto-detect initial tab based on route
  const getInitialTab = (): TabMode => {
    if (location === '/rankings') return 'rankings';
    if (location === '/profile') return 'profile';
    if (location === '/match-arena') return 'play';
    return 'passport';
  };
  
  const [activeTab, setActiveTab] = useState<TabMode>(getInitialTab());
  
  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location]);
  
  // Fetch real user data from API - always run, no demo data fallback
  const { data: currentUser, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: ['/api/auth/current-user'],
  });
  
  // Fetch real leaderboard data
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['/api/rankings/leaderboard'],
    enabled: !!currentUser,
  });
  
  // Fetch real match history
  const { data: matchHistoryData, isLoading: isLoadingMatches } = useQuery({
    queryKey: ['/api/matches/recent'],
    enabled: !!currentUser,
  });
  
  // Fetch incoming challenges
  const { data: incomingChallenges, isLoading: isLoadingChallenges } = useQuery({
    queryKey: ['/api/challenges/incoming'],
    enabled: !!currentUser,
  });
  
  // Transform user data to PlayerData format - no demo fallback
  const playerData: PlayerData | null = currentUser ? {
    id: (currentUser as any).id || 'unknown',
    name: `${(currentUser as any).firstName || ''} ${(currentUser as any).lastName || ''}`.trim() || (currentUser as any).username || 'Player',
    tier: ((currentUser as any).tier || 'recreational') as PlayerTier,
    rankingPoints: (currentUser as any).rankingPoints || 0,
    picklePoints: (currentUser as any).picklePoints || 0,
    globalRank: (currentUser as any).globalRank || 0,
    localRank: (currentUser as any).localRank || 0,
    passportCode: (currentUser as any).passportCode || 'LOADING',
    recentChange: (currentUser as any).recentChange || 0,
    winRate: (currentUser as any).winRate || 0,
    nextMilestone: {
      tier: (currentUser as any).nextMilestone?.tier || 'Competitive',
      pointsNeeded: (currentUser as any).nextMilestone?.pointsNeeded || 300,
    },
  } : null;
  
  // Micro-feedback states
  const [showSaveReaction, setShowSaveReaction] = useState(false);
  const [showChallengeReaction, setShowChallengeReaction] = useState(false);
  const [showPhotoReaction, setShowPhotoReaction] = useState(false);
  const [shimmerStats, setShimmerStats] = useState(false);
  
  // Trigger functions for micro-feedback
  const triggerSaveReaction = () => {
    setShowSaveReaction(true);
    setShimmerStats(true);
    setTimeout(() => setShimmerStats(false), 800);
  };
  
  const triggerChallengeReaction = () => setShowChallengeReaction(true);
  const triggerPhotoReaction = () => setShowPhotoReaction(true);
  const [passportPhoto, setPassportPhoto] = useState<string | undefined>(undefined);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>>([]);
  
  // WebSocket connection for real-time notifications
  const { connected, lastMessage, unreadCount } = useNotificationSocket({
    debugMode: false, // Disable debug mode for production
    autoReconnect: true, // Enable auto-reconnect
    onMessage: (message) => {
      console.log('📡 Received notification:', message);
      if (message.type === 'new_notification') {
        setNotifications(prev => [{
          id: Date.now().toString(),
          type: message.type,
          message: message.data?.message || 'New notification',
          timestamp: new Date(),
          read: false
        }, ...prev].slice(0, 10)); // Keep only last 10 notifications
      }
    }
  });

  // Demo function to simulate notifications
  const triggerDemoNotification = () => {
    const demoNotifications = [
      { type: 'match_request', message: 'Sarah Chen wants to play a match!' },
      { type: 'ranking_update', message: 'You moved up to #23 in your local rankings!' },
      { type: 'challenge', message: 'Alex Rodriguez challenged you to a match' },
      { type: 'system', message: 'New tournament registration open nearby' }
    ];
    
    const randomNotif = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: randomNotif.type,
      message: randomNotif.message,
      timestamp: new Date(),
      read: false
    }, ...prev].slice(0, 10));
  };

  // Handle passport photo save
  const handlePhotoSave = (photoData: string) => {
    setPassportPhoto(photoData);
    
    // Add a notification about the photo update
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: 'system',
      message: `Passport photo updated!`,
      timestamp: new Date(),
      read: false
    }, ...prev].slice(0, 10));
  };

  // Show loading state while fetching user data
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your player passport...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if data fetch failed
  if (userError || !playerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Player Data</h2>
          <p className="text-gray-400 mb-6">
            {userError ? 'Failed to fetch your player information. Please try again.' : 'No player data available.'}
          </p>
          <Button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" data-testid="dashboard">
      {/* Notifications Header */}
      <NotificationsHeader 
        player={playerData} 
        notifications={notifications}
        connected={connected}
        onTriggerDemo={triggerDemoNotification}
      />
      
      {/* Content Area */}
      <div className="p-4 pb-24"> {/* pb-24 for bottom nav space */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'passport' && (
              <PassportModeContent 
                player={playerData}
                passportPhoto={passportPhoto}
                onPhotoUpload={handlePhotoSave}
                leaderboardPlayers={(leaderboardData as any)?.leaderboard || []}
                contentFeedItems={[]} 
                matchHistory={matchHistoryData as any[] || []}
              />
            )}
            {/* Play tab redirects to /match-arena */}
            {activeTab === 'rankings' && <RankingsModeContent player={playerData} />}
            {activeTab === 'profile' && <ProfileModeContent player={playerData} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <NavigationTabs activeTab={activeTab} onTabChange={(tab) => {
        if (tab === 'play') {
          setLocation('/match-arena');
        } else {
          setActiveTab(tab);
        }
      }} />
    </div>
  );
}