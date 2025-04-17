/**
 * PKL-278651-COMM-0006-HUB-UI-MENU
 * Community Menu Component
 * 
 * A specialized horizontal menu for the Community section of the application.
 * Implements the standard HorizontalMenu component with community-specific options.
 */

import React from 'react';
import { useLocation } from 'wouter';
import { HorizontalMenu, MenuItem } from '@/components/ui/horizontal-menu';
import { Search, Users, PlusCircle, Calendar, Megaphone } from 'lucide-react';

export interface CommunityMenuProps {
  activeTab?: 'discover' | 'profile' | 'create' | 'events' | 'news';
  onChange?: (tab: string) => void;
  className?: string;
}

export function CommunityMenu({ 
  activeTab = 'discover', 
  onChange,
  className 
}: CommunityMenuProps) {
  const [, navigate] = useLocation();
  
  // Define the menu items for the community section
  const menuItems: MenuItem[] = [
    {
      id: 'discover',
      icon: <Search className="h-full w-full" />,
      label: 'Discover',
      onClick: () => navigate('/communities')
    },
    {
      id: 'profile',
      icon: <Users className="h-full w-full" />,
      label: 'Profile',
      onClick: () => navigate('/communities/my')
    },
    {
      id: 'create',
      icon: <PlusCircle className="h-full w-full" />,
      label: 'Create',
      onClick: () => navigate('/communities/create')
    },
    {
      id: 'events',
      icon: <Calendar className="h-full w-full" />,
      label: 'Events',
      onClick: () => navigate('/communities/events')
    },
    {
      id: 'news',
      icon: <Megaphone className="h-full w-full" />,
      label: 'News',
      onClick: () => navigate('/communities/news')
    }
  ];

  const handleTabChange = (tabId: string) => {
    if (onChange) {
      onChange(tabId);
    }
  };

  return (
    <HorizontalMenu
      items={menuItems}
      activeItemId={activeTab}
      onChange={handleTabChange}
      colorScheme="primary"
      size="md"
      className={className}
    />
  );
}

export default CommunityMenu;