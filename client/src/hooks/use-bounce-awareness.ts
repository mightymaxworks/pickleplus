/**
 * PKL-278651-BOUNCE-0008-ASSIST - Bounce Assistance Request Enhancement
 * 
 * useBounceAwareness - Custom hook for interacting with Bounce testing system.
 * Facilitates communication between user and the testing system.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import { useState, useEffect } from 'react';
import { TaskUpdateMessage } from '@/types/bounce';
import { useToast } from '@/hooks/use-toast';

// Define types for notifications and assistance requests
interface BounceNotification {
  id: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

interface AssistanceRequest {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  status: 'pending' | 'completed' | 'skipped';
}

// Sample notifications (for demo purposes)
const SAMPLE_NOTIFICATIONS: BounceNotification[] = [
  {
    id: '1',
    message: 'Welcome to Bounce Testing Mode! Help us improve Pickle+ by completing test tasks.',
    timestamp: new Date(),
    type: 'info',
    read: false,
  },
  {
    id: '2',
    message: 'New test task available: Verify match recording form on different devices.',
    timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
    type: 'info',
    read: false,
  },
];

// Sample assistance requests (for demo purposes)
const SAMPLE_ASSISTANCE_REQUESTS: AssistanceRequest[] = [
  {
    id: 'ar1',
    title: 'Verify Profile Picture Upload',
    description: 'Please navigate to your profile and test the profile picture upload functionality.',
    priority: 'medium',
    createdAt: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
    status: 'pending',
  },
  {
    id: 'ar2',
    title: 'Test Match Recording Flow',
    description: 'Record a test match and verify all form fields work correctly.',
    priority: 'high',
    createdAt: new Date(Date.now() - 1 * 60 * 60000), // 1 hour ago
    status: 'pending',
  },
];

/**
 * Custom hook for Bounce testing system awareness
 */
export function useBounceAwareness() {
  // State
  const [isActive, setIsActive] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<BounceNotification[]>([]);
  const [userAssistanceRequests, setUserAssistanceRequests] = useState<AssistanceRequest[]>([]);
  const { toast } = useToast();
  
  // Initialize with sample data (in a real implementation, this would fetch from an API)
  useEffect(() => {
    if (isActive) {
      // In a real implementation, fetch notifications from API
      setRecentNotifications(SAMPLE_NOTIFICATIONS);
      setUserAssistanceRequests(SAMPLE_ASSISTANCE_REQUESTS);
    }
  }, [isActive]);
  
  // Join the testing program
  const joinTesting = () => {
    setIsActive(true);
    
    // In a real implementation, this would call an API
    console.log('[Bounce] User joined testing program');
    
    // Show welcome notification
    toast({
      title: 'Testing Mode Activated',
      description: "Thank you for helping test Pickle+! You'll receive notifications for test tasks.",
      duration: 5000,
    });
  };
  
  // Dismiss a notification
  const dismissNotification = (index: number) => {
    setRecentNotifications(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };
  
  // Complete an assistance request
  const completeAssistanceRequest = (requestId: string) => {
    setUserAssistanceRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'completed' as const } 
          : req
      )
    );
    
    // In a real implementation, this would call an API
    console.log(`[Bounce] Completed assistance request: ${requestId}`);
    
    // Show completion toast
    toast({
      title: 'Task Completed',
      description: 'Thank you for your help! Your feedback has been recorded.',
      duration: 3000,
    });
  };
  
  // Skip an assistance request
  const skipAssistanceRequest = (requestId: string) => {
    setUserAssistanceRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'skipped' as const } 
          : req
      )
    );
    
    // In a real implementation, this would call an API
    console.log(`[Bounce] Skipped assistance request: ${requestId}`);
  };
  
  // Trigger a new assistance request (for demo purposes)
  const triggerAssistanceRequest = () => {
    const newRequest: AssistanceRequest = {
      id: `ar${Date.now()}`,
      title: 'Test Community Comments',
      description: 'Please navigate to any community post and test the comment functionality.',
      priority: 'medium',
      createdAt: new Date(),
      status: 'pending',
    };
    
    setUserAssistanceRequests(prev => [...prev, newRequest]);
    
    // Show notification
    const newNotification: BounceNotification = {
      id: `notif${Date.now()}`,
      message: `New assistance request: ${newRequest.title}`,
      timestamp: new Date(),
      type: 'info',
      read: false,
    };
    
    setRecentNotifications(prev => [newNotification, ...prev]);
    
    // Show toast
    toast({
      title: 'New Test Task',
      description: newRequest.title,
      duration: 5000,
    });
  };
  
  // Send task update to the Bounce system
  const sendTaskUpdate = (message: TaskUpdateMessage) => {
    // In a real implementation, this would send to an API
    console.log('[Bounce] Task update:', message);
    
    // If the task is completed, award XP and show toast
    if (message.status === 'completed') {
      toast({
        title: 'Task Step Completed',
        description: 'Great job! Keep up the good work.',
        duration: 3000,
      });
    }
  };
  
  return {
    isActive,
    recentNotifications,
    userAssistanceRequests,
    joinTesting,
    dismissNotification,
    completeAssistanceRequest,
    skipAssistanceRequest,
    triggerAssistanceRequest,
    sendTaskUpdate,
  };
}