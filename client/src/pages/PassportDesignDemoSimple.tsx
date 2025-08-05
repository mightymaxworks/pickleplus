import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Camera, MapPin, Calendar } from "lucide-react";

export default function PassportDesignDemoSimple() {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const currentData = {
    firstName: "Alex",
    lastName: "Rodriguez", 
    location: "San Francisco, CA",
    playingSince: "2020",
    currentRating: "4.2",
    totalMatches: 127,
    winRate: 68,
    picklePoints: 2480
  };

  const qrCodeData = `pickle-plus://user/alex-rodriguez`;

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Passport Design Demo</h1>
      
      <Card className="overflow-hidden">
        {/* Cover Image Section */}
        <div 
          className="relative h-48 md:h-56 bg-gradient-to-r from-orange-400 to-amber-500"
          style={coverImage ? {
            backgroundImage: `url(${coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-4 right-4"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setCoverImage(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
          >
            <Camera className="h-4 w-4 mr-2" />
            Change Cover
          </Button>
        </div>

        <CardContent className="relative -mt-16 pt-16">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Photo and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-orange-100 text-orange-800 text-xl font-bold">
                      {currentData.firstName[0]}{currentData.lastName[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setProfileImage(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-2 rounded-lg shadow-md">
                  <QRCodeSVG
                    value={qrCodeData}
                    size={64}
                    level="M"
                    className="block"
                  />
                </div>
                <div className="text-xs text-center text-muted-foreground">
                  <QrCode className="h-3 w-3 mx-auto mb-1" />
                  <span className="block">Connect</span>
                </div>
              </div>
            </div>

            {/* Name and Info Section */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentData.firstName} {currentData.lastName}
              </h1>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 mb-4">
                Rank #12
              </Badge>
              
              <div className="flex flex-col md:flex-row items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{currentData.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Playing since {currentData.playingSince}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{currentData.currentRating}</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{currentData.totalMatches}</div>
                  <div className="text-sm text-muted-foreground">Matches</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{currentData.winRate}%</div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{currentData.picklePoints}</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}