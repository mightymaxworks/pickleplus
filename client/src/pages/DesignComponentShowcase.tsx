import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Activity,
  Star,
  Target,
  Zap,
  Shield,
  Award,
  Calendar
} from 'lucide-react';

export default function DesignComponentShowcase() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 mb-6">
            Component Showcase
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Modern components inspired by PlayByPoint but enhanced for the Pickle+ experience
          </p>
        </div>

        {/* Button Variations */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Buttons & Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Primary Actions</h3>
              <div className="space-y-3">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Record Match
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  View Rankings
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Join Tournament
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Secondary Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full border-orange-500 text-orange-600 hover:bg-orange-50">
                  View Profile
                </Button>
                <Button variant="outline" className="w-full">
                  Edit Match
                </Button>
                <Button variant="ghost" className="w-full">
                  Cancel
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Icon Buttons</h3>
              <div className="space-y-3">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  <Trophy className="mr-2 h-4 w-4" />
                  View Trophies
                </Button>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
                <Button variant="ghost" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Community
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Size Variations</h3>
              <div className="space-y-3">
                <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600">
                  Large Button
                </Button>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Default Button
                </Button>
                <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                  Small Button
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Cards & Layout */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Cards & Content Layouts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stat Card */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">1,247</h3>
              <p className="text-slate-600 mb-4">Ranking Points</p>
              <Badge className="bg-green-100 text-green-800">Elite Level</Badge>
            </Card>

            {/* Progress Card */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-blue-600" />
                  Season Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Matches Won</span>
                      <span className="font-medium">24/30</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Tournament Wins</span>
                      <span className="font-medium">3/5</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Card */}
            <Card className="p-6 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Premium Feature</h3>
              <p className="text-slate-700 text-sm mb-4">
                Get advanced analytics and personalized coaching insights.
              </p>
              <Button size="sm" className="w-full">
                Upgrade Now
              </Button>
            </Card>
          </div>
        </section>

        {/* Data Visualization */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Data Visualization</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Win Rate</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-green-600 mr-2">85%</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">↗ +5%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Average Score</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600 mr-2">11.2</span>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">↗ +0.8</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Ranking</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-orange-600 mr-2">#47</span>
                    <Badge className="bg-orange-100 text-orange-800 text-xs">↗ +12</Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-purple-600" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                {[
                  { icon: Award, text: 'Won Summer Tournament', date: '2 days ago', color: 'text-yellow-600' },
                  { icon: Star, text: 'Reached Elite Rank', date: '1 week ago', color: 'text-purple-600' },
                  { icon: Shield, text: '10-Match Win Streak', date: '2 weeks ago', color: 'text-green-600' }
                ].map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center`}>
                      <achievement.icon className={`h-4 w-4 ${achievement.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{achievement.text}</p>
                      <p className="text-xs text-slate-500">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Forms & Inputs */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Forms & Inputs</h2>
          <Card className="p-8 max-w-md mx-auto">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-center">Quick Match Entry</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Opponent</label>
                <Input placeholder="Search players..." className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Your Score</label>
                  <Input placeholder="11" className="text-center" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Opponent Score</label>
                  <Input placeholder="9" className="text-center" />
                </div>
              </div>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-6">
                <Calendar className="mr-2 h-4 w-4" />
                Record Match
              </Button>
            </div>
          </Card>
        </section>

        {/* Color Palette */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Color System</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Primary Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded"></div>
                  <span className="text-sm">Orange #FF6B35</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded"></div>
                  <span className="text-sm">Blue #2563EB</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Neutral Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-900 rounded"></div>
                  <span className="text-sm">Slate 900</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-600 rounded"></div>
                  <span className="text-sm">Slate 600</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-100 rounded border"></div>
                  <span className="text-sm">Slate 100</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Status Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded"></div>
                  <span className="text-sm">Success</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Warning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded"></div>
                  <span className="text-sm">Error</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Gradients</h3>
              <div className="space-y-3">
                <div className="w-full h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded"></div>
                <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-blue-700 rounded"></div>
                <div className="w-full h-8 bg-gradient-to-r from-slate-700 to-slate-900 rounded"></div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}