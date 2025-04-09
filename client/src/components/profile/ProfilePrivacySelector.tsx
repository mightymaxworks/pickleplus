import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, Globe, Users, Shield, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfilePrivacySelectorProps {
  defaultProfile?: string;
  onSave?: (profile: string) => void;
}

type PrivacyProfile = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
};

const privacyProfiles: PrivacyProfile[] = [
  {
    id: 'public',
    name: 'Public Profile',
    description: 'Your profile is visible to everyone, including non-registered users',
    icon: <Globe className="h-5 w-5 text-primary" />
  },
  {
    id: 'connections',
    name: 'Connections Only',
    description: 'Your profile is only visible to your connections and friends',
    icon: <Users className="h-5 w-5 text-primary" />
  },
  {
    id: 'private',
    name: 'Private Profile',
    description: 'Your profile is only visible to you and administrators',
    icon: <Shield className="h-5 w-5 text-primary" />
  }
];

export function ProfilePrivacySelector({ 
  defaultProfile = 'public',
  onSave 
}: ProfilePrivacySelectorProps) {
  const [selectedProfile, setSelectedProfile] = useState(defaultProfile);

  const handleSave = () => {
    if (onSave) {
      onSave(selectedProfile);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h3 className="text-lg font-medium">Profile Visibility</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="ml-2 cursor-help">
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>This controls who can see your general profile information. You can also set individual privacy settings for specific areas of your profile.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <RadioGroup
        value={selectedProfile}
        onValueChange={setSelectedProfile}
        className="space-y-3"
      >
        {privacyProfiles.map((profile) => (
          <Card key={profile.id} className={`cursor-pointer transition-colors ${
            selectedProfile === profile.id ? 'border-primary/50 bg-primary/5' : ''
          }`}>
            <CardContent className="p-4">
              <div 
                className="flex items-start gap-3"
                onClick={() => setSelectedProfile(profile.id)}
              >
                <RadioGroupItem value={profile.id} id={profile.id} className="mt-1" />
                <Label 
                  htmlFor={profile.id} 
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {profile.icon}
                    <span className="font-medium">{profile.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.description}
                  </p>
                </Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>
      
      <Button 
        type="button" 
        onClick={handleSave}
        className="w-full"
      >
        <Check className="h-4 w-4 mr-2" />
        Save Privacy Setting
      </Button>
    </div>
  );
}