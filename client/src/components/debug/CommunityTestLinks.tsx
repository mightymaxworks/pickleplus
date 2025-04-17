/**
 * PKL-278651-COMM-0015-EVENT
 * Community Test Links Component
 * 
 * This component provides direct links to community pages for testing event creation
 * without having to navigate through the entire application.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-17
 */

import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function CommunityTestLinks() {
  const [, navigate] = useLocation();
  
  // Community IDs for testing
  const communities = [
    { id: 1, name: "Pickleball Pros" },
    { id: 2, name: "Dinking Diehards" },
    { id: 3, name: "Third Shot Drop Masters" }
  ];
  
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-slate-800 p-3 rounded-lg shadow-lg">
      <div className="text-xs text-white mb-2">Test Communities:</div>
      <div className="flex flex-col gap-2">
        {communities.map(community => (
          <Button 
            key={community.id}
            variant="outline"
            size="sm"
            onClick={() => navigate(`/communities/${community.id}`)}
            className="text-xs py-1 flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            <span>{community.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}