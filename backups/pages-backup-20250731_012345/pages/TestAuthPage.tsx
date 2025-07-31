import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function TestAuthPage() {
  const [, navigate] = useLocation();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Test Auth Page</h1>
        <p className="mb-4 text-gray-600">
          This is a simple test page to verify routing is working correctly.
        </p>
        <div className="flex flex-col gap-4">
          <Button 
            className="w-full"
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
          <Button 
            className="w-full"
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}