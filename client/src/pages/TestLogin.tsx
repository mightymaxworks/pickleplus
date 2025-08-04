import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function TestLogin() {
  const [username, setUsername] = useState('testcoach');
  const [password, setPassword] = useState('testcoach123');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password
        })
      });
      
      if (response.ok) {
        toast({
          title: "Login Successful",
          description: "You are now logged in as Test Coach"
        });
        // Navigate to the test coach profile page
        setLocation('/test-coach-profile');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Test Login</CardTitle>
          <p className="text-muted-foreground text-center">
            Login as test coach to demonstrate inline editing
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="testcoach"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="testcoach123"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login as Test Coach'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Demo Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Click "Login as Test Coach"</li>
              <li>2. You'll be redirected to the coach profile</li>
              <li>3. Click edit icons to modify fields inline</li>
              <li>4. Changes save automatically</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}