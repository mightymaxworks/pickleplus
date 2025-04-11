/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Mobile Optimization Testing Page
 * 
 * This page demonstrates the responsive capabilities of the admin interface,
 * showing different content based on the detected device type.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DeviceType, getDeviceType } from '@/modules/admin/utils/deviceDetection';
import { Smartphone, Tablet, Monitor, Laptop } from 'lucide-react';

// Component shown on mobile devices
const MobileView = () => (
  <Card className="mb-6 border-green-500">
    <CardHeader className="bg-green-50 dark:bg-green-900/20">
      <div className="flex items-center gap-2">
        <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
        <CardTitle className="text-lg text-green-700 dark:text-green-400">Mobile Device Detected</CardTitle>
      </div>
      <CardDescription>
        You are viewing the optimized mobile interface
      </CardDescription>
    </CardHeader>
    <CardContent className="pt-4">
      <p className="text-sm text-muted-foreground mb-4">
        The mobile optimization provides:
      </p>
      <ul className="space-y-2 text-sm list-disc pl-5">
        <li>Touch-friendly larger buttons and inputs</li>
        <li>Streamlined navigation elements</li>
        <li>Simplified layouts with focused content</li>
        <li>Optimized loading for faster performance</li>
        <li>Reduced data usage through efficient rendering</li>
      </ul>
      <Button className="w-full mt-4">Mobile Action Button</Button>
    </CardContent>
  </Card>
);

// Component shown on desktop devices
const DesktopView = () => (
  <Card className="mb-6 border-blue-500">
    <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
      <div className="flex items-center gap-2">
        <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <CardTitle className="text-lg text-blue-700 dark:text-blue-400">Desktop Device Detected</CardTitle>
      </div>
      <CardDescription>
        You are viewing the full desktop interface
      </CardDescription>
    </CardHeader>
    <CardContent className="pt-4">
      <p className="text-sm text-muted-foreground mb-4">
        The desktop experience provides:
      </p>
      <ul className="space-y-2 text-sm list-disc pl-5">
        <li>Full-featured administrative controls</li>
        <li>Advanced multi-column layouts</li>
        <li>Enhanced data visualization</li>
        <li>Complete reporting capabilities</li>
        <li>Keyboard shortcuts and accessibility options</li>
      </ul>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button>Primary Action</Button>
        <Button variant="outline">Secondary Action</Button>
      </div>
    </CardContent>
  </Card>
);

