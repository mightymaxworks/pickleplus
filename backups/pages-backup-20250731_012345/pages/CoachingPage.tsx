import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { 
  UserCog, ChevronLeft, CalendarClock, Clock, Zap, Award, 
  ShieldCheck, Medal, LucideProps, ClipboardCheck, BadgeDollarSign
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

function FeatureIcon(props: LucideProps) {
  return (
    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
      {props.children}
    </div>
  );
}

export default function CoachingPage() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();
  
  // Get current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/current-user"],
  });
  
  // Calculate countdown to May 15th (coach features launch)
  useEffect(() => {
    const launchDate = new Date("May 15, 2025 12:00:00").getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = launchDate - now;
      
      // If launch date has passed, enable features
      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      // Calculate days, hours, minutes, seconds
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };
    
    // Update countdown immediately and then every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleSubmitWaitlist = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    // Mock API request for now
    toast({
      title: "You're on the list!",
      description: "We'll notify you when coaching features launch",
    });
    setEmail("");
  };
  
  return (
    <div className="container max-w-6xl py-6">
      <title>Coaching Platform Coming Soon | Pickle+</title>
      
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-2">
          <Link to="/profile">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Profile
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Coaching Platform</h1>
        <Badge className="ml-2 bg-amber-500 text-white">Coming Soon</Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Marketing content */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-amber-600">
                    Unlock Your Pickleball Potential
                  </CardTitle>
                  <CardDescription className="text-base">
                    Connect with certified coaches or become a coach yourself
                  </CardDescription>
                </div>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                  <CalendarClock className="mr-1 h-3 w-3" />
                  Coming May 15th
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-hidden rounded-lg p-6 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-black/10 border border-amber-100 dark:border-amber-800/30 mt-2 mb-6">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-200 opacity-20 rounded-full"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-amber-200 opacity-20 rounded-full"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-4">
                    Launching in:
                  </h3>
                  
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="flex flex-col items-center">
                      <div className="bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-900/50 rounded-lg w-full aspect-square flex items-center justify-center shadow-sm">
                        <span className="text-3xl font-bold text-amber-600">{countdown.days}</span>
                      </div>
                      <span className="text-sm text-amber-800 dark:text-amber-400 mt-2">Days</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-900/50 rounded-lg w-full aspect-square flex items-center justify-center shadow-sm">
                        <span className="text-3xl font-bold text-amber-600">{countdown.hours}</span>
                      </div>
                      <span className="text-sm text-amber-800 dark:text-amber-400 mt-2">Hours</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-900/50 rounded-lg w-full aspect-square flex items-center justify-center shadow-sm">
                        <span className="text-3xl font-bold text-amber-600">{countdown.minutes}</span>
                      </div>
                      <span className="text-sm text-amber-800 dark:text-amber-400 mt-2">Minutes</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-900/50 rounded-lg w-full aspect-square flex items-center justify-center shadow-sm">
                        <span className="text-3xl font-bold text-amber-600">{countdown.seconds}</span>
                      </div>
                      <span className="text-sm text-amber-800 dark:text-amber-400 mt-2">Seconds</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-white dark:bg-black/30 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400" 
                      style={{ width: `${Math.min(100, (1 - (countdown.days / 40)) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-amber-700 dark:text-amber-500">
                    <span>Development in progress</span>
                    <span>Launch day</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <FeatureIcon>
                      <UserCog className="h-6 w-6 text-amber-600" />
                    </FeatureIcon>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Certified Coaches</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with PCP-certified and admin-verified coaches to improve your game.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <FeatureIcon>
                      <Clock className="h-6 w-6 text-amber-600" />
                    </FeatureIcon>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Flexible Sessions</h3>
                      <p className="text-sm text-muted-foreground">
                        Book in-person or online coaching sessions at times that work for you.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <FeatureIcon>
                      <Zap className="h-6 w-6 text-amber-600" />
                    </FeatureIcon>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Performance Tracking</h3>
                      <p className="text-sm text-muted-foreground">
                        Monitor your progress with detailed metrics and achievement tracking.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <FeatureIcon>
                      <Award className="h-6 w-6 text-amber-600" />
                    </FeatureIcon>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Skill Development</h3>
                      <p className="text-sm text-muted-foreground">
                        Focused training on specific skills with personalized feedback.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-xl font-bold mb-4">For Aspiring Coaches</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-4">
                      <FeatureIcon>
                        <ShieldCheck className="h-6 w-6 text-amber-600" />
                      </FeatureIcon>
                      <div>
                        <h3 className="text-lg font-medium mb-1">Coach Verification</h3>
                        <p className="text-sm text-muted-foreground">
                          Get verified and build your reputation as a trusted pickleball coach.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <FeatureIcon>
                        <Medal className="h-6 w-6 text-amber-600" />
                      </FeatureIcon>
                      <div>
                        <h3 className="text-lg font-medium mb-1">Coach Profile</h3>
                        <p className="text-sm text-muted-foreground">
                          Showcase your skills, certifications, and teaching philosophy.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <FeatureIcon>
                        <ClipboardCheck className="h-6 w-6 text-amber-600" />
                      </FeatureIcon>
                      <div>
                        <h3 className="text-lg font-medium mb-1">Session Management</h3>
                        <p className="text-sm text-muted-foreground">
                          Easy-to-use tools to schedule, track, and manage coaching sessions.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <FeatureIcon>
                        <BadgeDollarSign className="h-6 w-6 text-amber-600" />
                      </FeatureIcon>
                      <div>
                        <h3 className="text-lg font-medium mb-1">Payment Integration</h3>
                        <p className="text-sm text-muted-foreground">
                          Secure payment processing for your coaching services.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Waitlist and CTA */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30">
            <CardHeader>
              <CardTitle>Join the Waitlist</CardTitle>
              <CardDescription>
                Be the first to know when our coaching platform launches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium block mb-1">
                    Email Address
                  </label>
                  <Input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@example.com"
                    className="bg-white dark:bg-black/20 border-amber-200 dark:border-amber-800/50"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitWaitlist}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Join Waitlist
                  </Button>
                </div>
                
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  You'll be the first to know when our coaching platform launches.
                  We'll also send you exclusive early access offers.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Ready to share your skills?</CardTitle>
              <CardDescription>
                Apply to become a coach on our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Are you an experienced pickleball player who wants to help others improve their game?
                Apply to become a coach on our platform and start sharing your knowledge.
              </p>
              <Button 
                className="w-full bg-[#2196F3] hover:bg-[#1E88E5]"
                onClick={() => {
                  window.open("https://forms.gle/9HJK4ZGpTuQDLmnu6", "_blank");
                }}
              >
                Apply to Coach
              </Button>
            </CardContent>
            <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
              <p>
                Coach applications are being reviewed. Selected coaches will be
                invited to join the platform before the public launch.
              </p>
            </CardFooter>
          </Card>
          
          {user?.isCoach && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/10 dark:border-green-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-700 dark:text-green-400">You're a Coach!</CardTitle>
                <CardDescription>
                  You already have coaching access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 dark:text-green-400 mb-4">
                  When our coaching platform launches, you'll have immediate access to all coaching features.
                  Make sure your profile is complete to attract students.
                </p>
                <Button 
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800"
                  onClick={() => setLocation('/coach/profile/edit')}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Prepare Your Coach Profile
                </Button>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Have a Coach Code?</CardTitle>
              <CardDescription>
                Redeem your code to get early access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you've received a coach access code, you can redeem it now to unlock
                coaching features when they launch.
              </p>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/redeem-code'}
              >
                Redeem Coach Code
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}