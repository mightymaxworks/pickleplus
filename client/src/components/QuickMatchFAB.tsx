import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useState } from "react";
import { ScanQRModal } from "./ScanQRModal";

/**
 * QR Code Scanner Floating Action Button
 * Appears on all main app pages when user is authenticated
 * Opens QR scanner modal with role-based functionality
 * 
 * PKL-278651-QR-SCAN-0001 - Role-based QR scanning system
 * @lastModified 2025-06-03
 */
export default function QRScannerFAB() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Debug logging to help identify the issue
  console.log('QRScannerFAB - Debug info:', {
    user: user ? 'User exists' : 'No user',
    location,
    isLoading,
    shouldShow: !(!user || location === '/' || isLoading)
  });

  // Don't show FAB on landing page, if not logged in, or while loading auth state
  if (!user || location === '/' || isLoading) {
    return null;
  }

  // Always use orange for QR scanner
  const buttonClass = "bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 focus:ring-orange-500";

  // Handle QR scanner button click
  const handleQRScan = () => {
    setIsQRModalOpen(true);
  };

  return (
    <>
      <div 
        className="fixed z-50 bottom-20 right-6 md:bottom-6"
        style={{ 
          transition: 'all 0.3s ease'
        }}
      >
        <div className="group relative">
          {/* Button container with hover effects */}
          <div className="rounded-full shadow-lg transition-all duration-200 hover:shadow-xl 
                         transform hover:scale-105 active:scale-95">
            {/* Circular QR Scanner Button */}
            <Button 
              onClick={handleQRScan}
              size="icon"
              className={`flex items-center justify-center h-16 w-16 rounded-full ${buttonClass}`}
            >
              <QrCode className="h-8 w-8" />
              <span className="sr-only">Scan QR Code</span>
            </Button>
          </div>

          {/* Tooltip that appears on hover - desktop only */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100
                       shadow-md rounded-md bg-white dark:bg-gray-800 text-sm font-medium 
                       px-3 py-1.5 border border-gray-200 dark:border-gray-700 
                       transition-opacity duration-200 hidden md:block">
            Scan QR Code
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <ScanQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </>
  );
}