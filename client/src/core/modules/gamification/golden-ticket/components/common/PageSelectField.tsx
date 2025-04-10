/**
 * PKL-278651-GAME-0005-GOLD-ENH
 * Page Select Field
 * 
 * A multi-select dropdown component for page selection in Golden Ticket forms.
 */

import React from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import { AVAILABLE_PAGES, PAGE_GROUPS, ApplicationPage } from '../../data/availablePages';

interface PageSelectFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
}

export const PageSelectField: React.FC<PageSelectFieldProps> = ({
  form,
  name,
  label,
  description
}) => {
  const selectedValues = form.watch(name) || [];
  
  // Toggle selected page
  const togglePage = (page: ApplicationPage) => {
    const currentValues = form.getValues(name) || [];
    const pageIndex = currentValues.findIndex((p: string) => p === page.path);
    
    if (pageIndex > -1) {
      // Remove if already selected
      const newValues = [...currentValues];
      newValues.splice(pageIndex, 1);
      form.setValue(name, newValues, { shouldValidate: true });
    } else {
      // Add if not already selected
      form.setValue(name, [...currentValues, page.path], { shouldValidate: true });
    }
  };
  
  // Remove a specific page
  const removePage = (pagePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentValues = form.getValues(name) || [];
    form.setValue(
      name, 
      currentValues.filter((p: string) => p !== pagePath),
      { shouldValidate: true }
    );
  };
  
  // Clear all selected pages
  const clearPages = () => {
    form.setValue(name, [], { shouldValidate: true });
  };
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !selectedValues.length && "text-muted-foreground"
                  )}
                >
                  {selectedValues.length > 0
                    ? `${selectedValues.length} page${selectedValues.length > 1 ? 's' : ''} selected`
                    : "Select pages..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search pages..." />
                  <CommandEmpty>No pages found.</CommandEmpty>
                  <CommandList>
                    <ScrollArea className="h-[300px]">
                      {Object.entries(PAGE_GROUPS).map(([groupName, pages]) => (
                        pages.length > 0 && (
                          <CommandGroup key={groupName} heading={groupName.charAt(0).toUpperCase() + groupName.slice(1)}>
                            {pages.map((page) => {
                              const isSelected = selectedValues.includes(page.path);
                              return (
                                <CommandItem
                                  key={page.id}
                                  value={page.name}
                                  onSelect={() => togglePage(page)}
                                >
                                  <div className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                                  )}>
                                    {isSelected && <Check className="h-3 w-3" />}
                                  </div>
                                  <span className="flex-1">{page.name}</span>
                                  <span className="text-xs text-muted-foreground">{page.path}</span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        )
                      ))}
                    </ScrollArea>
                  </CommandList>
                  {selectedValues.length > 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem 
                          onSelect={clearPages}
                          className="justify-center text-center"
                        >
                          Clear all
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
          
          {/* Show selected pages as badges */}
          {selectedValues.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedValues.map((pagePath: string) => {
                const page = AVAILABLE_PAGES.find(p => p.path === pagePath);
                return (
                  <Badge 
                    key={pagePath} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {page?.name || pagePath}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => removePage(pagePath, e)}
                    />
                  </Badge>
                );
              })}
            </div>
          )}
          
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PageSelectField;