/**
 * PKL-278651-COMM-0014-MLIST
 * Enhanced Community Members List Component
 * 
 * This component provides an enhanced view of community members with
 * filtering, sorting, search, and improved role visualization.
 * 
 * @component MembersList
 * @layer UI
 * @version 1.0.0
 * @lastModified 2025-04-17
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Users, 
  Search, 
  SlidersHorizontal, 
  Shield, 
  ShieldCheck, 
  User, 
  CalendarDays,
  Clock,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Award,
  Star,
  BadgeCheck,
  List as ListIcon
} from "lucide-react";
import { useCommunityMembers } from "@/lib/hooks/useCommunity";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommunityMember, CommunityMemberRole } from "@/types/community";

// Types for component props
interface MembersListProps {
  communityId: number;
  layout?: 'grid' | 'list';
  showFilter?: boolean;
  compact?: boolean;
  limit?: number;
  isCurrentUserAdmin?: boolean;
}

/**
 * @visual
 * - Search bar at the top
 * - Dropdown filters for role and sort options
 * - Grid or list view of members with avatar, name, role
 * - Visual badges for admin/moderator roles
 * - Join date or activity indicators
 * - Pagination controls
 * @expectedBehavior
 * - Search filters members by name
 * - Role filter shows only members with selected roles
 * - Sort options change the display order
 * - Load more button fetches additional members
 */
