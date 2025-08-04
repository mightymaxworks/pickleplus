import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  QrCode, Trophy, TrendingUp, Calendar, Target, Award, 
  User, Users, MapPin, Clock, Zap, Star, ChevronRight,
  Play, BookOpen, Shield, Crown, Medal, Flame
} from "lucide-react";

interface ModernPassportDisplayProps {
  view?: 'full' | 'compact' | 'facility';
  interactive?: boolean;
}

export default function ModernPassportDisplay({ 
  view = 'full', 
  interactive = true 
}: ModernPassportDisplayProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Mock user data - in real app this would come from useAuth()
  const user = {
    id: 1,
    firstName: 'Alex',
    lastName: 'Jordan',
    username: 'alexj_pickleball',
    passportCode: 'PKL-A7J9X2',
    level: 3,
    picklePoints: 2847,
    rankingPoints: 1247,
    totalMatches: 47,
    matchesWon: 34,
    winPercentage: 72,
    currentStreak: 3,
    duprRating: 3.8,
    ageGroup: '30-39',
    lastMatchDate: '2025-08-03T10:30:00Z',
    achievements: [
      { id: 1, name: 'First Win', icon: '🏆', earned: true },
      { id: 2, name: 'Win Streak', icon: '🔥', earned: true },
      { id: 3, name: 'Tournament Player', icon: '👑', earned: false },
    ],
    recentMatches: [
      { id: 1, opponent: 'Sarah Chen', score: '11-9, 11-7', result: 'win', date: '2025-08-03' },
      { id: 2, opponent: 'Mike Wilson', score: '11-5, 8-11, 11-6', result: 'win', date: '2025-08-02' },
      { id: 3, opponent: 'Lisa Park', score: '9-11, 11-8, 7-11', result: 'loss', date: '2025-08-01' },
    ]
  };

  const quickActions = [
    { label: 'Record Match', icon: Play, color: 'bg-green-500', action: () => console.log('Record match') },
    { label: 'Find Players', icon: Users, color: 'bg-blue-500', action: () => console.log('Find players') },
    { label: 'Book Court', icon: Calendar, color: 'bg-purple-500', action: () => console.log('Book court') },
    { label: 'Training', icon: BookOpen, color: 'bg-orange-500', action: () => console.log('Training') },
  ];

  if (view === 'compact') {
    return (
      <motion.div 
        className="w-full max-w-md mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">{user.firstName[0]}{user.lastName[0]}</span>
                </div>
                <div>
                  <h3 className="font-bold">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm opacity-90">{user.passportCode}</p>
                </div>
              </div>
              <QrCode className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-orange-600">{user.duprRating}</p>
                <p className="text-xs text-gray-600">DUPR</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{user.picklePoints}</p>
                <p className="text-xs text-gray-600">Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{user.winPercentage}%</p>
                <p className="text-xs text-gray-600">Win Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (view === 'facility') {
    return (
      <motion.div 
        className="w-full max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                <p className="opacity-90">Level {user.level} Player • {user.passportCode}</p>
                <Badge className="bg-white/20 text-white mt-2">
                  <Shield className="w-4 h-4 mr-1" />
                  Verified Member
                </Badge>
              </div>
              <div className="text-center">
                <QrCode className="w-20 h-20 mx-auto mb-2" />
                <p className="text-sm">Facility Access</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-600">{user.duprRating}</p>
                <p className="text-sm text-gray-600">DUPR Rating</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{user.picklePoints}</p>
                <p className="text-sm text-gray-600">Pickle Points</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{user.totalMatches}</p>
                <p className="text-sm text-gray-600">Matches</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Flame className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{user.currentStreak}</p>
                <p className="text-sm text-gray-600">Win Streak</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Record Match
              </Button>
              <Button variant="outline" className="flex-1" size="lg">
                <Calendar className="w-4 h-4 mr-2" />
                Book Court
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Full view
  return (
    <motion.div 
      className="w-full max-w-6xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-6 text-white relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.div 
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-3xl font-bold">{user.firstName[0]}{user.lastName[0]}</span>
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
                <p className="text-lg opacity-90">@{user.username}</p>
                <p className="opacity-80">{user.passportCode}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-white/20 text-white">
                    <Crown className="w-4 h-4 mr-1" />
                    Level {user.level} Player
                  </Badge>
                  <Badge className="bg-white/20 text-white">
                    {user.ageGroup}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-center">
              <motion.div 
                className="cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <QrCode className="w-24 h-24 mx-auto mb-2" />
                <p className="text-sm">Scan to Connect</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <CardContent className="p-0">
          <div className="grid md:grid-cols-5 divide-x divide-gray-200">
            {[
              { label: 'DUPR Rating', value: user.duprRating, icon: Trophy, color: 'text-orange-600' },
              { label: 'Pickle Points', value: user.picklePoints.toLocaleString(), icon: Zap, color: 'text-green-600' },
              { label: 'Ranking Points', value: user.rankingPoints.toLocaleString(), icon: TrendingUp, color: 'text-purple-600' },
              { label: 'Win Rate', value: `${user.winPercentage}%`, icon: Target, color: 'text-blue-600' },
              { label: 'Win Streak', value: user.currentStreak, icon: Flame, color: 'text-red-600' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={stat.label} 
                  className="p-4 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {interactive && (
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="rounded-full px-6"
            size="lg"
          >
            Quick Actions
            <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${showQuickActions ? 'rotate-90' : ''}`} />
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            className="grid md:grid-cols-4 gap-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  className={`${action.color} text-white p-4 rounded-lg hover:shadow-lg transition-all`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-semibold">{action.label}</p>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="matches">Match History</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {user.recentMatches.slice(0, 3).map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">vs {match.opponent}</p>
                          <p className="text-sm text-gray-600">{match.score}</p>
                        </div>
                        <Badge variant={match.result === 'win' ? 'default' : 'secondary'}>
                          {match.result === 'win' ? 'Win' : 'Loss'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Progress */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Performance Progress
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Skill Level Progress</span>
                        <span className="text-sm font-medium">Level {user.level}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Win Rate Improvement</span>
                        <span className="text-sm font-medium">{user.winPercentage}%</span>
                      </div>
                      <Progress value={user.winPercentage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Monthly Goal</span>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="matches">
              <div className="space-y-4">
                <h3 className="font-semibold">Match History</h3>
                <div className="space-y-3">
                  {user.recentMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${match.result === 'win' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="font-medium">vs {match.opponent}</p>
                          <p className="text-sm text-gray-600">{match.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{match.score}</p>
                        <Badge variant={match.result === 'win' ? 'default' : 'secondary'}>
                          {match.result === 'win' ? 'Victory' : 'Defeat'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="achievements">
              <div className="space-y-4">
                <h3 className="font-semibold">Achievements</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {user.achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`p-4 border rounded-lg text-center ${
                        achievement.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <p className="font-medium">{achievement.name}</p>
                      <Badge variant={achievement.earned ? 'default' : 'outline'} className="mt-2">
                        {achievement.earned ? 'Earned' : 'Locked'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Career Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Matches</span>
                      <span className="font-semibold">{user.totalMatches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Matches Won</span>
                      <span className="font-semibold text-green-600">{user.matchesWon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Matches Lost</span>
                      <span className="font-semibold text-red-600">{user.totalMatches - user.matchesWon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Win Percentage</span>
                      <span className="font-semibold">{user.winPercentage}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Rankings</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Overall Ranking Points</span>
                      <span className="font-semibold text-purple-600">{user.rankingPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pickle Points</span>
                      <span className="font-semibold text-green-600">{user.picklePoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DUPR Rating</span>
                      <span className="font-semibold text-orange-600">{user.duprRating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Age Group</span>
                      <span className="font-semibold">{user.ageGroup}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </motion.div>
  );
}