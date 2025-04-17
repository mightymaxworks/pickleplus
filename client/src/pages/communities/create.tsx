/**
 * PKL-278651-COMM-0006-HUB-UI
 * Create Community Page
 * 
 * This page allows users to create a new community.
 */

import React from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateCommunity } from "../../lib/hooks/useCommunity";
import { insertCommunitySchema } from "@shared/schema/community";
import { CommunityProvider } from "../../lib/providers/CommunityProvider";
import { CommunityMenu } from "../../components/community/CommunityMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Skill level options for community creation
const SKILL_LEVELS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Professional", label: "Professional" },
  { value: "All Levels", label: "All Levels" },
];

// Extend the insert schema with validations
const createCommunitySchema = insertCommunitySchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().min(3, {
      message: "Community name must be at least 3 characters",
    }).max(100, {
      message: "Community name must be less than 100 characters",
    }),
    description: z.string().min(10, {
      message: "Description must be at least 10 characters",
    }).optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    skillLevel: z.string().optional().or(z.literal("")),
    tags: z.string().optional().or(z.literal("")),
    isPrivate: z.boolean().default(false),
    requiresApproval: z.boolean().default(false),
    rules: z.string().optional().or(z.literal("")),
    guidelines: z.string().optional().or(z.literal("")),
  });

type CreateCommunityFormValues = z.infer<typeof createCommunitySchema>;

export default function CreateCommunityPage() {
  const [, navigate] = useLocation();
  const createCommunity = useCreateCommunity();
  
  // Get current user ID (would normally come from auth context)
  const currentUserId = 1; // Placeholder until we integrate with auth
  
  // Initialize form with default values
  const form = useForm<CreateCommunityFormValues>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      skillLevel: "",
      avatarUrl: "",
      bannerUrl: "",
      bannerPattern: "",
      isPrivate: false,
      requiresApproval: false,
      tags: "",
      memberCount: 1, // Start with the creator
      eventCount: 0,
      postCount: 0,
      createdByUserId: currentUserId,
      rules: "",
      guidelines: "",
    },
  });
  
  // Form submission handler
  const onSubmit = async (data: CreateCommunityFormValues) => {
    try {
      // Ensure proper data types before submitting
      const formattedData = {
        ...data,
        isPrivate: Boolean(data.isPrivate),
        requiresApproval: Boolean(data.requiresApproval),
        rules: data.rules || "",
        guidelines: data.guidelines || "",
      };
      
      await createCommunity.mutateAsync(formattedData);
      
      toast({
        title: "Success!",
        description: "Your community has been created successfully.",
      });
      
      navigate("/communities");
    } catch (error) {
      console.error("Failed to create community:", error);
      
      toast({
        title: "Error",
        description: "Failed to create community. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Go back to communities list
  const handleBack = () => {
    navigate("/communities");
  };
  
  return (
    <CommunityProvider>
      {/* Add the new Community Menu */}
      <CommunityMenu 
        activeTab="create" 
        onChange={(tab) => {
          if (tab === 'discover') {
            handleBack();
          }
        }}
      />
      
      <div className="container py-6 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Communities
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Create a New Community</CardTitle>
            <CardDescription>
              Create a space for players to connect, share experiences, and organize events.
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter community name" />
                        </FormControl>
                        <FormDescription>
                          Choose a clear, descriptive name for your community.
                        </FormDescription>
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
                            {...field}
                            placeholder="Describe your community..."
                            className="min-h-[120px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Explain what your community is about and who should join.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., West Coast, Northeast" />
                          </FormControl>
                          <FormDescription>
                            The general region of your community.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="skillLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select skill level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SKILL_LEVELS.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The skill level this community is focused on.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., competitive, social, drills" />
                        </FormControl>
                        <FormDescription>
                          Comma-separated tags to help players find your community.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Community Settings</h3>
                  
                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Private Community</FormLabel>
                          <FormDescription>
                            Private communities are only visible to members.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requiresApproval"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Require Approval</FormLabel>
                          <FormDescription>
                            New members must be approved by an admin.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Community Guidelines</h3>
                  
                  <FormField
                    control={form.control}
                    name="rules"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rules</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Community rules..."
                            className="min-h-[100px]"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          Set clear rules for your community members.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guidelines"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guidelines</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Community guidelines..."
                            className="min-h-[100px]"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          Additional guidelines or expectations for your community.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t p-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={createCommunity.isPending}
                >
                  {createCommunity.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Community
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </CommunityProvider>
  );
}