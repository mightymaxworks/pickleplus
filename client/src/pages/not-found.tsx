import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function NotFound() {
  // PKL-278651-ROUT-0013-LOGOT - Fix logout issue on 404 page
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Determine destination based on auth status
  const getHomeDestination = () => {
    // If user is logged in, go to dashboard, otherwise go to landing page
    return user ? '/dashboard' : '/';
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50 overflow-hidden">
      {/* Decorative pickleballs in background */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`,
            opacity: 0.2,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.3 + 0.1,
            rotate: Math.random() * 360,
          }}
          transition={{ 
            duration: Math.random() * 20 + 10, 
            ease: "linear", 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        >
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 relative overflow-hidden">
            <svg viewBox="0 0 100 100" className="absolute inset-0">
              <circle cx="50" cy="50" r="48" fill="#F59E0B" fillOpacity="0.3" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#F59E0B" strokeWidth="1" />
              <path d="M50,10 L50,90 M10,50 L90,50" stroke="#F59E0B" strokeWidth="1" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="#F59E0B" strokeWidth="1" />
            </svg>
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-4 shadow-lg backdrop-blur-sm bg-white/90 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <motion.div 
                className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Out of Bounds!</h1>
              <p className="mt-4 text-gray-600 text-center">
                Looks like your shot landed outside the kitchen. The page you're looking for doesn't exist.
              </p>
            </div>
            
            <div className="flex items-center justify-center my-8">
              <motion.div 
                className="w-28 h-28 rounded-full bg-amber-50 border-2 border-amber-300 relative overflow-hidden"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                {/* Pickleball SVG */}
                <svg viewBox="0 0 100 100" className="absolute inset-0">
                  <circle cx="50" cy="50" r="48" fill="#FF5722" fillOpacity="0.2" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#FF5722" strokeWidth="1" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#FF5722" strokeWidth="1" />
                  <path d="M50,10 L50,90 M10,50 L90,50" stroke="#FF5722" strokeWidth="1" />
                  <circle cx="50" cy="50" r="15" fill="none" stroke="#FF5722" strokeWidth="1" />
                </svg>
              </motion.div>
            </div>

            <div className="mt-6 text-sm text-gray-500 text-center">
              <p>Error 404: Page not found</p>
              <p className="mt-1 text-orange-500 font-medium">Ready for next serve!</p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            {/* PKL-278651-ROUT-0013-LOGOT - Fix button actions to prevent accidental logout */}
            <Button 
              className="w-1/2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              onClick={() => window.history.back()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button 
              className="w-1/2 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => navigate(getHomeDestination())}
            >
              <Home className="mr-2 h-4 w-4" />
              {user ? 'Dashboard' : 'Home'}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
