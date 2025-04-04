import { Link, useLocation } from "wouter";

const MobileNavigation = () => {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: "fas fa-home" },
    { path: "/tournaments", label: "Tournaments", icon: "fas fa-trophy" },
    { path: "/achievements", label: "Achievements", icon: "fas fa-medal" },
    { path: "/profile", label: "Profile", icon: "fas fa-user" },
  ];

  return (
    <div className="md:hidden h-16 bg-white border-t border-gray-200 flex items-center justify-around px-6">
      {navItems.map((item, index) => {
        // Special case for log match button in the middle
        if (index === 2) {
          return (
            <>
              <div key="log-match" className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white -mt-5 shadow-lg">
                  <i className="fas fa-plus"></i>
                </div>
              </div>
              <Link key={item.path} href={item.path}>
                <div className={`flex flex-col items-center ${
                  location === item.path ? "text-primary" : "text-gray-500"
                }`}>
                  <i className={`${item.icon} text-lg`}></i>
                  <span className="text-xs mt-1">{item.label}</span>
                </div>
              </Link>
            </>
          );
        }
        
        return (
          <Link key={item.path} href={item.path}>
            <div className={`flex flex-col items-center ${
              location === item.path ? "text-primary" : "text-gray-500"
            }`}>
              <i className={`${item.icon} text-lg`}></i>
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileNavigation;
