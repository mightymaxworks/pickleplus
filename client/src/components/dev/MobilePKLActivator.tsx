/**
 * Mobile PKL-278651 Feature Activator
 * Development component to easily enable mobile-optimized features
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Palette, Navigation, Users } from 'lucide-react';
import { enableMobilePKLFeatures, getFeatureFlagStatus } from '@/utils/featureFlags';
import { useToast } from '@/hooks/use-toast';

export function MobilePKLActivator() {
  const { toast } = useToast();
  const currentFlags = getFeatureFlagStatus();

  const handleActivate = () => {
    enableMobilePKLFeatures();
    toast({
      title: "Mobile Features Activated",
      description: "PKL-278651 mobile optimizations are now enabled. Page will reload.",
    });
  };

  const mobileFeatures = [
    {
      name: 'Enhanced Community',
      flag: 'PKL_ENHANCED_COMMUNITY',
      icon: Users,
      description: 'New social features with improved mobile interactions'
    },
    {
      name: 'Enhanced Passport',
      flag: 'PKL_ENHANCED_PASSPORT',
      icon: Palette,
      description: 'Mobile-first passport dashboard with gesture navigation'
    },
    {
      name: 'Enhanced Navigation',
      flag: 'PKL_ENHANCED_NAVIGATION',
      icon: Navigation,
      description: 'Touch-optimized navigation with mobile patterns'
    },
    {
      name: 'Mobile Optimizations',
      flag: 'PKL_FORCE_MOBILE_OPTIMIZATIONS',
      icon: Smartphone,
      description: 'Force mobile-first design patterns'
    }
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="w-5 h-5 mr-2" />
          Mobile PKL-278651 Activator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {mobileFeatures.map((feature) => {
            const Icon = feature.icon;
            const isEnabled = currentFlags[feature.flag];
            return (
              <div key={feature.flag} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-2" />
                  <div>
                    <div className="font-medium text-sm">{feature.name}</div>
                    <div className="text-xs text-gray-600">{feature.description}</div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  isEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isEnabled ? 'On' : 'Off'}
                </div>
              </div>
            );
          })}
        </div>
        
        <Button 
          onClick={handleActivate}
          className="w-full bg-[#FF5722] hover:bg-[#E64A19]"
        >
          Activate All Mobile Features
        </Button>
        
        <div className="text-xs text-gray-500 text-center">
          This will reload the page to apply changes
        </div>
      </CardContent>
    </Card>
  );
}