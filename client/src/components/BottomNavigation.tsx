import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

export function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  
  const navItems: NavItem[] = [
    { label: "Dashboard", icon: "dashboard", path: "/dashboard" },
    { label: "Tournaments", icon: "emoji_events", path: "/tournaments" },
    { label: "Connections", icon: "people", path: "/connections" },
    { label: "Achievements", icon: "military_tech", path: "/achievements" },
    { label: "Profile", icon: "person", path: "/profile" }
  ];
  
  // Only show on mobile devices
  if (!isMobile) return null;

  return (
    <div className="bg-white pickle-shadow fixed bottom-0 left-0 right-0 flex justify-around items-center z-20 pb-safe">
      {navItems.map((item, index) => (
        <div
          key={index}
          className={`py-2 px-1 flex flex-col items-center justify-center w-1/5 ${
            location === item.path ? "text-[#FF5722]" : "text-gray-500"
          }`}
          onClick={() => setLocation(item.path)}
        >
          <span className="material-icons text-[22px]">{item.icon}</span>
          <span className="text-[10px] mt-1 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
