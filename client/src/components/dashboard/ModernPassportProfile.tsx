/**
 * Modern Passport Profile Component
 * 
 * A clean, modern passport design extracted from PassportDesignDemo
 * to replace the existing passport section in PassportDashboard.
 * Features QR code integration, image uploads, and inline editing.
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, MapPin, Calendar, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { EditableField } from "@/components/profile/EditableField";

interface ModernPassportProfileProps {
  user: any;
  isOwner?: boolean;
  onProfileUpdate?: (field: string, value: any) => void;
}

export default function ModernPassportProfile({ 
  user, 
  isOwner = false, 
  onProfileUpdate 
}: ModernPassportProfileProps) {
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);

  // Handle file upload for images
  const handleImageUpload = (type: 'profile' | 'cover') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (type === 'profile') {
            setProfileImage(result);
            onProfileUpdate?.('profilePicture', result || null);
          } else {
            setCoverImage(result);
            onProfileUpdate?.('coverImage', result);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Generate QR code data
  const qrCodeData = `${window.location.origin}/profile/${user?.id || 'demo'}`;
  const userRoles = { isCoach: user?.isCoach, isPlayer: true };

  return (
    <div className="w-full max-w-none p-0">
      <Card className="overflow-hidden relative w-full max-w-none shadow-lg border-0 rounded-none sm:rounded-lg sm:border sm:border-gray-200 dark:sm:border-gray-700 sm:m-4">
        {/* Background Image Section - Larger and Mobile Optimized */}
        <div 
          className="h-48 md:h-56 lg:h-64 relative"
          style={{
            backgroundImage: coverImage ? `url(${coverImage})` : 'linear-gradient(to bottom right, rgb(254 215 170), rgb(253 240 207), rgb(254 215 170))',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
        <div className="absolute inset-0 bg-black/10"></div>
        {isOwner && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-3 right-3 h-8 text-xs opacity-80 hover:opacity-100"
            onClick={() => handleImageUpload('cover')}
          >
            <Camera className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Change Cover</span>
            <span className="sm:hidden">Cover</span>
          </Button>
        )}
      </div>
      
        <CardContent className="p-4 md:p-6 -mt-8 md:-mt-12 relative">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
          {/* Left Section: Profile Photo */}
          <div className="relative">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white shadow-lg">
              {profileImage || user?.profilePicture ? (
                <AvatarImage src={profileImage || user?.profilePicture || undefined} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-lg md:text-xl font-bold">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}{user?.lastName?.[0] || ''}
                </AvatarFallback>
              )}
            </Avatar>
            {isOwner && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 h-7 w-7 md:h-8 md:w-8 rounded-full p-0"
                onClick={() => handleImageUpload('profile')}
              >
                <Camera className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Center Section: Name and Info */}
          <div className="flex-1 mx-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              {isOwner ? (
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <EditableField
                    label="First Name"
                    fieldName="firstName"
                    value={user?.firstName || ''}
                    onSave={async (fieldName: string, value: string) => {
                      onProfileUpdate?.('firstName', value);
                    }}
                    placeholder="First Name"
                    className="text-2xl md:text-3xl font-bold text-gray-900"
                  />
                  <EditableField
                    label="Last Name"
                    fieldName="lastName"
                    value={user?.lastName || ''}
                    onSave={async (fieldName: string, value: string) => {
                      onProfileUpdate?.('lastName', value);
                    }}
                    placeholder="Last Name"
                    className="text-2xl md:text-3xl font-bold text-gray-900"
                  />
                </div>
              ) : (
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {user?.firstName || user?.username || 'Player'} {user?.lastName || ''}
                </h1>
              )}
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs md:text-sm w-fit mx-auto sm:mx-0">
                Rank #{Math.floor(Math.random() * 50) + 1}
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-muted-foreground mb-4 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                {isOwner ? (
                  <EditableField
                    label="Location"
                    fieldName="location"
                    value={user?.location || ''}
                    onSave={async (fieldName: string, value: string) => {
                      onProfileUpdate?.('location', value);
                    }}
                    placeholder="Add your location"
                  />
                ) : (
                  <span>{user?.location || 'Location not set'}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                {isOwner ? (
                  <EditableField
                    label="Playing Since"
                    fieldName="playingSince"
                    value={user?.playingSince || user?.yearOfBirth?.toString() || ''}
                    onSave={async (fieldName: string, value: string) => {
                      onProfileUpdate?.('playingSince', value);
                    }}
                    placeholder="Playing since year"
                  />
                ) : (
                  <span>Playing since {user?.playingSince || user?.yearOfBirth || 'Unknown'}</span>
                )}
              </div>
            </div>

            {/* Profile Completion Indicator (only for owners) */}
            {isOwner && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Profile Completion</span>
                  <span className="text-sm text-blue-600">85%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Add profile photo and background image to reach 100%
                </div>
              </div>
            )}

            {/* Quick Stats - Mobile Optimized */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg md:text-2xl font-bold text-orange-600">{user?.currentRating || '4.2'}</div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg md:text-2xl font-bold text-blue-600">{user?.totalMatches || '0'}</div>
                <div className="text-xs text-muted-foreground">Matches</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg md:text-2xl font-bold text-green-600">{user?.winRate || '0'}%</div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg md:text-2xl font-bold text-purple-600">{user?.picklePoints || '0'}</div>
                <div className="text-xs text-muted-foreground">Points</div>
              </div>
            </div>
          </div>

            {/* Right Section: QR Code */}
            <div className="flex-shrink-0">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-2 rounded-lg shadow-md">
                  <QRCodeSVG
                    value={qrCodeData}
                    size={64}
                    level="M"
                    className="block"
                  />
                </div>
                <div className="text-xs text-center text-muted-foreground max-w-[80px]">
                  <QrCode className="h-3 w-3 mx-auto mb-1" />
                  <span className="block">Connect</span>
                </div>
              </div>
            </div>
        </div>

        </CardContent>
      </Card>
      
      {/* Tabbed Content - Mobile Optimized */}
      <div className="sm:m-4 sm:mt-2">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className={`grid w-full h-auto p-1 ${userRoles.isCoach ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="about" className="text-xs md:text-sm px-2 py-2">About</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs md:text-sm px-2 py-2">Stats</TabsTrigger>
            <TabsTrigger value="rankings" className="text-xs md:text-sm px-2 py-2">Rankings</TabsTrigger>
            {userRoles.isCoach && <TabsTrigger value="coaching" className="text-xs md:text-sm px-2 py-2">Coaching</TabsTrigger>}
            <TabsTrigger value="connect" className="text-xs md:text-sm px-2 py-2">Connect</TabsTrigger>
          </TabsList>
            
          
          <TabsContent value="about" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Player Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Player Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Playing Style</h4>
                    <p className="text-sm">Aggressive baseline play with strong net presence</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Favorite Shots</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Cross-court dink</Badge>
                      <Badge variant="outline">Third shot drop</Badge>
                      <Badge variant="outline">Lob</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Tournament Match</span>
                    <span className="text-green-600">Won</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Practice Session</span>
                    <span className="text-blue-600">Completed</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Rating Update</span>
                    <span className="text-orange-600">+0.2</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                    Performance chart would go here
                  </div>
                </CardContent>
              </Card>

              {/* Match History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Matches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>vs. Player A</span>
                    <span className="text-green-600">11-9, 11-7</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>vs. Player B</span>
                    <span className="text-red-600">9-11, 8-11</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="rankings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rankings & Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl mb-2">🏆</div>
                    <h4 className="font-semibold text-sm">First Win</h4>
                    <p className="text-xs text-muted-foreground">Won your first match</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-semibold text-sm">Accuracy Pro</h4>
                    <p className="text-xs text-muted-foreground">90% shot accuracy</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl mb-2">🔥</div>
                    <h4 className="font-semibold text-sm">Win Streak</h4>
                    <p className="text-xs text-muted-foreground">5 wins in a row</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="connect" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connect & Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="bg-white p-4 rounded-lg shadow-md inline-block mb-4">
                    <QRCodeSVG
                      value={qrCodeData}
                      size={128}
                      level="M"
                      className="block"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scan to connect and view full profile
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}