export function MembersList({
  communityId,
  layout = 'grid',
  showFilter = true,
  compact = false,
  limit = 12,
  isCurrentUserAdmin = false
}: MembersListProps) {
  // State for search, filters, and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [page, setPage] = useState(0);
  const pageSize = limit;
  
  // Calculate offset for pagination
  const offset = page * pageSize;
  
  // Fetch members data
  const { 
    data: members = [], 
    isLoading, 
    isFetching,
    isError, 
    error,
    refetch
  } = useCommunityMembers(communityId, {
    limit: pageSize,
    offset,
    role: activeRole || undefined,
  });
  
  // Filter members by search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    
    return members.filter(member => {
      const displayName = member.user?.displayName || '';
      const username = member.user?.username || '';
      
      return displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             username.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [members, searchQuery]);
  
  // Sort members based on selected sort option
  const sortedMembers = useMemo(() => {
    const sorted = [...filteredMembers];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => {
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        });
      case 'alphabetical':
        return sorted.sort((a, b) => {
          const nameA = a.user?.displayName || a.user?.username || '';
          const nameB = b.user?.displayName || b.user?.username || '';
          return nameA.localeCompare(nameB);
        });
      default:
        return sorted;
    }
  }, [filteredMembers, sortBy]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle role filter change
  const handleRoleChange = (role: string | null) => {
    setActiveRole(role);
    setPage(0); // Reset pagination when filter changes
  };
  
  // Handle sort change
  const handleSortChange = (sort: 'newest' | 'oldest' | 'alphabetical') => {
    setSortBy(sort);
  };
  
  // Handle load more
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };
  
  // Format the join date for display
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Get role badge component
  const getRoleBadge = (role: CommunityMemberRole) => {
    switch (role) {
      case CommunityMemberRole.ADMIN:
        return (
          <Badge variant="default" className="bg-primary text-primary-foreground">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case CommunityMemberRole.MODERATOR:
        return (
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            <Shield className="h-3 w-3 mr-1" />
            Moderator
          </Badge>
        );
      case CommunityMemberRole.MEMBER:
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            Member
          </Badge>
        );
    }
  };
  
  // Get creator badge if member is the creator
  const getCreatorBadge = (isCreator?: boolean) => {
    if (!isCreator) return null;
    
    return (
      <Badge variant="default" className="ml-2 bg-amber-500 text-white hover:bg-amber-600">
        <Star className="h-3 w-3 mr-1" />
        Creator
      </Badge>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-10">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
      {activeRole || searchQuery ? (
        <>
          <p className="text-lg font-medium mb-2">No members found</p>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            No members match your current filters. Try adjusting your search or filters.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('');
              setActiveRole(null);
            }}
          >
            Clear Filters
          </Button>
        </>
      ) : (
        <p className="text-muted-foreground">This community doesn't have any members yet</p>
      )}
    </div>
  );
  
  // Render the list in grid layout
  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sortedMembers.map(member => (
        <Card key={member.id} className="bg-muted/40 overflow-hidden">
          <CardContent className={compact ? "p-3" : "p-4"}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className={compact ? "h-10 w-10" : "h-12 w-12"}>
                  <AvatarImage src={member.user?.avatarUrl || undefined} />
                  <AvatarFallback>
                    {(member.user?.displayName || 'User').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className={`font-medium ${compact ? "text-sm" : ""}`}>
                    {member.user?.displayName || member.user?.username || 'Anonymous User'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getRoleBadge(member.role)}
                    {getCreatorBadge(member.isCreator)}
                  </div>
                  
                  {!compact && (
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      <span>Joined {formatJoinDate(member.joinedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {isCurrentUserAdmin && !compact && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={member.isCreator}>
                      Promote to Moderator
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={member.isCreator}>
                      Remove from Community
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Render the list in list layout
  const renderList = () => (
    <div className="space-y-2">
      {sortedMembers.map(member => (
        <Card key={member.id} className="bg-muted/40">
          <CardContent className={compact ? "py-2 px-3" : "py-3 px-4"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className={compact ? "h-8 w-8" : "h-10 w-10"}>
                  <AvatarImage src={member.user?.avatarUrl || undefined} />
                  <AvatarFallback>
                    {(member.user?.displayName || 'User').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className={`font-medium ${compact ? "text-sm" : ""}`}>
                    {member.user?.displayName || member.user?.username || 'Anonymous User'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getRoleBadge(member.role)}
                    {getCreatorBadge(member.isCreator)}
                  </div>
                </div>
              </div>
              
              {!compact && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  <span>{formatJoinDate(member.joinedAt)}</span>
                </div>
              )}
              
              {isCurrentUserAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={member.isCreator}>
                      Promote to Moderator
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={member.isCreator}>
                      Remove from Community
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Render loading state
  const renderLoading = () => (
    <div className={layout === 'grid' 
      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      : "space-y-3"
    }>
      {Array(compact ? 6 : 8).fill(0).map((_, i) => (
        <Skeleton key={i} className={layout === 'grid' ? "h-20 w-full" : "h-14 w-full"} />
      ))}
    </div>
  );
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Members
            </CardTitle>
            <CardDescription>
              {!isLoading && `${filteredMembers.length} members shown`}
              {activeRole && ` • Filtered by ${activeRole} role`}
            </CardDescription>
          </div>
          
          {showFilter && !compact && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full md:w-60"
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden md:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleRoleChange(null)}
                    className={!activeRole ? "bg-accent text-accent-foreground" : ""}
                  >
                    <User className="h-4 w-4 mr-2" />
                    All Members
                    {!activeRole && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleRoleChange(CommunityMemberRole.ADMIN)}
                    className={activeRole === CommunityMemberRole.ADMIN ? "bg-accent text-accent-foreground" : ""}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Admins Only
                    {activeRole === CommunityMemberRole.ADMIN && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleRoleChange(CommunityMemberRole.MODERATOR)}
                    className={activeRole === CommunityMemberRole.MODERATOR ? "bg-accent text-accent-foreground" : ""}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Moderators Only
                    {activeRole === CommunityMemberRole.MODERATOR && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleSortChange('newest')}
                    className={sortBy === 'newest' ? "bg-accent text-accent-foreground" : ""}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Newest First
                    {sortBy === 'newest' && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleSortChange('oldest')}
                    className={sortBy === 'oldest' ? "bg-accent text-accent-foreground" : ""}
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Oldest First
                    {sortBy === 'oldest' && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleSortChange('alphabetical')}
                    className={sortBy === 'alphabetical' ? "bg-accent text-accent-foreground" : ""}
                  >
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Alphabetical
                    {sortBy === 'alphabetical' && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    {layout === 'grid' ? (
                      <>
                        <Users className="h-4 w-4" />
                        <span className="hidden md:inline">Grid</span>
                      </>
                    ) : (
                      <>
                        <ListIcon className="h-4 w-4" />
                        <span className="hidden md:inline">List</span>
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>View Layout</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Grid View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    List View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          renderLoading()
        ) : sortedMembers.length === 0 ? (
          renderEmptyState()
        ) : (
          layout === 'grid' ? renderGrid() : renderList()
        )}
      </CardContent>
      
      {!isLoading && sortedMembers.length > 0 && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleLoadMore}
            disabled={isFetching || members.length < pageSize}
          >
            {isFetching ? "Loading..." : "Load More Members"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}