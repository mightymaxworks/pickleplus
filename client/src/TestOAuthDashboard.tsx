import React from 'react';
import OAuthDeveloperDashboard from './pages/OAuthDeveloperDashboard';

export default function TestOAuthDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OAuth Developer Dashboard Test Page</h1>
      <div className="border border-gray-200 rounded-lg p-4">
        <OAuthDeveloperDashboard />
      </div>
    </div>
  );
}