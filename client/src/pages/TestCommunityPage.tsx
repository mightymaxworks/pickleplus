/**
 * PKL-278651-COMM-0001-UIMOCK
 * Community Module UI/UX Test Page
 * 
 * This page contains UI mockups for the Community Module features
 * to validate design patterns before full implementation.
 */
import React from 'react';
import { Helmet } from 'react-helmet';
import CommunityMockupView from '../core/modules/community/components/mockups/CommunityMockupView';

const TestCommunityPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Community UI Test | Pickle+</title>
      </Helmet>
      <div className="container mx-auto py-6 px-4">
        <div className="bg-accent/10 p-3 mb-6 rounded-md border border-accent/20">
          <h2 className="text-sm font-medium text-accent-foreground">PKL-278651-COMM-0001-UIMOCK</h2>
          <p className="text-sm text-muted-foreground">
            This is a UI mockup test page for the Community Module. Use the tabs below to explore different UI components.
          </p>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Community Features UI Test</h1>
        
        <CommunityMockupView />
      </div>
    </>
  );
};

export default TestCommunityPage;