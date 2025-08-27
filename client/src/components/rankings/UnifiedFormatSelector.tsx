/**
 * Unified Format Selector for Rankings
 * Replaces duplicate format selectors across the application
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, User, Heart } from 'lucide-react';

export type RankingFormat = 'singles' | 'mens-doubles' | 'womens-doubles' | 'mixed-doubles-men' | 'mixed-doubles-women';
export type RankingDivision = 'open' | '35plus' | '50plus' | '60plus' | '70plus' | 'U19' | 'U16' | 'U14' | 'U12';

interface UnifiedFormatSelectorProps {
  format: RankingFormat;
  division: RankingDivision;
  onFormatChange: (format: RankingFormat) => void;
  onDivisionChange: (division: RankingDivision) => void;
  className?: string;
}

export const formatLabels: Record<RankingFormat, { label: string; icon: React.ReactNode; description: string }> = {
  'singles': { label: 'Singles', icon: <User className="w-4 h-4" />, description: 'Individual play rankings' },
  'mens-doubles': { label: "Men's Doubles", icon: <Users className="w-4 h-4" />, description: 'Male doubles teams' },
  'womens-doubles': { label: "Women's Doubles", icon: <Users className="w-4 h-4" />, description: 'Female doubles teams' },
  'mixed-doubles-men': { label: 'Mixed Doubles (Men)', icon: <Heart className="w-4 h-4" />, description: 'Male players in mixed teams' },
  'mixed-doubles-women': { label: 'Mixed Doubles (Women)', icon: <Heart className="w-4 h-4" />, description: 'Female players in mixed teams' },
};

export const divisionLabels: Record<RankingDivision, string> = {
  'open': 'Open (19+)',
  '35plus': '35+',
  '50plus': '50+', 
  '60plus': '60+',
  '70plus': '70+',
  'U19': 'Junior U19',
  'U16': 'Junior U16',
  'U14': 'Junior U14',
  'U12': 'Junior U12',
};

export default function UnifiedFormatSelector({
  format,
  division,
  onFormatChange,
  onDivisionChange,
  className = ""
}: UnifiedFormatSelectorProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Format Selection with Visual Tabs */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Format</label>
        <Tabs value={format} onValueChange={(value) => onFormatChange(value as RankingFormat)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            {Object.entries(formatLabels).map(([key, { label, icon }]) => (
              <TabsTrigger 
                key={key}
                value={key}
                className="flex flex-col gap-1 h-16 text-xs"
              >
                {icon}
                <span className="hidden sm:block">{label.replace(' (Men)', '').replace(' (Women)', '')}</span>
                <span className="sm:hidden">{key === 'singles' ? 'S' : key.includes('mixed') ? 'MX' : 'D'}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Division Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Division</label>
        <Select value={division} onValueChange={(value) => onDivisionChange(value as RankingDivision)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Division" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(divisionLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Format Description */}
      <div className="text-xs text-gray-600 bg-gray-50 rounded-md p-2">
        <div className="flex items-center gap-1">
          {formatLabels[format].icon}
          <span className="font-medium">{formatLabels[format].label}</span>
        </div>
        <p className="mt-1">{formatLabels[format].description}</p>
      </div>
    </div>
  );
}