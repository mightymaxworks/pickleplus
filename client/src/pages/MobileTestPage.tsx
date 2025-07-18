/**
 * Mobile PKL-278651 Test Page
 * Quick access page for testing mobile features
 */

import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { MobilePKLActivator } from '@/components/dev/MobilePKLActivator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

export default function MobileTestPage() {
  const [, setLocation] = useLocation();

  return (
    <StandardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Mobile PKL-278651 Testing</h1>
          <p className="text-gray-600">
            Test and activate enhanced mobile features from the PKL-278651 design framework
          </p>
        </div>

        {/* Mobile Feature Activator */}
        <div className="flex justify-center">
          <MobilePKLActivator />
        </div>

        {/* Quick Access Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRight className="w-5 h-5 mr-2" />
              Test Enhanced Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => setLocation('/enhanced-community-demo')}
              className="w-full justify-start"
              variant="outline"
            >
              Enhanced Community Demo
            </Button>
            <Button 
              onClick={() => setLocation('/mobile-ux-showcase')}
              className="w-full justify-start"
              variant="outline"
            >
              Mobile UX Showcase
            </Button>
            <Button 
              onClick={() => setLocation('/migration-control-center')}
              className="w-full justify-start"
              variant="outline"
            >
              Migration Control Center
            </Button>
            <Button 
              onClick={() => setLocation('/dashboard')}
              className="w-full justify-start bg-[#FF5722] hover:bg-[#E64A19] text-white"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Mobile Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Mobile Testing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>1.</strong> Click "Activate All Mobile Features" above</p>
              <p><strong>2.</strong> The page will reload with PKL-278651 mobile optimizations</p>
              <p><strong>3.</strong> Test on your mobile device or use browser dev tools mobile view</p>
              <p><strong>4.</strong> Look for:</p>
              <ul className="ml-4 space-y-1">
                <li>• Enhanced touch targets (44px+)</li>
                <li>• Improved gesture navigation</li>
                <li>• Mobile-first social interactions</li>
                <li>• Optimized component layouts</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
}