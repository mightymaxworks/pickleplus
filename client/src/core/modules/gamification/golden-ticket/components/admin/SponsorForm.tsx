/**
 * PKL-278651-GAME-0005-GOLD-ENH
 * Sponsor Form Component
 * 
 * Form for creating new sponsors with file upload support.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSponsor } from '../../api/goldenTicketApi';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import FileUploadField from '../common/FileUploadField';
import { uploadSponsorLogo } from '../../services/fileUploadService';

// Form schema for creating sponsors (must match server schema)
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().or(z.literal('')).nullable(),
  logoPath: z.string().optional().nullable(),
  logoFile: z.any().optional().nullable(), // For file upload
  website: z.string()
    .refine(val => {
      if (!val) return true; // Allow empty strings
      return val.startsWith('http'); // Only accept full URLs
    }, { message: 'Must be a valid URL starting with http:// or https://' })
    .optional().or(z.literal('')).nullable(),
  contactName: z.string().optional().or(z.literal('')).nullable(),
  contactEmail: z.string()
    .refine(val => {
      if (!val) return true; // Allow empty strings
      return val.includes('@'); // Simple email validation
    }, { message: 'Must be a valid email address' })
    .optional().or(z.literal('')).nullable(),
  active: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

const SponsorForm: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Default form values
  const defaultValues: Partial<FormValues> = {
    name: '',
    description: '',
    // Removed logoUrl as it's handled by file upload
    website: '',
    contactName: '',
    contactEmail: '',
    active: true
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  
  // Mutation for creating sponsors
  const mutation = useMutation({
    mutationFn: createSponsor,
    onSuccess: () => {
      // Force a complete cache refresh for sponsor data
      console.log('Sponsor created successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['admin', 'sponsors'] });
      queryClient.refetchQueries({ queryKey: ['admin', 'sponsors'] });
      
      toast({
        title: 'Success',
        description: 'Sponsor created successfully',
        variant: 'default',
      });
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create sponsor',
        variant: 'destructive',
      });
      console.error('Error creating sponsor:', error);
    }
  });
  
  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: uploadSponsorLogo,
    onSuccess: (response) => {
      // Set only the logoPath from the response
      form.setValue('logoPath', response.filePath, { shouldValidate: true });
      
      toast({
        title: 'Success',
        description: 'Logo uploaded successfully',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload logo',
        variant: 'destructive',
      });
      console.error('Error uploading logo:', error);
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Remove the file field from the submitted data
      const { logoFile, ...submitData } = data;
      
      // If a file was selected, upload it first and wait for the result
      if (data.logoFile) {
        const uploadResult = await uploadLogoMutation.mutateAsync(data.logoFile);
        
        // Update the submitData with the uploaded file info
        submitData.logoPath = uploadResult.filePath;
        // No need to set logoUrl, as we're using logoPath exclusively now
        
        console.log('File uploaded successfully, updated submit data:', submitData);
      }
      
      // Make sure we have clean null values for any empty string fields
      // Use a type assertion to work with the partial data
      const typedData = submitData as Record<string, string | null | boolean>;
      Object.keys(typedData).forEach((key) => {
        // Handle empty strings by converting them to null
        if (typeof typedData[key] === 'string' && typedData[key] === '') {
          typedData[key] = null;
        }
      });
      
      // Then create the sponsor with the updated data
      console.log('Submitting sponsor data:', submitData);
      mutation.mutate(submitData);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to process form submission',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Sponsor name" {...field} />
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
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of the sponsor" 
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* File Upload Field */}
        <FormField
          control={form.control}
          name="logoFile"
          render={({ field }) => (
            <FileUploadField
              form={form}
              name="logoFile"
              label="Sponsor Logo"
              description="Upload a logo for the sponsor (JPEG, PNG, WebP, GIF up to 2MB)"
            />
          )}
        />
        
        {/* Removed logoUrl field as it's confusing and unnecessary */}
        
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL (optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com" 
                  value={field.value || ''} 
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Name (optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="John Doe" 
                  value={field.value || ''} 
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email (optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="contact@example.com" 
                  value={field.value || ''} 
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={mutation.isPending}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
        >
          {mutation.isPending ? 'Creating...' : 'Create Sponsor'}
        </Button>
      </form>
    </Form>
  );
};

export default SponsorForm;