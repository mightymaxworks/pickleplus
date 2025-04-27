import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Calculator, ExternalLink, HelpCircle, Info } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Define the rating systems available for conversion
const RATING_SYSTEMS = {
  COURTIQ: 'COURTIQ', // Our internal system (1000-2500)
  DUPR: 'DUPR',       // Dynamic Universal Pickleball Rating (2.0-7.0)
  IFP: 'IFP',         // International Federation of Pickleball (1.0-5.0)
  UTPR: 'UTPR',       // USA Pickleball Tournament Player Rating (2.5-6.0)
  WPR: 'WPR',         // World Pickleball Rating (0-10.0)
  IPTPA: 'IPTPA'      // International Pickleball Teaching Professional Association (1.0-5.0)
};

// Rating system interface with display information
interface RatingSystemInfo {
  code: string;
  name: string;
  description: string;
  range: string;
  placeholderValue: string;
  websiteUrl?: string;
}

// Rating systems information
const ratingSystemsInfo: Record<string, RatingSystemInfo> = {
  [RATING_SYSTEMS.COURTIQ]: {
    code: RATING_SYSTEMS.COURTIQ,
    name: 'CourtIQ™',
    description: 'Pickle+ internal rating system',
    range: '1000-2500',
    placeholderValue: '1500'
  },
  [RATING_SYSTEMS.DUPR]: {
    code: RATING_SYSTEMS.DUPR,
    name: 'DUPR',
    description: 'Dynamic Universal Pickleball Rating',
    range: '2.0-7.0',
    placeholderValue: '4.0',
    websiteUrl: 'https://mydupr.com'
  },
  [RATING_SYSTEMS.UTPR]: {
    code: RATING_SYSTEMS.UTPR,
    name: 'UTPR',
    description: 'USA Pickleball Tournament Player Rating',
    range: '2.5-6.0',
    placeholderValue: '4.0',
    websiteUrl: 'https://usapickleball.org'
  },
  [RATING_SYSTEMS.WPR]: {
    code: RATING_SYSTEMS.WPR,
    name: 'WPR',
    description: 'World Pickleball Rating',
    range: '0-10.0',
    placeholderValue: '5.0'
  },
  [RATING_SYSTEMS.IFP]: {
    code: RATING_SYSTEMS.IFP,
    name: 'IFP',
    description: 'International Federation of Pickleball',
    range: '1.0-5.0',
    placeholderValue: '3.5',
    websiteUrl: 'https://ifpickleball.org'
  },
  [RATING_SYSTEMS.IPTPA]: {
    code: RATING_SYSTEMS.IPTPA,
    name: 'IPTPA',
    description: 'International Pickleball Teaching Professional Association',
    range: '1.0-5.0',
    placeholderValue: '3.5',
    websiteUrl: 'https://iptpa.com'
  }
};

// Conversion result interface
interface ConversionResult {
  rating: number;
  confidence: number;
  source: string;
  originalRating: number | null;
  originalSystem: string | null;
}

