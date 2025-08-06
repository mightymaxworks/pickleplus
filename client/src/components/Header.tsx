import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Menu, Shield, User, LogOut } from "lucide-react";
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
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Header() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  
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
            <div className="mr-4">
              <NotificationBell />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#FF5722] to-[#2196F3] flex items-center justify-center text-white font-bold cursor-pointer">
                  {initials}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                {/* LAUNCH VERSION: Admin Panel disabled for streamlined experience */}
                {/* {user?.isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => setLocation("/admin/dashboard")}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )} */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
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
