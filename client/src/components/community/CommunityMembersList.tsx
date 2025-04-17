/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Community Members List Component
 * 
 * This component displays a list of members for a community with role indicators.
 */
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { CommunityMember } from "@/types/community";
import { Shield, Users, User, Crown } from "lucide-react";

interface CommunityMembersListProps {
  members: CommunityMember[];
  isLoading: boolean;
  communityId: number;
}

export const CommunityMembersList = ({ members, isLoading, communityId }: CommunityMembersListProps) => {
  const admins = members.filter(member => member.role === 'admin');
  const moderators = members.filter(member => member.role === 'moderator');
  const regularMembers = members.filter(member => member.role === 'member');
  
  const renderMemberItem = (member: CommunityMember) => {
    return (
      <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
        <Avatar>
          <AvatarImage src={member.user?.avatarUrl || ""} />
          <AvatarFallback>
            {member.user?.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="font-medium flex items-center gap-2">
            {member.user?.displayName || member.user?.username}
            
            {member.role === 'admin' && (
              <Badge variant="default" className="flex items-center gap-1 text-xs">
                <Crown size={10} /> Admin
              </Badge>
            )}
            
            {member.role === 'moderator' && (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <Shield size={10} /> Mod
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    );
  };
  
  const renderSkeletons = (count: number) => {
    return Array(count).fill(0).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    ));
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Members</CardTitle>
          <CardDescription>Loading members...</CardDescription>
        </CardHeader>
        <CardContent>
          {renderSkeletons(5)}
        </CardContent>
      </Card>
    );
  }
  
  if (members.length === 0) {
    return (
      <Card className="text-center p-6">
        <div className="py-10">
          <h3 className="text-xl font-semibold mb-2">No Members Yet</h3>
          <p className="text-muted-foreground">
            Be the first to join this community!
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={18} />
          <span>Community Members</span>
          <Badge variant="outline" className="ml-2">
            {members.length}
          </Badge>
        </CardTitle>
        <CardDescription>People who have joined this community</CardDescription>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="max-h-[600px]">
          {admins.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <Crown size={14} /> Administrators
              </h3>
              <div className="space-y-1">
                {admins.map(renderMemberItem)}
              </div>
            </div>
          )}
          
          {moderators.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <Shield size={14} /> Moderators
              </h3>
              <div className="space-y-1">
                {moderators.map(renderMemberItem)}
              </div>
            </div>
          )}
          
          {regularMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <User size={14} /> Members
              </h3>
              <div className="space-y-1">
                {regularMembers.map(renderMemberItem)}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};