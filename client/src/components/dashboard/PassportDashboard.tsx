import React, { useState, useEffect, useMemo, memo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  Star,
  QrCode,
  Scan,
  Edit,
  X,
  Camera,
  Medal,
  ChevronRight,
  Plus,
  Calendar,
  Users,
  MapPin,
  Clock,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
// Temporarily commenting out until import issue is resolved
// import ImageUploadModal from '@/components/profile/ImageUploadModal';
import ModernPassportProfile from '@/components/dashboard/ModernPassportProfile';

interface PassportDashboardProps {
  user: any;
  onFieldChange: (field: string, value: any) => void;
  initialTab?: string;
}

export default function PassportDashboard({ user, onFieldChange, initialTab }: PassportDashboardProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [isPassportExpanded, setIsPassportExpanded] = useState(false);
  const [showPassportCode, setShowPassportCode] = useState(false);

  const handleFieldChange = useCallback(async (field: string, value: any) => {
    console.log('Field changed:', field, value);
    
    try {
      // Call the API to save the changes
      const response = await fetch('/api/profile/field', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ field, value })
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${field}`);
      }

      const result = await response.json();
      console.log('Field update successful:', result);

      // Update local state immediately for instant UI feedback
      onFieldChange(field, value);

      // If the result includes updated user data, use it to update state
      if (result && result.user) {
        onFieldChange('_fullUserUpdate', result.user);
      }

      // Smaller, less intrusive notification
      toast({
        title: "Saved",
        description: "",
        duration: 2000, // Show for only 2 seconds
      });
    } catch (error) {
      console.error('Field update error:', error);
      toast({
        title: "Update Failed", 
        description: `Failed to save ${field}. Please try again.`,
        variant: "destructive"
      });
    }
  }, [onFieldChange, toast]);

  // Safety check for user object
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-8 h-8 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-spin">
              <polygon
                points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                fill="none"
                stroke="#f97316"
                strokeWidth="8"
              />
            </svg>
          </div>
          <p className="text-orange-600">Loading passport...</p>
        </div>
      </div>
    );
  }

  const handleQRReveal = () => {
    setShowPassportCode(!showPassportCode);
  };

  // Calculate some basic stats for demo
  const totalRankingPoints = 1250;
  const winRate = 78;
  const currentStreak = 5;
  const matchStats = { totalMatches: 42 };

  return (
    <div className="w-full min-h-screen">
      <ModernPassportProfile 
        user={user}
        isOwner={true}
        onProfileUpdate={handleFieldChange}
        initialTab={initialTab}
      />
    </div>
  );
}