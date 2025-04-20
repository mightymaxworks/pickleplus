/**
 * PKL-278651-COMM-0034-MEMBER
 * Enhanced Member Management Component
 * 
 * This component provides an advanced interface for managing community members,
 * including bulk actions, role assignments, and permissions management.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, 
  Shield, 
  UserPlus, 
  UserMinus, 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal,
  Search,
  Filter,
  CheckSquare,
  Square,
  Tag,
  Award,
  RefreshCw,
  Clock,
  Settings,
  Download,
  ArrowUpRight,
  Trash2,
  History,
  Plus
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MemberActionType } from "@/types/community-roles";

interface EnhancedMemberManagementProps {
  communityId: number;
  userRole: string;
  hasManagePermission: boolean;
}

export function EnhancedMemberManagement({
  communityId,
  userRole,
  hasManagePermission
}: EnhancedMemberManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("members");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState<MemberActionType | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<any | null>(null);
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const [newRoleData, setNewRoleData] = useState({
    name: "",
    color: "#4f46e5",
    icon: "award",
  });
  
  // Fetch members with their roles
  const { 
    data: members = [], 
    isLoading: isLoadingMembers,
    isError: isMembersError,
    error: membersError,
    refetch: refetchMembers
  } = useQuery({
    queryKey: [
      `/api/communities/${communityId}/members/with-roles`, 
      { search: searchQuery, role: selectedRoleFilter }
    ],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.role) searchParams.append('role', params.role);
      
      const response = await apiRequest(
        'GET',
        `/api/communities/${communityId}/members/with-roles?${searchParams.toString()}`
      );
      return await response.json();
    },
    enabled: communityId > 0
  });
  
  // Fetch custom roles
  const {
    data: customRoles = [],
    isLoading: isLoadingRoles,
    refetch: refetchRoles
  } = useQuery({
    queryKey: [`/api/communities/${communityId}/custom-roles`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/communities/${communityId}/custom-roles`);
      return await response.json();
    },
    enabled: communityId > 0 && (userRole === 'admin' || userRole === 'moderator')
  });
  
  // Fetch roles with permissions
  const {
    data: rolesWithPermissions = [],
    isLoading: isLoadingPermissions,
    refetch: refetchPermissions
  } = useQuery({
    queryKey: [`/api/communities/${communityId}/roles`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/communities/${communityId}/roles`);
      return await response.json();
    },
    enabled: communityId > 0 && userRole === 'admin'
  });
  
  // Fetch action logs
  const {
    data: actionLogs = [],
    isLoading: isLoadingLogs
  } = useQuery({
    queryKey: [`/api/communities/${communityId}/action-logs`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/communities/${communityId}/action-logs`);
      return await response.json();
    },
    enabled: communityId > 0 && selectedTab === 'logs' && hasManagePermission
  });
  
  // Toggle member selection
  const toggleMemberSelection = (userId: number) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };
  
  // Toggle select all members
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map((member: any) => member.userId));
    }
    setIsAllSelected(!isAllSelected);
  };
  
  // Reset selections
  const resetSelections = () => {
    setSelectedMembers([]);
    setIsAllSelected(false);
  };
  
  // Update when members change
  useEffect(() => {
    if (isAllSelected) {
      setSelectedMembers(members.map((member: any) => member.userId));
    }
  }, [members, isAllSelected]);
  
  // Handle bulk action
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, details }: { action: MemberActionType, details?: any }) => {
      const response = await apiRequest(
        'POST',
        `/api/communities/${communityId}/members/bulk-actions`,
        {
          action,
          userIds: selectedMembers,
          details
        }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bulk action completed",
        description: `Successfully performed bulk action on ${selectedMembers.length} members.`,
      });
      resetSelections();
      setBulkActionDialogOpen(false);
      setSelectedBulkAction(null);
      
      // Refresh data
      refetchMembers();
      refetchRoles();
    },
    onError: (error: any) => {
      toast({
        title: "Bulk action failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle promoting a member to moderator
  const promoteMemberMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest(
        'POST',
        `/api/communities/${communityId}/members/bulk-actions`,
        {
          action: MemberActionType.PROMOTE,
          userIds: [userId]
        }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Member promoted",
        description: "Successfully promoted member to moderator.",
      });
      refetchMembers();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to promote member",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle demoting a moderator to member
  const demoteMemberMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest(
        'POST',
        `/api/communities/${communityId}/members/bulk-actions`,
        {
          action: MemberActionType.DEMOTE,
          userIds: [userId]
        }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Member demoted",
        description: "Successfully demoted moderator to member.",
      });
      refetchMembers();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to demote member",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle removing a member
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest(
        'POST',
        `/api/communities/${communityId}/members/bulk-actions`,
        {
          action: MemberActionType.REMOVE,
          userIds: [userId]
        }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Member removed",
        description: "Successfully removed member from community.",
      });
      refetchMembers();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove member",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle assigning a role to a member
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: number, roleId: number }) => {
      const response = await apiRequest(
        'POST',
        `/api/communities/${communityId}/members/${userId}/assign-role`,
        { customRoleId: roleId }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role assigned",
        description: "Successfully assigned role to member.",
      });
      refetchMembers();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to assign role",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle removing a role from a member
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: number, roleId: number }) => {
      const response = await apiRequest(
        'DELETE',
        `/api/communities/${communityId}/members/${userId}/roles/${roleId}`
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role removed",
        description: "Successfully removed role from member.",
      });
      refetchMembers();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove role",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle creating a new custom role
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      const response = await apiRequest(
        'POST',
        `/api/communities/${communityId}/custom-roles`,
        roleData
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role created",
        description: "Successfully created new custom role.",
      });
      setAddRoleDialogOpen(false);
      setNewRoleData({
        name: "",
        color: "#4f46e5",
        icon: "award",
      });
      refetchRoles();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create role",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle updating role permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ role, permissions }: { role: string, permissions: Record<string, boolean> }) => {
      const response = await apiRequest(
        'PATCH',
        `/api/communities/${communityId}/roles/${role}/permissions`,
        { permissions }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Permissions updated",
        description: "Successfully updated role permissions.",
      });
      refetchPermissions();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update permissions",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Filtered and sorted members
  const filteredMembers = useMemo(() => {
    return members;
  }, [members]);
  
  // Execute bulk action
  const executeBulkAction = async () => {
    if (!selectedBulkAction || selectedMembers.length === 0) {
      toast({
        title: "No action selected",
        description: "Please select an action and at least one member.",
        variant: "destructive",
      });
      return;
    }
    
    // Get any additional details based on the action
    let details = {};
    
    if (selectedBulkAction === MemberActionType.ADD_ROLE) {
      // Show dialog to select role to add
      setAddRoleDialogOpen(true);
      return;
    }
    
    // Execute the bulk action
    bulkActionMutation.mutate({
      action: selectedBulkAction,
      details
    });
  };
  
  // Execute bulk add role
  const executeBulkAddRole = (roleId: number) => {
    bulkActionMutation.mutate({
      action: MemberActionType.ADD_ROLE,
      details: { roleId }
    });
  };
  
  if (!hasManagePermission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            Member Management
          </CardTitle>
          <CardDescription>
            You don't have permission to manage community members.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-0 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Enhanced Member Management
            </CardTitle>
            <CardDescription>
              Manage roles, permissions, and bulk actions for community members
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                refetchMembers();
                refetchRoles();
                refetchPermissions();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="px-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Tag className="w-4 h-4 mr-2" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="logs">
              <History className="w-4 h-4 mr-2" />
              Activity Logs
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Members Tab */}
        <TabsContent value="members" className="p-0">
          <div className="p-4 border-t">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div className="flex flex-1 w-full sm:w-auto items-center gap-2">
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Role
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem 
                      onClick={() => setSelectedRoleFilter(null)}
                      className={!selectedRoleFilter ? "bg-accent text-accent-foreground" : ""}
                    >
                      All Roles
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setSelectedRoleFilter("admin")}
                      className={selectedRoleFilter === "admin" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Admins
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSelectedRoleFilter("moderator")}
                      className={selectedRoleFilter === "moderator" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Moderators
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSelectedRoleFilter("member")}
                      className={selectedRoleFilter === "member" ? "bg-accent text-accent-foreground" : ""}
                    >
                      Members
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {selectedMembers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedMembers.length} selected
                  </span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setBulkActionDialogOpen(true);
                    }}
                  >
                    Bulk Actions
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetSelections}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            
            {isLoadingMembers ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox 
                          checked={isAllSelected} 
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">Joined</TableHead>
                      <TableHead className="hidden md:table-cell">Custom Roles</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member: any) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedMembers.includes(member.userId)}
                            onCheckedChange={() => toggleMemberSelection(member.userId)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.user?.avatarUrl} />
                              <AvatarFallback>
                                {member.user?.displayName?.charAt(0) || member.user?.username?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {member.user?.displayName || member.user?.username || "Anonymous User"}
                              </div>
                              {member.user?.passportId && (
                                <div className="text-xs text-muted-foreground">
                                  {member.user.passportId}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              member.role === "admin" 
                                ? "default" 
                                : member.role === "moderator" 
                                  ? "secondary" 
                                  : "outline"
                            }
                            className={
                              member.role === "admin"
                                ? "bg-primary text-primary-foreground"
                                : member.role === "moderator"
                                  ? "bg-secondary text-secondary-foreground"
                                  : "text-muted-foreground"
                            }
                          >
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm text-muted-foreground">
                            {formatDate(member.joinedAt)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {member.customRoles?.map((role: any) => (
                              <Badge 
                                key={role.id} 
                                variant="outline" 
                                style={{ 
                                  backgroundColor: `${role.color}20`, 
                                  color: role.color, 
                                  borderColor: role.color 
                                }}
                              >
                                {role.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              {/* Role actions */}
                              {member.role === "member" && (
                                <DropdownMenuItem 
                                  onClick={() => promoteMemberMutation.mutate(member.userId)}
                                  disabled={member.isCreator}
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  Promote to Moderator
                                </DropdownMenuItem>
                              )}
                              
                              {member.role === "moderator" && (
                                <DropdownMenuItem 
                                  onClick={() => demoteMemberMutation.mutate(member.userId)}
                                  disabled={member.isCreator}
                                >
                                  <ChevronDown className="h-4 w-4 mr-2" />
                                  Demote to Member
                                </DropdownMenuItem>
                              )}
                              
                              {/* Custom role actions */}
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Tag className="h-4 w-4 mr-2" />
                                  Assign Custom Role
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    {customRoles.length === 0 ? (
                                      <DropdownMenuItem disabled>
                                        No custom roles
                                      </DropdownMenuItem>
                                    ) : (
                                      customRoles.map((role: any) => {
                                        const hasRole = member.customRoles?.some(
                                          (r: any) => r.id === role.id
                                        );
                                        return (
                                          <DropdownMenuItem
                                            key={role.id}
                                            disabled={hasRole}
                                            onClick={() => {
                                              if (!hasRole) {
                                                assignRoleMutation.mutate({
                                                  userId: member.userId,
                                                  roleId: role.id
                                                });
                                              }
                                            }}
                                          >
                                            <div 
                                              className="h-3 w-3 rounded-full mr-2"
                                              style={{ backgroundColor: role.color }}
                                            />
                                            {role.name}
                                            {hasRole && (
                                              <CheckSquare className="h-4 w-4 ml-2" />
                                            )}
                                          </DropdownMenuItem>
                                        );
                                      })
                                    )}
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                              
                              {member.customRoles?.length > 0 && (
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove Custom Role
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                      {member.customRoles.map((role: any) => (
                                        <DropdownMenuItem
                                          key={role.id}
                                          onClick={() => {
                                            removeRoleMutation.mutate({
                                              userId: member.userId,
                                              roleId: role.id
                                            });
                                          }}
                                        >
                                          <div 
                                            className="h-3 w-3 rounded-full mr-2"
                                            style={{ backgroundColor: role.color }}
                                          />
                                          {role.name}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              {/* Remove from community */}
                              <DropdownMenuItem 
                                onClick={() => removeMemberMutation.mutate(member.userId)}
                                disabled={member.isCreator}
                                className="text-destructive focus:text-destructive"
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Remove from Community
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-lg font-medium mb-2">No members found</p>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  {searchQuery || selectedRoleFilter
                    ? "No members match your current filters. Try adjusting your search or filters."
                    : "This community doesn't have any members yet."}
                </p>
                {(searchQuery || selectedRoleFilter) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRoleFilter(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Roles Tab */}
        <TabsContent value="roles" className="p-0">
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Custom Roles</h3>
              <Button
                variant="default"
                size="sm"
                onClick={() => setAddRoleDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>
            
            {isLoadingRoles ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : customRoles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customRoles.map((role: any) => (
                  <Card key={role.id}>
                    <CardHeader className="py-3 px-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: role.color }}
                          />
                          <h4 className="font-medium">{role.name}</h4>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedRoleForEdit(role);
                              setRoleDialogOpen(true);
                            }}>
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              Delete Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        Assigned to {role.memberCount || 0} members
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-lg font-medium mb-2">No custom roles</p>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  You haven't created any custom roles yet. Custom roles help you organize your community members.
                </p>
                <Button 
                  variant="default" 
                  onClick={() => setAddRoleDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Role
                </Button>
              </div>
            )}
            
            {userRole === 'admin' && (
              <>
                <div className="mt-8 mb-4">
                  <h3 className="text-lg font-medium">Role Permissions</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage what actions each role can perform in the community
                  </p>
                </div>
                
                {isLoadingPermissions ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Permission</TableHead>
                          <TableHead className="w-[100px] text-center">Admin</TableHead>
                          <TableHead className="w-[100px] text-center">Moderator</TableHead>
                          <TableHead className="w-[100px] text-center">Member</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rolesWithPermissions.length > 0 && rolesWithPermissions[0].permissions && 
                          Object.entries(rolesWithPermissions[0].permissions).map(([permission, _]) => {
                            // Convert permission string to readable format
                            const readablePermission = permission
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (l) => l.toUpperCase());
                            
                            return (
                              <TableRow key={permission}>
                                <TableCell>{readablePermission}</TableCell>
                                {rolesWithPermissions.map((role: any) => (
                                  <TableCell key={role.roleName} className="text-center">
                                    <Checkbox 
                                      checked={role.permissions[permission]} 
                                      disabled={role.roleName === 'admin'}
                                      onCheckedChange={(checked) => {
                                        if (role.roleName !== 'admin') {
                                          const updatedPermissions = {
                                            ...role.permissions,
                                            [permission]: !!checked
                                          };
                                          updatePermissionsMutation.mutate({
                                            role: role.roleName,
                                            permissions: updatedPermissions
                                          });
                                        }
                                      }}
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
        
        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="p-0">
          <div className="p-4 border-t">
            <h3 className="text-lg font-medium mb-4">Member Management Activity Logs</h3>
            
            {isLoadingLogs ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : actionLogs.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actionLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {log.actionType.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={log.performedBy?.avatarUrl} />
                              <AvatarFallback>
                                {log.performedBy?.displayName?.charAt(0) || log.performedBy?.username?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {log.performedBy?.displayName || log.performedBy?.username || "Unknown User"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {log.actionType === MemberActionType.PROMOTE && "Promoted user(s) to moderator"}
                            {log.actionType === MemberActionType.DEMOTE && "Demoted user(s) to member"}
                            {log.actionType === MemberActionType.REMOVE && "Removed user(s) from community"}
                            {log.actionType === MemberActionType.ADD_ROLE && 
                              `Added role "${log.actionDetails?.roleName}" to user(s)`}
                            {log.actionType === MemberActionType.REMOVE_ROLE && 
                              `Removed role "${log.actionDetails?.roleName}" from user(s)`}
                            {log.actionType === MemberActionType.CHANGE_PRIMARY_ROLE && 
                              `Updated permissions for role "${log.actionDetails?.role}"`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.targetUserIds?.length} user(s) affected
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-lg font-medium mb-2">No activity logs</p>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  There are no member management activity logs to display yet.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Select an action to perform on {selectedMembers.length} selected members.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <Button
                variant={selectedBulkAction === MemberActionType.PROMOTE ? "default" : "outline"}
                onClick={() => setSelectedBulkAction(MemberActionType.PROMOTE)}
                className="justify-start"
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Promote to Moderator
              </Button>
              
              <Button
                variant={selectedBulkAction === MemberActionType.DEMOTE ? "default" : "outline"}
                onClick={() => setSelectedBulkAction(MemberActionType.DEMOTE)}
                className="justify-start"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Demote to Member
              </Button>
              
              <Button
                variant={selectedBulkAction === MemberActionType.ADD_ROLE ? "default" : "outline"}
                onClick={() => setSelectedBulkAction(MemberActionType.ADD_ROLE)}
                className="justify-start"
              >
                <Tag className="h-4 w-4 mr-2" />
                Assign Custom Role
              </Button>
              
              <Button
                variant={selectedBulkAction === MemberActionType.REMOVE ? "destructive" : "outline"}
                onClick={() => setSelectedBulkAction(MemberActionType.REMOVE)}
                className="justify-start"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Remove from Community
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={executeBulkAction} 
              disabled={!selectedBulkAction || bulkActionMutation.isPending}
            >
              {bulkActionMutation.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Custom Role Dialog */}
      <Dialog open={addRoleDialogOpen} onOpenChange={setAddRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Role</DialogTitle>
            <DialogDescription>
              Create a new custom role for your community members.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  placeholder="e.g., VIP Member"
                  value={newRoleData.name}
                  onChange={(e) => setNewRoleData({ 
                    ...newRoleData, 
                    name: e.target.value 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roleColor">Role Color</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-8 w-8 rounded-full border"
                    style={{ backgroundColor: newRoleData.color }}
                  />
                  <Input
                    id="roleColor"
                    type="color"
                    value={newRoleData.color}
                    onChange={(e) => setNewRoleData({
                      ...newRoleData,
                      color: e.target.value
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createRoleMutation.mutate(newRoleData)}
              disabled={!newRoleData.name || createRoleMutation.isPending}
            >
              {createRoleMutation.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Role Selection Dialog for Bulk Add Role */}
      <Dialog open={selectedBulkAction === MemberActionType.ADD_ROLE && bulkActionDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setBulkActionDialogOpen(false);
          setSelectedBulkAction(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Custom Role</DialogTitle>
            <DialogDescription>
              Choose which custom role to assign to the {selectedMembers.length} selected members.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {isLoadingRoles ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : customRoles.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {customRoles.map((role: any) => (
                  <Button
                    key={role.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => executeBulkAddRole(role.id)}
                  >
                    <div 
                      className="h-4 w-4 rounded-full mr-2"
                      style={{ backgroundColor: role.color }}
                    />
                    {role.name}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  No custom roles available. Create a custom role first.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setBulkActionDialogOpen(false);
              setSelectedBulkAction(null);
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}