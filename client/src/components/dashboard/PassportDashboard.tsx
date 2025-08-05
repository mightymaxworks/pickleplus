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
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 bg-orange-${300 + (i % 3) * 100} rounded-full opacity-40`}
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${15 + (i * 8)}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Pulsing background orbs */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-40 h-40 bg-orange-200/20 rounded-full blur-xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-28 h-28 bg-yellow-200/25 rounded-full blur-lg"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.15, 0.35, 0.15]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Modern Player Passport */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <ModernPassportProfile 
          user={user}
          isOwner={true}
          onProfileUpdate={handleFieldChange}
        />
      </motion.div>

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