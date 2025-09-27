import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Trophy, 
  Zap, 
  MapPin, 
  Calendar,
  Target,
  Star,
  TrendingUp,
  QrCode,
  Gift
} from 'lucide-react';

// Interactive Passport Dashboard Test Page
// Concept: Passport card as central hub with context-sensitive information

type PlayerTier = 'recreational' | 'competitive' | 'elite' | 'professional';
type ViewMode = 'overview' | 'competitive' | 'collection';

interface PlayerData {
  name: string;
  tier: PlayerTier;
  rankingPoints: number;
  picklePoints: number;
  globalRank: number;
  localRank: number;
  location: string;
  recentAchievements: string[];
  nextMilestone: { tier: string; pointsNeeded: number };
}

const tierConfig = {
  recreational: {
    name: 'Recreational',
    range: '0-300',
    color: 'from-slate-600 to-slate-700',
    textColor: 'text-slate-300',
    badgeColor: 'bg-slate-500',
    icon: Users,
  },
  competitive: {
    name: 'Competitive', 
    range: '300-1000',
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-300',
    badgeColor: 'bg-blue-500',
    icon: Target,
  },
  elite: {
    name: 'Elite',
    range: '1000-1800', 
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-300',
    badgeColor: 'bg-purple-500',
    icon: Star,
  },
  professional: {
    name: 'Professional',
    range: '1800+',
    color: 'from-orange-500 to-orange-600', 
    textColor: 'text-orange-300',
    badgeColor: 'bg-orange-500',
    icon: Trophy,
  },
};

// Mock player data
const mockPlayer: PlayerData = {
  name: 'Alex Chen',
  tier: 'elite',
  rankingPoints: 1247,
  picklePoints: 89,
  globalRank: 847,
  localRank: 23,
  location: 'Vancouver, BC',
  recentAchievements: ['Elite Status Achieved', 'Tournament Finalist', '10-Game Win Streak'],
  nextMilestone: { tier: 'Professional', pointsNeeded: 553 },
};

