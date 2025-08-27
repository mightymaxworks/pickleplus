/**
 * Unified Rankings View Component
 * Clean, mobile-optimized rankings interface with dropdown selectors
 */
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type RankingFormat, type RankingDivision, formatLabels, divisionLabels } from './UnifiedFormatSelector';
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
      {/* Header with Mobile-Optimized Dropdowns */}
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            {formatLabels[format].icon}
            {formatLabels[format].label} Rankings
          </h3>
          
          {/* Mobile-Friendly Dropdown Selectors */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select value={format} onValueChange={(value) => setFormat(value as RankingFormat)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Format" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(formatLabels).map(([key, { label, icon }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {icon}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select value={division} onValueChange={(value) => setDivision(value as RankingDivision)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(divisionLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Format Description */}
          <p className="text-sm text-gray-600 mt-3">
            {formatLabels[format].description} - {divisionLabels[division]} division
          </p>
        </div>
      </div>
      
      {/* Rankings Data */}
      <EnhancedLeaderboard 
        format={mapToEnhancedLeaderboardFormat(format)}
      />
    </Card>
  );
}