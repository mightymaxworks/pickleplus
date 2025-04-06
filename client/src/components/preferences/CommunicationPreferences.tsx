import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CommunicationChannel {
  id?: number;
  userId: number;
  name: string;
  type: string;
  value: string;
  isVerified: boolean;
  verificationCode?: string;
  isActive: boolean;
  priority: number;
}

interface NotificationPreference {
  id?: number;
  userId: number;
  type: string;
  isActive: boolean;
  channels: string[];
}

interface CommunicationPreferences {
  channels: CommunicationChannel[];
  preferences: NotificationPreference[];
}

export function CommunicationPreferences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [preferences, setPreferences] = useState<CommunicationPreferences | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get current communication preferences
  const { data, isLoading } = useQuery({
    queryKey: ["/api/communication-preferences"]
  });
  
  // Handle data updates when it changes
  React.useEffect(() => {
    if (data) {
      setPreferences(data as CommunicationPreferences);
    } else if (data === null && !isLoading) {
      // Set default values if no preferences exist yet
      setPreferences({
        channels: [],
        preferences: []
      });
    }
  }, [data, isLoading]);
  
  // Save communication preferences
  const savePreferencesMutation = useMutation({
    mutationFn: async (prefs: CommunicationPreferences) => {
      const response = await apiRequest(
        "POST",
        "/api/communication-preferences",
        prefs
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communication-preferences"] });
      setIsEditing(false);
      toast({ 
        title: "Success!", 
        description: "Communication preferences updated successfully.", 
        variant: "success" 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to update preferences: ${(error as Error).message}`, 
        variant: "destructive" 
      });
    }
  });
  
  // Toggle notification preference
  const handleToggleNotification = (notificationType: string, active: boolean) => {
    if (!preferences) return;
    
    const updatedPreferences = {
      ...preferences,
      preferences: preferences.preferences.map(pref => 
        pref.type === notificationType ? { ...pref, isActive: active } : pref
      )
    };
    
    setPreferences(updatedPreferences);
    savePreferencesMutation.mutate(updatedPreferences);
  };
  
  // Toggle channel active state
  const handleToggleChannel = (channelId: number, active: boolean) => {
    if (!preferences) return;
    
    const updatedPreferences = {
      ...preferences,
      channels: preferences.channels.map(channel => 
        channel.id === channelId ? { ...channel, isActive: active } : channel
      )
    };
    
    setPreferences(updatedPreferences);
    savePreferencesMutation.mutate(updatedPreferences);
  };
  
  const handleSaveChanges = () => {
    if (!preferences) return;
    savePreferencesMutation.mutate(preferences);
  };
  
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Communication Preferences</h2>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Communication Preferences</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Communication Channels</h3>
        <p className="text-gray-600 mb-6">
          Manage your contact channels and how Pickle+ can reach you.
        </p>
        
        {preferences?.channels && preferences.channels.length > 0 ? (
          <div className="space-y-4">
            {preferences.channels.map(channel => (
              <div key={channel.id || channel.name} className="flex justify-between items-center p-4 border rounded-md">
                <div>
                  <h4 className="font-medium">{channel.name}</h4>
                  <p className="text-sm text-gray-600">{channel.value}</p>
                  {!channel.isVerified && (
                    <span className="text-xs text-amber-600">Unverified</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {channel.isActive ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    checked={channel.isActive}
                    onCheckedChange={(active) => handleToggleChannel(channel.id || 0, active)}
                    disabled={!channel.isVerified}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed rounded-md">
            <p className="text-gray-500">No communication channels configured</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsEditing(true)}
            >
              Add Channel
            </Button>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Notification Preferences</h3>
        <p className="text-gray-600 mb-6">
          Control what types of notifications you receive and how you receive them.
        </p>
        
        {preferences?.preferences && preferences.preferences.length > 0 ? (
          <div className="space-y-4">
            {preferences.preferences.map(pref => (
              <div key={pref.type} className="flex justify-between items-center p-4 border rounded-md">
                <div>
                  <h4 className="font-medium">{formatNotificationType(pref.type)}</h4>
                  <p className="text-sm text-gray-600">
                    Channels: {formatChannels(pref.channels, preferences.channels)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {pref.isActive ? "Enabled" : "Disabled"}
                  </span>
                  <Switch
                    checked={pref.isActive}
                    onCheckedChange={(active) => handleToggleNotification(pref.type, active)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed rounded-md">
            <p className="text-gray-500">No notification preferences configured</p>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(true)}
        >
          Edit Preferences
        </Button>
      </div>
      
      {/* TODO: Add edit modal/form when isEditing is true */}
    </div>
  );
}

// Helper functions to format display values
function formatNotificationType(type: string): string {
  const formattedType = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const typeMapping: Record<string, string> = {
    'Tournament Updates': 'Tournament Updates',
    'Connection Requests': 'Connection Requests',
    'Rating Changes': 'Rating Changes',
    'Achievement Unlocked': 'Achievement Unlocked',
    'Match Invitations': 'Match Invitations',
    'System Announcements': 'System Announcements',
    'Marketing Communications': 'Marketing Communications'
  };
  
  return typeMapping[formattedType] || formattedType;
}

function formatChannels(channelTypes: string[], allChannels: CommunicationChannel[]): string {
  if (!channelTypes || channelTypes.length === 0) {
    return 'None';
  }
  
  const channelNames = channelTypes.map(type => {
    const channel = allChannels.find(c => c.type === type);
    return channel ? channel.name : type;
  });
  
  return channelNames.join(', ');
}