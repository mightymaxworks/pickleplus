/**
 * PKL-278651-BOUNCE-0006-AWARE - Bounce Awareness Enhancement
 * 
 * BounceAssistanceRequest - A component that shows a user assistance request
 * from the Bounce automated testing system and allows the user to interact with it.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Zap, AlertCircle, EyeIcon } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AssistanceRequestProps {
  id: string;
  area: string;
  task: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'skipped';
  xpReward: number;
  onComplete: (id: string, feedback?: string) => void;
  onSkip: (id: string) => void;
}

export const BounceAssistanceRequest = ({
  id,
  area,
  task,
  timestamp,
  status,
  xpReward,
  onComplete,
  onSkip
}: AssistanceRequestProps) => {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Format the timestamp to be more readable
  const formattedTime = timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const handleComplete = () => {
    setSubmitting(true);
    
    // Simulate an API call with a delay
    setTimeout(() => {
      onComplete(id, feedback);
      
      toast({
        title: "Task completed",
        description: `You earned ${xpReward} XP for your contribution!`,
        duration: 5000,
      });
      
      setSubmitting(false);
    }, 1000);
  };

  const handleSkip = () => {
    onSkip(id);
    
    toast({
      title: "Task skipped",
      description: "No problem, we'll find someone else to help with this task.",
      duration: 3000,
    });
  };

  // If the request is already completed or skipped, show a different state
  if (status === 'completed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-4 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-start">
              <CheckCircle className="mr-3 text-green-500 h-5 w-5 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-300">
                  {area} - Completed
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  {task}
                </p>
                <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-500">
                  <Zap className="mr-1 h-3 w-3" />
                  <span>+{xpReward} XP earned at {formattedTime}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (status === 'skipped') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-4 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <CardContent className="p-4">
            <div className="flex items-start">
              <XCircle className="mr-3 text-gray-400 h-5 w-5 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-600 dark:text-gray-400">
                  {area} - Skipped
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {task}
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  Skipped at {formattedTime}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Render the pending request
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <Card className="border-blue-200 dark:border-blue-900 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <AlertCircle className="text-blue-600 dark:text-blue-400 h-5 w-5" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">
                    Bounce Needs Your Help: {area}
                  </h3>
                  <div className="flex items-center text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    <Zap className="mr-1 h-3 w-3" />
                    {xpReward} XP Reward
                  </div>
                </div>
                <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                  {task}
                </p>
                <div className="mt-4">
                  <label 
                    htmlFor={`feedback-${id}`} 
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    When you're done, share what you found (optional)
                  </label>
                  <Textarea
                    id={`feedback-${id}`}
                    placeholder="Describe what you found while testing this feature..."
                    className="w-full h-20 text-sm"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-gray-900/50 p-3 flex justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <EyeIcon className="h-3 w-3 mr-1" />
              Requested at {formattedTime}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSkip}
                disabled={submitting}
              >
                Skip
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleComplete}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Complete Task"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};