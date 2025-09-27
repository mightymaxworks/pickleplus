import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Star, 
  Target, 
  Award,
  Crown,
  Heart,
  Zap,
  TrendingUp,
  Clock,
  MapPin,
  Send,
  CheckCircle,
  X,
  Plus,
  Eye,
  Handshake,
  Trophy,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface PartnerProfile {
  id: string;
  name: string;
  tier: 'recreational' | 'competitive' | 'elite' | 'professional';
  rankingPoints: number;
  winRate: number;
  preferredStyle: 'aggressive' | 'defensive' | 'balanced' | 'strategic';
  availability: string[];
  location: string;
  distance: number;
  compatibility: number; // 0-100%
  strengths: string[];
  weaknesses: string[];
  recentMatches: number;
  teamExperience: number; // Number of doubles matches
  avatar?: string;
  isOnline: boolean;
  communicationStyle: 'vocal' | 'quiet' | 'strategic' | 'encouraging';
  schedule: 'flexible' | 'mornings' | 'evenings' | 'weekends';
}

interface TeamRequest {
  id: string;
  partner: PartnerProfile;
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined';
  matchType: 'casual' | 'competitive' | 'tournament';
}

// Partner Compatibility Card
function PartnerCompatibilityCard({ partner, onSendRequest, onViewProfile }: {
  partner: PartnerProfile;
  onSendRequest: (partner: PartnerProfile, message: string) => void;
  onViewProfile: (partner: PartnerProfile) => void;
}) {
  const { toast } = useToast();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  const tierConfig = {
    recreational: { name: 'Recreational', color: 'from-slate-500 to-slate-600', icon: Target },
    competitive: { name: 'Competitive', color: 'from-blue-500 to-blue-600', icon: Zap },
    elite: { name: 'Elite', color: 'from-purple-500 to-purple-600', icon: Award },
    professional: { name: 'Professional', color: 'from-orange-500 to-orange-600', icon: Crown },
  };

  const styleConfig = {
    aggressive: { name: 'Aggressive', icon: Zap, color: 'text-red-400' },
    defensive: { name: 'Defensive', icon: Target, color: 'text-blue-400' },
    balanced: { name: 'Balanced', icon: Activity, color: 'text-green-400' },
    strategic: { name: 'Strategic', icon: Trophy, color: 'text-purple-400' },
  };

  const config = tierConfig[partner.tier];
  const style = styleConfig[partner.preferredStyle];
  const TierIcon = config.icon;
  const StyleIcon = style.icon;

  const compatibilityColor = partner.compatibility >= 80 ? 'text-green-400' : 
                           partner.compatibility >= 60 ? 'text-yellow-400' : 'text-red-400';

  const handleSendRequest = () => {
    onSendRequest(partner, requestMessage || 'Would you like to team up for doubles?');
    setShowRequestModal(false);
    setRequestMessage('');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="relative"
      >
        <Card className={`p-4 border border-slate-600 bg-gradient-to-br ${config.color} hover:border-orange-400 transition-all`}>
          {/* Compatibility Badge */}
          <div className="absolute -top-2 -right-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 border-2 border-slate-600`}>
              <Heart className={`h-3 w-3 ${compatibilityColor}`} />
              <span className={`text-xs font-bold ${compatibilityColor}`}>{partner.compatibility}%</span>
            </div>
          </div>

          {/* Online Status */}
          {partner.isOnline && (
            <div className="absolute -top-1 -left-1">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          )}

          <div className="text-white">
            {/* Partner Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                  <TierIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-lg">{partner.name}</div>
                  <div className="text-xs opacity-75">{config.name}</div>
                  <div className="flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3" />
                    {partner.distance < 1 ? `${Math.round(partner.distance * 1000)}m` : `${partner.distance}km`}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold">{partner.rankingPoints.toLocaleString()}</div>
                <div className="text-xs opacity-75">Ranking Points</div>
              </div>
            </div>

            {/* Compatibility Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Partner Compatibility</span>
                <span className={compatibilityColor}>{partner.compatibility}%</span>
              </div>
              <Progress value={partner.compatibility} className="h-2" />
            </div>

            {/* Playing Style & Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="flex items-center gap-1 p-2 bg-black/20 rounded">
                <StyleIcon className={`h-3 w-3 ${style.color}`} />
                <span>{style.name}</span>
              </div>
              <div className="text-center p-2 bg-black/20 rounded">
                <div className="font-bold">{Math.round(partner.winRate * 100)}%</div>
                <div className="opacity-75">Win Rate</div>
              </div>
            </div>

            {/* Strengths */}
            <div className="mb-3">
              <div className="text-xs opacity-75 mb-1">Strengths</div>
              <div className="flex flex-wrap gap-1">
                {partner.strengths.slice(0, 3).map(strength => (
                  <Badge key={strength} className="text-xs bg-green-500/20 text-green-300">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => onViewProfile(partner)}
                variant="outline"
                size="sm"
                className="flex-1 text-white border-white/30 hover:bg-white/10"
              >
                <Eye className="h-4 w-4 mr-1" />
                Profile
              </Button>
              
              <Button
                onClick={() => setShowRequestModal(true)}
                size="sm"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Handshake className="h-4 w-4 mr-1" />
                Team Up
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRequestModal(false)}
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
                    <Handshake className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">Team Up with {partner.name}</h2>
                  </div>
                  <p className="text-slate-400">Send a partnership request</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Partnership Message</label>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="I think we'd make a great doubles team! Want to play some matches together?"
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setShowRequestModal(false)}
                    variant="outline"
                    className="flex-1 text-white border-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendRequest}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Partner Requests Management
function PartnerRequestsPanel({ requests, onAccept, onDecline }: {
  requests: TeamRequest[];
  onAccept: (request: TeamRequest) => void;
  onDecline: (request: TeamRequest) => void;
}) {
  if (requests.length === 0) {
    return (
      <Card className="p-6 bg-slate-800/50 border-slate-700 text-center">
        <UserPlus className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Partnership Requests</h3>
        <p className="text-slate-400">Find compatible partners in the discovery section above</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Handshake className="h-5 w-5 text-blue-400" />
        Partnership Requests ({requests.length})
      </h3>
      
      {requests.map(request => (
        <Card key={request.id} className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium mb-1">
                  {request.partner.name} wants to team up
                </div>
                <div className="text-sm text-slate-400 mb-2">
                  {request.message}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{request.partner.rankingPoints.toLocaleString()} points</span>
                  <span>{Math.round(request.partner.winRate * 100)}% win rate</span>
                  <span>{request.timestamp.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => onDecline(request)}
                size="sm"
                variant="outline"
                className="text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
              <Button
                onClick={() => onAccept(request)}
                size="sm"
                className="bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Main Doubles Partner System Component
export default function DoublesPartnerSystem({ onPartnerFound, currentPartner }: {
  onPartnerFound?: (partner: PartnerProfile) => void;
  currentPartner?: { name: string; id: string } | null;
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'discover' | 'requests' | 'teams'>('discover');
  const [isSearching, setIsSearching] = useState(false);
  const [partnerRequests, setPartnerRequests] = useState<TeamRequest[]>([]);
  
  // Mock partner data with compatibility scoring
  const [availablePartners] = useState<PartnerProfile[]>([
    {
      id: '1',
      name: 'Emma Rodriguez',
      tier: 'competitive',
      rankingPoints: 1342,
      winRate: 0.78,
      preferredStyle: 'balanced',
      availability: ['mornings', 'weekends'],
      location: 'Vancouver Community Center',
      distance: 0.5,
      compatibility: 94,
      strengths: ['Net Play', 'Consistency', 'Communication'],
      weaknesses: ['Power Shots'],
      recentMatches: 12,
      teamExperience: 8,
      isOnline: true,
      communicationStyle: 'encouraging',
      schedule: 'flexible'
    },
    {
      id: '2',
      name: 'Marcus Chen',
      tier: 'elite',
      rankingPoints: 1567,
      winRate: 0.82,
      preferredStyle: 'aggressive',
      availability: ['evenings', 'weekends'],
      location: 'Richmond Sports Complex',
      distance: 1.2,
      compatibility: 87,
      strengths: ['Power Shots', 'Court Coverage', 'Strategy'],
      weaknesses: ['Patience'],
      recentMatches: 18,
      teamExperience: 15,
      isOnline: true,
      communicationStyle: 'strategic',
      schedule: 'evenings'
    },
    {
      id: '3',
      name: 'Sofia Kim',
      tier: 'competitive',
      rankingPoints: 1298,
      winRate: 0.75,
      preferredStyle: 'defensive',
      availability: ['mornings', 'afternoons'],
      location: 'UBC Recreation Center',
      distance: 2.1,
      compatibility: 76,
      strengths: ['Defense', 'Placement', 'Patience'],
      weaknesses: ['Aggressive Play'],
      recentMatches: 8,
      teamExperience: 5,
      isOnline: false,
      communicationStyle: 'quiet',
      schedule: 'mornings'
    }
  ]);

  const handleSendPartnerRequest = (partner: PartnerProfile, message: string) => {
    const newRequest: TeamRequest = {
      id: Date.now().toString(),
      partner,
      message,
      timestamp: new Date(),
      status: 'pending',
      matchType: 'casual'
    };

    // In real app, this would be an API call
    toast({
      title: "🤝 Partnership Request Sent!",
      description: `Sent team-up request to ${partner.name}`,
      duration: 3000,
    });

    // Simulate response after 2 seconds
    setTimeout(() => {
      toast({
        title: "✨ Partnership Accepted!",
        description: `${partner.name} accepted your team-up request! You're now a doubles team.`,
        duration: 4000,
      });
      
      if (onPartnerFound) {
        onPartnerFound(partner);
      }
    }, 2000);
  };

  const handleAcceptRequest = (request: TeamRequest) => {
    setPartnerRequests(prev => prev.filter(r => r.id !== request.id));
    toast({
      title: "🎉 Partnership Formed!",
      description: `You're now teammates with ${request.partner.name}!`,
      duration: 3000,
    });

    if (onPartnerFound) {
      onPartnerFound(request.partner);
    }
  };

  const handleDeclineRequest = (request: TeamRequest) => {
    setPartnerRequests(prev => prev.filter(r => r.id !== request.id));
    toast({
      title: "Partnership Declined",
      description: `Declined team-up request from ${request.partner.name}`,
      duration: 2000,
    });
  };

  const filteredPartners = availablePartners.sort((a, b) => b.compatibility - a.compatibility);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Doubles Partner System</h2>
        <p className="text-slate-400">Find compatible partners for doubles matches</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex bg-slate-800 rounded-lg p-1">
          {([
            { key: 'discover', label: 'Discover Partners', icon: Users },
            { key: 'requests', label: 'Requests', icon: Handshake },
            { key: 'teams', label: 'My Teams', icon: Trophy }
          ] as const).map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                variant={activeTab === tab.key ? 'default' : 'ghost'}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.key === 'requests' && partnerRequests.length > 0 && (
                  <Badge className="bg-blue-500 text-white ml-1">
                    {partnerRequests.length}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'discover' && (
          <motion.div
            key="discover"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map(partner => (
                <PartnerCompatibilityCard
                  key={partner.id}
                  partner={partner}
                  onSendRequest={handleSendPartnerRequest}
                  onViewProfile={() => {}}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <PartnerRequestsPanel
              requests={partnerRequests}
              onAccept={handleAcceptRequest}
              onDecline={handleDeclineRequest}
            />
          </motion.div>
        )}

        {activeTab === 'teams' && (
          <motion.div
            key="teams"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {currentPartner ? (
              <div className="max-w-md mx-auto">
                <Card className="p-6 border border-slate-600 bg-gradient-to-br from-green-600/20 to-blue-600/20">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Users className="h-8 w-8 text-green-400" />
                      <Trophy className="h-8 w-8 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Active Doubles Team</h3>
                    <div className="text-green-400 text-lg font-medium mb-4">
                      You & {currentPartner.name}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-6">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Partnership Active</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                        onClick={() => setActiveTab('discover')}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Find Opponents
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 border-red-400/30 text-red-400 hover:bg-red-400/10"
                        onClick={() => {
                          toast({
                            title: "🔄 Partnership Dissolved",
                            description: "You can form new partnerships anytime.",
                            duration: 3000,
                          });
                          // This would normally call a callback to dissolve the partnership
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Dissolve
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">My Doubles Teams</h3>
                <p className="text-slate-400 mb-6">Your established partnerships will appear here</p>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => setActiveTab('discover')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Find New Partner
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}