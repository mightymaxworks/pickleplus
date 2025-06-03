/**
 * Passport Dashboard Preview Component
 * 
 * This component shows two layout options for the player passport dashboard:
 * 1. Prominent QR Code - Always visible, central to the design
 * 2. Flip Feature QR Code - Hidden behind a card flip interaction
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-03
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  RotateCcw, 
  Star, 
  Trophy, 
  TrendingUp, 
  Users,
  Scan,
  Eye,
  EyeOff,
  Zap,
  Award,
  Target
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PassportDashboardPreview() {
  const [qrVisible, setQrVisible] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeLayout, setActiveLayout] = useState<'prominent' | 'flip'>('prominent');

  const mockUser = {
    displayName: "Alex Rivera",
    username: "alexr_pickle",
    picklePoints: 2847,
    duprRating: 4.2,
    matchesWon: 24,
    totalMatches: 28,
    currentStreak: 5,
    achievements: ["Tournament Winner", "Rising Star", "Community Leader"]
  };

  const ProminentQRLayout = () => (
    <div className="space-y-6">
      {/* Passport Header with Prominent QR */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Player Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {mockUser.displayName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-emerald-900">{mockUser.displayName}</h2>
                  <p className="text-emerald-700">@{mockUser.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-emerald-600">DUPR Rating</p>
                  <p className="text-xl font-bold text-emerald-900">{mockUser.duprRating}</p>
                </div>
                <div>
                  <p className="text-sm text-emerald-600">Win Rate</p>
                  <p className="text-xl font-bold text-emerald-900">
                    {Math.round((mockUser.matchesWon / mockUser.totalMatches) * 100)}%
                  </p>
                </div>
              </div>
            </div>
            
            {/* Prominent QR Code */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-white border-4 border-emerald-300 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                <QrCode className="w-20 h-20 text-emerald-600" />
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                <Scan className="w-3 h-3 mr-1" />
                Scan to Connect
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pickle Points Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Pickle Points
            </h3>
            <span className="text-2xl font-bold text-yellow-600">{mockUser.picklePoints.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="font-semibold">+234</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Spending Power</p>
              <p className="font-semibold">${(mockUser.picklePoints * 0.01).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rank</p>
              <p className="font-semibold">#47</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const FlipQRLayout = () => (
    <div className="space-y-6">
      {/* Passport Header with Flip QR */}
      <div className="relative h-64">
        <motion.div
          className="absolute inset-0 w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ perspective: 1000, transformStyle: "preserve-3d" }}
        >
          {/* Front Side - Player Info */}
          <Card className={`absolute inset-0 w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 ${isFlipped ? 'opacity-0' : 'opacity-100'}`}
                style={{ backfaceVisibility: 'hidden' }}>
            <CardContent className="p-6 h-full flex items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {mockUser.displayName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900">{mockUser.displayName}</h2>
                    <p className="text-blue-700">@{mockUser.username}</p>
                    <Badge className="mt-1 bg-blue-100 text-blue-700">Player Passport</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-600">DUPR</p>
                    <p className="text-xl font-bold text-blue-900">{mockUser.duprRating}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Win Rate</p>
                    <p className="text-xl font-bold text-blue-900">
                      {Math.round((mockUser.matchesWon / mockUser.totalMatches) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Streak</p>
                    <p className="text-xl font-bold text-blue-900">{mockUser.currentStreak}</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setIsFlipped(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Show QR
              </Button>
            </CardContent>
          </Card>

          {/* Back Side - QR Code */}
          <Card className={`absolute inset-0 w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <CardContent className="p-6 h-full flex flex-col items-center justify-center">
              <div className="w-40 h-40 bg-white border-4 border-green-300 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <QrCode className="w-32 h-32 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-green-900 mb-2">Scan to Connect</h3>
              <p className="text-green-700 text-center mb-4">
                Other players can scan this code to initiate matches, view stats, or connect
              </p>
              <Button 
                onClick={() => setIsFlipped(false)}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{mockUser.picklePoints.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Pickle Points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{mockUser.totalMatches}</p>
            <p className="text-sm text-gray-600">Total Matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{mockUser.currentStreak}</p>
            <p className="text-sm text-gray-600">Win Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{mockUser.achievements.length}</p>
            <p className="text-sm text-gray-600">Achievements</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Layout Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Player Passport Dashboard Layouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeLayout} onValueChange={(value) => setActiveLayout(value as 'prominent' | 'flip')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prominent">Prominent QR Code</TabsTrigger>
              <TabsTrigger value="flip">Flip Feature QR Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="prominent" className="mt-6">
              <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">Prominent QR Code Approach</h4>
                <p className="text-emerald-700 text-sm">
                  QR code is always visible and central to the design. Encourages scanning and emphasizes the passport concept.
                  Best for maximizing QR code usage and player connections.
                </p>
              </div>
              <ProminentQRLayout />
            </TabsContent>
            
            <TabsContent value="flip" className="mt-6">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Flip Feature QR Code Approach</h4>
                <p className="text-blue-700 text-sm">
                  QR code is hidden behind an interactive flip animation. Provides a cleaner interface while maintaining 
                  the passport metaphor through the flip interaction.
                </p>
              </div>
              <FlipQRLayout />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Comparison Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-emerald-700 mb-2">Prominent QR Code</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Always visible, encourages scanning
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Clear passport identity
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Maximum QR code adoption
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                  Takes up visual space
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Flip Feature QR Code</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Clean, uncluttered interface
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Interactive passport metaphor
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  More space for other content
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                  Requires user action to access QR
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}