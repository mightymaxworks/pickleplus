import { Link, useLocation } from "wouter";
import { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SidebarProps {
  user?: User;
}

const Sidebar = ({ user }: SidebarProps) => {
  const [location] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/users/logout", {});
      window.location.href = "/login";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-home" },
    { path: "/profile", label: "My Profile", icon: "fas fa-user" },
    { path: "/tournaments", label: "Tournaments", icon: "fas fa-trophy" },
    { path: "/achievements", label: "Achievements", icon: "fas fa-medal" },
    { path: "/leaderboard", label: "Leaderboard", icon: "fas fa-users" },
    { path: "/social/content", label: "Community Content", icon: "fas fa-share-alt" },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-white shadow-md">
      {/* App Logo */}
      <Link href="/">
        <div className="p-4 flex items-center justify-center border-b border-gray-200 cursor-pointer">
          <div className="text-2xl font-bold text-primary">Pickle<span className="text-secondary">+</span></div>
        </div>
      </Link>
      
      {/* Nav Items */}
      <nav className="mt-6 flex-1">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div 
              className={`px-4 py-3 flex items-center cursor-pointer ${
                location === item.path
                  ? "bg-primary bg-opacity-10 text-primary"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              <i className={`${item.icon} mr-3 ${location === item.path ? "text-primary" : "text-gray-500"}`}></i>
              <span className={location === item.path ? "font-medium" : ""}>
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </nav>
      
      {/* Profile Summary */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white">
              <span>{user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{user.displayName}</div>
              <div className="text-xs text-gray-500">Level {user.level}</div>
            </div>
            <div onClick={handleLogout} className="cursor-pointer">
              <i className="fas fa-sign-out-alt text-gray-500"></i>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
