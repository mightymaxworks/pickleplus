import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import PointsProgressBar from '@/components/xp/XPProgressBar';
import { Coins, TrendingUp, Award, ShoppingCart } from 'lucide-react';

export default function PointsDemo() {
  const [currentPoints, setCurrentPoints] = useState(2847);
  const [testAmount, setTestAmount] = useState(100);

  const handleAddPoints = () => {
    setCurrentPoints(prev => prev + testAmount);
  };

  const handleSpendPoints = () => {
    setCurrentPoints(prev => Math.max(0, prev - testAmount));
  };

  const merchantOffers = [
    { name: "Local Pro Shop", discount: "10% off", cost: 500 },
    { name: "Court Time", discount: "Free 1 hour", cost: 750 },
    { name: "Paddle Upgrade", discount: "$25 off", cost: 1000 },
    { name: "Tournament Entry", discount: "50% off", cost: 1500 },
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pickle+ Points System Demo</h1>
        <p className="text-muted-foreground">
          Experience the new **Pickle Points** currency that replaces XP with real merchant value!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-green-600" />
              Your Pickle Points
            </CardTitle>
            <CardDescription>Spendable currency with real merchant value</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">{currentPoints.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Pickle Points</p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{width: '65%'}}></div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">Points Active</Badge>
              <span className="text-sm text-muted-foreground">
                Ready to spend!
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Demo Controls Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Test Points System
            </CardTitle>
            <CardDescription>Simulate earning and spending points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Amount</label>
              <Input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value) || 0)}
                placeholder="Enter points amount"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddPoints} className="flex-1">
                Earn Points
              </Button>
              <Button onClick={handleSpendPoints} variant="outline" className="flex-1">
                Spend Points
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Earn points by: Playing matches, winning tournaments, completing challenges, referring friends
            </div>
          </CardContent>
        </Card>

        {/* Merchant Offers Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
              Merchant Partnerships
            </CardTitle>
            <CardDescription>Spend your Pickle Points for real discounts and rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {merchantOffers.map((offer, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{offer.name}</h4>
                    <p className="text-sm text-muted-foreground">{offer.discount}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{offer.cost} PP</div>
                    <Button 
                      size="sm" 
                      disabled={currentPoints < offer.cost}
                      onClick={() => setCurrentPoints(prev => Math.max(0, prev - offer.cost))}
                    >
                      {currentPoints >= offer.cost ? 'Redeem' : 'Not enough'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Benefits Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-600" />
              Why Pickle Points?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-green-600 mb-2">Real Value</div>
                <p className="text-sm text-muted-foreground">
                  Unlike XP, every point has actual merchant value you can spend
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">Simple</div>
                <p className="text-sm text-muted-foreground">
                  One currency system instead of confusing XP + Points
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-purple-600 mb-2">Motivating</div>
                <p className="text-sm text-muted-foreground">
                  Every match played brings you closer to real rewards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}