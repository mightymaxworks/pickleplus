/**
 * Demo Player Passport Component for Landing Page
 * 
 * Shows a sample passport card exactly as it appears in the dashboard
 * but with demo data for non-authenticated users on the landing page.
 * Matches PlayerPassport.tsx structure exactly.
 */

import React from 'react';
import { PicklePlusNewLogo } from '@/components/icons/PicklePlusNewLogo';
import { Trophy, Scan } from 'lucide-react';

export function DemoPlayerPassport() {
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl" style={{ height: '440px' }}>
        {/* Top border accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF5722] to-[#FF9800]"></div>
        
        {/* Header with orange gradient */}
        <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] p-4">
          <div className="flex justify-between items-center text-white">
            <div className="font-bold text-lg">Founding Member</div>
            <PicklePlusNewLogo height="32px" width="auto" preserveAspectRatio={true} />
          </div>
          
          {/* Player info */}
          <div className="flex items-center mt-3">
            <div className="h-16 w-16 rounded-full bg-white p-0.5 mr-3 shadow">
              <div className="h-full w-full rounded-full overflow-hidden bg-yellow-100">
                <div className="h-full w-full rounded-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-r from-orange-500 to-amber-500">
                  M
                </div>
              </div>
            </div>
            
            <div>
              <div className="font-bold text-lg text-white">mightymax</div>
              <div className="flex flex-wrap gap-1 text-sm text-white/90">
                <div className="bg-white/20 rounded-full px-2 py-0.5 flex items-center inline-block">
                  <Trophy size={12} className="text-yellow-300 mr-1" />
                  DUPR 4.5
                </div>
                <div className="bg-white/20 rounded-full px-2 py-0.5 inline-block text-xs">
                  1000MM7
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats section with glass morphism effect */}
        <div className="flex-1 p-4 bg-gradient-to-br from-gray-50/90 to-white/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-500/5 pointer-events-none"></div>
          
          <div className="relative z-10">
            {/* Level and XP */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Level 1 • 814 XP</span>
                <span>81%</span>
              </div>
              
              {/* XP Progress Bar */}
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-full"
                  style={{ width: '81%' }}
                ></div>
              </div>
            </div>
            
            {/* Stats grid matching the exact dashboard layout */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-3 rounded-xl text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rating</div>
                <div className="font-bold text-lg text-blue-600 dark:text-blue-400">0</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-3 rounded-xl text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Matches</div>
                <div className="font-bold text-lg text-green-600 dark:text-green-400">3</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-3 rounded-xl text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rank</div>
                <div className="font-bold text-lg text-purple-600 dark:text-purple-400">-</div>
              </div>
            </div>
            
            {/* QR Code access button */}
            <div className="mt-auto">
              <button 
                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-3 rounded-xl w-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Scan size={16} />
                <span className="text-sm font-medium">View Passport QR Code</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}