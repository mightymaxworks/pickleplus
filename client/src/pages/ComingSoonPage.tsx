import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RedeemCodeForm } from "@/components/profile/RedeemCodeForm";
import { CalendarClock, CheckCircle, ChevronLeft, Mail, ShieldCheck, Trophy, Users } from "lucide-react";
import { Link } from "wouter";

// Form schema for waitlist signup
const waitlistFormSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  reason: z.string()
    .min(1, "Please tell us why you're interested")
    .max(500, "Please keep your response under 500 characters"),
});

type WaitlistFormValues = z.infer<typeof waitlistFormSchema>;

export default function ComingSoonPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Fetch current user info
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/current-user"],
    retry: false
  });
  
  // Setup form
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      email: currentUser?.email || "",
      reason: "",
    },
  });
  
  // Waitlist submission mutation
  const waitlistMutation = useMutation({
    mutationFn: async (data: WaitlistFormValues) => {
      const res = await apiRequest("POST", "/api/waitlist/coaching", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to join waitlist");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "You're on the list!",
        description: "We'll notify you when coaching profiles launch.",
      });
      setIsSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join waitlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Submit handler
  function onSubmit(data: WaitlistFormValues) {
    waitlistMutation.mutate(data);
  }
  
  const launchDate = new Date("April 30, 2025");
  const timeUntilLaunch = launchDate.getTime() - new Date().getTime();
  const daysUntilLaunch = Math.ceil(timeUntilLaunch / (1000 * 60 * 60 * 24));
  
  return (
    <div className="container max-w-5xl py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/profile">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </Link>
      </Button>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white p-8 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Coaching Profiles Coming Soon
          </h1>
          <p className="text-xl opacity-90 mb-6">
            Transform your pickleball expertise into a coaching business. 
            Launching in {daysUntilLaunch} days.
          </p>
          <div className="flex items-center gap-2 text-white/80">
            <CalendarClock className="h-5 w-5" />
            <span>Launch Date: April 30, 2025</span>
          </div>
        </div>
        
        {/* Decorative graphics */}
        <div className="absolute right-0 bottom-0 opacity-10 -mb-10 -mr-10">
          <div className="w-64 h-64 border-8 border-white rounded-full" />
        </div>
        <div className="absolute right-12 top-4 opacity-10 -mt-10 -mr-10">
          <div className="w-32 h-32 border-4 border-white rounded-full" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="col-span-2 space-y-8">
          <section>
            <h2 className="text-3xl font-bold mb-6">Become a Pickleball Coach</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Pickle+ is expanding to connect players with skilled coaches. 
              Create your professional coaching profile and grow your teaching business 
              on the platform pickleball players already use and trust.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start mb-4">
                    <div className="bg-orange-100 dark:bg-orange-950 p-2 rounded-full mr-4">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Find Students</h3>
                      <p className="text-sm text-muted-foreground">Connect with players looking to improve their game</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start mb-4">
                    <div className="bg-orange-100 dark:bg-orange-950 p-2 rounded-full mr-4">
                      <Trophy className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Build Your Brand</h3>
                      <p className="text-sm text-muted-foreground">Showcase your credentials and teaching philosophy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start mb-4">
                    <div className="bg-orange-100 dark:bg-orange-950 p-2 rounded-full mr-4">
                      <ShieldCheck className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Verified Profiles</h3>
                      <p className="text-sm text-muted-foreground">Gain trust with certified coach verification</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start mb-4">
                    <div className="bg-orange-100 dark:bg-orange-950 p-2 rounded-full mr-4">
                      <CheckCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Simple Scheduling</h3>
                      <p className="text-sm text-muted-foreground">Manage bookings and availability in one place</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
          
          <Separator />
          
          {/* Feature Preview Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4">What to Expect</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Professional profile with customizable sections</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Showcase your teaching specialties and credentials</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Set your rates and availability</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Receive booking requests from players</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Track student progress and provide feedback</span>
              </li>
            </ul>
          </section>
        </div>
        
        {/* Sidebar with waitlist form or redemption code form */}
        <div className="space-y-6">
          <Card className="bg-slate-50 dark:bg-slate-900 border-orange-200 dark:border-orange-900">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">Join the Waitlist</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be first to know when coaching profiles launch.
              </p>
              
              {isSubmitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <h4 className="font-medium">You're on the list!</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We'll notify you when coaching profiles launch. Thank you for your interest!
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="flex items-center border rounded-md pl-3 bg-white dark:bg-slate-950">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="your@email.com" 
                                {...field} 
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Why are you interested?</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us a bit about your coaching experience or interest..." 
                              {...field} 
                              className="resize-none min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={waitlistMutation.isPending}
                    >
                      {waitlistMutation.isPending ? "Submitting..." : "Join Waitlist"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
          
          <Separator />
          
          <RedeemCodeForm 
            title="Have an Early Access Code?"
            description="Enter your invitation code to access coaching features before launch."
            endpoint="/api/coach/redeem-code"
            buttonText="Redeem Access Code"
          />
        </div>
      </div>
    </div>
  );
}