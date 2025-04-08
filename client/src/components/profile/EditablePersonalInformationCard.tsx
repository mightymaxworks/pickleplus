import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Edit, User, Calendar, MapPin, Star, Shield, GripVertical } from "lucide-react";

interface EditablePersonalInformationCardProps {
  user: any;
}

export function EditablePersonalInformationCard({ user }: EditablePersonalInformationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <CardDescription>
              Your pickleball profile details
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 gap-1"
          >
            <Link href="/profile/edit">
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-4">
          {user.yearOfBirth && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm">Age</div>
                <div className="text-sm text-muted-foreground">
                  {new Date().getFullYear() - user.yearOfBirth} years old
                </div>
              </div>
            </div>
          )}
          
          {user.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm">Location</div>
                <div className="text-sm text-muted-foreground">
                  {user.location}
                </div>
              </div>
            </div>
          )}
          
          {user.playingSince && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm">Playing since</div>
                <div className="text-sm text-muted-foreground">
                  {user.playingSince}
                </div>
              </div>
            </div>
          )}
          
          {user.skillLevel && (
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm">Self-rated skill level</div>
                <div className="text-sm text-muted-foreground">
                  {user.skillLevel}
                </div>
              </div>
            </div>
          )}
          
          {user.dominantHand && (
            <div className="flex items-start gap-3">
              <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm">Dominant hand</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {user.dominantHand}
                </div>
              </div>
            </div>
          )}
          
          {user.preferredPosition && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm">Preferred position</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {user.preferredPosition === 'no preference' ? 'No Preference' : user.preferredPosition}
                </div>
              </div>
            </div>
          )}
          
          {user.playingStyle && (
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm">Playing style</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {user.playingStyle}
                </div>
              </div>
            </div>
          )}
          
          {(!user.yearOfBirth && !user.location && !user.playingSince && !user.skillLevel && 
            !user.dominantHand && !user.preferredPosition && !user.playingStyle) && (
            <div className="text-center py-6 text-muted-foreground">
              <User className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No personal information added yet</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/profile/edit">Add your details</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}