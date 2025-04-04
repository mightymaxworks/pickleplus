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
    { label: "Dashboard", icon: "dashboard", path: "/" },
    { label: "Tournaments", icon: "emoji_events", path: "/tournaments" },
    { label: "Achievements", icon: "military_tech", path: "/achievements" },
    { label: "Leaderboard", icon: "leaderboard", path: "/leaderboard" },
    { label: "Profile", icon: "person", path: "/profile" }
  ];
  
  // Only show on mobile devices
  if (!isMobile) return null;

  return (
    <div className="bg-white pickle-shadow fixed bottom-0 left-0 right-0 flex justify-around items-center z-20">
      {navItems.map((item, index) => (
        <div
          key={index}
          className={`py-3 px-5 flex flex-col items-center ${
            location === item.path ? "text-[#FF5722]" : "text-gray-500"
          }`}
          onClick={() => setLocation(item.path)}
        >
          <span className="material-icons">{item.icon}</span>
          <span className="text-xs">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
