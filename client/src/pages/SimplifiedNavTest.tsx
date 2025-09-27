import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Trophy, 
  QrCode,
  Gift,
  MapPin,
  Calendar,
  Target,
  Star,
  Zap,
  Search,
  Plus,
  BarChart3,
  Settings,
  User
} from 'lucide-react';

// Simplified Navigation Test Page
// Concept: Unified actions instead of complex navigation

type NavigationMode = 'passport' | 'play' | 'rankings' | 'collect';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'immediate' | 'scheduled' | 'social';
  estimatedTime?: string;
  difficulty?: string;
  playersNeeded?: number;
}

const quickActions: QuickAction[] = [
  {
    id: 'quick-match',
    title: 'Quick Match',
    description: 'Find a game starting now',
    icon: Zap,
    category: 'immediate',
    estimatedTime: '5 min',
    difficulty: 'Any level',
    playersNeeded: 1,
  },
  {
    id: 'scan-court',
    title: 'Scan Court QR',
    description: 'Record match results instantly',
    icon: QrCode,
    category: 'immediate',
    estimatedTime: '1 min',
  },
  {
    id: 'join-tournament',
    title: 'Vancouver Open',
    description: 'Tournament starts in 2 hours',
    icon: Trophy,
    category: 'scheduled',
    estimatedTime: '3 hours',
    difficulty: 'Elite+',
    playersNeeded: 32,
  },
  {
    id: 'book-court',
    title: 'Book Court',
    description: 'Reserve a court for later',
    icon: Calendar,
    category: 'scheduled',
    estimatedTime: '1 hour',
  },
  {
    id: 'find-partner',
    title: 'Find Practice Partner',
    description: 'Connect with nearby players',
    icon: Users,
    category: 'social',
    estimatedTime: '30 min',
    playersNeeded: 1,
  },
  {
    id: 'join-league',
    title: 'Join Local League',
    description: 'Competitive weekly matches',
    icon: Target,
    category: 'social',
    estimatedTime: 'Weekly',
    difficulty: 'Competitive+',
  },
];

function NavigationTab({ 
  mode, 
  currentMode, 
  onClick, 
  icon: Icon, 
  label, 
  badge 
}: {
  mode: NavigationMode;
  currentMode: NavigationMode;
  onClick: () => void;
  icon: React.ComponentType<any>;
  label: string;
  badge?: number;
}) {
  const isActive = currentMode === mode;
  
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex-1 p-4 rounded-lg transition-all ${
        isActive 
          ? 'bg-orange-500 text-white' 
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col items-center gap-1">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{label}</span>
        {badge && badge > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0">
            {badge}
          </Badge>
        )}
      </div>
    </motion.button>
  );
}

