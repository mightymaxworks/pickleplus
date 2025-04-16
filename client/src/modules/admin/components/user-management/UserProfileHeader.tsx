/**
 * PKL-278651-ADMIN-0015-USER
 * User Profile Header Component
 * 
 * Displays user profile information in the admin interface with status controls
 */

import { useState } from 'react';
import { User } from '@/types';
import { UserAccountStatus } from '../../../../shared/types/admin/user-management';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  CalendarDays, 
  Check, 
  ChevronDown, 
  Edit, 
  ExternalLink, 
  Mail, 
  MapPin, 
  MoreHorizontal, 
  Shield, 
  Star, 
  Trophy, 
  User as UserIcon, 
  UserMinus, 
  Verified 
} from 'lucide-react';

interface UserProfileHeaderProps {
  user: User;
  accountStatus: UserAccountStatus | null;
  onUpdateStatus: (statusData: { 
    status: 'active' | 'suspended' | 'restricted' | 'deactivated';
    reason?: string;
    expiresAt?: string;
  }) => void;
}

export const UserProfileHeader = ({ 
  user, 
  accountStatus, 
  onUpdateStatus 
}: UserProfileHeaderProps) => {
  const [suspendReason, setSuspendReason] = useState('');
  const [restrictReason, setRestrictReason] = useState('');
  
  const getInitials = () => {
    if (user.avatarInitials) return user.avatarInitials;
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };
  
  const statusVariant = () => {
    if (!accountStatus) return undefined;
    
    switch (accountStatus.status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'destructive';
      case 'restricted':
        return 'warning';
      case 'deactivated':
        return 'secondary';
      default:
        return undefined;
    }
  };
  
  const handleSuspend = () => {
    onUpdateStatus({
      status: 'suspended',
      reason: suspendReason
    });
    setSuspendReason('');
  };
  
  const handleRestrict = () => {
    onUpdateStatus({
      status: 'restricted',
      reason: restrictReason
    });
    setRestrictReason('');
  };
  
  const handleActivate = () => {
    onUpdateStatus({
      status: 'active',
      reason: 'Account restored by administrator'
    });
  };
  
  return (
    <Card className="border-none shadow-sm bg-card/60">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and basic info */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Avatar className="h-24 w-24 border-2 border-primary">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.displayName || user.username} />
              ) : (
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex flex-col items-center md:items-start mt-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">
                  {user.displayName || user.username}
                </h2>
                {user.isAdmin && (
                  <Badge variant="default" className="ml-1">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                {user.isFoundingMember && (
                  <Badge variant="secondary" className="ml-1">
                    <Star className="h-3 w-3 mr-1" />
                    Founding
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground">@{user.username}</p>
              
              {accountStatus && (
                <Badge variant={statusVariant()} className="mt-2">
                  {accountStatus.status.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
          
          {/* User details */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <UserIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p>{user.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p>{user.location || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CalendarDays className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Playing Since</p>
                  <p>{user.playingSince || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Verified className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Passport ID</p>
                  <p>
                    {user.passportId || 'Not assigned'}
                    {user.passportId && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                        Verified
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Trophy className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Ranking Points</p>
                  <div className="flex items-center">
                    <p>{user.rankingPoints || 0}</p>
                    {user.rankingPoints > 1000 && (
                      <Badge variant="secondary" className="ml-2">
                        Elite
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Star className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Level / XP</p>
                  <p>Level {user.level} ({user.xp} XP)</p>
                </div>
              </div>
              
              {user.duprRating && (
                <div className="flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">DUPR Rating</p>
                    <p>{user.duprRating}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-row md:flex-col gap-2 justify-center md:justify-start">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Account Status
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Manage Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {(!accountStatus || accountStatus.status !== 'active') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Check className="h-4 w-4 mr-2" />
                        Activate Account
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Activate Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will restore full access to the user account. Are you sure you want to proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleActivate}>
                          Activate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {(!accountStatus || accountStatus.status !== 'restricted') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Restrict Account
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Restrict Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will limit the user's access to certain features. Please provide a reason:
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Textarea
                        value={restrictReason}
                        onChange={(e) => setRestrictReason(e.target.value)}
                        placeholder="Reason for account restriction"
                        className="mt-2"
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRestrict} disabled={!restrictReason.trim()}>
                          Restrict Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {(!accountStatus || accountStatus.status !== 'suspended') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive focus:text-destructive"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Suspend Account
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Suspend Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will prevent the user from logging in. Please provide a reason:
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Textarea
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        placeholder="Reason for account suspension"
                        className="mt-2"
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleSuspend} 
                          disabled={!suspendReason.trim()}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Suspend Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View Matches</DropdownMenuItem>
                <DropdownMenuItem>View Tournaments</DropdownMenuItem>
                <DropdownMenuItem>Reset Password</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};