// Component showing the device detection settings
const DeviceDetectionCard = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const isLaptop = useMediaQuery('(min-width: 1025px) and (max-width: 1440px)');
  const isDesktop = useMediaQuery('(min-width: 1441px)');
  
  const deviceType = getDeviceType();
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Device Detection Settings</CardTitle>
        <CardDescription>
          How PKL-278651-ADMIN-0009-MOBILE detects your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Device Type</Label>
              <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
                {deviceType === DeviceType.Mobile && <Smartphone className="h-4 w-4 text-primary" />}
                {deviceType === DeviceType.Tablet && <Tablet className="h-4 w-4 text-primary" />}
                {deviceType === DeviceType.Desktop && <Monitor className="h-4 w-4 text-primary" />}
                {deviceType === DeviceType.Laptop && <Laptop className="h-4 w-4 text-primary" />}
                <span className="font-medium text-primary">{DeviceType[deviceType]}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Screen Width Categories</Label>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs">Mobile:</span>
                  <span className="text-xs font-medium">{isMobile ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs">Tablet:</span>
                  <span className="text-xs font-medium">{isTablet ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs">Laptop:</span>
                  <span className="text-xs font-medium">{isLaptop ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs">Desktop:</span>
                  <span className="text-xs font-medium">{isDesktop ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Viewport Dimensions</Label>
            <div className="p-2 bg-secondary/30 text-xs rounded-md">
              <p>Media Query Breakpoints:</p>
              <ul className="pl-5 list-disc space-y-1 mt-1">
                <li>Mobile: max-width: 640px</li>
                <li>Tablet: 641px - 1024px</li>
                <li>Laptop: 1025px - 1440px</li>
                <li>Desktop: min-width: 1441px</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component showing responsive UI examples
const ResponsiveExamples = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Responsive UI Examples</CardTitle>
        <CardDescription>
          Key responsive patterns used throughout the admin interface
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="layout">Layouts</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="layout">
            <div className="space-y-4 pt-4">
              <h4 className="font-medium">Responsive Layouts</h4>
              <p className="text-sm text-muted-foreground">
                The admin interface uses these layout patterns to adapt to different screen sizes:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                <div className="bg-secondary/20 p-3 rounded-md">
                  <h5 className="text-sm font-medium">Single Column (Mobile)</h5>
                  <div className="bg-primary/10 h-20 mt-2 rounded flex items-center justify-center">
                    <div className="w-1/2 h-1/2 bg-primary/20 rounded"></div>
                  </div>
                </div>
                
                <div className="bg-secondary/20 p-3 rounded-md">
                  <h5 className="text-sm font-medium">Two Columns (Tablet)</h5>
                  <div className="bg-primary/10 h-20 mt-2 rounded flex items-center justify-center gap-2">
                    <div className="w-1/3 h-1/2 bg-primary/20 rounded"></div>
                    <div className="w-1/3 h-1/2 bg-primary/20 rounded"></div>
                  </div>
                </div>
                
                <div className="bg-secondary/20 p-3 rounded-md">
                  <h5 className="text-sm font-medium">Multi Column (Desktop)</h5>
                  <div className="bg-primary/10 h-20 mt-2 rounded flex items-center justify-center gap-1">
                    <div className="w-1/5 h-1/2 bg-primary/20 rounded"></div>
                    <div className="w-1/5 h-1/2 bg-primary/20 rounded"></div>
                    <div className="w-1/5 h-1/2 bg-primary/20 rounded"></div>
                    <div className="w-1/5 h-1/2 bg-primary/20 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="components">
            <div className="space-y-4 pt-4">
              <h4 className="font-medium">Responsive Components</h4>
              <p className="text-sm text-muted-foreground">
                Our components automatically adjust based on screen size:
              </p>
              
              <div className="space-y-4 mt-4">
                <div className="border rounded-md p-3">
                  <h5 className="text-sm font-medium mb-2">Button Sizing</h5>
                  <div className="flex flex-wrap gap-2">
                    <Button size={isMobile ? "lg" : "default"}>
                      {isMobile ? "Larger Touch Target" : "Standard Button"}
                    </Button>
                    <Button variant="outline" size={isMobile ? "lg" : "default"}>
                      Secondary
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-md p-3">
                  <h5 className="text-sm font-medium mb-2">Card Layout</h5>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex flex-col md:flex-row gap-2 items-center">
                      <div className="bg-primary/20 w-full md:w-24 h-24 rounded-md flex items-center justify-center">
                        <span className="text-xs">Image</span>
                      </div>
                      <div className="flex-1">
                        <h6 className="font-medium">Card Title</h6>
                        <p className="text-xs text-muted-foreground">
                          Card content that will reflow based on available space
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="navigation">
            <div className="space-y-4 pt-4">
              <h4 className="font-medium">Responsive Navigation</h4>
              <p className="text-sm text-muted-foreground">
                Navigation adapts to screen size for optimal usability:
              </p>
              
              <div className="space-y-4 mt-4">
                <div className="border rounded-md p-3">
                  <h5 className="text-sm font-medium mb-2">
                    {isMobile ? "Mobile Navigation" : "Desktop Navigation"}
                  </h5>
                  
                  {isMobile ? (
                    <div className="bg-muted p-2 rounded-md">
                      <div className="flex justify-between items-center mb-2 border-b pb-2">
                        <div className="font-medium">Menu</div>
                        <Button variant="ghost" size="sm">☰</Button>
                      </div>
                      <div className="space-y-1">
                        <div className="bg-background p-2 rounded flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          <span className="text-sm">Dashboard</span>
                        </div>
                        <div className="p-2 rounded flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                          <span className="text-sm">Users</span>
                        </div>
                        <div className="p-2 rounded flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                          <span className="text-sm">Settings</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted rounded-md">
                      <div className="flex items-center p-2 border-b">
                        <div className="font-medium mr-4">App Logo</div>
                        <div className="flex gap-4">
                          <div className="text-sm font-medium">Dashboard</div>
                          <div className="text-sm">Users</div>
                          <div className="text-sm">Settings</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default function MobileTestPage() {
  const deviceType = getDeviceType();
  const pageTitle = "Mobile Optimization Test";
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="text-muted-foreground">
          Testing and demonstrating mobile optimizations for the admin interface
        </p>
      </div>
      
      {deviceType === DeviceType.Mobile ? <MobileView /> : <DesktopView />}
      
      <DeviceDetectionCard />
      
      <ResponsiveExamples />
      
      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
          <CardDescription>Technical overview of the mobile optimization sprint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Sprint: PKL-278651-ADMIN-0009-MOBILE</h3>
              <p className="text-sm text-muted-foreground">
                This sprint implements mobile optimizations for the admin interface, providing
                a responsive experience across different device types.
              </p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Key Components</h4>
                <ul className="space-y-1 text-sm pl-5 list-disc">
                  <li>Device detection utility</li>
                  <li>Enhanced useMediaQuery hook</li>
                  <li>Responsive component architecture</li>
                  <li>Mobile-specific component variants</li>
                  <li>Screen size breakpoint system</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Implementation Approach</h4>
                <ul className="space-y-1 text-sm pl-5 list-disc">
                  <li>Hybrid responsive design</li>
                  <li>Conditional rendering based on device type</li>
                  <li>Mobile-first CSS with tailwind</li>
                  <li>Touchpoint size optimization</li>
                  <li>Navigation simplification for small screens</li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">File Structure</h4>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                {`client/src/modules/admin/
├── utils/
│   └── deviceDetection.ts    # Device detection utilities
├── components/
│   ├── mobile/               # Mobile-specific components
│   └── responsive/           # Responsive wrapper components
└── hooks/
    └── useMediaQuery.ts      # Enhanced media query hook`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}