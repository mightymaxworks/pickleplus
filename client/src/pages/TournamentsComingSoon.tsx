import { Trophy, Calendar, Medal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/auth';

export default function TournamentsComingSoon() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto max-w-5xl p-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
            <Trophy className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Tournaments Coming Soon</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're putting the final touches on our tournament system. Stay tuned for competitive play!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Event Calendar
              </CardTitle>
              <CardDescription>
                Browse and register for upcoming tournaments in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Our tournament calendar will feature events for all skill levels, from beginners to advanced players.
                Filter by location, date, format, and skill level to find the perfect tournament for you.
              </p>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">Coming in April 2025</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-primary" />
                XP & Ranking System
              </CardTitle>
              <CardDescription>
                Climb the ranks and earn special achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Tournament participation will earn you XP, tier progression, and exclusive badges.
                Your performance will be tracked to help you monitor your improvement over time.
              </p>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">Coming in April 2025</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Be the first to know</CardTitle>
            <CardDescription>
              Join our waitlist to receive updates when tournaments launch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                You're already on our platform, so we'll notify you as soon as tournaments are available.
                Make sure to complete your profile to get personalized tournament recommendations.
              </p>
              <Button className="w-full md:w-auto" disabled>
                You'll be notified
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}