/**
 * PKL-278651-COMM-0028-NOTIF - Notifications Page Component
 * Implementation timestamp: 2025-04-19 15:00 ET
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
import { LayoutContainer } from '@/components/layout/LayoutContainer';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
  AlertTriangle 
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
    
    // Navigate based on notification type
    if (notification.referenceType === 'community' && notification.referenceId) {
      navigate(`/communities/${notification.referenceId}`);
    } else if (notification.referenceType === 'post' && notification.referenceId && notification.communityId) {
      navigate(`/communities/${notification.communityId}/posts/${notification.referenceId}`);
    } else if (notification.referenceType === 'event' && notification.referenceId && notification.communityId) {
      navigate(`/communities/${notification.communityId}/events/${notification.referenceId}`);
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
  
  // Calculate total pages - this is a simplified calculation since we don't have a total count
  const totalPages = Math.max(1, Math.ceil((notifications?.length || 0) / pageSize));
  
  return (
    <div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 mb-4" 
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </Button>
      
      <LayoutContainer maxWidth="lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageHeader 
            title="Notifications" 
            description="View and manage your notifications"
          />
          
          <div className="flex items-center">
            <TestNotificationButton />
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            <Select onValueChange={handleFilterChange} defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
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
        
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {activeTab === 'unread' 
                  ? "You've read all your notifications." 
                  : "You don't have any notifications yet."}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div 
                      className="flex-1 min-w-0"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="font-medium">{notification.title}</div>
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
      </LayoutContainer>
    </div>
  );
}