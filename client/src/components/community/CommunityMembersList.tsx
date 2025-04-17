/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Community Members List Component
 * 
 * This component displays a list of members in a community with search and role filtering capabilities.
 */
import { useState } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search,
  Shield,
  StarIcon,
  MapPin,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommunityMember } from '@/lib/api/community';

interface CommunityMembersListProps {
  members: CommunityMember[];
  isLoading: boolean;
  communityId: number;
}

export const CommunityMembersList = ({ members, isLoading, communityId }: CommunityMembersListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter members based on search query and active tab
  const filteredMembers = members.filter(member => {
    // Search filter
    if (searchQuery && !member.user?.username.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Tab filter
    if (activeTab === 'admin' && member.role !== 'admin' && member.role !== 'owner') {
      return false;
    }
    
    if (activeTab === 'moderator' && member.role !== 'moderator') {
      return false;
    }
    
    if (activeTab === 'member' && (member.role === 'admin' || member.role === 'moderator' || member.role === 'owner')) {
      return false;
    }
    
    return true;
  });
  
  // Get badge for member role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="default" className="bg-orange-500">Owner</Badge>;
      case 'admin':
        return <Badge variant="default" className="bg-red-500">Admin</Badge>;
      case 'moderator':
        return <Badge variant="default" className="bg-blue-500">Moderator</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };
  
  // Count members by role
  const adminCount = members.filter(m => m.role === 'admin' || m.role === 'owner').length;
  const moderatorCount = members.filter(m => m.role === 'moderator').length;
  const memberCount = members.filter(m => m.role === 'member').length;
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-10 w-72" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (members.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="flex flex-col items-center justify-center text-center">
          <Users className="h-16 w-16 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Members Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            This community doesn't have any members yet.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="w-full md:w-1/2 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search members..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="all">
              All ({members.length})
            </TabsTrigger>
            <TabsTrigger value="admin">
              Admins ({adminCount})
            </TabsTrigger>
            <TabsTrigger value="moderator">
              Mods ({moderatorCount})
            </TabsTrigger>
            <TabsTrigger value="member">
              Members ({memberCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              No members match your search for "{searchQuery}".
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.user?.avatarUrl || ""} />
                    <AvatarFallback>
                      {member.user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{member.user?.username}</h3>
                      {getRoleBadge(member.role)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(member.joinedAt))} ago
                    </p>
                    
                    {member.user?.location && (
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{member.user.location}</span>
                      </div>
                    )}
                    
                    {member.user?.bio && (
                      <p className="text-sm mt-2 line-clamp-2">{member.user.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};