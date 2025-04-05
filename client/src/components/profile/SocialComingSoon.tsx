import { CalendarClock, Users, Medal, Share2, Award, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function SocialComingSoon() {
  return (
    <Card className="border-2 border-dashed border-primary/20 bg-background/50">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
              Pickleball Community
            </span>
          </CardTitle>
          <Badge variant="outline" className="font-bold border-2 text-primary bg-primary/10">
            <CalendarClock className="mr-1 h-3 w-3" />
            Coming April 2025
          </Badge>
        </div>
        <CardDescription className="text-lg">
          Connect with fellow pickleball enthusiasts and grow your network!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-card">
            <div className="bg-primary/10 p-2 rounded-full text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Find Playing Partners</h3>
              <p className="text-sm text-muted-foreground">
                Connect with players at your skill level for practice matches and friendly games
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-card">
            <div className="bg-primary/10 p-2 rounded-full text-primary">
              <Medal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Find Tournament Partners</h3>
              <p className="text-sm text-muted-foreground">
                Team up with the perfect partner for upcoming tournaments in your area
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-card">
            <div className="bg-[#4CAF50]/10 p-2 rounded-full text-[#4CAF50]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Coaching Connections</h3>
              <p className="text-sm text-muted-foreground">
                Connect with certified coaches to improve your skills or become a coach yourself
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-card">
            <div className="bg-[#4CAF50]/10 p-2 rounded-full text-[#4CAF50]">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Clubs & Leagues</h3>
              <p className="text-sm text-muted-foreground">
                Join local clubs and leagues to participate in regular organized play
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-lg border border-border p-2">
            <div className="flex items-center space-x-4">
              <div className="bg-muted w-12 h-12 rounded-full animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse"></div>
                <div className="h-3 w-2/3 bg-muted rounded animate-pulse"></div>
              </div>
              <Button disabled variant="outline" size="sm">Connect</Button>
            </div>
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Share2 className="h-8 w-8 text-primary mb-2 animate-bounce" />
                <p className="text-sm font-medium">Social connections coming soon!</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <div className="mb-4 p-4 bg-primary/5 rounded-lg">
            <h4 className="font-semibold text-center mb-2">Benefits of Our Social Connections</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div>
                <h5 className="text-sm font-medium text-primary">For Players</h5>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Find certified coaches that match your play style</li>
                  <li>Discover players at your exact skill level</li>
                  <li>Connect with local clubs and organized play</li>
                  <li>Build your tournament network</li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-medium text-[#4CAF50]">For Coaches</h5>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Showcase your certifications and specialties</li>
                  <li>Build your student roster with matching tools</li>
                  <li>Schedule sessions and manage availability</li>
                  <li>Share success stories and build your reputation</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              We're working on exciting social features to help you connect with the pickleball community.
              Full coaching and social features will be available in April 2025.
            </p>
          </div>
          <div className="flex justify-center">
            <Button disabled variant="default" className="w-full max-w-xs">
              Join the Waitlist
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}