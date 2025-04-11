/**
 * PKL-278651-ADMIN-0014-UX
 * Help Button Component
 * 
 * This component provides a standardized way to access help resources
 * including guided tours, documentation, and contextual help.
 */

import React, { useState } from 'react';
import { HelpCircle, BookOpen, Play, MessageCircle, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { EnhancedTooltip } from './EnhancedTooltip';
import { useLocation } from 'wouter';

export function HelpButton() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);

  // Function to start a guided tour
  const startGuidedTour = () => {
    toast({
      title: "Guided Tour",
      description: "The guided tour feature will be available soon!",
    });
    // Tour logic would be implemented here
  };

  // Function to open documentation
  const openDocumentation = () => {
    // In a real implementation, this would open documentation relevant to the current page
    window.open('https://docs.pickleplus.com', '_blank');
  };

  // Function to open support chat
  const openSupportChat = () => {
    toast({
      title: "Support Chat",
      description: "The support chat feature will be available soon!",
    });
  };

  // Function to show contextual help
  const showContextualHelp = () => {
    setHelpPanelOpen(true);
    // In a real implementation, this would display help relevant to the current page/context
    toast({
      title: "Contextual Help",
      description: "Help information for this page will appear here.",
    });
  };

  return (
    <EnhancedTooltip content="Help & Resources" side="bottom">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Help & Resources</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={startGuidedTour}>
              <Play className="mr-2 h-4 w-4" />
              <span>Start guided tour</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={showContextualHelp}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Show help for this page</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDocumentation}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Documentation</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={openSupportChat}>
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>Chat with support</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/support')}>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support center</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </EnhancedTooltip>
  );
}