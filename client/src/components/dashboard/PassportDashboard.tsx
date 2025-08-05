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
}

export default function PassportDashboard({ user, onFieldChange }: PassportDashboardProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [isPassportExpanded, setIsPassportExpanded] = useState(false);
  const [showPassportCode, setShowPassportCode] = useState(false);

  const handleFieldChange = useCallback((field: string, value: any) => {
    onFieldChange(field, value);
  }, [onFieldChange]);

  // Safety check for user object
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full mx-auto mb-4"></div>
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
    <div className="min-h-screen w-full">
      <ModernPassportProfile 
        user={user}
        isOwner={true}
        onProfileUpdate={handleFieldChange}
      />

      {/* Photo Upload Modal - Temporarily disabled */}
      {/* 
      <ImageUploadModal
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        onImageSelect={(imageData: string) => {
          handleFieldChange('avatarUrl', imageData);
          setIsPhotoUploadOpen(false);
          toast({
            title: t('dashboard.photo.uploaded'),
            description: t('dashboard.photo.success'),
          });
        }}
        currentImage={user.avatarUrl}
      />
      */}
    </div>
  );
}