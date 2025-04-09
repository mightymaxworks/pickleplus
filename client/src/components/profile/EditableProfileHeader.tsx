import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileImageEditor } from "./ProfileImageEditor";
import { Edit, Trophy } from "lucide-react";

interface EditableProfileHeaderProps {
  user: any;
  tierInfo: {
    name: string;
    description: string;
  };
}

export function EditableProfileHeader({ user, tierInfo }: EditableProfileHeaderProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#FF5722] to-[#FF9800]"></div>
      
      <CardContent className="pt-16 pb-6 px-6">
        <div className="flex flex-col items-center mb-4">
          {/* Profile Image */}
          <div className="mb-4 -mt-12 relative z-10">
            <ProfileImageEditor user={user} />
          </div>
          
          {/* User Info */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-bold">{user.displayName || user.username}</h2>
              {user.isVerified && (
                <Badge variant="outline" className="rounded-full h-6 border-[#4CAF50] text-[#4CAF50]">
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 mr-1 text-[#FF9800]" />
                <span>{tierInfo.name}</span>
              </div>
              
              {user.location && (
                <div className="text-sm text-muted-foreground">
                  • {user.location}
                </div>
              )}
            </div>
            
            {user.bio && (
              <p className="mt-3 text-sm text-center max-w-md mx-auto">{user.bio}</p>
            )}
          </div>
        </div>
        
        {/* Action button - removed for contextual editing */}
        <div className="mt-4 flex justify-center">
          <div className="text-sm text-muted-foreground">
            Click on any field to edit directly
          </div>
        </div>
      </CardContent>
    </Card>
  );
}