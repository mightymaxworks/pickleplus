/**
 * Find Players Widget - Address the gap between match recording and finding opponents
 * Helps users discover other players for matches
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  MapPin, 
  Star,
  MessageCircle,
  Plus,
  Target
} from 'lucide-react';

interface Player {
  id: number;
  name: string;
  username: string;
  rating: number;
  location: string;
  skillLevel: string;
  preferredFormat: string;
  availableToday: boolean;
  avatar?: string;
}

export function FindPlayersWidget() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for demonstration - would come from API
  const nearbyPlayers: Player[] = [
    {
      id: 1,
      name: 'Sarah Chen',
      username: 'sarahc',
      rating: 3.8,
      location: '2.1 km away',
      skillLevel: '3.5-4.0',
      preferredFormat: 'Doubles',
      availableToday: true,
      avatar: '/uploads/profiles/avatar-default.png'
    },
    {
      id: 2,
      name: 'Mike Rodriguez',
      username: 'mikerpb',
      rating: 4.2,
      location: '3.7 km away',
      skillLevel: '4.0-4.5',
      preferredFormat: 'Singles',
      availableToday: false
    },
    {
      id: 3,
      name: 'Jenny Kim',
      username: 'jennykim',
      rating: 3.5,
      location: '1.8 km away',
      skillLevel: '3.0-3.5',
      preferredFormat: 'Mixed Doubles',
      availableToday: true
    }
  ];

  const handlePlayerConnect = (player: Player) => {
    // Navigate to communities where player connections would happen
    navigate('/communities');
  };

  const handleFindMore = () => {
    navigate('/communities');
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          {language === 'zh-CN' ? '寻找球友' : 'Find Players'}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {language === 'zh-CN' 
            ? '与附近的球员联系并安排比赛' 
            : 'Connect with nearby players and arrange matches'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={language === 'zh-CN' ? '搜索球员...' : 'Search players...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-green-200 focus:border-green-400"
          />
        </div>

        {/* Available Players */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Target className="w-4 h-4 text-green-600" />
            {language === 'zh-CN' ? '附近球员' : 'Nearby Players'}
          </h4>
          
          {nearbyPlayers.slice(0, 3).map((player) => (
            <motion.div
              key={player.id}
              className="p-3 bg-white rounded-lg border border-green-100 hover:border-green-200 transition-colors"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={player.avatar} />
                    <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{player.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        {player.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {player.location}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {player.availableToday && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      {language === 'zh-CN' ? '今日可约' : 'Available'}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handlePlayerConnect(player)}
                    className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {language === 'zh-CN' ? '联系' : 'Connect'}
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {player.skillLevel}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {player.preferredFormat}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleFindMore}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'zh-CN' ? '浏览更多球员' : 'Browse More Players'}
          </Button>
        </div>

        {/* Coming Soon Notice */}
        <div className="text-center pt-2 border-t border-green-100">
          <p className="text-xs text-gray-500">
            {language === 'zh-CN' 
              ? '完整的球员匹配系统即将推出' 
              : 'Full player matching system coming soon'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}