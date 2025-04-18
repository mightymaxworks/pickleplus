/**
 * PKL-278651-COMM-0017-SEARCH
 * Community Search Results Component
 * 
 * This component displays community search results using advanced search filters
 * and provides pagination and empty states.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-18
 * @framework Framework5.1
 */

import React, { useState } from 'react';
import { Link } from 'wouter';
import { useCommunities } from '@/lib/hooks/useCommunity';
import { AdvancedCommunitySearch } from './AdvancedCommunitySearch';
import { Community } from '@/types/community';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Calendar, MapPin, Star, Lock, Shield, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/pagination';

interface CommunitySearchResultsProps {
  initialSearch?: Record<string, any>;
  limit?: number;
  showAdvancedSearch?: boolean;
  className?: string;
}

export function CommunitySearchResults({
  initialSearch = {},
  limit = 10,
  showAdvancedSearch = true,
  className = '',
}: CommunitySearchResultsProps) {
  const [searchParams, setSearchParams] = useState<Record<string, any>>({
    ...initialSearch,
    limit
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  // Calculate offset based on current page and limit
  const offset = (currentPage - 1) * limit;
  const searchWithPagination = { ...searchParams, offset };
  
  // Fetch communities with current search parameters
  const { data: communities, isLoading, isError, error } = useCommunities(searchWithPagination);
  
  // Handler for new search
  const handleSearch = (newParams: Record<string, any>) => {
    console.log('[PKL-278651-COMM-0017-SEARCH] New search params:', newParams);
    setSearchParams({ ...newParams, limit });
    // Reset to first page when making a new search
    setCurrentPage(1);
  };
  
  // Handler for page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Calculate total pages (if we have data)
  const totalResults = Array.isArray(communities) ? communities.length : 0;
  const hasMore = totalResults === limit; // If we got exactly 'limit' items, assume there might be more
  
  // Helper function to check if a community needs approval
  const requiresApproval = (community: Community) => community.requiresApproval;
  
  // Helper function to get community skill level display
  const getSkillLevelBadge = (level: string | null) => {
    if (!level) return null;
    
    const levelColors: Record<string, string> = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-blue-100 text-blue-700',
      advanced: 'bg-purple-100 text-purple-700',
      pro: 'bg-red-100 text-red-700'
    };
    
    const levelDisplay: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      pro: 'Pro'
    };
    
    // Short display for mobile
    const shortDisplay: Record<string, string> = {
      beginner: 'Beg',
      intermediate: 'Int',
      advanced: 'Adv',
      pro: 'Pro'
    };
    
    return (
      <Badge variant="outline" className={`${levelColors[level] || ''} text-xs px-2 truncate max-w-[90px] sm:max-w-full`}>
        <span className="hidden sm:inline">{levelDisplay[level] || level}</span>
        <span className="inline sm:hidden">{shortDisplay[level] || level}</span>
      </Badge>
    );
  };
  
  return (
    <div className={className}>
      {showAdvancedSearch && (
        <div className="mb-6">
          <AdvancedCommunitySearch
            onSearch={handleSearch}
            initialValues={searchParams}
          />
        </div>
      )}
      
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="w-full">
              <CardHeader className="flex flex-row gap-4 items-center pb-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-4/5" />
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="w-full bg-destructive/10">
          <CardHeader>
            <CardTitle>Error Loading Communities</CardTitle>
            <CardDescription>
              There was a problem fetching the communities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSearch(searchParams)}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      ) : communities && communities.length > 0 ? (
        <div className="space-y-4">
          {communities.map((community) => (
            <Card key={community.id} className="w-full transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
                      <AvatarFallback>
                        {community.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Link to={`/communities/${community.id}`}>
                          <span className="hover:underline">{community.name}</span>
                        </Link>
                        {community.isPrivate && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        {community.location && (
                          <div className="flex items-center mr-4">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span>{community.location}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          <span>{community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getSkillLevelBadge(community.skillLevel)}
                    {requiresApproval(community) && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 text-xs px-2 truncate max-w-[90px] sm:max-w-full">
                        <Shield className="h-3 w-3 mr-1" /> 
                        <span className="hidden sm:inline">Approval Required</span>
                        <span className="inline sm:hidden">Approval</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {community.description || "No description provided."}
                </p>
                
                {community.tags && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-3">
                    {community.tags.split(',').map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 truncate max-w-[80px] sm:max-w-[120px]"
                      >
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 flex justify-between">
                <div className="text-sm flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {community.eventCount} {community.eventCount === 1 ? 'event' : 'events'}
                  </span>
                </div>
                <Link to={`/communities/${community.id}`}>
                  <Button size="sm" variant="outline" className="h-8 px-2 sm:px-3">
                    <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">View Community</span>
                    <span className="inline sm:hidden ml-1 text-xs">View</span>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          
          {/* Pagination */}
          {(currentPage > 1 || hasMore) && (
            <div className="mt-6">
              <Pagination 
                currentPage={currentPage} 
                totalPages={hasMore ? currentPage + 1 : currentPage} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </div>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>No Communities Found</CardTitle>
            <CardDescription>
              We couldn't find any communities matching your search criteria.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search terms to find more communities.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => handleSearch({})}
            >
              Clear Filters
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}