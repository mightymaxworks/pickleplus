import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Menu, X, Home, Calendar, Users, Trophy, Activity, BookOpen, PlusCircle } from "lucide-react";
import DesktopSidebar from "./DesktopSidebar";
import MobileNavigation from "./MobileNavigation";
import UserDropdownMenu from "./UserDropdownMenu";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [useLocation()[0]]); // Only re-run when the path changes

  if (!mounted || !user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <DesktopSidebar user={user} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-gray-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* Page Title - can be dynamic */}
            <h1 className="text-xl font-bold text-gray-800 md:ml-0 ml-4">
              Pickle+ Dashboard
            </h1>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <UserDropdownMenu user={user} />
            </div>
          </div>
        </header>
        
        {/* Mobile Menu - only visible when open */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 z-50 bg-white shadow-md">
            <nav className="p-4">
              <ul className="space-y-4">
                <li>
                  <a 
                    href="/dashboard" 
                    className="flex items-center text-gray-700 hover:text-primary"
                  >
                    <Home size={20} className="mr-2" />
                    Dashboard
                  </a>
                </li>
                <li>
                  <a 
                    href="/matches" 
                    className="flex items-center text-gray-700 hover:text-primary"
                  >
                    <Activity size={20} className="mr-2" />
                    Matches
                  </a>
                </li>
                <li>
                  <a 
                    href="/tournaments" 
                    className="flex items-center text-gray-700 hover:text-primary"
                  >
                    <Trophy size={20} className="mr-2" />
                    Tournaments
                  </a>
                </li>
                <li>
                  <a 
                    href="/training" 
                    className="flex items-center text-gray-700 hover:text-primary"
                  >
                    <BookOpen size={20} className="mr-2" />
                    Training
                  </a>
                </li>
                <li>
                  <a 
                    href="/community" 
                    className="flex items-center text-gray-700 hover:text-primary"
                  >
                    <Users size={20} className="mr-2" />
                    Community
                  </a>
                </li>
                <li>
                  <a 
                    href="/passport" 
                    className="flex items-center text-gray-700 hover:text-primary"
                  >
                    <Calendar size={20} className="mr-2" />
                    Passport
                  </a>
                </li>
                {user.isAdmin && (
                  <li>
                    <a 
                      href="/admin" 
                      className="flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <span className="flex items-center">
                        <Users size={20} className="mr-2" />
                        Admin Panel
                      </span>
                    </a>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
        
        {/* Mobile Navigation - fixed to bottom */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <MobileNavigation />
        </div>
      </div>
    </div>
  );
}