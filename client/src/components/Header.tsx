import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Menu, Bell, Shield, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PicklePlusLogo } from "@/components/icons/PicklePlusLogo";
import { PickleGoldLogo } from "@/components/icons/PickleGoldLogo";
import { FoundingMemberBadge } from "@/components/ui/founding-member-badge";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [notificationCount] = useState(3);
  const { toast } = useToast();
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/login");
  };
  
  const handleNotificationClick = () => {
    toast({
      title: "Coming April 15th!",
      description: "Stay tuned! Our personalized notification system is launching soon with match alerts, tournament invites, and achievement updates.",
      variant: "default",
      duration: 5000,
    });
  };
  
  const initials = user?.avatarInitials || user?.displayName?.split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2) || "U";

  return (
    <header className="bg-white pickle-shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => setLocation("/dashboard")}>
          {user?.isFoundingMember ? (
            <PickleGoldLogo height={40} />
          ) : (
            <PicklePlusLogo className="h-10 w-auto" />
          )}
        </div>
        
        {user ? (
          <div className="flex items-center">
            <div className="relative mr-4 cursor-pointer" onClick={handleNotificationClick}>
              <Bell className="h-5 w-5 text-gray-500" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5722] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {notificationCount}
                </span>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#FF5722] to-[#2196F3] flex items-center justify-center text-white font-bold cursor-pointer">
                  {initials}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocation("/profile")}>
                  Profile
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => setLocation("/admin/dashboard")}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                {/* For debugging - remove in production */}
                <DropdownMenuItem className="text-xs text-muted-foreground">
                  {user?.isAdmin ? "Admin: Yes" : "Admin: No"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setLocation("/login")}
            >
              Login
            </Button>
            <Button 
              onClick={() => setLocation("/register")}
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
