/**
 * PKL-278651-COMM-0006-HUB-UI
 * Community Menu Component
 * 
 * A horizontal menu for navigating community-related pages.
 */

import React from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

type MenuTab = "discover" | "profile" | "create" | "events" | "news" | "my";

interface CommunityMenuProps {
  activeTab?: MenuTab;
  className?: string;
}

const CommunityMenu: React.FC<CommunityMenuProps> = ({ 
  activeTab, 
  className 
}) => {
  const [, navigate] = useLocation();
  
  const tabs = [
    { id: "discover", label: "Discover", href: "/communities" },
    { id: "my", label: "My Communities", href: "/communities/my" },
    { id: "create", label: "Create Community", href: "/communities/create" },
    { id: "events", label: "Community Events", href: "/communities/events" },
    { id: "news", label: "Community News", href: "/communities/news" },
  ];
  
  return (
    <div className={cn(
      "relative overflow-auto md:overflow-visible w-full",
      className
    )}>
      <div className="flex snap-x snap-mandatory md:snap-none overflow-x-auto pb-2 md:pb-0 gap-1 md:gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "flex-shrink-0 inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 snap-start snap-always transition-all",
              tab.id === activeTab
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => navigate(tab.href)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Shadow indicators for scroll */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
    </div>
  );
};

export { CommunityMenu };
export default CommunityMenu;