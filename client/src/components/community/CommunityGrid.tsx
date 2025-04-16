/**
 * PKL-278651-COMM-0006-HUB-UI
 * Community Grid Component
 * 
 * This component displays a grid of community cards.
 */

import React from "react";
import { Community } from "@shared/schema/community";
import { CommunityCard } from "./CommunityCard";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunityGridProps {
  communities: Community[];
  isLoading?: boolean;
  compact?: boolean;
  userMemberships?: number[]; // Array of community IDs the user is a member of
}

export function CommunityGrid({
  communities,
  isLoading = false,
  compact = false,
  userMemberships = [],
}: CommunityGridProps) {
  // Show skeletons while loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <CommunityGridSkeleton key={index} compact={compact} />
        ))}
      </div>
    );
  }
  
  // Show empty state if no communities
  if (communities.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No communities found</h3>
        <p className="text-muted-foreground mt-2">
          There are no communities matching your criteria.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {communities.map((community) => (
        <CommunityCard
          key={community.id}
          community={community}
          compact={compact}
          isMember={userMemberships.includes(community.id)}
        />
      ))}
    </div>
  );
}

function CommunityGridSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className={compact ? "p-4" : "p-6"}>
        <div className="flex items-center gap-4">
          <Skeleton className={`rounded-full ${compact ? "h-10 w-10" : "h-16 w-16"}`} />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            {!compact && <Skeleton className="h-4 w-full" />}
          </div>
        </div>
      </div>
      
      <div className={compact ? "p-4 pt-0" : "p-6 pt-0"}>
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        
        {!compact && (
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}
      </div>
      
      <div className={compact ? "p-4 pt-0" : "p-6 pt-0"}>
        <div className="flex justify-end">
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}