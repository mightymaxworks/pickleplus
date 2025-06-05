/**
 * PKL-278651-TRAINING-CENTER-BOOKING - Complete Training Center Booking Page
 * Demonstrates the refined booking flow:
 * 1. Facility selection (QR scan/code entry/dropdown)
 * 2. Detailed weekly calendar view
 * 3. Class selection with limits and minimums
 * 4. Coach credentials and class details
 * 5. Payment and registration
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import { StandardLayout } from '@/components/layout/StandardLayout';
import ComprehensiveBookingFlow from '@/components/training-center/ComprehensiveBookingFlow';

export default function TrainingCenterBookingPage() {
  return (
    <StandardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">Training Center Booking</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Complete streamlined booking flow with facility selection, detailed calendar view, 
              class limits, minimum enrollment requirements, and coach credentials
            </p>
          </div>
        </div>
        
        <div className="py-8">
          <ComprehensiveBookingFlow />
        </div>
      </div>
    </StandardLayout>
  );
}