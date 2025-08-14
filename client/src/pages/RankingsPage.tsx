import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EnhancedLeaderboard from '@/components/match/EnhancedLeaderboard';
import TierLegend from '@/components/match/TierLegend';

export default function RankingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAge, setFilterAge] = useState('all');
  const [filterSkill, setFilterSkill] = useState('all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Global Rankings
              </h1>
              <p className="text-gray-600">
                PicklePlus ranking system with skill-based competition
              </p>
            </div>
          </div>


        </motion.div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterAge} onValueChange={setFilterAge}>
                <SelectTrigger>
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="18-34">18-34</SelectItem>
                  <SelectItem value="35-49">35-49</SelectItem>
                  <SelectItem value="50-59">50-59</SelectItem>
                  <SelectItem value="60-69">60-69</SelectItem>
                  <SelectItem value="70+">70+</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSkill} onValueChange={setFilterSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Skill Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner (0-499)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (500-999)</SelectItem>
                  <SelectItem value="advanced">Advanced (1000-1499)</SelectItem>
                  <SelectItem value="expert">Expert (1500-1999)</SelectItem>
                  <SelectItem value="elite">Elite (2000+)</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterAge('all');
                  setFilterSkill('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rankings Tabs */}
        <Tabs defaultValue="singles" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="singles" className="text-sm">Singles</TabsTrigger>
            <TabsTrigger value="doubles" className="text-sm">Doubles</TabsTrigger>
            <TabsTrigger value="tiers" className="hidden md:flex text-sm">Tiers</TabsTrigger>
            <TabsTrigger value="age-group" className="hidden md:flex text-sm">Age Group</TabsTrigger>
            <TabsTrigger value="recent" className="hidden md:flex text-sm">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="singles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Singles Player Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedLeaderboard format="singles" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doubles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Doubles Player Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedLeaderboard format="doubles" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiers" className="mt-6">
            <TierLegend />
          </TabsContent>

          <TabsContent value="age-group" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Age Group Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Medal className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Age Group Rankings - Coming Soon!
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Compare your performance against players in your age group
                  </p>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    Phase 2 Feature
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Activity Feed - Coming Soon!
                  </h3>
                  <p className="text-gray-500 mb-4">
                    See recent matches, ranking changes, and achievements
                  </p>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    Phase 2 Feature
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}