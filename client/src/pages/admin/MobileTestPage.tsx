/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Mobile Optimization Testing Page
 * 
 * This page demonstrates the responsive capabilities of the admin interface,
 * showing different content based on the detected device type.
 */

import React from "react";
import { AdminLayout } from "@/modules/admin/components/AdminLayout";
import { useDeviceType } from "@/modules/admin/utils/deviceDetection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Laptop, Monitor, Info } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";

const MobileTestPage: React.FC = () => {
  const deviceType = useDeviceType();
  
  // Icons for different device types
  const deviceIcons = {
    mobile: <Smartphone className="h-8 w-8 text-blue-500" />,
    tablet: <Laptop className="h-8 w-8 text-purple-500" />,
    desktop: <Monitor className="h-8 w-8 text-teal-500" />
  };
  
  // Colors for different device types
  const deviceColors = {
    mobile: "bg-blue-50 border-blue-200 text-blue-700",
    tablet: "bg-purple-50 border-purple-200 text-purple-700",
    desktop: "bg-teal-50 border-teal-200 text-teal-700"
  };
  
  // Badge variants for different device types
  const deviceBadgeVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    mobile: "destructive", 
    tablet: "secondary",
    desktop: "default"
  };
  
  // Descriptions for different device types
  const deviceDescriptions = {
    mobile: "You are viewing the mobile-optimized version with simplified layouts and touch-friendly controls.",
    tablet: "You are viewing the tablet-optimized layout with adjustments for medium-sized screens.",
    desktop: "You are viewing the full desktop version with complete functionality and expanded layouts."
  };
  
  return (
    <AdminProtectedRoute>
      <AdminLayout title="Mobile Test">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">Device Detection Test</CardTitle>
                <Badge variant={deviceBadgeVariants[deviceType] || "default"}>
                  {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
                </Badge>
              </div>
              <CardDescription>
                This page demonstrates the responsive capabilities of Pickle+ Admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`p-6 rounded-lg border ${deviceColors[deviceType]} flex items-start`}>
                <div className="mr-4 flex-shrink-0">
                  {deviceIcons[deviceType]}
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">
                    Detected Device Type: {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
                  </h3>
                  <p className="text-sm">
                    {deviceDescriptions[deviceType]}
                  </p>
                  
                  <div className="mt-4 bg-white bg-opacity-50 p-3 rounded-lg border border-current">
                    <h4 className="font-medium flex items-center mb-2">
                      <Info className="h-4 w-4 mr-1" />
                      Implementation Details
                    </h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Using media queries through <code className="bg-white px-1 py-0.5 rounded text-xs">useMediaQuery</code> hook</li>
                      <li>Detecting device type based on screen width breakpoints</li>
                      <li>Rendering optimized components based on detected device</li>
                      <li>Using Tailwind responsive classes for layout adjustments</li>
                      <li>Part of the PKL-278651-ADMIN-0009-MOBILE sprint</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {deviceType === 'mobile' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mobile Features</CardTitle>
                <CardDescription>Features optimized for mobile devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  The mobile view includes:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Touch-friendly larger interaction targets</li>
                  <li>Simplified navigation with prioritized actions</li>
                  <li>Single-column layouts for better readability</li>
                  <li>Reduced information density</li>
                  <li>Slide-out navigation panels</li>
                </ul>
              </CardContent>
            </Card>
          )}
          
          {deviceType === 'tablet' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tablet Features</CardTitle>
                <CardDescription>Features optimized for tablet devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  The tablet view includes:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Two-column layouts where appropriate</li>
                  <li>Side navigation with expanded options</li>
                  <li>Balanced information density</li>
                  <li>Hybrid touch/mouse input optimizations</li>
                </ul>
              </CardContent>
            </Card>
          )}
          
          {deviceType === 'desktop' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Desktop Features</CardTitle>
                <CardDescription>Features optimized for desktop devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  The desktop view includes:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Multi-column layouts for efficient screen usage</li>
                  <li>Persistent side navigation</li>
                  <li>Higher information density</li>
                  <li>Advanced filtering and sorting options</li>
                  <li>Keyboard shortcuts and mouse optimizations</li>
                </ul>
              </CardContent>
            </Card>
          )}
          
          <div className="text-xs text-gray-500 text-center p-4">
            Resize your browser window to see the responsive behavior in action.
            <br />
            Breakpoints: Mobile (&lt;640px) | Tablet (641px-768px) | Desktop (&gt;768px)
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default MobileTestPage;