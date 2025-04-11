/**
 * PKL-278651-ADMIN-0014-UX
 * Admin Settings Form
 * 
 * This component demonstrates the enhanced form components with improved UX features
 * such as better validation, error handling, and accessibility.
 */

import React, { useState } from 'react';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  EnhancedForm, 
  FormFieldWithFeedback,
  EnhancedTooltip,
  StatusMessage
} from '../ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Settings, Bell, Users, AlertTriangle } from 'lucide-react';

// Define the form schema with validation
const adminSettingsSchema = z.object({
  siteName: z.string().min(3, { message: 'Site name must be at least 3 characters' }),
  adminEmail: z.string().email({ message: 'Please enter a valid email address' }),
  supportEmail: z.string().email({ message: 'Please enter a valid email address' }).optional().or(z.literal('')),
  maxUsersPerEvent: z.coerce.number().int().positive().min(1).max(1000),
  notificationsEnabled: z.boolean(),
  defaultEventDuration: z.string(),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
  newUserApproval: z.enum(['automatic', 'manual', 'verified_email']),
  analyticsTrackingCode: z.string().optional(),
});

type AdminSettingsFormValues = z.infer<typeof adminSettingsSchema>;

// Default values for the form
const defaultValues: Partial<AdminSettingsFormValues> = {
  siteName: 'Pickle+',
  adminEmail: 'admin@pickleplus.com',
  supportEmail: 'support@pickleplus.com',
  maxUsersPerEvent: 50,
  notificationsEnabled: true,
  defaultEventDuration: '60',
  maintenanceMode: false,
  maintenanceMessage: 'System is currently undergoing scheduled maintenance. Please check back later.',
  newUserApproval: 'automatic',
  analyticsTrackingCode: '',
};

export function AdminSettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Simulated form submission
  const onSubmit = async (data: AdminSettingsFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Settings saved:', data);
      setSubmitSuccess(true);
      
      // Reset success message after a delay
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSubmitError('Failed to save settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Settings className="h-5 w-5 mr-2 text-primary" />
            Admin Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedForm
            schema={adminSettingsSchema}
            defaultValues={defaultValues as AdminSettingsFormValues}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError || undefined}
            successMessage={submitSuccess ? "Settings saved successfully!" : undefined}
            submitText="Save Settings"
            formDescription="Configure global settings for the Pickle+ platform. These settings affect all users."
            showResetButton
            liveValidation
            autoFocusFirstField
          >
            {(form) => (
              <div className="space-y-6">
                {/* General Settings Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">General Settings</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormFieldWithFeedback
                      control={form.control}
                      name="siteName"
                      label="Site Name"
                      required
                      tooltip="The name of the site displayed in the header and emails"
                    >
                      <Input placeholder="Pickle+" />
                    </FormFieldWithFeedback>
                    
                    <FormFieldWithFeedback
                      control={form.control}
                      name="adminEmail"
                      label="Admin Email"
                      required
                      tooltip="Primary email for admin notifications"
                    >
                      <Input placeholder="admin@example.com" type="email" />
                    </FormFieldWithFeedback>
                    
                    <FormFieldWithFeedback
                      control={form.control}
                      name="supportEmail"
                      label="Support Email"
                      tooltip="Email address for user support inquiries"
                    >
                      <Input placeholder="support@example.com" type="email" />
                    </FormFieldWithFeedback>
                    
                    <FormFieldWithFeedback
                      control={form.control}
                      name="maxUsersPerEvent"
                      label="Max Users Per Event"
                      required
                      tooltip="Maximum number of participants allowed in a single event"
                    >
                      <Input type="number" min={1} max={1000} />
                    </FormFieldWithFeedback>
                  </div>
                </div>
                
                {/* Notification Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-primary" />
                    Notification Settings
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormFieldWithFeedback
                      control={form.control}
                      name="notificationsEnabled"
                      label="Enable System Notifications"
                      tooltip="When enabled, the system will send email notifications for important events"
                    >
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={form.watch('notificationsEnabled')}
                          onCheckedChange={(checked) => form.setValue('notificationsEnabled', checked, { shouldValidate: true })}
                        />
                        <span className="text-sm text-muted-foreground">
                          {form.watch('notificationsEnabled') ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </FormFieldWithFeedback>
                    
                    <FormFieldWithFeedback
                      control={form.control}
                      name="defaultEventDuration"
                      label="Default Event Duration (minutes)"
                      required
                    >
                      <Select 
                        value={form.watch('defaultEventDuration')}
                        onValueChange={(value) => form.setValue('defaultEventDuration', value, { shouldValidate: true })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="180">3 hours</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormFieldWithFeedback>
                  </div>
                </div>
                
                {/* Maintenance Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-primary" />
                    Maintenance Settings
                  </h3>
                  <div className="space-y-4">
                    <FormFieldWithFeedback
                      control={form.control}
                      name="maintenanceMode"
                      label="Maintenance Mode"
                      tooltip="When enabled, regular users will see a maintenance message instead of the app"
                    >
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={form.watch('maintenanceMode')}
                          onCheckedChange={(checked) => {
                            form.setValue('maintenanceMode', checked, { shouldValidate: true });
                            // Show a warning if enabling maintenance mode
                            if (checked) {
                              form.setFocus('maintenanceMessage');
                            }
                          }}
                        />
                        <span className="flex items-center text-sm">
                          {form.watch('maintenanceMode') ? (
                            <span className="text-destructive font-medium">Enabled (site will be inaccessible to regular users)</span>
                          ) : (
                            <span className="text-muted-foreground">Disabled</span>
                          )}
                        </span>
                      </div>
                    </FormFieldWithFeedback>
                    
                    {form.watch('maintenanceMode') && (
                      <FormFieldWithFeedback
                        control={form.control}
                        name="maintenanceMessage"
                        label="Maintenance Message"
                        description="This message will be displayed to users when the site is in maintenance mode"
                      >
                        <Textarea 
                          rows={3}
                          placeholder="System is currently undergoing scheduled maintenance. Please check back later."
                        />
                      </FormFieldWithFeedback>
                    )}
                  </div>
                </div>
                
                {/* Security Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    User Settings
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-1">
                    <FormFieldWithFeedback
                      control={form.control}
                      name="newUserApproval"
                      label="New User Approval"
                      required
                    >
                      <Select 
                        value={form.watch('newUserApproval')}
                        onValueChange={(value: any) => form.setValue('newUserApproval', value, { shouldValidate: true })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select approval method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatic">Automatic (No approval required)</SelectItem>
                          <SelectItem value="verified_email">Email Verification Only</SelectItem>
                          <SelectItem value="manual">Manual Admin Approval</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormFieldWithFeedback>
                    
                    <FormFieldWithFeedback
                      control={form.control}
                      name="analyticsTrackingCode"
                      label="Analytics Tracking Code"
                      tooltip="Optional tracking code for analytics integrations"
                    >
                      <Textarea 
                        rows={3}
                        placeholder="Paste your analytics tracking code here"
                      />
                    </FormFieldWithFeedback>
                  </div>
                </div>
                
                {/* Show warning for maintenance mode */}
                {form.watch('maintenanceMode') && (
                  <StatusMessage 
                    type="warning"
                    title="Maintenance Mode Warning"
                    message="Enabling maintenance mode will prevent all regular users from accessing the application. Only administrators will be able to log in."
                  />
                )}
              </div>
            )}
          </EnhancedForm>
        </CardContent>
      </Card>
    </div>
  );
}