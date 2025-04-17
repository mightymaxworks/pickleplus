/**
 * @component IconsShowcasePage
 * @layer UI
 * @version 1.0.0
 * @description Icons showcase page to demonstrate the custom icons
 */
import React from 'react';
import MainLayout from "@/components/MainLayout";
import IconShowcase from '@/assets/icons/IconShowcase';

const IconsShowcasePage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pickle+ Custom Icons</h1>
          <p className="text-muted-foreground">
            Framework 5.1 implementation with semantic identifiers and SVG customization
          </p>
        </div>
        
        <IconShowcase />
        
        <div className="mt-12 p-6 bg-muted/30 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Implementation Details</h2>
          <p className="mb-4">
            These icons are implemented as React components with SVG elements, providing:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6">
            <li>Full customization of colors, sizes, and styles</li>
            <li>Semantic identifiers for testing and debugging</li>
            <li>Framework 5.1 component annotations</li>
            <li>Sport-specific visuals for the Pickle+ platform</li>
            <li>Consistent design language across the application</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-3">Usage Example</h3>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`
// Import icons
import { PickleballIcon, PaddleIcon } from '@/assets/icons';

// Use in components
<div className="flex items-center gap-2">
  <PickleballIcon size={24} color="#FF6600" />
  <span>Pickleball Score:</span>
  <strong>11-9</strong>
</div>
            `}</code>
          </pre>
        </div>
      </div>
    </MainLayout>
  );
};

export default IconsShowcasePage;