function PlayModeContent() {
  return (
    <div className="space-y-6">
      {/* Primary Action */}
      <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-2">Ready to Play?</h2>
          <p className="mb-4 opacity-90">Find the perfect game for your skill level</p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
            <Search className="h-4 w-4 mr-2" />
            Find My Next Game
          </Button>
        </div>
      </Card>

      {/* Quick Actions by Category */}
      {(['immediate', 'scheduled', 'social'] as const).map((category) => (
        <div key={category}>
          <h3 className="text-white font-semibold mb-3 capitalize flex items-center">
            {category === 'immediate' && <Zap className="h-4 w-4 mr-2" />}
            {category === 'scheduled' && <Calendar className="h-4 w-4 mr-2" />}
            {category === 'social' && <Users className="h-4 w-4 mr-2" />}
            {category} Options
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {quickActions
              .filter(action => action.category === category)
              .map((action) => (
                <motion.div key={action.id} whileHover={{ scale: 1.02 }}>
                  <Card className="p-4 bg-slate-800 border-slate-700 hover:border-slate-600 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <action.icon className="h-5 w-5 text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{action.title}</h4>
                        <p className="text-slate-400 text-sm mb-2">{action.description}</p>
                        
                        <div className="flex flex-wrap gap-2 text-xs">
                          {action.estimatedTime && (
                            <Badge variant="outline" className="text-slate-300">
                              {action.estimatedTime}
                            </Badge>
                          )}
                          {action.difficulty && (
                            <Badge variant="outline" className="text-slate-300">
                              {action.difficulty}
                            </Badge>
                          )}
                          {action.playersNeeded && (
                            <Badge variant="outline" className="text-slate-300">
                              +{action.playersNeeded} player{action.playersNeeded > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PassportModeContent() {
  const playerData = {
    name: 'Alex Chen',
    tier: 'Elite',
    rankingPoints: 1247,
    picklePoints: 89,
    globalRank: 847,
    localRank: 23,
    recentMatches: [
      { opponent: 'Sarah M.', result: 'Win', points: '+4.5' },
      { opponent: 'Mike J.', result: 'Loss', points: '+1.5' },
      { opponent: 'Emma W.', result: 'Win', points: '+4.2' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Passport Card Preview */}
      <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400">
        <div className="text-center text-white mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">{playerData.name}</h2>
          <Badge className="bg-white/20 text-white mt-1">{playerData.tier}</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{playerData.rankingPoints.toLocaleString()}</div>
            <div className="text-purple-100 text-sm">Ranking Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{playerData.picklePoints}</div>
            <div className="text-purple-100 text-sm">Pickle Points</div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">#{playerData.globalRank}</div>
            <div className="text-slate-400 text-sm">Global Rank</div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">#{playerData.localRank}</div>
            <div className="text-slate-400 text-sm">Local Rank</div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-3">Recent Matches</h3>
        <div className="space-y-2">
          {playerData.recentMatches.map((match, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
              <span className="text-slate-300">vs {match.opponent}</span>
              <div className="flex items-center gap-2">
                <Badge 
                  className={match.result === 'Win' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}
                >
                  {match.result}
                </Badge>
                <span className="text-orange-400 text-sm">{match.points}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button className="bg-slate-700 hover:bg-slate-600 text-white">
          <QrCode className="h-4 w-4 mr-2" />
          Scan QR
        </Button>
        <Button className="bg-slate-700 hover:bg-slate-600 text-white">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}

function RankingsModeContent() {
  const topPlayers = [
    { name: 'Sarah Martinez', points: 2156, rank: 1, change: '+47' },
    { name: 'Mike Johnson', points: 2089, rank: 2, change: '-12' },
    { name: 'Alex Chen', points: 1647, rank: 3, change: '+23' },
    { name: 'Emma Wilson', points: 1523, rank: 4, change: '+89' },
  ];

  return (
    <div className="space-y-6">
      {/* View Switcher */}
      <div className="flex gap-2">
        {['Global', 'Local', 'My Tier'].map((view) => (
          <Button
            key={view}
            size="sm"
            variant={view === 'Local' ? 'default' : 'outline'}
            className="flex-1"
          >
            {view}
          </Button>
        ))}
      </div>

      {/* Your Position */}
      <Card className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400">
        <div className="text-white text-center">
          <h3 className="font-semibold mb-2">Your Position</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xl font-bold">#847</div>
              <div className="text-orange-100 text-xs">Global</div>
            </div>
            <div>
              <div className="text-xl font-bold">#23</div>
              <div className="text-orange-100 text-xs">Local</div>
            </div>
            <div>
              <div className="text-xl font-bold">1,247</div>
              <div className="text-orange-100 text-xs">Points</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Top Rankings */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <Trophy className="h-4 w-4 mr-2" />
          Local Leaders (Vancouver)
        </h3>
        <div className="space-y-2">
          {topPlayers.map((player) => (
            <div key={player.rank} className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
              <div className="flex items-center gap-3">
                <div className="text-white font-bold">#{player.rank}</div>
                <div>
                  <div className="text-white font-medium">{player.name}</div>
                  <div className="text-slate-400 text-sm">{player.points.toLocaleString()} points</div>
                </div>
              </div>
              <Badge 
                className={player.change.startsWith('+') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}
              >
                {player.change}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          View All
        </Button>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Find Players
        </Button>
      </div>
    </div>
  );
}

function CollectModeContent() {
  return (
    <div className="space-y-6">
      {/* Available Points */}
      <Card className="p-4 bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-400">
        <div className="text-white text-center">
          <div className="text-3xl font-bold mb-1">89</div>
          <div className="text-yellow-100">Pickle Points Available</div>
        </div>
      </Card>

      {/* Daily Pack */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-white font-semibold mb-2">Today's Daily Pack</h3>
          <p className="text-slate-400 text-sm mb-4">Special community rewards</p>
          <Button className="w-full">
            Open Pack (15 points)
          </Button>
        </div>
      </Card>

      {/* Collection Stats */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-3">Collection Progress</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Cards</span>
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

      {/* Available Packs */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 bg-slate-800 border-slate-700 text-center">
          <div className="text-blue-400 font-medium">Premium Pack</div>
          <div className="text-slate-400 text-sm">25 points</div>
        </Card>
        <Card className="p-3 bg-slate-800 border-slate-700 text-center">
          <div className="text-purple-400 font-medium">Elite Pack</div>
          <div className="text-slate-400 text-sm">50 points</div>
        </Card>
      </div>
    </div>
  );
}

export default function SimplifiedNavTest() {
  const [currentMode, setCurrentMode] = useState<NavigationMode>('passport');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Mobile-First Layout */}
      <div className="max-w-md mx-auto min-h-screen bg-slate-900/50 backdrop-blur-sm">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Pickle+ Passport</h1>
            <p className="text-slate-400 text-sm">Simplified Navigation Test</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentMode === 'passport' && <PassportModeContent />}
              {currentMode === 'play' && <PlayModeContent />}
              {currentMode === 'rankings' && <RankingsModeContent />}
              {currentMode === 'collect' && <CollectModeContent />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-slate-800/95 backdrop-blur-sm border-t border-slate-700">
          <div className="flex p-2 gap-1">
            <NavigationTab
              mode="passport"
              currentMode={currentMode}
              onClick={() => setCurrentMode('passport')}
              icon={User}
              label="Passport"
            />
            <NavigationTab
              mode="play"
              currentMode={currentMode}
              onClick={() => setCurrentMode('play')}
              icon={Zap}
              label="Play"
              badge={3} // Available games nearby
            />
            <NavigationTab
              mode="rankings"
              currentMode={currentMode}
              onClick={() => setCurrentMode('rankings')}
              icon={Trophy}
              label="Rankings"
            />
            <NavigationTab
              mode="collect"
              currentMode={currentMode}
              onClick={() => setCurrentMode('collect')}
              icon={Gift}
              label="Collect"
              badge={1} // Daily pack available
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed top-4 right-4 max-w-sm">
        <Card className="p-3 bg-slate-800/90 backdrop-blur-sm border-slate-700">
          <p className="text-slate-300 text-sm">
            💡 <strong>Concept:</strong> Four unified modes instead of complex navigation. 
            Each mode focuses on one primary goal with contextual quick actions.
          </p>
        </Card>
      </div>
    </div>
  );
}