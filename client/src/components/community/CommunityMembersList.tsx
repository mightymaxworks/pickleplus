/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Community Members List Component
 * 
 * This component displays a list of members for a community with role indicators.
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Search, UserPlus } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export interface CommunityMember {
  id: number;
  userId: number;
  communityId: number;
  role: 'member' | 'admin' | 'moderator';
  joinedAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
  };
}

interface CommunityMembersListProps {
  members: CommunityMember[];
  isLoading: boolean;
  communityId: number;
}

export const CommunityMembersList = ({ members, isLoading, communityId }: CommunityMembersListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter members based on search query
  const filteredMembers = members.filter(member => 
    member.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${member.user?.firstName} ${member.user?.lastName}`
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  
  // Get admins and moderators
  const admins = members.filter(member => member.role === 'admin');
  const moderators = members.filter(member => member.role === 'moderator');
  
  const renderMemberItem = (member: CommunityMember) => {
    return (
      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={member.user?.avatarUrl || ""} />
            <AvatarFallback>
              {member.user?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium flex items-center gap-2">
              {member.user?.username}
              {member.role === 'admin' && (
                <Badge variant="default" className="text-xs">Admin</Badge>
              )}
              {member.role === 'moderator' && (
                <Badge variant="secondary" className="text-xs">Mod</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Joined {member.joinedAt ? formatDistanceToNow(new Date(member.joinedAt)) + ' ago' : 'recently'}
            </div>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="text-xs gap-1">
          <UserPlus className="h-3 w-3" />
          <span>Follow</span>
        </Button>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center border rounded-md px-3 mb-4">
          <Search className="h-4 w-4 mr-2 opacity-50" />
          <Skeleton className="h-9 w-full" />
        </div>
        
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Shield className="h-12 w-12 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Members Yet</h3>
          <p className="text-muted-foreground mb-2 max-w-md">
            This community doesn't have any members yet. Share the community link to invite others!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex items-center border rounded-md px-3">
        <Search className="h-4 w-4 mr-2 opacity-50" />
        <Input 
          placeholder="Search members..." 
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Community Leaders */}
      {(admins.length > 0 || moderators.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Community Leaders
            </CardTitle>
            <CardDescription>
              Admins and moderators who manage this community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {admins.map(renderMemberItem)}
              {moderators.map(renderMemberItem)}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* All Members */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            All Members ({filteredMembers.length})
          </CardTitle>
          <CardDescription>
            {searchQuery ? `Showing ${filteredMembers.length} members matching "${searchQuery}"` : `${members.length} people in this community`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No members found matching your search.
            </p>
          ) : (
            <div className="space-y-1">
              {filteredMembers.map(renderMemberItem)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};