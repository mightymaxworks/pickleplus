/**
 * PKL-278651-MASCOT-0001-CORE
 * Bounce Mascot Settings Component
 * 
 * This component allows administrators to customize the Bounce mascot,
 * including uploading a custom PNG image to replace the default SVG.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Upload,
  RefreshCw,
  Clock,
  Image,
  Palette,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BounceMascot } from '@/components/mascot';

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  minDelay: 60000, // 1 minute
  maxDelay: 300000, // 5 minutes
  displayDuration: 12000, // 12 seconds
  appearProbability: 0.7, // 70% chance
  customImagePath: '',
};

const BounceMascotSettings = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Used to show the mascot in the preview
  const [showPreviewMascot, setShowPreviewMascot] = useState(false);
  
  // Query to fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['/api/admin/bounce/mascot/settings'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/admin/bounce/mascot/settings', {
          method: 'GET',
        });
        
        if (response) {
          // If we have settings stored, use them
          setSettings(response);
          if (response.customImagePath) {
            setPreviewImageUrl(response.customImagePath);
          }
        }
        
        return response;
      } catch (error) {
        // If we can't get settings (first time), use defaults
        console.log('Using default mascot settings');
        return DEFAULT_SETTINGS;
      }
    },
  });
  
  // Mutation to save settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      return await apiRequest('/api/admin/bounce/mascot/settings', {
        method: 'POST',
        body: newSettings,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'Bounce mascot settings have been updated.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error saving settings',
        description: 'There was a problem saving your settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation to upload image
  const uploadImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest('/api/admin/bounce/mascot/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Let the browser set the correct Content-Type for form data
          'Content-Type': undefined,
        },
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Image uploaded',
        description: 'Your custom mascot image has been uploaded.',
        variant: 'default',
      });
      
      // Update settings with the new image path
      if (data && data.imagePath) {
        setSettings({
          ...settings,
          customImagePath: data.imagePath,
        });
        
        // Save settings with the new image path
        saveSettingsMutation.mutate({
          ...settings,
          customImagePath: data.imagePath,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: 'There was a problem uploading your image. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Check file type
    if (!file.type.includes('image/png')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PNG image.',
        variant: 'destructive',
      });
      return;
    }
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewImageUrl(previewUrl);
    
    // Create form data and upload
    const formData = new FormData();
    formData.append('mascotImage', file);
    uploadImageMutation.mutate(formData);
  };
  
  // Reset to default SVG
  const handleResetImage = () => {
    setPreviewImageUrl(null);
    setSettings({
      ...settings,
      customImagePath: '',
    });
    
    // Save settings without a custom image path
    saveSettingsMutation.mutate({
      ...settings,
      customImagePath: '',
    });
    
    toast({
      title: 'Image reset',
      description: 'Mascot reset to default SVG image.',
      variant: 'default',
    });
  };
  
  // Save all settings
  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };
  
  // Show the mascot in preview
  const handleShowPreviewMascot = () => {
    setShowPreviewMascot(true);
    // Hide after the display duration
    setTimeout(() => {
      setShowPreviewMascot(false);
    }, settings.displayDuration);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>Bounce Mascot Settings</CardTitle>
        </div>
        <CardDescription>
          Customize the appearance and behavior of the Bounce mascot
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Behavior
            </TabsTrigger>
          </TabsList>
          
          {/* Appearance tab */}
          <TabsContent value="appearance" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Mascot Image</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mascot-image-upload">Upload Custom PNG</Label>
                      {previewImageUrl && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleResetImage}
                          className="flex items-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Reset to Default
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Select PNG Image
                      </Button>
                      <Input
                        ref={fileInputRef}
                        id="mascot-image-upload"
                        type="file"
                        accept="image/png"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleShowPreviewMascot}
                      >
                        Preview Mascot
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload a PNG image to replace the default SVG mascot
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="mascot-enabled"
                      checked={settings.enabled}
                      onCheckedChange={(checked) => 
                        setSettings({...settings, enabled: checked})
                      }
                    />
                    <Label htmlFor="mascot-enabled">Enable Bounce Mascot</Label>
                  </div>
                </div>
                
                <div className="border rounded p-6 flex items-center justify-center bg-muted/20">
                  {previewImageUrl ? (
                    <div className="relative">
                      <img 
                        src={previewImageUrl} 
                        alt="Custom Bounce Mascot" 
                        className="w-32 h-32 object-contain"
                      />
                      <div className="absolute bottom-0 right-0 bg-background rounded-full p-1">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src="/bounce-mascot.svg" 
                        alt="Default Bounce Mascot" 
                        className="w-32 h-32"
                      />
                      <div className="absolute bottom-0 right-0 bg-background rounded-full p-1">
                        <Check className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Behavior tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Minimum Delay Between Appearances</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.minDelay / 1000)} seconds
                  </span>
                </div>
                <Slider
                  defaultValue={[settings.minDelay]}
                  min={10000}
                  max={120000}
                  step={5000}
                  value={[settings.minDelay]}
                  onValueChange={(vals) => 
                    setSettings({...settings, minDelay: vals[0]})
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum time before Bounce may appear again
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Maximum Delay Between Appearances</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.maxDelay / 1000)} seconds
                  </span>
                </div>
                <Slider
                  defaultValue={[settings.maxDelay]}
                  min={60000}
                  max={600000}
                  step={30000}
                  value={[settings.maxDelay]}
                  onValueChange={(vals) => 
                    setSettings({...settings, maxDelay: vals[0]})
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum time before Bounce may appear again
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Display Duration</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.displayDuration / 1000)} seconds
                  </span>
                </div>
                <Slider
                  defaultValue={[settings.displayDuration]}
                  min={5000}
                  max={30000}
                  step={1000}
                  value={[settings.displayDuration]}
                  onValueChange={(vals) => 
                    setSettings({...settings, displayDuration: vals[0]})
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How long Bounce stays visible when it appears
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Appearance Probability</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.appearProbability * 100)}%
                  </span>
                </div>
                <Slider
                  defaultValue={[settings.appearProbability * 100]}
                  min={10}
                  max={100}
                  step={5}
                  value={[settings.appearProbability * 100]}
                  onValueChange={(vals) => 
                    setSettings({...settings, appearProbability: vals[0] / 100})
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Probability that Bounce will appear after the delay
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setSettings(DEFAULT_SETTINGS)}
        >
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSaveSettings}
          disabled={saveSettingsMutation.isPending}
        >
          {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
      
      {/* Preview of the Bounce mascot */}
      {showPreviewMascot && (
        <BounceMascot 
          showOnMount={true}
          displayDuration={settings.displayDuration}
          customImagePath={previewImageUrl || undefined}
        />
      )}
    </Card>
  );
};

export default BounceMascotSettings;