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
    <Card className="p-4">
      {/* Integrated Header with Format Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {formatLabels[format].icon}
            {formatLabels[format].label} Rankings
          </h3>
        </div>
        
        {/* Compact Format Selector */}
        <UnifiedFormatSelector
          format={format}
          division={division}
          onFormatChange={setFormat}
          onDivisionChange={setDivision}
        />
      </div>
      
      {/* Rankings Data */}
      <EnhancedLeaderboard 
        format={mapToEnhancedLeaderboardFormat(format)}
      />
    </Card>
  );
}