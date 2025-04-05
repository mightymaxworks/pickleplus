import { BarChart, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';

export default function LeaderboardComingSoon() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto max-w-5xl p-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <BarChart className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Leaderboard Coming Soon</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your ranking, compare yourself to other players, and climb to the top of the Pickle+ leaderboards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Player Rankings
              </CardTitle>
              <CardDescription>
                See where you stand among players in your area and skill level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Our ranking system will be based on match performance, tournament results, 
                and skill level progression. Filter rankings by location, age bracket, 
                and skill level to find meaningful comparisons.
              </p>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">Coming in April 2025</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Community Challenges
              </CardTitle>
              <CardDescription>
                Participate in limited-time competitions and special events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Join special leaderboard challenges that run for a limited time. Compete in
                categories like most matches played, highest win percentage, or most improved
                player within a time period.
              </p>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">Coming in April 2025</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Fair and Balanced Competition</CardTitle>
            <CardDescription>
              Our ranking system is designed to provide meaningful comparisons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                We're developing a sophisticated rating system that accounts for the quality
                of opponents, match context, and skill progression. This ensures rankings reflect
                true skill level and provide a fair competitive environment.
              </p>
              <Button className="w-full md:w-auto" disabled>
                You'll be notified when live
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}