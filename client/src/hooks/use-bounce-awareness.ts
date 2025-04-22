/**
 * PKL-278651-BOUNCE-0006-AWARE - Bounce Awareness Enhancement
 * 
 * useBounceAwareness - Hook that provides real-time bounce testing status
 * and event listeners for automated testing activity.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import { useState, useEffect } from 'react';
import { bounceStatusService } from '@/lib/services/bounceStatusService';

interface BounceAwarenessState {
  isActive: boolean;
  testingSince: Date | null;
  currentAreas: string[];
  completedTests: number;
  totalIssuesFound: number;
  recentNotifications: { message: string; timestamp: Date }[];
  userAssistanceRequests: {
    id: string;
    area: string;
    task: string;
    timestamp: Date;
    status: 'pending' | 'completed' | 'skipped';
    xpReward: number;
  }[];
}

export function useBounceAwareness() {
  const [state, setState] = useState<BounceAwarenessState>({
    isActive: false,
    testingSince: null,
    currentAreas: [],
    completedTests: 0,
    totalIssuesFound: 0,
    recentNotifications: [],
    userAssistanceRequests: []
  });
  
  // Load initial data and set up listeners
  useEffect(() => {
    const fetchData = async () => {
      try {
        const areas = await bounceStatusService.getCurrentTestingAreas();
        const metrics = await bounceStatusService.getTestingMetrics();
        
        setState(prev => ({
          ...prev,
          isActive: areas.length > 0,
          testingSince: areas.length > 0 ? new Date() : null,
          currentAreas: areas.map(area => area.name),
          totalIssuesFound: metrics?.issuesFound || 0
        }));
      } catch (error) {
        console.error('Error loading bounce awareness data:', error);
      }
    };
    
    fetchData();
    
    // Simulate real-time events 
    // In production, this would be replaced with websocket connections or similar
    const intervalId = setInterval(() => {
      // Simulate a random testing event every so often
      const random = Math.random();
      
      if (random < 0.2) {
        // Simulate a test completion event
        setState(prev => ({
          ...prev,
          completedTests: prev.completedTests + 1,
          recentNotifications: [
            {
              message: `Test completed: ${['Login flow', 'Match recording', 'Tournament bracket'][Math.floor(Math.random() * 3)]}`,
              timestamp: new Date()
            },
            ...prev.recentNotifications.slice(0, 4) // Keep only recent 5
          ]
        }));
      } else if (random < 0.4) {
        // Simulate an issue found event
        setState(prev => ({
          ...prev,
          totalIssuesFound: prev.totalIssuesFound + 1,
          recentNotifications: [
            {
              message: `New issue found: ID-${Math.floor(Math.random() * 1000)}`,
              timestamp: new Date()
            },
            ...prev.recentNotifications.slice(0, 4) // Keep only recent 5
          ]
        }));
      } else if (random < 0.5) {
        // Simulate a user assistance request - this is what we want to demonstrate
        const assistanceAreas = [
          'Tournament Registration',
          'Match Recording',
          'User Profile',
          'Notifications'
        ];
        
        const assistanceTasks = [
          'Please test the tournament registration flow and verify you receive a confirmation email',
          'Can you record a match result and check if stats are updated correctly?',
          'Please update your profile picture and verify it displays correctly',
          'Please check if you receive push notifications when a match is scheduled'
        ];
        
        const randomAreaIndex = Math.floor(Math.random() * assistanceAreas.length);
        
        setState(prev => {
          // Create a new user assistance request
          const newRequest = {
            id: `req-${Date.now()}`,
            area: assistanceAreas[randomAreaIndex],
            task: assistanceTasks[randomAreaIndex],
            timestamp: new Date(),
            status: 'pending' as const,
            xpReward: 15 + Math.floor(Math.random() * 25) // 15-40 XP
          };
          
          return {
            ...prev,
            userAssistanceRequests: [...prev.userAssistanceRequests, newRequest],
            recentNotifications: [
              {
                message: `Bounce needs your help with ${newRequest.area}!`,
                timestamp: new Date()
              },
              ...prev.recentNotifications.slice(0, 4)
            ]
          };
        });
      }
    }, 5000); // Faster interval for demo purposes
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  return {
    ...state,
    // Methods that would trigger actions
    joinTesting: () => {
      // Start a testing session and create the first assistance request immediately
      const assistanceAreas = [
        'Tournament Registration',
        'Match Recording',
        'User Profile',
        'Notifications'
      ];
      
      const assistanceTasks = [
        'Please test the tournament registration flow and verify you receive a confirmation email',
        'Can you record a match result and check if stats are updated correctly?',
        'Please update your profile picture and verify it displays correctly',
        'Please check if you receive push notifications when a match is scheduled'
      ];
      
      const randomAreaIndex = Math.floor(Math.random() * assistanceAreas.length);
      
      const newRequest = {
        id: `req-${Date.now()}`,
        area: assistanceAreas[randomAreaIndex],
        task: assistanceTasks[randomAreaIndex],
        timestamp: new Date(),
        status: 'pending' as const,
        xpReward: 15 + Math.floor(Math.random() * 25) // 15-40 XP
      };
      
      setState(prev => ({
        ...prev,
        isActive: true,
        testingSince: new Date(),
        userAssistanceRequests: [...prev.userAssistanceRequests, newRequest],
        recentNotifications: [
          {
            message: `Bounce needs your help with ${newRequest.area}!`,
            timestamp: new Date()
          },
          ...prev.recentNotifications.slice(0, 4)
        ]
      }));
      
      console.log('Joining testing - would navigate to /admin/bounce');
    },
    dismissNotification: (index: number) => {
      setState(prev => ({
        ...prev,
        recentNotifications: prev.recentNotifications.filter((_, i) => i !== index)
      }));
    },
    // Methods for user assistance requests
    completeAssistanceRequest: (requestId: string) => {
      setState(prev => {
        const updatedRequests = prev.userAssistanceRequests.map(req => 
          req.id === requestId 
            ? { ...req, status: 'completed' as const } 
            : req
        );
        
        // Find the completed request to get XP reward
        const completedRequest = prev.userAssistanceRequests.find(req => req.id === requestId);
        
        return {
          ...prev,
          userAssistanceRequests: updatedRequests,
          recentNotifications: [
            {
              message: `🎉 You earned ${completedRequest?.xpReward || 0} XP for helping with testing!`,
              timestamp: new Date()
            },
            ...prev.recentNotifications.slice(0, 4)
          ]
        };
      });
    },
    skipAssistanceRequest: (requestId: string) => {
      setState(prev => {
        const updatedRequests = prev.userAssistanceRequests.map(req => 
          req.id === requestId 
            ? { ...req, status: 'skipped' as const } 
            : req
        );
        
        return {
          ...prev,
          userAssistanceRequests: updatedRequests
        };
      });
    },
    // Helper method for demo purposes
    triggerAssistanceRequest: () => {
      const assistanceAreas = [
        'Tournament Registration',
        'Match Recording',
        'User Profile',
        'Notifications'
      ];
      
      const assistanceTasks = [
        'Please test the tournament registration flow and verify you receive a confirmation email',
        'Can you record a match result and check if stats are updated correctly?',
        'Please update your profile picture and verify it displays correctly',
        'Please check if you receive push notifications when a match is scheduled'
      ];
      
      const randomAreaIndex = Math.floor(Math.random() * assistanceAreas.length);
      
      setState(prev => {
        const newRequest = {
          id: `req-${Date.now()}`,
          area: assistanceAreas[randomAreaIndex],
          task: assistanceTasks[randomAreaIndex],
          timestamp: new Date(),
          status: 'pending' as const,
          xpReward: 15 + Math.floor(Math.random() * 25) // 15-40 XP
        };
        
        return {
          ...prev,
          userAssistanceRequests: [...prev.userAssistanceRequests, newRequest],
          recentNotifications: [
            {
              message: `Bounce needs your help with ${newRequest.area}!`,
              timestamp: new Date()
            },
            ...prev.recentNotifications.slice(0, 4)
          ]
        };
      });
    }
  };
}