/**
 * PKL-278651-CONN-0008-UX-MOD2 - PicklePass™ UI/UX Enhancement Sprint v2.1
 * 
 * Passport Page
 * 
 * A dedicated page for viewing the Universal Passport.
 * 
 * @implementation Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import { useNavigate } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { ModernUniversalPassport } from '@/components/events/ModernUniversalPassport';

export function PassportPage() {
  const [, navigate] = useNavigate();
  
  // Handle back button
  const handleBack = () => {
    navigate('/events');
  };
  
  return (
    <StandardLayout>
      <div className="container py-6 max-w-lg mx-auto">
        <Button
          variant="ghost" 
          className="mb-4"
          onClick={handleBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        
        <div className="my-4">
          <ModernUniversalPassport 
            onViewRegisteredEvents={() => navigate('/events')}
          />
        </div>
      </div>
    </StandardLayout>
  );
}

export default PassportPage;