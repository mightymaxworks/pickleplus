/**
 * Development-only login component to bypass authentication
 * This component is for development testing only and should not be used in production
 */

import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

export function DevLogin() {
  const { toast } = useToast();
  const { login } = useAuth();
  
  // Test user credentials (using standard test accounts)
  const testUsers = [
    { username: 'admin', password: 'password123', label: 'Admin' },
    { username: 'regular', password: 'password123', label: 'Regular User' },
    { username: 'coach', password: 'password123', label: 'Coach' }
  ];
  
  const handleLogin = async (username: string, password: string) => {
    try {
      await loginAsync({ username, password });
      toast({
        title: 'Development Login',
        description: `Logged in as ${username} successfully.`,
      });
    } catch (error) {
      console.error('Development login failed:', error);
      toast({
        title: 'Login Failed',
        description: 'Could not log in with test credentials. Check console for details.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 bg-slate-800 p-3 rounded-lg shadow-lg">
      <div className="text-xs text-white mb-1">Development Login</div>
      {testUsers.map(user => (
        <Button 
          key={user.username}
          variant="outline"
          size="sm"
          onClick={() => handleLogin(user.username, user.password)}
          className="text-xs py-1"
        >
          {user.label}
        </Button>
      ))}
    </div>
  );
}