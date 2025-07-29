/**
 * Demo Player Passport Component for Landing Page
 * 
 * Shows a sample passport card exactly as it appears in the dashboard
 * but with demo data for non-authenticated users on the landing page.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PicklePlusNewLogo } from '@/components/icons/PicklePlusNewLogo';

export function DemoPlayerPassport() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl">
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
              <div className="h-full w-full rounded-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-r from-orange-500 to-amber-500">
                M
              </div>
            </div>
            <div className="text-white">
              <div className="font-semibold text-lg">mightymax</div>
              <div className="flex items-center space-x-2 text-sm opacity-90">
                <span>⭐ DUPR 4.5</span>
                <span>•</span>
                <span>1000MM7</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-4 bg-white dark:bg-gray-900">
          {/* Level progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Level 1 • 814 XP</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: '81%' }}
              ></div>
            </div>
          </div>
          
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-lg font-semibold text-blue-600">0</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">3</div>
              <div className="text-xs text-gray-500">Matches</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-600">-</div>
              <div className="text-xs text-gray-500">Rank</div>
            </div>
          </div>
          
          {/* QR Code button */}
          <div className="text-center">
            <button className="flex items-center justify-center w-full py-2 px-4 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h.01m0 0h4.01M12 12v.01" />
              </svg>
              View Passport QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}