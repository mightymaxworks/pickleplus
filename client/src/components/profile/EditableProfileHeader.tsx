import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileImageEditor } from "./ProfileImageEditor";
import { Award, Bookmark, Edit, MapPin, Medal, Star, Trophy } from "lucide-react";

interface EditableProfileHeaderProps {
  user: any;
  tierInfo: {
    name: string;
    description: string;
  };
}

export function EditableProfileHeader({ user, tierInfo }: EditableProfileHeaderProps) {
  // Define gradient based on founding member status
  const headerGradient = user.isFoundingMember 
    ? "bg-gradient-to-r from-[#FF5722] to-[#FFD700]" 
    : "bg-gradient-to-r from-[#FF5722] to-[#FF9800]";

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-24 ${headerGradient}`}></div>
      
      <CardContent className="pt-16 pb-6 px-6">
        <div className="flex flex-col items-center mb-4">
          {/* Profile Image */}
          <div className="mb-4 -mt-12 relative z-10">
            <ProfileImageEditor user={user} />
            {user.isFoundingMember && (
              <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1 shadow-md border-2 border-white">
                <Star className="h-4 w-4 text-white" fill="white" />
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h2 className={`text-2xl font-bold ${user.isFoundingMember ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300' : ''}`}>
                {user.displayName || user.username}
              </h2>
              {user.isVerified && (
                <Badge variant="outline" className="rounded-full h-6 border-[#4CAF50] text-[#4CAF50]">
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
              {/* Location */}
              {user.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{user.location}</span>
                </div>
              )}
              
              {/* Founding Member Badge */}
              {user.isFoundingMember && (
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-300 text-black border-0 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  Founding Member
                </Badge>
              )}
              
              {/* External Rating */}
              <Badge variant="outline" className={`flex items-center gap-1 px-3 py-1 ${user.isFoundingMember ? 'border-amber-400 text-amber-500' : 'border-[#2196F3] text-[#2196F3]'}`}>
                <Star className="h-3.5 w-3.5" />
                {user.duprRating || user.utprRating || user.wprRating ? 
                  `${Math.max(
                    parseFloat(user.duprRating || '0'), 
                    parseFloat(user.utprRating || '0'), 
                    parseFloat(user.wprRating || '0')
                  ).toFixed(1)} Rating` : 
                  'No Rating'
                }
                {user.externalRatingsVerified && (
                  <span className="ml-1 text-xs text-green-600">✓</span>
                )}
              </Badge>
              
              {/* CourtIQ Rating */}
              <Badge variant="outline" className={`flex items-center gap-1 px-3 py-1 ${user.isFoundingMember ? 'border-amber-400 text-amber-500' : 'border-[#4CAF50] text-[#4CAF50]'}`}>
                <Trophy className="h-3.5 w-3.5" />
                {user.rankingPoints || '0'} CourtIQ™ Pts
              </Badge>
            </div>
            
            {user.bio && (
              <p className="mt-4 text-sm text-center max-w-md mx-auto">{user.bio}</p>
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