import { useLocation } from "wouter";
import { Home, Activity, Trophy, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function MobileNavigation() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="bg-white shadow-lg border-t border-gray-200">
      <div className="flex items-center justify-around h-16 px-4 relative">
        {/* Home */}
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex flex-col items-center justify-center p-2 ${
            location === "/dashboard" ? "text-primary" : "text-gray-600"
          }`}
        >
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </button>
        
        {/* Matches */}
        <button
          onClick={() => navigate("/matches")}
          className={`flex flex-col items-center justify-center p-2 ${
            location === "/matches" ? "text-primary" : "text-gray-600"
          }`}
        >
          <Activity size={20} />
          <span className="text-xs mt-1">Matches</span>
        </button>
        
        {/* Record Match Button (Centered) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/3">
          <Button
            onClick={() => navigate("/record-match")}
            size="lg"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center"
          >
            <Plus size={24} />
          </Button>
        </div>
        
        {/* Tournaments */}
        <button
          onClick={() => navigate("/tournaments")}
          className={`flex flex-col items-center justify-center p-2 ${
            location === "/tournaments" ? "text-primary" : "text-gray-600"
          }`}
        >
          <Trophy size={20} />
          <span className="text-xs mt-1">Events</span>
        </button>
        
        {/* Profile/Menu */}
        <button
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center justify-center p-2 ${
            location === "/profile" ? "text-primary" : "text-gray-600"
          }`}
        >
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
}