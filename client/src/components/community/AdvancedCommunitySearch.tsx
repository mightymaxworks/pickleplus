/**
 * PKL-278651-COMM-0017-SEARCH
 * Advanced Community Search Component
 * 
 * This component provides a comprehensive search interface for communities
 * with advanced filtering options, sorting, and recommendations.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-18
 * @framework Framework5.1
 */

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X, Search, Filter, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/lib/auth';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

// Skill level options for pickleball
const SKILL_LEVELS = [
  { label: "Beginner (1.0-2.0)", value: "beginner" },
  { label: "Intermediate (2.5-3.5)", value: "intermediate" },
  { label: "Advanced (4.0-4.5)", value: "advanced" },
  { label: "Pro (5.0+)", value: "pro" }
];

// Event types in pickleball communities
const EVENT_TYPES = [
  { label: "Match Play", value: "match_play" },
  { label: "League", value: "league" },
  { label: "Tournament", value: "tournament" },
  { label: "Clinic", value: "clinic" },
  { label: "Workshop", value: "workshop" },
  { label: "Social", value: "social" }
];

// Sorting options for communities
const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Name (A-Z)", value: "name_asc" },
  { label: "Name (Z-A)", value: "name_desc" },
  { label: "Most Members", value: "members_high" },
  { label: "Fewest Members", value: "members_low" },
  { label: "Most Events", value: "events_high" },
  { label: "Fewest Events", value: "events_low" }
];

// Common location tags for pickleball communities
const POPULAR_LOCATIONS = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"
];

// Popular tags for pickleball communities
const POPULAR_TAGS = [
  "Competitive", "Casual", "Beginners Welcome", "Seniors", "Youth",
  "Indoor", "Outdoor", "All Levels", "Training", "Weekly Games"
];

// Form schema
const searchFormSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  skillLevel: z.string().optional(),
  tags: z.array(z.string()).optional(),
  eventType: z.string().optional(),
  hasEvents: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  sort: z.string().optional(),
  popular: z.boolean().optional(),
  recommendForUser: z.boolean().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

interface AdvancedCommunitySearchProps {
  onSearch: (searchParams: any) => void;
  initialValues?: Partial<SearchFormValues>;
  expanded?: boolean;
  className?: string;
}

export function AdvancedCommunitySearch({
  onSearch,
  initialValues,
  expanded = false,
  className = '',
}: AdvancedCommunitySearchProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialValues?.tags || []);
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize form with default values
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      search: initialValues?.search || '',
      location: initialValues?.location || '',
      skillLevel: initialValues?.skillLevel || '',
      tags: initialValues?.tags || [],
      eventType: initialValues?.eventType || '',
      hasEvents: initialValues?.hasEvents || false,
      isPrivate: initialValues?.isPrivate || false,
      sort: initialValues?.sort || 'newest',
      popular: initialValues?.popular || false,
      recommendForUser: initialValues?.recommendForUser || false,
    },
  });

  // Update form values when initialValues change
  useEffect(() => {
    if (initialValues) {
      Object.entries(initialValues).forEach(([key, value]) => {
        form.setValue(key as keyof SearchFormValues, value);
      });
      
      if (initialValues.tags) {
        setSelectedTags(initialValues.tags);
      }
    }
  }, [initialValues, form]);

  // Form submission handler
  const onSubmit = (values: SearchFormValues) => {
    const searchParams: Record<string, any> = {};
    
    // Only include non-empty values
    if (values.search) searchParams.search = values.search;
    if (values.location) searchParams.location = values.location;
    if (values.skillLevel) searchParams.skillLevel = values.skillLevel;
    if (values.tags && values.tags.length > 0) searchParams.tags = values.tags;
    if (values.eventType) searchParams.eventType = values.eventType;
    if (values.hasEvents) searchParams.hasEvents = values.hasEvents;
    if (values.isPrivate) searchParams.isPrivate = values.isPrivate;
    if (values.sort) searchParams.sort = values.sort;
    if (values.popular) searchParams.popular = values.popular;
    
    // Add recommendation parameter if requested and user is logged in
    if (values.recommendForUser && user?.id) {
      searchParams.recommendForUser = user.id;
    }
    
    console.log('[PKL-278651-COMM-0017-SEARCH] Search submitted:', searchParams);
    onSearch(searchParams);
    
    toast({
      title: "Search filters applied",
      description: "Your community search has been updated.",
    });
  };

  // Handler for tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    
    // Update form value
    const currentTags = form.getValues('tags') || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    form.setValue('tags', newTags);
  };

  // Clear all form values
  const handleClearAll = () => {
    form.reset({
      search: '',
      location: '',
      skillLevel: '',
      tags: [],
      eventType: '',
      hasEvents: false,
      isPrivate: false,
      sort: 'newest',
      popular: false,
      recommendForUser: false,
    });
    setSelectedTags([]);
    
    // Immediately search with empty params
    onSearch({});
    
    toast({
      title: "Filters cleared",
      description: "All search filters have been reset.",
    });
  };

  return (
    <div className={`bg-card border rounded-lg shadow-sm p-4 ${className}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Find Communities</h3>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 px-2"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                {isExpanded ? "Less Filters" : "More Filters"}
              </Button>
            </div>
            
            {/* Basic search - always visible */}
            <div className="flex space-x-2">
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search communities..."
                          className="pl-9"
                          {...field}
                        />
                        {field.value && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1.5 h-7 w-7 p-0"
                            onClick={() => form.setValue('search', '')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="shrink-0">
                Search
              </Button>
            </div>
          </div>
          
          {/* Quick filter tags */}
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.slice(0, 5).map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
          
          {/* Advanced filters - expandable */}
          {isExpanded && (
            <div className="pt-2 space-y-4 border-t">
              <Tabs defaultValue="filters">
                <TabsList className="w-full">
                  <TabsTrigger value="filters" className="flex-1">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </TabsTrigger>
                  <TabsTrigger value="sort" className="flex-1">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Sort & Recommend
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="filters" className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Any location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="any">Any location</SelectItem>
                              {POPULAR_LOCATIONS.map(location => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                                <SelectValue placeholder="Any skill level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="any">Any skill level</SelectItem>
                              {SKILL_LEVELS.map(level => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Any event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="any">Any event type</SelectItem>
                            {EVENT_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <FormLabel>Tags</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_TAGS.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag}
                          {selectedTags.includes(tag) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="additional">
                      <AccordionTrigger>Additional Filters</AccordionTrigger>
                      <AccordionContent className="pt-4 space-y-4">
                        <div className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name="hasEvents"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Has upcoming events
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name="isPrivate"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Show private communities
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
                
                <TabsContent value="sort" className="pt-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="sort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Communities By</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Newest First" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SORT_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Smart Discovery</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name="popular"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Most popular communities
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {user && (
                          <div className="flex items-center space-x-2">
                            <FormField
                              control={form.control}
                              name="recommendForUser"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Recommended for me
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-between pt-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
            
            <Button type="submit" size="sm">
              Apply Filters
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}