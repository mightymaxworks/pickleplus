/**
 * PKL-278651-COMM-0028-NOTIF - Test Notification Button
 * Implementation timestamp: 2025-04-19 17:15 ET
 * 
 * Test button to generate sample notifications
 * 
 * Framework 5.2 compliant implementation
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface TestNotificationButtonProps {
  className?: string;
}

export function TestNotificationButton({ className }: TestNotificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const generateTestNotifications = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiRequest('POST', '/api/notifications/generate-test');
      const data = await response.json();
      
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
      
      toast({
        title: 'Test Notifications Generated',
        description: `Successfully created ${data.notifications.length} test notifications`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error generating test notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate test notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generateTestNotifications}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Bell className="h-4 w-4 mr-2" />
      )}
      Generate Test Notifications
    </Button>
  );
}