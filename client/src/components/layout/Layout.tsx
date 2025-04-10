/**
 * PKL-278651-UI-0001-LAYOUT
 * Main Layout Component
 * 
 * Consistent layout used across the platform, including header navigation and footer
 */

import React, { ReactNode } from 'react';
import HeaderNav from './HeaderNav';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gray-100 border-t py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-red-600 mr-2">
                  <span className="absolute inset-0 flex items-center justify-center font-bold text-white">P+</span>
                </div>
                <span className="font-bold text-xl">Pickle+</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Elevating your pickleball experience</p>
            </div>
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Pickle+. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;