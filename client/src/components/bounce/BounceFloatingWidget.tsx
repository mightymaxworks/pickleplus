/**
 * PKL-278651-BOUNCE-0008-ASSIST - Bounce Assistance Request Enhancement
 * 
 * BounceFloatingWidget - A floating widget that provides access to Bounce testing
 * features without cluttering the main interface. Expands to show tasks and
 * can be minimized to a small button.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, ChevronUp, ChevronDown, Zap, TrendingUp, Bell } from 'lucide-react';
import { useGuidedTask } from '@/contexts/BounceGuidedTaskContext';
import { useBounceAwareness } from '@/hooks/use-bounce-awareness';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { BounceGuidedTask } from './BounceGuidedTask';

interface BounceFloatingWidgetProps {
  className?: string;
}

export const BounceFloatingWidget: React.FC<BounceFloatingWidgetProps> = ({
  className = ''
}) => {
  const { 
    isTestingModeActive, 
    setTestingMode,
    tasks,
    isFloatingWidgetVisible,
    setFloatingWidgetVisibility,
    activeTaskId,
    setActiveTask
  } = useGuidedTask();
  
  const { 
    isActive: isBounceActive,
    recentNotifications,
    dismissNotification,
    userAssistanceRequests
  } = useBounceAwareness();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'notifications'>('tasks');
  
  // Effect to show widget when Bounce becomes active
  useEffect(() => {
    if (isBounceActive && !isFloatingWidgetVisible) {
      setFloatingWidgetVisibility(true);
    }
  }, [isBounceActive, isFloatingWidgetVisible, setFloatingWidgetVisibility]);
  
  // Count of pending tasks
  const pendingTasksCount = tasks.length;
  
  // Count of notifications
  const notificationsCount = recentNotifications.length;
  
  // Handlers
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  const toggleTestingMode = () => {
    setTestingMode(!isTestingModeActive);
  };
  
  const closeWidget = () => {
    setFloatingWidgetVisibility(false);
  };
  
  // If widget is not visible, don't render anything
  if (!isFloatingWidgetVisible) {
    return null;
  }
  
  // Collapsed state - just show the button
  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center bg-blue-600 hover:bg-blue-700 relative"
                onClick={toggleExpanded}
              >
                <Bot className="h-6 w-6 text-white" />
                {(pendingTasksCount > 0 || notificationsCount > 0) && (
                  <Badge 
                    className="absolute -top-2 -right-2 bg-red-500 text-white"
                    variant="destructive"
                  >
                    {pendingTasksCount + notificationsCount}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Bounce Testing Assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    );
  }
  
  // Expanded state - show the widget with tasks and notifications
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`fixed bottom-4 right-4 z-50 ${className}`}
    >
      <Card className="w-80 sm:w-96 shadow-xl border-blue-200 dark:border-blue-900 overflow-hidden">
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/50 w-8 h-8 flex items-center justify-center rounded-full mr-2">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-md font-medium text-blue-700 dark:text-blue-300">
                Bounce Assistant
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 rounded-full"
                onClick={toggleExpanded}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={closeWidget}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <div className="px-3">
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 rounded-none ${
                activeTab === 'tasks' 
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Tasks
              {pendingTasksCount > 0 && (
                <Badge 
                  className="ml-1 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                  variant="outline"
                >
                  {pendingTasksCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 rounded-none ${
                activeTab === 'notifications' 
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="h-4 w-4 mr-1" />
              Notifications
              {notificationsCount > 0 && (
                <Badge 
                  className="ml-1 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                  variant="outline"
                >
                  {notificationsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
        
        <CardContent className="p-3 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div 
                        key={task.id}
                        className={`cursor-pointer rounded-lg p-3 transition-colors ${
                          activeTaskId === task.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/30'
                        }`}
                        onClick={() => setActiveTask(activeTaskId === task.id ? null : task.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">
                            {task.title}
                          </div>
                          <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                            <Zap className="h-3 w-3 mr-1" />
                            {task.totalXpReward} XP
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {task.description}
                        </div>
                        
                        {activeTaskId === task.id && (
                          <BounceGuidedTask taskId={task.id} />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                      <Bot className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">No Active Tasks</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                      Bounce will notify you when it needs assistance with testing a specific feature.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {recentNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {recentNotifications.map((notification, index) => (
                      <div 
                        key={index}
                        className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/20"
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <div className="text-sm">{notification.message}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {notification.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-6 w-6 p-0"
                            onClick={() => dismissNotification(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                      <Bell className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">No Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                      You'll receive notifications here when Bounce has updates or needs your assistance.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        <CardFooter className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 p-3 flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-1 ${
              isTestingModeActive 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-gray-400'
            }`} />
            Testing Mode: {isTestingModeActive ? 'Active' : 'Inactive'}
          </div>
          <Button
            size="sm"
            variant={isTestingModeActive ? "destructive" : "default"}
            onClick={toggleTestingMode}
            className="text-xs px-3 h-7"
          >
            {isTestingModeActive ? 'Deactivate' : 'Activate'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};