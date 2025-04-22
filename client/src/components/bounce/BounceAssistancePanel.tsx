/**
 * PKL-278651-BOUNCE-0006-AWARE - Bounce Awareness Enhancement
 * 
 * BounceAssistancePanel - A demonstration component that shows user assistance requests
 * from the Bounce automated testing system for demonstration purposes.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, HelpCircle } from 'lucide-react';
import { useBounceAwareness } from '@/hooks/use-bounce-awareness';
import { BounceAssistanceRequest } from './BounceAssistanceRequest';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BounceAssistancePanelProps {
  className?: string;
}

export const BounceAssistancePanel = ({ 
  className = '' 
}: BounceAssistancePanelProps) => {
  const { 
    isActive, 
    userAssistanceRequests = [], 
    triggerAssistanceRequest,
    completeAssistanceRequest,
    skipAssistanceRequest
  } = useBounceAwareness();

  // Only show the panel if bounce is active or if there are assistance requests
  if (!isActive && userAssistanceRequests.length === 0) {
    return null;
  }

  // For demonstration purposes only - this creates a clear visualization
  const pendingRequests = userAssistanceRequests.filter(req => req.status === 'pending');
  const completedRequests = userAssistanceRequests.filter(req => req.status === 'completed');
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.5 }}
      className={`mb-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium flex items-center">
          <Bot className="mr-2 h-5 w-5 text-blue-600" />
          <span>Bounce Assistance Requests</span>
          {pendingRequests.length > 0 && (
            <div className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs py-0.5 px-2 rounded-full">
              {pendingRequests.length} pending
            </div>
          )}
        </h3>
        
        {/* Demo controls - only for demonstration purposes */}
        <div className="flex items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mr-3 flex items-center">
            <Zap className="mr-1 h-4 w-4 text-yellow-500" />
            <span>Total XP earned: {completedRequests.reduce((total, req) => total + req.xpReward, 0)}</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={triggerAssistanceRequest}
          >
            <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
            Request Help (Demo)
          </Button>
        </div>
      </div>
      
      {/* Pending requests */}
      {pendingRequests.length > 0 ? (
        <div className="space-y-3">
          {pendingRequests.map(request => (
            <BounceAssistanceRequest
              key={request.id}
              id={request.id}
              area={request.area}
              task={request.task}
              timestamp={request.timestamp}
              status={request.status}
              xpReward={request.xpReward}
              onComplete={completeAssistanceRequest}
              onSkip={skipAssistanceRequest}
            />
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center border-dashed border-2 border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Bot className="h-8 w-8 text-gray-400" />
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300">No Active Requests</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1">
                Bounce will notify you when it needs assistance with testing a specific feature.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={triggerAssistanceRequest}
              className="mt-2"
            >
              Trigger Demo Request
            </Button>
          </div>
        </Card>
      )}
      
      {/* Completed requests - limited to 2 most recent for space */}
      {completedRequests.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Recently Completed ({completedRequests.length})
          </h4>
          <div className="space-y-2">
            {completedRequests.slice(0, 2).map(request => (
              <BounceAssistanceRequest
                key={request.id}
                id={request.id}
                area={request.area}
                task={request.task}
                timestamp={request.timestamp}
                status={request.status}
                xpReward={request.xpReward}
                onComplete={completeAssistanceRequest}
                onSkip={skipAssistanceRequest}
              />
            ))}
            {completedRequests.length > 2 && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                + {completedRequests.length - 2} more completed requests
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};