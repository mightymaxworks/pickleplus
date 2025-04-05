import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  Award, 
  Clock, 
  MapPin, 
  Users, 
  ChevronLeft, 
  Video, 
  MessageSquare,
  Star,
  BookOpen,
  Target,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import { CoachProfileSkeleton } from "@/components/profile/CoachProfileSkeleton";
import { getProfileColorsByLevel } from "@/hooks/useXPTier";

export default function CoachProfilePage() {
  const [activeTab, setActiveTab] = useState("about");
  
  // Fetch coach profile data
  const { data: coach, isLoading } = useQuery({
    queryKey: ["/api/coach/profile"],
    retry: false
  });
  
  // If loading, show skeleton
  if (isLoading) {
    return <CoachProfileSkeleton />;
  }
  
  // If no coach profile is found
  if (!coach) {
    return (
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/profile">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Profile
          </Link>
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Coach Profile Not Found</CardTitle>
            <CardDescription>
              You don't have an active coaching profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              To create a coaching profile, you need to either:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Subscribe to our coaching plan</li>
              <li>Enter a valid coaching redemption code</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button variant="default">Subscribe to Coaching</Button>
              <Button variant="outline">Enter Redemption Code</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Get profile colors based on level
  const colors = getProfileColorsByLevel(coach.level || 1);
  
  // Format specialties for display
  const specialties = coach.specialties || [];
  const teachingStyles = coach.teachingStyles || [];
  
  return (
    <div className="container max-w-5xl py-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/profile">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </Link>
      </Button>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and Key Info */}
          <div className="flex flex-col items-center text-center md:text-left md:items-start">
            <Avatar className={`h-24 w-24 mb-3 border-2 ${colors.border}`}>
              <AvatarImage src={coach.profilePicture} />
              <AvatarFallback className={colors.bg}>
                {coach.username?.substring(0, 2).toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
              {coach.isPCPCertified && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  PCP Certified
                </Badge>
              )}
              {coach.isAdminVerified && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  Verified Coach
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3 justify-center md:justify-start">
              {coach.yearsCoaching && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{coach.yearsCoaching} {coach.yearsCoaching === 1 ? 'year' : 'years'} coaching</span>
                </div>
              )}
              {coach.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{coach.location}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Name, Bio, CTAs */}
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-bold mb-1">{coach.displayName || coach.username}</h1>
            <p className="text-lg font-medium text-muted-foreground mb-3">
              {coach.headline || "Pickleball Coach"}
            </p>
            <p className="text-sm mb-4">
              {coach.shortBio || coach.bio?.substring(0, 150) || "No bio available."}
            </p>
            <div className="flex flex-wrap gap-3 mt-auto">
              <Button className="flex-1 sm:flex-none">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <Calendar className="mr-2 h-4 w-4" />
                Book Session
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subscription Status */}
      {coach.subscriptionEndsAt && (
        <Card className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium">Coaching subscription active</p>
                <p className="text-sm text-muted-foreground">
                  Expires on {new Date(coach.subscriptionEndsAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">Renew</Button>
          </CardContent>
        </Card>
      )}
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="specialties">Specialties</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        
        {/* About Tab */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p>{coach.bio || "No biography available."}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Coaching Philosophy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p>{coach.teachingPhilosophy || "No coaching philosophy specified."}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Certifications & Education</CardTitle>
            </CardHeader>
            <CardContent>
              {coach.certifications && coach.certifications.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {coach.certifications.map((cert, i) => (
                    <li key={i}>{cert}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No certifications listed.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Specialties Tab */}
        <TabsContent value="specialties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Areas of Expertise</CardTitle>
              <CardDescription>
                Skills and techniques I specialize in teaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              {specialties.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specialties.map((specialty, i) => (
                    <div key={i} className="flex items-center p-3 border rounded-md">
                      <Target className="h-5 w-5 mr-2 text-orange-500" />
                      <span>{specialty}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No specialties listed.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Teaching Approach</CardTitle>
              <CardDescription>
                How I work with students to improve their game
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teachingStyles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {teachingStyles.map((style, i) => (
                    <div key={i} className="flex items-center p-3 border rounded-md">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                      <span>{style}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No teaching styles listed.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Types</CardTitle>
              <CardDescription>
                Types of coaching sessions I offer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coach.coachingFormats && coach.coachingFormats.length > 0 ? (
                <div className="space-y-3">
                  {coach.coachingFormats.map((format, i) => (
                    <div key={i} className="p-4 border rounded-md flex justify-between items-center">
                      <div className="flex items-start gap-3">
                        {format.toLowerCase().includes('private') && <Users className="h-5 w-5 text-orange-500" />}
                        {format.toLowerCase().includes('group') && <Users className="h-5 w-5 text-blue-500" />}
                        {format.toLowerCase().includes('video') && <Video className="h-5 w-5 text-green-500" />}
                        <div>
                          <h3 className="font-medium">{format}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format.toLowerCase().includes('private') && 'One-on-one focused attention'}
                            {format.toLowerCase().includes('group') && 'Learn with others in a social environment'}
                            {format.toLowerCase().includes('video') && 'Video analysis and feedback'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {coach.hourlyRate && (
                          <p className="font-bold">${coach.hourlyRate}{format.toLowerCase().includes('group') ? '/person' : ''}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No coaching formats listed.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>
                When I'm available for coaching sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coach.availabilitySchedule ? (
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(coach.availabilitySchedule).map(([day, slots]) => (
                    <AccordionItem key={day} value={day}>
                      <AccordionTrigger>{day}</AccordionTrigger>
                      <AccordionContent>
                        {Array.isArray(slots) && slots.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {slots.map((slot, i) => (
                              <Badge key={i} variant="outline" className="justify-center py-1">
                                {slot}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Not available</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">No availability information provided.</p>
              )}
              
              <div className="mt-4">
                <Badge 
                  variant={coach.acceptingNewStudents ? "default" : "secondary"} 
                  className="mt-2"
                >
                  {coach.acceptingNewStudents 
                    ? "Currently accepting new students" 
                    : "Not accepting new students at this time"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Success Stories</CardTitle>
              <CardDescription>
                Feedback and results from my students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coach.studentSuccesses && coach.studentSuccesses.length > 0 ? (
                <div className="space-y-4">
                  {coach.studentSuccesses.map((success, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>{success.studentName?.substring(0, 2) || "ST"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{success.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{success.date}</p>
                        </div>
                      </div>
                      <p className="text-sm mb-3">{success.testimonial}</p>
                      {success.achievement && (
                        <div className="bg-muted p-2 rounded-md text-sm flex items-center">
                          <Flame className="h-4 w-4 mr-2 text-orange-500" />
                          {success.achievement}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="text-muted-foreground">No testimonials added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Featured Content</CardTitle>
              <CardDescription>
                Tips, drills, and resources I've created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Video className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-muted-foreground">No content published yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Check back soon for videos, articles, and drills.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}