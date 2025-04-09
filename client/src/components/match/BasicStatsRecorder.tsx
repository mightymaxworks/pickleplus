/**
 * PKL-278651-MATCH-0003-DS: Basic Stats Recorder Component
 * This component provides a simple interface for recording match statistics
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Check, Minus, Plus, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { type InsertMatchStatistics } from '@shared/match-statistics-schema';

// Schema for stats form validation
const statsFormSchema = z.object({
  // General statistics
  totalPoints: z.number().int().min(0).optional(),
  rallyLengthAvg: z.number().min(0).max(100).optional(),
  longestRally: z.number().int().min(0).optional(),
  
  // Shot statistics
  unforcedErrors: z.number().int().min(0).optional(),
  winners: z.number().int().min(0).optional(),
  
  // Point-specific statistics
  netPointsWon: z.number().int().min(0).optional(),
  netPointsTotal: z.number().int().min(0).optional(),
  dinkPointsWon: z.number().int().min(0).optional(),
  dinkPointsTotal: z.number().int().min(0).optional(),
  servePointsWon: z.number().int().min(0).optional(),
  servePointsTotal: z.number().int().min(0).optional(),
  returnPointsWon: z.number().int().min(0).optional(),
  returnPointsTotal: z.number().int().min(0).optional(),
  
  // Technical statistics
  thirdShotSuccessRate: z.number().min(0).max(100).optional(),
  timeAtNetPct: z.number().min(0).max(100).optional(),
  
  // Physical statistics
  distanceCoveredMeters: z.number().min(0).optional(),
  avgShotSpeedKph: z.number().min(0).optional(),
});

// Type for form values
type StatsFormValues = z.infer<typeof statsFormSchema>;

interface BasicStatsRecorderProps {
  matchId: number;
  initialData?: Partial<StatsFormValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Component for recording basic match statistics
export function BasicStatsRecorder({ 
  matchId, 
  initialData,
  onSuccess, 
  onCancel 
}: BasicStatsRecorderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with default values or initial data
  const form = useForm<StatsFormValues>({
    resolver: zodResolver(statsFormSchema),
    defaultValues: {
      totalPoints: initialData?.totalPoints || 0,
      rallyLengthAvg: initialData?.rallyLengthAvg || 0,
      longestRally: initialData?.longestRally || 0,
      unforcedErrors: initialData?.unforcedErrors || 0,
      winners: initialData?.winners || 0,
      netPointsWon: initialData?.netPointsWon || 0,
      netPointsTotal: initialData?.netPointsTotal || 0,
      dinkPointsWon: initialData?.dinkPointsWon || 0,
      dinkPointsTotal: initialData?.dinkPointsTotal || 0,
      servePointsWon: initialData?.servePointsWon || 0,
      servePointsTotal: initialData?.servePointsTotal || 0,
      returnPointsWon: initialData?.returnPointsWon || 0,
      returnPointsTotal: initialData?.returnPointsTotal || 0,
      thirdShotSuccessRate: initialData?.thirdShotSuccessRate || 0,
      timeAtNetPct: initialData?.timeAtNetPct || 0,
      distanceCoveredMeters: initialData?.distanceCoveredMeters || 0,
      avgShotSpeedKph: initialData?.avgShotSpeedKph || 0,
    }
  });
  
  // Function to handle form submission
  const onSubmit = async (data: StatsFormValues) => {
    if (!matchId) {
      toast({
        title: "Error",
        description: "Missing match ID. Cannot save statistics.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create match statistics object
      const statsData: Partial<InsertMatchStatistics> = {
        matchId,
        ...data,
      };
      
      // Submit to API
      const response = await apiRequest('POST', '/api/match/statistics', statsData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save match statistics');
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/match/${matchId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/match/${matchId}/statistics`] });
      
      toast({
        title: "Statistics Saved",
        description: "Match statistics have been successfully recorded.",
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving match statistics:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save match statistics',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Counter component for integer fields
  const CounterInput = ({ 
    value, 
    onChange, 
    min = 0, 
    max = 999,
    label
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    min?: number; 
    max?: number;
    label?: string;
  }) => {
    const increment = () => {
      if (value < max) {
        onChange(value + 1);
      }
    };
    
    const decrement = () => {
      if (value > min) {
        onChange(value - 1);
      }
    };
    
    return (
      <div className="flex flex-col space-y-1">
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
        <div className="flex items-center">
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-r-none" 
            onClick={decrement}
            disabled={value <= min}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= min && val <= max) {
                onChange(val);
              }
            }}
            className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-l-none" 
            onClick={increment}
            disabled={value >= max}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Match Statistics</CardTitle>
            <CardDescription>
              Record detailed statistics for this match
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* General Statistics Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">General Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Points */}
                <FormField
                  control={form.control}
                  name="totalPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Points</FormLabel>
                      <FormControl>
                        <CounterInput
                          value={field.value || 0}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Average Rally Length */}
                <FormField
                  control={form.control}
                  name="rallyLengthAvg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avg Rally Length</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            value={[field.value || 0]}
                            min={0}
                            max={50}
                            step={0.5}
                            onValueChange={(values) => field.onChange(values[0])}
                            className="mt-2"
                          />
                          <div className="text-sm text-center">{field.value !== undefined && field.value !== null ? field.value.toFixed(1) : '0.0'} shots</div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Longest Rally */}
                <FormField
                  control={form.control}
                  name="longestRally"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longest Rally</FormLabel>
                      <FormControl>
                        <CounterInput
                          value={field.value || 0}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Shot Statistics Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Shot Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Winners */}
                <FormField
                  control={form.control}
                  name="winners"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Winners</FormLabel>
                      <FormControl>
                        <CounterInput
                          value={field.value || 0}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Unforced Errors */}
                <FormField
                  control={form.control}
                  name="unforcedErrors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unforced Errors</FormLabel>
                      <FormControl>
                        <CounterInput
                          value={field.value || 0}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Point-specific Statistics Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Point-specific Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Net Points */}
                <div className="space-y-3">
                  <FormLabel className="text-sm">Net Points</FormLabel>
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="netPointsWon"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <CounterInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              label="Won"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="netPointsTotal"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <CounterInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              label="Total"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Dink Points */}
                <div className="space-y-3">
                  <FormLabel className="text-sm">Dink Points</FormLabel>
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="dinkPointsWon"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <CounterInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              label="Won"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dinkPointsTotal"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <CounterInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              label="Total"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Serve Points */}
                <div className="space-y-3">
                  <FormLabel className="text-sm">Serve Points</FormLabel>
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="servePointsWon"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <CounterInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              label="Won"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="servePointsTotal"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <CounterInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              label="Total"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Return Points */}
                <div className="space-y-3">
                  <FormLabel className="text-sm">Return Points</FormLabel>
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="returnPointsWon"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <CounterInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              label="Won"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="returnPointsTotal"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <CounterInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              label="Total"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Technical Statistics Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Technical Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Third Shot Success Rate */}
                <FormField
                  control={form.control}
                  name="thirdShotSuccessRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Third Shot Success Rate</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            value={[field.value || 0]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(values) => field.onChange(values[0])}
                            className="mt-2"
                          />
                          <div className="text-sm text-center">{field.value}%</div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Time at Net Percentage */}
                <FormField
                  control={form.control}
                  name="timeAtNetPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time at Net</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            value={[field.value || 0]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(values) => field.onChange(values[0])}
                            className="mt-2"
                          />
                          <div className="text-sm text-center">{field.value}%</div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Alert className="bg-muted/50">
              <AlertTitle className="text-sm font-medium">Advanced Statistics</AlertTitle>
              <AlertDescription className="text-xs">
                Advanced statistics like distance covered and shot speed require specialized equipment and will be available in a future update.
              </AlertDescription>
            </Alert>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="gap-1"
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Statistics
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}