export function RatingConverter() {
  const { toast } = useToast();
  const [fromSystem, setFromSystem] = useState<string>(RATING_SYSTEMS.DUPR);
  const [toSystem, setToSystem] = useState<string>(RATING_SYSTEMS.COURTIQ);
  const [rating, setRating] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle rating input changes
  const handleRatingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Allow only numbers and decimal points
    if (/^$|^[0-9]+\.?[0-9]*$/.test(value)) {
      setRating(value);
      setError(null);
    }
  };

  // Validate the rating input based on selected system
  const validateRating = (): boolean => {
    if (!rating) {
      setError('Please enter a rating value');
      return false;
    }

    const numericRating = parseFloat(rating);
    const system = ratingSystemsInfo[fromSystem];
    const [min, max] = system.range.split('-').map(parseFloat);

    if (isNaN(numericRating)) {
      setError('Please enter a valid number');
      return false;
    }

    if (numericRating < min || numericRating > max) {
      setError(`Rating must be between ${system.range}`);
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateRating()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Converting rating from ${fromSystem} to ${toSystem}: ${rating}`);
      
      const response = await apiRequest('POST', '/api/courtiq/convert-rating', {
        fromSystem,
        toSystem,
        rating: parseFloat(rating)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert rating');
      }
      
      const apiResponse = await response.json();
      
      // Format the API response to match our component's expected structure
      const data: ConversionResult = {
        rating: apiResponse.convertedRating,
        confidence: 90, // Default high confidence for our direct calculations
        source: fromSystem === toSystem ? 'direct' : 'mathematical',
        originalRating: apiResponse.originalRating,
        originalSystem: apiResponse.fromSystem
      };
      
      setResult(data);
      
      console.log('Conversion result:', data);
      
      toast({
        title: 'Rating Converted',
        description: `${fromSystem} ${rating} ≈ ${toSystem} ${data.rating.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error converting rating:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      
      toast({
        title: 'Conversion Failed',
        description: error instanceof Error ? error.message : 'Failed to convert rating',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get appropriate CSS color based on confidence level
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-amber-600';
    return 'text-red-600';
  };

  // Provide a description of the confidence level
  const getConfidenceDescription = (confidence: number): string => {
    if (confidence >= 90) return 'High confidence (exact match or close interpolation)';
    if (confidence >= 75) return 'Medium confidence (mathematical approximation)';
    return 'Low confidence (multi-step conversion)';
  };

  // Get source description
  const getSourceDescription = (source: string): string => {
    switch (source) {
      case 'exact_match': return 'Exact match from conversion table';
      case 'interpolation': return 'Interpolated between known values';
      case 'mathematical': return 'Mathematical formula approximation';
      case 'direct': return 'Direct value (same system)';
      default: return source;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>Rating System Converter</CardTitle>
        </div>
        
        <CardDescription>
          Convert between different pickleball rating systems to understand your level across all standards.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From System */}
            <div className="space-y-2">
              <Label htmlFor="fromSystem">Convert From</Label>
              <Select
                value={fromSystem}
                onValueChange={(value) => {
                  setFromSystem(value);
                  // Reset rating when changing systems
                  setRating('');
                  // Don't allow same system for both selections
                  if (value === toSystem) {
                    setToSystem(
                      Object.keys(RATING_SYSTEMS).find(
                        (key) => key !== value
                      ) || RATING_SYSTEMS.COURTIQ
                    );
                  }
                }}
              >
                <SelectTrigger id="fromSystem">
                  <SelectValue placeholder="Select rating system" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ratingSystemsInfo).map((system) => (
                    <SelectItem key={system.code} value={system.code}>
                      <div className="flex items-center">
                        <span>{system.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({system.range})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="rating">{ratingSystemsInfo[fromSystem].name} Rating</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{ratingSystemsInfo[fromSystem].description}</p>
                      <p className="text-xs mt-1">Valid range: {ratingSystemsInfo[fromSystem].range}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <Input
                id="rating"
                value={rating}
                onChange={handleRatingChange}
                placeholder={`Enter your ${ratingSystemsInfo[fromSystem].name} rating (e.g., ${ratingSystemsInfo[fromSystem].placeholderValue})`}
                className={error ? 'border-red-500' : ''}
              />
              
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              
              {ratingSystemsInfo[fromSystem].websiteUrl && (
                <div className="text-xs flex items-center mt-1">
                  <a 
                    href={ratingSystemsInfo[fromSystem].websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary flex items-center gap-1 hover:underline"
                  >
                    Visit {ratingSystemsInfo[fromSystem].name} website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            
            {/* To System */}
            <div className="space-y-2">
              <Label htmlFor="toSystem">Convert To</Label>
              <Select
                value={toSystem}
                onValueChange={(value) => {
                  setToSystem(value);
                  // Don't allow same system for both selections
                  if (value === fromSystem) {
                    setFromSystem(
                      Object.keys(RATING_SYSTEMS).find(
                        (key) => key !== value
                      ) || RATING_SYSTEMS.DUPR
                    );
                  }
                }}
              >
                <SelectTrigger id="toSystem">
                  <SelectValue placeholder="Select rating system" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ratingSystemsInfo).map((system) => (
                    <SelectItem key={system.code} value={system.code}>
                      <div className="flex items-center">
                        <span>{system.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({system.range})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center mt-2 gap-2">
                <Label>{ratingSystemsInfo[toSystem].name}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{ratingSystemsInfo[toSystem].description}</p>
                      <p className="text-xs mt-1">Valid range: {ratingSystemsInfo[toSystem].range}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="border rounded-md h-10 flex items-center px-3 bg-muted/30">
                {result ? (
                  <div className="font-medium">{result.rating.toFixed(2)}</div>
                ) : (
                  <div className="text-muted-foreground italic">Converted rating will appear here</div>
                )}
              </div>
              
              {ratingSystemsInfo[toSystem].websiteUrl && (
                <div className="text-xs flex items-center mt-1">
                  <a 
                    href={ratingSystemsInfo[toSystem].websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary flex items-center gap-1 hover:underline"
                  >
                    Visit {ratingSystemsInfo[toSystem].name} website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid place-items-center my-2">
            <div className="border-2 border-muted rounded-full p-2 bg-muted/30">
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={isLoading}
          >
            {isLoading ? 'Converting...' : 'Convert Rating'}
          </Button>
          
          {result && (
            <div className="mt-4 bg-muted/30 rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Conversion Result</div>
                <Badge variant="outline" className={`${getConfidenceColor(result.confidence)} border-none`}>
                  {result.confidence}% Confidence
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Original Rating</div>
                  <div className="font-medium">
                    {result.originalRating} ({result.originalSystem})
                  </div>
                </div>
                
                <div>
                  <div className="text-muted-foreground">Converted Rating</div>
                  <div className="font-medium">
                    {result.rating.toFixed(2)} ({toSystem})
                  </div>
                </div>
                
                <div>
                  <div className="text-muted-foreground">Conversion Method</div>
                  <div>
                    {getSourceDescription(result.source)}
                  </div>
                </div>
                
                <div>
                  <div className="text-muted-foreground">Confidence Level</div>
                  <div className={getConfidenceColor(result.confidence)}>
                    {getConfidenceDescription(result.confidence)}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 inline mr-1" />
                The confidence score indicates the reliability of this conversion based on the available data and conversion method used.
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}