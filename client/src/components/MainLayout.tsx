import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { TabNavigation } from "@/components/TabNavigation";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5722]"></div>
      </div>
    );
  }
  
  // Don't render the layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <Header />
      <TabNavigation />
      
      <main className="flex-grow">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>
      
      <BottomNavigation />
      <FloatingActionButton />
    </div>
  );
}
