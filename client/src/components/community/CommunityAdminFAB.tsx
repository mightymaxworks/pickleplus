/**
 * PKL-278651-COMM-0019-MOBILE
 * Community Admin Floating Action Button
 * 
 * This component provides a mobile-friendly floating action button
 * for community administrators to access management functions.
 * Simple version for debugging.
 */

import React, { useState } from 'react';
import { Settings, Edit, Users, Calendar, Image, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";

interface CommunityAdminFABProps {
  communityId: number;
}

export function CommunityAdminFAB({ communityId }: CommunityAdminFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();

  console.log("FAB rendered for community ID:", communityId);

  const toggleMenu = () => {
    console.log("Toggle FAB menu");
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    console.log("FAB option clicked:", option);
    setIsOpen(false);
    navigate(`/communities/${communityId}?tab=manage&section=${option}`);
  };

  return (
    <div className="fixed left-6 bottom-20 flex flex-col gap-2 items-start z-50">
      {/* Menu items only shown when open */}
      {isOpen && (
        <div className="bg-card p-4 rounded-lg shadow-lg border border-border mb-2">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="icon" 
                className="h-12 w-12"
                onClick={() => handleOptionClick('visual')}
                title="Visual Settings"
              >
                <Image size={20} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12"
                onClick={() => handleOptionClick('general')}
                title="General Settings"
              >
                <Settings size={20} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12"
                onClick={() => handleOptionClick('members')}
                title="Manage Members"
              >
                <Users size={20} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12"
                onClick={() => handleOptionClick('events')}
                title="Manage Events"
              >
                <Calendar size={20} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main FAB button - always shown */}
      <Button
        size="icon"
        variant={isOpen ? "destructive" : "default"}
        className="h-14 w-14 rounded-full shadow-xl border-2 border-primary/30 bg-primary text-primary-foreground"
        onClick={toggleMenu}
        aria-label={isOpen ? "Close admin menu" : "Open admin menu"}
      >
        {isOpen ? <X size={24} /> : <Settings size={24} />}
      </Button>
    </div>
  );
}