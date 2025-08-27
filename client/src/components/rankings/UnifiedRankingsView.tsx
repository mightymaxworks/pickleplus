/**
 * Unified Rankings View Component
 * Clean, modern rankings interface with format-specific data loading
 */
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import UnifiedFormatSelector, { type RankingFormat, type RankingDivision, formatLabels } from './UnifiedFormatSelector';
import EnhancedLeaderboard from '@/components/match/EnhancedLeaderboard';

// Format mapping utility to convert new format types to what EnhancedLeaderboard expects
function mapToEnhancedLeaderboardFormat(format: RankingFormat): "singles" | "doubles" | "mixed" {
  switch (format) {
    case 'singles':
      return 'singles';
    case 'mens-doubles':
    case 'womens-doubles':
      return 'doubles';
    case 'mixed-doubles-men':
    case 'mixed-doubles-women':
      return 'mixed';
    default:
      return 'singles';
  }
}

// Division mapping utility 
function mapDivisionToEnhancedLeaderboard(division: RankingDivision): string {
  return division === 'open' ? 'open' : division;
}

export default function UnifiedRankingsView() {
  const [format, setFormat] = useState<RankingFormat>('singles');
  const [division, setDivision] = useState<RankingDivision>('open');

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <Card className="p-4">
        <UnifiedFormatSelector
          format={format}
          division={division}
          onFormatChange={setFormat}
          onDivisionChange={setDivision}
        />
      </Card>

      {/* Rankings Display */}
      <Card className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {formatLabels[format].icon}
            {formatLabels[format].label} Rankings
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {formatLabels[format].description} - {division.replace('plus', '+').replace('U', 'Under ')} division
          </p>
        </div>
        
        <EnhancedLeaderboard 
          format={mapToEnhancedLeaderboardFormat(format)}
        />
      </Card>
    </div>
  );
}