function InteractivePassportCard({ 
  player, 
  viewMode, 
  onModeChange,
  onAction 
}: {
  player: PlayerData;
  viewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onAction: (action: string) => void;
}) {
  const config = tierConfig[player.tier];
  const TierIcon = config.icon;

  return (
    <motion.div
      className="relative w-full max-w-md mx-auto"
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`relative bg-gradient-to-br ${config.color} rounded-2xl p-6 shadow-xl border border-white/30`}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl" />
        
        {/* Header */}
        <div className="relative z-10 text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TierIcon className="h-6 w-6 text-white" />
            <Badge className={`${config.badgeColor} text-white px-3 py-1`}>
              {config.name}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold text-white">{player.name}</h2>
          <p className="text-white/80 text-sm">{player.location}</p>
        </div>

        {/* Interactive Points Display */}
        <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
          <motion.button
            className={`p-4 rounded-xl border-2 transition-all ${
              viewMode === 'competitive' 
                ? 'border-white bg-white/20' 
                : 'border-white/30 hover:border-white/50'
            }`}
            onClick={() => onModeChange('competitive')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{player.rankingPoints.toLocaleString()}</div>
              <div className="text-white/80 text-xs">Ranking Points</div>
            </div>
          </motion.button>
          
          <motion.button
            className={`p-4 rounded-xl border-2 transition-all ${
              viewMode === 'collection' 
                ? 'border-white bg-white/20' 
                : 'border-white/30 hover:border-white/50'
            }`}
            onClick={() => onModeChange('collection')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{player.picklePoints}</div>
              <div className="text-white/80 text-xs">Pickle Points</div>
            </div>
          </motion.button>
        </div>

        {/* Context-Sensitive Content */}
        <div className="relative z-10">
          {viewMode === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex justify-between text-white text-sm">
                <span>Global Rank</span>
                <span>#{player.globalRank.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white text-sm">
                <span>Local Rank</span>
                <span>#{player.localRank}</span>
              </div>
              <div className="pt-2">
                <div className="text-white text-xs mb-1">Next: {player.nextMilestone.tier}</div>
                <div className="bg-white/30 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-1000"
                    style={{ width: '65%' }}
                  />
                </div>
                <div className="text-white text-xs mt-1">{player.nextMilestone.pointsNeeded} points needed</div>
              </div>
            </motion.div>
          )}

          {viewMode === 'competitive' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="text-center">
                <div className="text-white text-sm mb-2">Competitive Standing</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/30 rounded-lg p-2">
                    <div className="text-white font-bold">#{player.globalRank}</div>
                    <div className="text-white">Global</div>
                  </div>
                  <div className="bg-white/30 rounded-lg p-2">
                    <div className="text-white font-bold">#{player.localRank}</div>
                    <div className="text-white">Local</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {viewMode === 'collection' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="text-center">
                <div className="text-white text-sm mb-2">Collection Progress</div>
                <div className="text-xs text-white mb-2">
                  {player.picklePoints} points available to spend
                </div>
                <Button 
                  size="sm" 
                  className="bg-white/30 hover:bg-white/40 text-white border-white/30"
                  onClick={() => onAction('openPack')}
                >
                  <Gift className="h-4 w-4 mr-1" />
                  Open Pack (15 points)
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="relative z-10 flex gap-2 mt-6">
          <Button 
            size="sm" 
            className="flex-1 bg-white/30 hover:bg-white/40 text-white border-white/30"
            onClick={() => onAction('findGame')}
          >
            <Users className="h-4 w-4 mr-1" />
            Find Game
          </Button>
          <Button 
            size="sm" 
            className="bg-white/30 hover:bg-white/40 text-white border-white/30 px-3"
            onClick={() => onAction('scanQR')}
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ContextualSidebar({ viewMode, player }: { viewMode: ViewMode; player: PlayerData }) {
  return (
    <div className="space-y-4">
      {viewMode === 'overview' && (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {player.recentAchievements.map((achievement, i) => (
              <div key={i} className="text-sm text-slate-300 bg-slate-700/50 rounded p-2">
                🏆 {achievement}
              </div>
            ))}
          </div>
        </Card>
      )}

      {viewMode === 'competitive' && (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <Trophy className="h-4 w-4 mr-2" />
            Upcoming Tournaments
          </h3>
          <div className="space-y-3">
            <div className="text-sm">
              <div className="text-white font-medium">Vancouver Open</div>
              <div className="text-slate-400 text-xs">This Saturday • 2.5km away</div>
              <Button size="sm" className="mt-2 w-full">Join Tournament</Button>
            </div>
            <div className="text-sm">
              <div className="text-white font-medium">BC Championships</div>
              <div className="text-slate-400 text-xs">Next Month • Elite+ Only</div>
              <Button size="sm" variant="outline" className="mt-2 w-full">Get Notified</Button>
            </div>
          </div>
        </Card>
      )}

      {viewMode === 'collection' && (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <Gift className="h-4 w-4 mr-2" />
            Collection Stats
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Cards Collected</span>
              <span className="text-white">47/200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Rare Cards</span>
              <span className="text-white">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Epic Cards</span>
              <span className="text-white">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Legendary Cards</span>
              <span className="text-white">1</span>
            </div>
          </div>
        </Card>
      )}

      {/* Universal Quick Actions */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            Find Courts
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Book Session
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            Join League
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Quick Match
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function PassportDashboardTest() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  const handleAction = (action: string) => {
    console.log(`Action triggered: ${action}`);
    // In real app, this would trigger navigation or modals
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Passport Dashboard Test</h1>
          <p className="text-slate-400">Interactive passport card as central hub with context-sensitive views</p>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Interactive Passport Card */}
          <div className="flex items-center justify-center min-h-[600px]">
            <InteractivePassportCard
              player={mockPlayer}
              viewMode={viewMode}
              onModeChange={setViewMode}
              onAction={handleAction}
            />
          </div>

          {/* Context-Sensitive Sidebar */}
          <div className="space-y-6">
            <ContextualSidebar viewMode={viewMode} player={mockPlayer} />
          </div>
        </div>

        {/* Mode Indicator */}
        <div className="text-center mt-8">
          <div className="flex justify-center gap-2">
            {(['overview', 'competitive', 'collection'] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? 'default' : 'outline'}
                onClick={() => setViewMode(mode)}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
          <p className="text-slate-500 text-sm mt-2">
            Click on the passport card point counters or use buttons above to switch context
          </p>
        </div>
      </div>
    </div>
  );
}