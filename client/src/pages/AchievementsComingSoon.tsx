import { Award, Star, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';

export default function AchievementsComingSoon() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto max-w-5xl p-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-4">
            <Award className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Achievements Coming Soon</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your progress, unlock badges, and showcase your pickleball journey through our achievement system.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Skill Milestones
              </CardTitle>
              <CardDescription>
                Earn badges for reaching important skill milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Track your progress with achievements for specific skills like serving accuracy,
                dinking consistency, third shot drops, and more. Receive guidance on improving
                areas where you need practice.
              </p>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">Coming in April 2025</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Match Achievements
              </CardTitle>
              <CardDescription>
                Celebrate your match victories and special accomplishments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Unlock special badges for winning streaks, comeback victories, perfect games,
                and more. Share your achievements with friends and track your performance stats
                over time.
              </p>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">Coming in April 2025</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Help Shape Our Achievement System</CardTitle>
            <CardDescription>
              We want your input on the achievements that matter most
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                As an early user of Pickle+, your feedback will help us design a meaningful
                achievement system that truly captures the pickleball experience. Stay tuned 
                for surveys and beta testing opportunities.
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