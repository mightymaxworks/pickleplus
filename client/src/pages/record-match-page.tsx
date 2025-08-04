import React from 'react';
import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { QuickMatchRecorder } from '@/components/match/QuickMatchRecorder';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  ListChecks
} from 'lucide-react';

/**
 * Enhanced Record Match Page using the new compact interface
 * Updated to use the streamlined QuickMatchRecorder component
 */
export default function RecordMatchPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-6">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <ListChecks className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span>Record Match</span>
            </h1>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/matches')}
              className="text-muted-foreground self-start sm:self-auto"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="text-sm">Back to Matches</span>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">
            Record your pickleball match results quickly and easily
          </p>
        </div>
        
        {/* Main Match Recorder */}
        <QuickMatchRecorder />
      </div>
    </DashboardLayout>
  );
}