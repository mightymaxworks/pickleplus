/**
 * Temporary Test Page for Passport Development Fallback Data
 */
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { getUserPassportCode, getMyRegisteredEvents } from '@/lib/sdk/eventSDK';

export function TestPassportDataPage() {
  const [passportData, setPassportData] = useState<any>(null);
  const [eventsData, setEventsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test both SDK functions directly
      const passport = await getUserPassportCode();
      const events = await getMyRegisteredEvents();
      
      setPassportData(passport);
      setEventsData(events);
      console.log('Passport data:', passport);
      console.log('Events data:', events);
    } catch (err) {
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StandardLayout>
      <div className="container py-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Test Passport Development Fallback Data</h1>
        
        <Button 
          onClick={fetchData} 
          disabled={loading}
          className="mb-6"
        >
          {loading ? 'Loading...' : 'Test Passport Data'}
        </Button>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}
        
        {passportData && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Passport Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                {JSON.stringify(passportData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
        
        {eventsData && (
          <Card>
            <CardHeader>
              <CardTitle>Registered Events</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                {JSON.stringify(eventsData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </StandardLayout>
  );
}

export default TestPassportDataPage;