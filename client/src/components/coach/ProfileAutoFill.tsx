/**
 * Profile Auto-Fill Component
 * PKL-278651-PCP-BASIC-TIER - Auto-populate from player profile
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, CheckCircle } from 'lucide-react';

interface PlayerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
}

interface ProfileAutoFillProps {
  onAutoFill: (data: Partial<PlayerProfile>) => void;
  currentData: Partial<PlayerProfile>;
}

export const ProfileAutoFill: React.FC<ProfileAutoFillProps> = ({ onAutoFill, currentData }) => {
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const fetchPlayerProfile = async () => {
    setLoading(true);
    try {
      // Simulate fetching from authenticated user profile
      const mockProfile: PlayerProfile = {
        firstName: 'Alex',
        lastName: 'Rodriguez',
        email: 'alex.rodriguez@email.com',
        phone: '+1 (555) 123-4567',
        profileImageUrl: undefined
      };
      
      setPlayerProfile(mockProfile);
    } catch (error) {
      console.error('Failed to fetch player profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    if (playerProfile) {
      onAutoFill({
        firstName: playerProfile.firstName,
        lastName: playerProfile.lastName,
        email: playerProfile.email,
        phone: playerProfile.phone,
        profileImageUrl: playerProfile.profileImageUrl
      });
      setAutoFilled(true);
    }
  };

  useEffect(() => {
    fetchPlayerProfile();
  }, []);

  if (!playerProfile && !loading) {
    return null;
  }

  return (
    <div className="mb-6">
      <Alert className="border-blue-200 bg-blue-50">
        <User className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Player Profile Detected:</strong> We found your existing player information. 
            Would you like to auto-fill your coaching profile?
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoFill}
            disabled={loading || autoFilled}
            className="ml-4"
          >
            {loading ? (
              'Loading...'
            ) : autoFilled ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Auto-filled
              </>
            ) : (
              'Auto-fill Profile'
            )}
          </Button>
        </AlertDescription>
      </Alert>

      {playerProfile && (
        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <strong>Available Information:</strong> {playerProfile.firstName} {playerProfile.lastName}, 
          {playerProfile.email}
          {playerProfile.phone && `, ${playerProfile.phone}`}
        </div>
      )}
    </div>
  );
};