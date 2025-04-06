import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PartnerPreference {
  id?: number;
  userId: number;
  isActive: boolean;
  skillRange?: [number, number];
  ageRange?: [number, number];
  genderPreference?: string | null;
  playStyle?: string | null;
  gameTypes?: string[];
  availabilityTimes?: Record<string, string[]>;
  locationPreference?: string | null;
  notes?: string | null;
}

export function PartnerPreferences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [preferences, setPreferences] = useState<PartnerPreference | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get current partner preferences
  const { data, isLoading } = useQuery({
    queryKey: ["/api/partner-preferences"]
  });
  
  // Handle data updates when it changes
  React.useEffect(() => {
    if (data) {
      setPreferences(data as PartnerPreference);
    } else if (data === null && !isLoading) {
      // Set default values if no preferences exist yet
      setPreferences({
        isActive: false,
        userId: 0,
        skillRange: [1000, 2000],
        ageRange: [18, 99],
        genderPreference: null,
        playStyle: null,
        gameTypes: ["doubles"],
        availabilityTimes: {},
        locationPreference: null,
        notes: null
      });
    }
  }, [data, isLoading]);
  
  // Save partner preferences
  const savePreferencesMutation = useMutation({
    mutationFn: async (prefs: PartnerPreference) => {
      const response = await apiRequest(
        "POST",
        "/api/partner-preferences",
        prefs
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner-preferences"] });
      setIsEditing(false);
      toast({ 
        title: "Success!", 
        description: "Partner preferences updated successfully.", 
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
  
  const handleToggleActive = (active: boolean) => {
    if (!preferences) return;
    
    const updatedPreferences = {
      ...preferences,
      isActive: active
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
        <h2 className="text-2xl font-bold mb-4">Partner Preferences</h2>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Partner Preferences</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {preferences?.isActive ? "Active" : "Inactive"}
          </span>
          <Switch
            checked={preferences?.isActive || false}
            onCheckedChange={handleToggleActive}
          />
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          When active, Pickle+ will use your preferences to suggest potential playing partners
          and make your profile visible to players looking for partners with your characteristics.
        </p>
      </div>
      
      {isEditing ? (
        <div className="space-y-6">
          {/* Edit form for preferences would go here */}
          <div className="flex justify-end space-x-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              disabled={savePreferencesMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveChanges}
              disabled={savePreferencesMutation.isPending}
            >
              {savePreferencesMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Skill Preferences</h3>
              <p className="text-gray-600">
                {preferences?.skillRange 
                  ? `${preferences.skillRange[0]} - ${preferences.skillRange[1]}` 
                  : "No preference set"}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Age Preferences</h3>
              <p className="text-gray-600">
                {preferences?.ageRange 
                  ? `${preferences.ageRange[0]} - ${preferences.ageRange[1]}` 
                  : "No preference set"}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Gender Preference</h3>
              <p className="text-gray-600">
                {preferences?.genderPreference || "No preference set"}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Play Style</h3>
              <p className="text-gray-600">
                {preferences?.playStyle || "No preference set"}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Game Types</h3>
              <p className="text-gray-600">
                {preferences?.gameTypes?.join(", ") || "No preference set"}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Location Preference</h3>
              <p className="text-gray-600">
                {preferences?.locationPreference || "No preference set"}
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
            <p className="text-gray-600">
              {preferences?.notes || "No notes added"}
            </p>
          </div>
          
          <div>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
            >
              Edit Preferences
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}