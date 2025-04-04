import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Tab {
  label: string;
  path: string;
}

export function TabNavigation() {
  const [location, setLocation] = useLocation();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: "0px",
    width: "0px",
  });
  const isMobile = useIsMobile();

  const tabs: Tab[] = [
    { label: "Dashboard", path: "/" },
    { label: "Tournaments", path: "/tournaments" },
    { label: "Achievements", path: "/achievements" },
    { label: "Leaderboard", path: "/leaderboard" },
    { label: "Profile", path: "/profile" }
  ];

  // Determine active tab based on current location
  useEffect(() => {
    const index = tabs.findIndex(tab => tab.path === location);
    if (index >= 0) {
      setActiveTabIndex(index);
    }
  }, [location, tabs]);

  // Update indicator position when active tab changes
  useEffect(() => {
    if (tabsContainerRef.current) {
      const tabElements = tabsContainerRef.current.querySelectorAll(".tab");
      if (tabElements[activeTabIndex]) {
        const tabElement = tabElements[activeTabIndex] as HTMLElement;
        setIndicatorStyle({
          left: `${tabElement.offsetLeft}px`,
          width: `${tabElement.offsetWidth}px`,
        });
      }
    }
  }, [activeTabIndex]);

  // Handle window resize to reposition indicator
  useEffect(() => {
    const handleResize = () => {
      if (tabsContainerRef.current) {
        const tabElements = tabsContainerRef.current.querySelectorAll(".tab");
        if (tabElements[activeTabIndex]) {
          const tabElement = tabElements[activeTabIndex] as HTMLElement;
          setIndicatorStyle({
            left: `${tabElement.offsetLeft}px`,
            width: `${tabElement.offsetWidth}px`,
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTabIndex]);

  // Don't render on mobile as we use bottom navigation instead
  if (isMobile) return null;

  return (
    <div className="bg-white sticky top-0 z-10 pickle-shadow">
      <div className="container mx-auto relative">
        <div className="flex text-gray-500" ref={tabsContainerRef}>
          {tabs.map((tab, index) => (
            <div
              key={index}
              className={`tab px-6 py-4 cursor-pointer ${
                activeTabIndex === index ? "text-[#FF5722] font-medium" : ""
              }`}
              onClick={() => setLocation(tab.path)}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <div
          className="absolute bottom-0 h-[3px] bg-[#FF5722] transition-all duration-300"
          style={indicatorStyle}
        />
      </div>
    </div>
  );
}
