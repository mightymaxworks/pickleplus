import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Menu } from "lucide-react";
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

export function Header() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [notificationCount] = useState(3);
  
  const handleLogout = async () => {
    await logout();
    setLocation("/login");
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
            <div className="relative mr-4">
              <span className="material-icons text-gray-500">notifications</span>
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
                    <DropdownMenuItem onClick={() => setLocation("/admin/codes")}>
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
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
