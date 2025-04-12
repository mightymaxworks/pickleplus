/**
 * PKL-278651-TOURN-0001-FORM
 * Tournament Basic Information Step
 * 
 * The first step in the tournament creation wizard
 * Collects name, description, location, and status
 */

import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  Form
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { TournamentFormValues } from '../CreateTournamentWizard';
import { cn } from '@/lib/utils';

interface TournamentBasicInfoStepProps {
  form: UseFormReturn<TournamentFormValues>;
  className?: string;
}

// Export the component content directly for use in the main wizard
export function TournamentBasicInfoStepContent({ form, className }: TournamentBasicInfoStepProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2 mb-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Enter the primary details about your tournament.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tournament Name*</FormLabel>
            <FormControl>
              <Input placeholder="Spring Championship 2025" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="A brief description of the tournament"
                className="resize-none"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="City, State or Online" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status*</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="draft">Draft (Not visible to players)</SelectItem>
                <SelectItem value="published">Published (Visible to all players)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// Default export for lazy loading
export default TournamentBasicInfoStepContent;