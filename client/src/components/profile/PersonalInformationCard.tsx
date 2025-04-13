import { 
  User, MapPin, Clock, Dumbbell, Database, Hand, KeyRound, 
  Smartphone, Award, Heart, UserCircle2, UserCheck
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { ContextualEditField } from "./contextual-edit/ContextualEditField";
import { ProfileEditProvider } from "@/contexts/ProfileEditContext";
import { z } from "zod";

interface PersonalInformationCardProps {
  user: any;
}

export function PersonalInformationCard({ user }: PersonalInformationCardProps) {
  return (
    <ProfileEditProvider>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-[#2196F3]" /> 
              Personal Information
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {/* Name Information */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Identity</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="bg-[#FF9800]/10 text-[#FF9800] p-2 rounded-md mr-3 mt-2">
                    <UserCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-grow">
                    <ContextualEditField
                      fieldName="firstName"
                      fieldLabel="First Name"
                      initialValue={user.firstName}
                      placeholder="Enter your first name"
                      validator={z.string().min(2, "First name must be at least 2 characters")}
                      fieldType="basic"
                    />
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FF9800]/10 text-[#FF9800] p-2 rounded-md mr-3 mt-2">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-grow">
                    <ContextualEditField
                      fieldName="lastName"
                      fieldLabel="Last Name"
                      initialValue={user.lastName}
                      placeholder="Enter your last name"
                      validator={z.string().min(2, "Last name must be at least 2 characters")}
                      fieldType="basic"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />
            
            {/* Contact Information */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Contact</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start">
                  <div className="bg-[#2196F3]/10 text-[#2196F3] p-2 rounded-md mr-3">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Email</div>
                    <div>{user.email || "Not provided"}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#4CAF50]/10 text-[#4CAF50] p-2 rounded-md mr-3">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Location</div>
                    <div>{user.location || "Not provided"}</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Play Information */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Play Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="bg-[#FF5722]/10 text-[#FF5722] p-2 rounded-md mr-3">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Playing Since</div>
                    <div>{user.playingSince || "Not provided"}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#9C27B0]/10 text-[#9C27B0] p-2 rounded-md mr-3">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Skill Level</div>
                    <div>{user.skillLevel || "Not provided"}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#673AB7]/10 text-[#673AB7] p-2 rounded-md mr-3">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Preferred Position</div>
                    <div>{user.preferredPosition || "Not provided"}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#00BCD4]/10 text-[#00BCD4] p-2 rounded-md mr-3">
                    <Hand className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Dominant Hand</div>
                    <div>{user.dominantHand || "Not provided"}</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Equipment */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Equipment</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="bg-[#3F51B5]/10 text-[#3F51B5] p-2 rounded-md mr-3">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Paddle Brand</div>
                    <div>{user.paddleBrand || "Not provided"}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#E91E63]/10 text-[#E91E63] p-2 rounded-md mr-3">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Paddle Model</div>
                    <div>{user.paddleModel || "Not provided"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-[#F44336]" /> About Me
                  </h4>
                  <div className="text-sm mt-2">{user.bio}</div>
                </div>
              </>
            )}

            {/* Playing Style */}
            {user.playingStyle && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#FFC107]" /> Playing Style
                  </h4>
                  <div className="text-sm mt-2">{user.playingStyle}</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </ProfileEditProvider>
  );
}