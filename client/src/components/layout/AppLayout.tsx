import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [location] = useLocation();
  
  // Get current user data
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  // Determine current page title based on route
  const getCurrentPageTitle = () => {
    const routeTitles: Record<string, string> = {
      "/": "Dashboard",
      "/profile": "My Profile",
      "/tournaments": "Tournaments",
      "/achievements": "Achievements",
      "/leaderboard": "Leaderboard",
    };
    
    return routeTitles[location] || "Dashboard";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar user={user} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex md:hidden">
            <i className="fas fa-bars text-darkText"></i>
          </div>
          
          <div className="md:hidden text-xl font-bold text-primary">Pickle<span className="text-secondary">+</span></div>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-darkText">{getCurrentPageTitle()}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-primary text-white rounded-md px-4 py-2 text-sm font-medium flex items-center">
              <i className="fas fa-plus mr-2"></i>
              <span>Log Match</span>
            </button>
            
            <div className="relative">
              <i className="fas fa-bell text-gray-500"></i>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-white text-[10px]">3</div>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            children
          )}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileNavigation />
      </div>
    </div>
  );
};

export default AppLayout;
