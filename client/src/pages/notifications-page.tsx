/**
 * PKL-278651-COMM-0028-NOTIF - Notifications Page Component
 * Implementation timestamp: 2025-04-20 07:30 ET
 * 
 * Page component for displaying all user notifications with filtering options
 * 
 * Framework 5.2 compliant implementation
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notificationsSDK, UserNotification } from '@/lib/sdk/notificationsSDK';
import { useLocation } from 'wouter';
import { format, formatDistanceToNow } from 'date-fns';
import { queryClient } from '@/lib/queryClient';
import { TestNotificationButton } from '@/components/notifications/TestNotificationButton';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  Loader2, 
  Bell, 
  CheckCircle, 
  Calendar, 
  MessageSquare, 
  User, 
  Users, 
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Home
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NotificationsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const pageSize = 10;
  
  // Get unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    queryFn: notificationsSDK.getUnreadCount,
  });
  
  const unreadCount = unreadCountData?.count || 0;
  
  // Get notifications with pagination and filtering
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['/api/notifications', { 
      limit: pageSize, 
      offset: (currentPage - 1) * pageSize,
      filterType,
      includeRead: activeTab !== 'unread'
    }],
    queryFn: () => notificationsSDK.getNotifications({ 
      limit: pageSize, 
      offset: (currentPage - 1) * pageSize,
      filterType,
      includeRead: activeTab !== 'unread'
    }),
  });
  
  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationsSDK.markAsRead,
    onSuccess: () => {
      refetchAllData();
    }
  });
  
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsSDK.markAllAsRead,
    onSuccess: () => {
      refetchAllData();
      toast({
        title: "All notifications marked as read",
        variant: "default",
      });
    }
  });
  
  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationsSDK.deleteNotification,
    onSuccess: () => {
      refetchAllData();
      toast({
        title: "Notification deleted",
        variant: "default",
      });
    }
  });
  
  // Clear all notifications mutation
  const clearAllNotificationsMutation = useMutation({
    mutationFn: notificationsSDK.clearAllNotifications,
    onSuccess: () => {
      refetchAllData();
      toast({
        title: "All notifications cleared",
        variant: "default",
      });
    }
  });
  
  // Helper function to refetch all notification data
  const refetchAllData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: UserNotification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // First try to use the direct link if available
    if (notification.link) {
      navigate(notification.link);
    }
    // Fallback to reference-based navigation if link is not available
    else if (notification.referenceType === 'community' && notification.referenceId) {
      navigate(`/communities/${notification.referenceId}`);
    } else if (notification.referenceType === 'post' && notification.referenceId && notification.communityId) {
      navigate(`/communities/${notification.communityId}/posts/${notification.referenceId}`);
    } else if (notification.referenceType === 'event' && notification.referenceId && notification.communityId) {
      navigate(`/communities/${notification.communityId}/events/${notification.referenceId}`);
    } else {
      // Default to dashboard if no specific navigation target
      navigate('/dashboard');
    }
  };
  
  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'community_invite':
      case 'community_join_approved':
      case 'community_announcement':
        return <Users className="h-5 w-5 text-indigo-500" />;
      case 'event_reminder':
      case 'event_canceled':
      case 'event_updated':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'post_mention':
      case 'post_reply':
      case 'post_like':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'member_role_change':
        return <User className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && 
                   date.getMonth() === now.getMonth() && 
                   date.getFullYear() === now.getFullYear();
    
    return isToday 
      ? formatDistanceToNow(date, { addSuffix: true })
      : format(date, 'MMM d, yyyy • h:mm a');
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };
  
  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilterType(value === 'all' ? undefined : value);
    setCurrentPage(1);
  };
  
  // Group notifications by date
  const groupNotificationsByDate = (notifs: UserNotification[] | undefined) => {
    if (!notifs) return {};
    
    const groups: {[key: string]: UserNotification[]} = {
      'Today': [],
      'This Week': [],
      'Earlier': []
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    notifs.forEach(notif => {
      const createdDate = new Date(notif.createdAt);
      
      if (createdDate >= today) {
        groups['Today'].push(notif);
      } else if (createdDate >= weekAgo) {
        groups['This Week'].push(notif);
      } else {
        groups['Earlier'].push(notif);
      }
    });
    
    // Only return groups that have notifications
    return Object.fromEntries(
      Object.entries(groups).filter(([_, notifications]) => notifications.length > 0)
    );
  };
  
  // Get priority color for notification type
  const getNotificationPriorityColor = (type: string): string => {
    const priorityMap: {[key: string]: string} = {
      'community_announcement': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'event_reminder': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'community_invite': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'post_mention': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'post_reply': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'default': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };
    
    return priorityMap[type] || priorityMap['default'];
  };
  
  // Group notifications
  const groupedNotifications = groupNotificationsByDate(notifications);
  
  // Calculate total pages - this is a simplified calculation since we don't have a total count
  const totalPages = Math.max(1, Math.ceil((notifications?.length || 0) / pageSize));
  
  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">
                <Home className="h-4 w-4 mr-1" />
                <span>Dashboard</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Notifications</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <PageHeader 
            title="Notifications" 
            description="View and manage your notifications"
          />
          
          <div className="flex items-center">
            <TestNotificationButton />
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">
                All
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Enhanced filter UI with visual indicators */}
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground mb-1 ml-1">Filter by type</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge 
                  variant={filterType === undefined ? "secondary" : "outline"}
                  className="cursor-pointer hover:bg-secondary/80 whitespace-nowrap"
                  onClick={() => handleFilterChange('all')}
                >
                  All types
                </Badge>
                <Badge 
                  variant={filterType === 'community_invite' ? "secondary" : "outline"}
                  className={`cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 whitespace-nowrap ${
                    filterType === 'community_invite' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : ''
                  }`}
                  onClick={() => handleFilterChange('community_invite')}
                >
                  Invites
                </Badge>
                <Badge 
                  variant={filterType === 'community_announcement' ? "secondary" : "outline"}
                  className={`cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 whitespace-nowrap ${
                    filterType === 'community_announcement' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''
                  }`}
                  onClick={() => handleFilterChange('community_announcement')}
                >
                  Announcements
                </Badge>
                <Badge 
                  variant={filterType === 'event_reminder' ? "secondary" : "outline"}
                  className={`cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 whitespace-nowrap ${
                    filterType === 'event_reminder' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''
                  }`}
                  onClick={() => handleFilterChange('event_reminder')}
                >
                  Events
                </Badge>
                <Badge 
                  variant={filterType === 'post_mention' ? "secondary" : "outline"}
                  className={`cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 whitespace-nowrap ${
                    filterType === 'post_mention' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : ''
                  }`}
                  onClick={() => handleFilterChange('post_mention')}
                >
                  Mentions
                </Badge>
                <Badge 
                  variant={filterType === 'post_reply' ? "secondary" : "outline"}
                  className={`cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 whitespace-nowrap ${
                    filterType === 'post_reply' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''
                  }`}
                  onClick={() => handleFilterChange('post_reply')}
                >
                  Replies
                </Badge>
              </div>
            </div>
            
            {/* For mobile, keep the dropdown too */}
            <div className="md:hidden">
              <Select onValueChange={handleFilterChange} defaultValue="all">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="community_invite">Community Invites</SelectItem>
                  <SelectItem value="community_join_approved">Join Approvals</SelectItem>
                  <SelectItem value="community_announcement">Announcements</SelectItem>
                  <SelectItem value="event_reminder">Event Reminders</SelectItem>
                  <SelectItem value="post_mention">Mentions</SelectItem>
                  <SelectItem value="post_reply">Replies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Mark all as read
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')) {
                  clearAllNotificationsMutation.mutate();
                }
              }}
              disabled={clearAllNotificationsMutation.isPending}
            >
              {clearAllNotificationsMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear all
            </Button>
          </div>
        </div>
        
        {/* Notifications List */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
                <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your notifications center is empty</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                {activeTab === 'unread' 
                  ? "You're all caught up! You've read all your notifications." 
                  : "You don't have any notifications yet. When you receive notifications, they'll appear here."}
              </p>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg max-w-sm mx-auto text-left mt-6">
                <h4 className="font-medium flex items-center text-blue-800 dark:text-blue-300 mb-2">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Pro tip
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Stay engaged with your community by participating in discussions and events to receive updates and notifications.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Render notifications grouped by date */}
              {Object.entries(groupedNotifications).map(([timeGroup, notificationGroup]) => (
                <div key={timeGroup}>
                  <div className="mb-3 border-b pb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">{timeGroup}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {notificationGroup.map((notification) => (
                      <Card 
                        key={notification.id} 
                        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 p-2 rounded-full ${getNotificationPriorityColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div 
                            className="flex-1 min-w-0"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <div className="font-medium flex items-center">
                                {notification.title}
                                {/* Category badge */}
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {notification.type.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </div>
                            </div>
                            <p className="text-sm mt-1">{notification.message}</p>
                            
                            <div className="flex items-center gap-2 mt-2">
                              {!notification.isRead && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsReadMutation.mutate(notification.id);
                                  }}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Mark as read
                                </Button>
                              )}
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Are you sure you want to delete this notification?')) {
                                    deleteNotificationMutation.mutate(notification.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}