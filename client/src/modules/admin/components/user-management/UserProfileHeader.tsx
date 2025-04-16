/**
 * PKL-278651-ADMIN-0015-USER
 * User Profile Header Component
 * 
 * This component displays the user's profile header with avatar, name, and key metrics
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Shield, Trophy, Clock, Pencil } from 'lucide-react';
import { UserAccountStatus } from '@shared/types/admin/user-management';
import { User as UserType } from '@shared/types';
import { getInitials } from '@/lib/utils';

interface UserProfileHeaderProps {
  user: UserType;
  accountStatus: UserAccountStatus | null;
}

/**
 * User Profile Header - Displays user info and profile actions
 */
export function UserProfileHeader({ user, accountStatus }: UserProfileHeaderProps) {
  // Extract user data
  const {
    username,
    email,
    displayName,
    avatarUrl,
    firstName,
    lastName,
    isAdmin,
    isCoach,
    isFoundingMember,
    passportId,
    createdAt,
    lastLoginAt
  } = user;

  // Format dates
  const joinDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown';
  const lastActive = lastLoginAt ? new Date(lastLoginAt).toLocaleDateString() : 'Never';

  // Generate initials for avatar fallback
  const initials = getInitials(displayName || firstName || lastName || username);

  // Determine badge color based on account status
  const getBadgeVariant = () => {
    if (!accountStatus) return 'outline';
    
    switch (accountStatus.status) {
      case 'active': return 'success';
      case 'suspended': return 'destructive';
      case 'restricted': return 'warning';
      case 'deactivated': return 'secondary';
      default: return 'outline';
    }
  };

  // Determine badge label based on account status
  const getBadgeLabel = () => {
    if (!accountStatus) return 'Active';
    
    switch (accountStatus.status) {
      case 'active': return 'Active';
      case 'suspended': return 'Suspended';
      case 'restricted': return 'Restricted';
      case 'deactivated': return 'Deactivated';
      default: return accountStatus.status;
    }
  };

  return (
    <div className="w-full p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Avatar */}
        <Avatar className="h-24 w-24">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={displayName || username} />
          ) : null}
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold">
              {displayName || username}
            </h2>
            <Badge variant={getBadgeVariant()}>
              {getBadgeLabel()}
            </Badge>
            {isAdmin && (
              <Badge variant="outline" className="bg-primary/10">
                Administrator
              </Badge>
            )}
            {isCoach && (
              <Badge variant="outline" className="bg-blue-500/10">
                Coach
              </Badge>
            )}
            {isFoundingMember && (
              <Badge variant="outline" className="bg-amber-500/10">
                Founding Member
              </Badge>
            )}
          </div>

          <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>@{username}</span>
            </div>
            {email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                <span>{email}</span>
              </div>
            )}
            {passportId && (
              <div className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                <span>Passport ID: {passportId}</span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5" />
                Member since {joinDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Last active {lastActive}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 self-stretch sm:self-start">
          <Button variant="outline" className="gap-1" size="sm">
            <Pencil className="h-4 w-4" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}