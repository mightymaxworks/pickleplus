import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { SlidersHorizontal, Filter } from 'lucide-react';
import { useRatingTiers } from "@/hooks/use-multi-dimensional-rankings";

interface LeaderboardFiltersProps {
  tierFilter: string | undefined;
  setTierFilter: (value: string | undefined) => void;
  minRating: number | undefined;
  setMinRating: (value: number | undefined) => void;
  maxRating: number | undefined;
  setMaxRating: (value: number | undefined) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
}

export function LeaderboardFilters({
  tierFilter,
  setTierFilter,
  minRating,
  setMinRating,
  maxRating,
  setMaxRating,
  showFilters,
  setShowFilters
}: LeaderboardFiltersProps) {
  // State for no upper limit toggle
  const [noUpperLimit, setNoUpperLimit] = useState(false);
  
  // Fetch rating tiers for dropdown
  const { data: tiers, isLoading: tiersLoading } = useRatingTiers();
  
  // Convert tier minRating to 0-9 scale for display
  const convertRating = (rating: number): number => {
    return parseFloat((rating * 1.8).toFixed(1));
  };
  
  // Handler for the rating range slider
  const handleRatingRangeChange = (values: number[]) => {
    if (values.length === 2) {
      setMinRating(values[0]);
      // Only set max rating if "no upper limit" is disabled
      if (!noUpperLimit) {
        setMaxRating(values[1]);
      }
    }
  };
  
  // Handle no upper limit toggle
  const handleNoUpperLimitToggle = (checked: boolean) => {
    setNoUpperLimit(checked);
    if (checked) {
      // Remove max rating when "no upper limit" is enabled
      setMaxRating(undefined);
    } else {
      // Set max rating to current slider value when "no upper limit" is disabled
      const sliderValue = document.getElementById('rating-range') as any;
      if (sliderValue && sliderValue.value) {
        try {
          const values = sliderValue.value.split(',');
          if (values.length > 1) {
            setMaxRating(parseFloat(values[1]));
          } else {
            setMaxRating(9);
          }
        } catch {
          setMaxRating(9);
        }
      } else {
        setMaxRating(9);
      }
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setTierFilter(undefined);
    setMinRating(undefined);
    setMaxRating(undefined);
    setNoUpperLimit(false);
  };
  
  return (
    <Accordion
      type="single"
      collapsible
      value={showFilters ? "filters" : undefined}
      onValueChange={(value) => setShowFilters(value === "filters")}
      className="border rounded-lg p-1 mb-4"
    >
      <AccordionItem value="filters" className="border-none">
        <AccordionTrigger className="px-4 py-2 hover:no-underline">
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            <span>Skill Rating Filters</span>
            {(tierFilter || minRating || maxRating || noUpperLimit) && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-6">
            {/* Tier Filter */}
            <div className="space-y-2">
              <Label htmlFor="tier-filter">Filter by Tier</Label>
              <Select
                value={tierFilter || "all"}
                onValueChange={(value) => setTierFilter(value === "all" ? undefined : value)}
              >
                <SelectTrigger id="tier-filter" className="w-full">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  {!tiersLoading && tiers && tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.name}>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: tier.colorCode || undefined }}
                        />
                        {tier.name} ({convertRating(tier.minRating)}-{convertRating(tier.maxRating)})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Rating Range Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="rating-range">Rating Range (0-9 scale)</Label>
                <span className="text-sm text-gray-500">
                  {minRating !== undefined ? minRating.toFixed(1) : '0.0'} 
                  {noUpperLimit ? '+ (no upper limit)' : ` - ${maxRating !== undefined ? maxRating.toFixed(1) : '9.0'}`}
                </span>
              </div>
              <Slider
                id="rating-range"
                defaultValue={[0, 9]}
                value={[minRating !== undefined ? minRating : 0, maxRating !== undefined ? maxRating : 9]}
                max={9}
                min={0}
                step={0.1}
                onValueChange={handleRatingRangeChange}
                disabled={noUpperLimit ? true : undefined}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Beginner</span>
                <span>Advanced</span>
                <span>Elite</span>
              </div>
              
              {/* No Upper Limit Toggle */}
              <div className="flex items-center justify-between mt-4">
                <div>
                  <Label htmlFor="no-upper-limit" className="text-sm">No upper limit</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show all players above the minimum rating
                  </p>
                </div>
                <Switch
                  id="no-upper-limit"
                  checked={noUpperLimit}
                  onCheckedChange={handleNoUpperLimitToggle}
                />
              </div>
            </div>
            
            {/* Reset Filters Button */}
            {(tierFilter || minRating || maxRating || noUpperLimit) && (
              <div className="pt-2">
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}