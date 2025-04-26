/**
 * PKL-278651-PROF-0009.1-SECT - Profile Details Section
 * 
 * This component displays basic user profile information with clean UI.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Mail, User, Clock } from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";
import { Separator } from "@/components/ui/separator";

interface ProfileDetailsSectionProps {
  user: EnhancedUser;
}

export function ProfileDetailsSection({ user }: ProfileDetailsSectionProps) {
  // Format dates
  const formattedJoinDate = new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const formattedLastActive = user.lastUpdated 
    ? new Date(user.lastUpdated).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
        <CardDescription>Your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Display Name</span>
          </div>
          <div className="font-medium">{user.displayName || user.username}</div>
        </div>
        
        {user.email && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </div>
            <div className="font-medium">{user.email}</div>
          </div>
        )}
        
        {user.location && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </div>
            <div className="font-medium">{user.location}</div>
          </div>
        )}
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>Joined</span>
          </div>
          <div className="font-medium">{formattedJoinDate}</div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last Active</span>
          </div>
          <div className="font-medium">{formattedLastActive}</div>
        </div>
        
        {user.bio && (
          <>
            <Separator className="my-2" />
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Bio</div>
              <div className="text-sm">{user.bio}</div>
            </div>
          </>
        )}
        
        <Separator className="my-2" />
        
        <div className="flex flex-wrap gap-2">
          {user.isAdmin && (
            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
              Admin
            </Badge>
          )}
          {user.passportId && (
            <Badge variant="outline" className="text-emerald-500 border-emerald-500">
              Verified
            </Badge>
          )}
          {user.preferredPosition && (
            <Badge variant="secondary">
              {user.preferredPosition}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}