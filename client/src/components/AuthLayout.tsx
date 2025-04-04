import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Don't render anything while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5722]"></div>
      </div>
    );
  }
  
  // Render the auth pages if not authenticated
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        {children}
      </div>
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Pickle+ | The Ultimate Pickleball Passport</p>
      </footer>
    </div>
  );
}
