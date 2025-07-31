import { Building2, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/auth';

export default function TrainingFacilitiesComingSoon() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto max-w-5xl p-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Training Facilities Coming Soon</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're building a comprehensive network of training facilities. Stay tuned for enhanced training experiences!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Facility Discovery
              </CardTitle>
              <CardDescription>
                Find and connect with training centers in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Our facility finder will help you locate nearby training centers, view their amenities, 
                and check availability for courts, lessons, and programs.
              </p>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">Coming in April 2025</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Integrated Booking
              </CardTitle>
              <CardDescription>
                Book courts and classes directly through the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Seamlessly book training sessions, group classes, and court time across 
                our partner facilities with real-time availability and instant confirmation.
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
              Join our waitlist to receive updates when facility discovery launches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                You're already on our platform, so we'll notify you as soon as training facilities are available.
                Make sure to complete your profile to get personalized facility recommendations.
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