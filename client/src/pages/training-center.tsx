/**
 * PKL-278651-TRAINING-CENTER-001 - Training Center Management Page
 * Main entry point for the training center check-in system
 */

import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import TrainingCenterCheckIn from '@/components/training-center/TrainingCenterCheckIn';

export default function TrainingCenterPage() {
  return (
    <StandardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Training Center</h1>
                  <p className="text-gray-600 mt-1">
                    Check in to training facilities and work with certified coaches
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Beta
                  </div>
                </div>
              </div>
            </div>
            
            <TrainingCenterCheckIn />
          </div>
        </div>
      </StandardLayout>
    </>
  );
}