import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Check, Shield, Users, Globe } from 'lucide-react';

// Define a type for our privacy setting
export type UserPrivacySetting = {
  fieldName: string;
  visibilityLevel: 'public' | 'connections' | 'private';
};

// Define the component props
interface FieldVisibilitySettingsProps {
  fieldSettings?: UserPrivacySetting[];
  onSave?: (settings: UserPrivacySetting[]) => void;
}

// Field definitions to display in the component
const PROFILE_FIELDS = [
  { id: 'basic_info', label: 'Basic Information', description: 'Name, username, location' },
  { id: 'physical_attributes', label: 'Physical Attributes', description: 'Height, reach, etc.' },
  { id: 'equipment', label: 'Equipment', description: 'Paddle brand, model, etc.' },
  { id: 'court_preferences', label: 'Court Preferences', description: 'Surface, environment, etc.' },
  { id: 'performance_metrics', label: 'Performance Metrics', description: 'Strength, accuracy ratings' },
  { id: 'match_history', label: 'Match History', description: 'Recent matches and outcomes' },
  { id: 'tournament_history', label: 'Tournament History', description: 'Participations and results' },
];

export function FieldVisibilitySettings({ 
  fieldSettings,
  onSave
}: FieldVisibilitySettingsProps) {
  // Initialize settings state with defaults or existing settings
  const [settings, setSettings] = useState<UserPrivacySetting[]>(
    fieldSettings || 
    PROFILE_FIELDS.map(field => ({
      fieldName: field.id,
      visibilityLevel: 'public'
    }))
  );
  
  // Handle changing a field's visibility level
  const handleVisibilityChange = (fieldName: string, visibilityLevel: 'public' | 'connections' | 'private') => {
    setSettings(current => 
      current.map(setting => 
        setting.fieldName === fieldName 
          ? { ...setting, visibilityLevel } 
          : setting
      )
    );
  };
  
  // Save settings when the save button is clicked
  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {PROFILE_FIELDS.map((field) => {
          const currentSetting = settings.find(s => s.fieldName === field.id);
          const visibilityLevel = currentSetting?.visibilityLevel || 'public';
          
          return (
            <Card key={field.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{field.label}</h4>
                      <p className="text-sm text-muted-foreground">{field.description}</p>
                    </div>
                  </div>
                  
                  <RadioGroup 
                    value={visibilityLevel}
                    onValueChange={(value) => 
                      handleVisibilityChange(
                        field.id, 
                        value as 'public' | 'connections' | 'private'
                      )
                    }
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id={`${field.id}-public`} />
                      <Label htmlFor={`${field.id}-public`} className="flex items-center cursor-pointer">
                        <Globe className="h-4 w-4 mr-2 text-primary" />
                        Public
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="connections" id={`${field.id}-connections`} />
                      <Label htmlFor={`${field.id}-connections`} className="flex items-center cursor-pointer">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        Connections Only
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id={`${field.id}-private`} />
                      <Label htmlFor={`${field.id}-private`} className="flex items-center cursor-pointer">
                        <Shield className="h-4 w-4 mr-2 text-primary" />
                        Private
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Button 
        type="button" 
        className="w-full"
        onClick={handleSave}
      >
        <Check className="h-4 w-4 mr-2" />
        Save Privacy Settings
      </Button>
    </div>
  );
}