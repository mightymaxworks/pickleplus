/**
 * PKL-278651-COACH-0001-CORE
 * S.A.G.E. (Skills Assessment & Growth Engine) Coaching Page
 * 
 * This page hosts the SAGE coaching panel and handles authentication.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { useAuth } from "@/hooks/use-auth";
import SageCoachingPanel from "@/components/sage/SageCoachingPanel";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export function SageCoachingPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">S.A.G.E. Coaching System</CardTitle>
            <CardDescription>
              Sign in to access personalized coaching insights and training plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              The Skills Assessment & Growth Engine (S.A.G.E.) provides pickleball players with 
              personalized coaching insights, analysis, and training plans based on your 
              playing history and skill level.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-primary/5 rounded-lg">
                <h3 className="font-medium mb-2">Personalized Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Receive analyses of your strengths, weaknesses, and opportunities for improvement
                  across all five dimensions of CourtIQ™.
                </p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <h3 className="font-medium mb-2">Training Plans</h3>
                <p className="text-sm text-muted-foreground">
                  Get custom training exercises designed to help you improve specific aspects
                  of your game with step-by-step instructions.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/auth")}>
              Sign In to Access S.A.G.E.
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <SageCoachingPanel />
    </div>
  );
}

export default SageCoachingPage;