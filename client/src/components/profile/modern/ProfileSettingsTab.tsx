/**
 * PKL-278651-PROF-0014-COMP - Profile Settings Tab
 * 
 * Settings tab for the modern profile page, allowing users to manage privacy and preferences.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EnhancedUser } from "@/types/enhanced-user";
import { Eye, EyeOff, Lock, Bell, BellOff } from "lucide-react";

interface ProfileSettingsTabProps {
  user: EnhancedUser;
  onFieldUpdate: (field: string, value: any) => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function ProfileSettingsTab({
  user,
  onFieldUpdate
}: ProfileSettingsTabProps) {
  // Default privacy settings if not already set
  const privacyProfile = user.privacyProfile || 'public';
  
  // Local state for toggle switches
  const [allowMatchRequests, setAllowMatchRequests] = useState<boolean>(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState<boolean>(true);
  const [allowConnectionRequests, setAllowConnectionRequests] = useState<boolean>(true);
  const [allowMentoring, setAllowMentoring] = useState<boolean>(user.mentorshipInterest || false);
  
  // Handle privacy profile change
  const handlePrivacyChange = (value: 'public' | 'friends' | 'private') => {
    onFieldUpdate('privacyProfile', value);
  };
  
  // Handle switch toggle for mentorship
  const handleMentorshipToggle = (checked: boolean) => {
    setAllowMentoring(checked);
    onFieldUpdate('mentorshipInterest', checked);
  };
  
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Privacy Settings Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <span>Privacy Settings</span>
            </CardTitle>
            <CardDescription>
              Control who can see your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`border-2 cursor-pointer ${
                  privacyProfile === 'public' ? 'border-primary' : 'border-transparent'
                }`} onClick={() => handlePrivacyChange('public')}>
                  <CardContent className="p-4 text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <h3 className="font-medium mb-1">Public</h3>
                    <p className="text-xs text-muted-foreground">
                      Anyone can view your profile
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={`border-2 cursor-pointer ${
                  privacyProfile === 'friends' ? 'border-primary' : 'border-transparent'
                }`} onClick={() => handlePrivacyChange('friends')}>
                  <CardContent className="p-4 text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <h3 className="font-medium mb-1">Connections Only</h3>
                    <p className="text-xs text-muted-foreground">
                      Only your connections can view full details
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={`border-2 cursor-pointer ${
                  privacyProfile === 'private' ? 'border-primary' : 'border-transparent'
                }`} onClick={() => handlePrivacyChange('private')}>
                  <CardContent className="p-4 text-center">
                    <EyeOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <h3 className="font-medium mb-1">Private</h3>
                    <p className="text-xs text-muted-foreground">
                      Only you can see all your information
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="pt-4 space-y-4">
                <h3 className="text-sm font-medium mb-2">Field Visibility</h3>
                <div className="text-center text-muted-foreground text-sm">
                  Detailed field visibility controls coming in Sprint 4
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Communication Preferences */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Communication Preferences</span>
            </CardTitle>
            <CardDescription>
              Manage how others can contact you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="match-requests">Match Requests</Label>
                  <p className="text-muted-foreground text-xs">
                    Allow others to invite you to matches
                  </p>
                </div>
                <Switch
                  id="match-requests"
                  checked={allowMatchRequests}
                  onCheckedChange={setAllowMatchRequests}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="direct-messages">Direct Messages</Label>
                  <p className="text-muted-foreground text-xs">
                    Allow others to send you private messages
                  </p>
                </div>
                <Switch
                  id="direct-messages"
                  checked={allowDirectMessages}
                  onCheckedChange={setAllowDirectMessages}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="connection-requests">Connection Requests</Label>
                  <p className="text-muted-foreground text-xs">
                    Allow others to send you connection requests
                  </p>
                </div>
                <Switch
                  id="connection-requests"
                  checked={allowConnectionRequests}
                  onCheckedChange={setAllowConnectionRequests}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mentorship">Mentorship Interest</Label>
                  <p className="text-muted-foreground text-xs">
                    Show that you're interested in mentoring others
                  </p>
                </div>
                <Switch
                  id="mentorship"
                  checked={allowMentoring}
                  onCheckedChange={handleMentorshipToggle}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Account Settings */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="pb-4">
                <Button variant="outline">Change Password</Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Danger Zone</h3>
                <div className="p-4 border border-destructive/20 rounded-lg">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="font-medium text-destructive">Deactivate Account</h4>
                      <p className="text-xs text-muted-foreground">
                        Temporarily disable your account
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">Deactivate</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}