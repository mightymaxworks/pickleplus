/**
 * PKL-278651-COMM-0014-UI-INFO - Sprint 1.4
 * Enhanced Community Information Card Component
 * 
 * This component displays structured information in collapsible sections
 * following the Community Profile Information Display spec.
 * 
 * Features:
 * - Collapsible sections with smooth animations
 * - Icon-based section headers for better visual hierarchy
 * - Responsive layout for all screen sizes
 * - Rich content support (text, links, tags, etc.)
 * - Customizable card appearance with theme integration
 */

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CommunityInfoCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  initialExpanded?: boolean;
  className?: string;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

export function CommunityInfoCard({
  title,
  icon,
  children,
  initialExpanded = true,
  className,
  badgeText,
  badgeVariant = "secondary"
}: CommunityInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  return (
    <Card className={cn("overflow-hidden transition-all duration-200", className)}>
      <CardHeader className="px-4 py-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 truncate">
            <span className="flex-shrink-0">{icon}</span>
            <span className="truncate">{title}</span>
            {badgeText && (
              <Badge variant={badgeVariant} className="ml-2 text-xs flex-shrink-0">
                {badgeText}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <div 
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="px-4 py-3">
            {children}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

// Subcomponent for displaying formatted descriptions
export function CommunityInfoDescription({ 
  children, 
  placeholder = "No information provided." 
}: { 
  children: React.ReactNode; 
  placeholder?: string;
}) {
  if (!children) {
    return (
      <p className="text-muted-foreground italic">{placeholder}</p>
    );
  }
  
  return (
    <div className="prose dark:prose-invert max-w-none">
      {typeof children === 'string' ? (
        <p>{children}</p>
      ) : (
        children
      )}
    </div>
  );
}

// Subcomponent for creating tags/labels in community info cards
export function CommunityInfoTags({ 
  tags, 
  colorScheme = "secondary" 
}: { 
  tags: string[] | null | undefined; 
  colorScheme?: "default" | "secondary" | "outline" | "accent"; 
}) {
  // Make sure tags is an array before trying to map over it
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag, i) => (
        <Badge key={i} variant={colorScheme === "accent" ? "default" : colorScheme} className={colorScheme === "accent" ? "bg-primary/15 text-primary hover:bg-primary/25" : ""}>
          {tag}
        </Badge>
      ))}
    </div>
  );
}

// Subcomponent for creating statistics in the info card
export function CommunityInfoStats({ 
  stats 
}: { 
  stats: Array<{ label: string; value: string | number; icon?: React.ReactNode }>
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-md">
          {/* Always show icon prominently for mobile first design */}
          <div className="mb-1 text-primary text-opacity-80">
            {stat.icon || <span className="inline-block h-5 w-5" />}
          </div>
          <div className="text-xl font-semibold">{stat.value}</div>
          <div className="text-xs text-muted-foreground text-center">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}