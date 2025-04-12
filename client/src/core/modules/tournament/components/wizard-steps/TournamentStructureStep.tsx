/**
 * PKL-278651-TOURN-0001-FORM
 * Tournament Structure Step
 * 
 * The second step in the tournament creation wizard
 * Collects format, division, and level information
 */

import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TournamentFormValues } from '../CreateTournamentWizard';
import { cn } from '@/lib/utils';
import { Users, User, Calendar, Trophy } from 'lucide-react';

interface TournamentStructureStepProps {
  form: UseFormReturn<TournamentFormValues>;
  className?: string;
}

export function TournamentStructureStep({ form, className }: TournamentStructureStepProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2 mb-4">
        <h3 className="text-lg font-medium">Tournament Structure</h3>
        <p className="text-sm text-muted-foreground">
          Define the format, division, and skill level for your tournament.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="format"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Tournament Format*</FormLabel>
            <FormDescription>
              Select the playing format for the tournament
            </FormDescription>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-3 gap-4"
            >
              <FormItem>
                <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                  <FormControl>
                    <RadioGroupItem value="singles" className="sr-only" />
                  </FormControl>
                  <div className="border-2 rounded-md p-4 cursor-pointer hover:border-primary/50 transition-colors">
                    <User className="h-6 w-6 mb-2" />
                    <h4 className="font-medium">Singles</h4>
                    <p className="text-xs text-muted-foreground">1v1 matches</p>
                  </div>
                </FormLabel>
              </FormItem>
              <FormItem>
                <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                  <FormControl>
                    <RadioGroupItem value="doubles" className="sr-only" />
                  </FormControl>
                  <div className="border-2 rounded-md p-4 cursor-pointer hover:border-primary/50 transition-colors">
                    <Users className="h-6 w-6 mb-2" />
                    <h4 className="font-medium">Doubles</h4>
                    <p className="text-xs text-muted-foreground">2v2 matches</p>
                  </div>
                </FormLabel>
              </FormItem>
              <FormItem>
                <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                  <FormControl>
                    <RadioGroupItem value="mixed" className="sr-only" />
                  </FormControl>
                  <div className="border-2 rounded-md p-4 cursor-pointer hover:border-primary/50 transition-colors">
                    <Users className="h-6 w-6 mb-2" />
                    <h4 className="font-medium">Mixed</h4>
                    <p className="text-xs text-muted-foreground">Mixed doubles</p>
                  </div>
                </FormLabel>
              </FormItem>
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <FormField
          control={form.control}
          name="division"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Division*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="open">Open (All ages)</SelectItem>
                  <SelectItem value="age_50+">50+</SelectItem>
                  <SelectItem value="age_60+">60+</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skill Level*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0.0-2.9)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (3.0-3.9)</SelectItem>
                  <SelectItem value="advanced">Advanced (4.0-4.9)</SelectItem>
                  <SelectItem value="club">Club (All levels)</SelectItem>
                  <SelectItem value="pro">Professional (5.0+)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}