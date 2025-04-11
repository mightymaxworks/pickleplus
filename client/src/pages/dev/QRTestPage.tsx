/**
 * QR Code Testing Page - PKL-278651-CONN-0002-QR
 * 
 * This page allows testing of QR code scanning and generation features
 * without affecting the main application. It's only available in development
 * mode or when the QR features are enabled.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { featureFlags } from '@/core/features/featureFlags';
import { enableFeature, disableFeature } from '@/lib/featureFlags';

// Define User interface for TypeScript type safety
interface User {
  id: number;
  username: string;
  passportId?: string;
}

// Sample player data for testing
const SAMPLE_PLAYERS = [
  { id: 1, username: 'MightyMax', passportId: 'PKL-0001-MM7' },
  { id: 2, username: 'PowerPlayer', passportId: 'PKL-0002-PP8' },
  { id: 3, username: 'SpinMaster', passportId: 'PKL-0003-SM9' },
];

// Sample event data for testing
const SAMPLE_EVENTS = [
  { id: 101, name: 'Weekly Mixer', date: '2025-04-15', location: 'Main Courts' },
  { id: 102, name: 'Beginners Tournament', date: '2025-04-20', location: 'North Courts' },
  { id: 103, name: 'Pro Exhibition', date: '2025-04-30', location: 'Championship Court' },
];

export default function QRTestPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('player-qr');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(1);
  const [selectedEventId, setSelectedEventId] = useState<number>(101);
  const [manualQRInput, setManualQRInput] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  
  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/auth/current-user'],
  });

  // Format QR data for player
  const formatPlayerQRData = (playerId: number) => {
    const player = SAMPLE_PLAYERS.find(p => p.id === playerId) || SAMPLE_PLAYERS[0];
    return JSON.stringify({
      type: 'player_profile',
      passportId: player.passportId
    });
  };

  // Format QR data for event
  const formatEventQRData = (eventId: number) => {
    const event = SAMPLE_EVENTS.find(e => e.id === eventId) || SAMPLE_EVENTS[0];
    return JSON.stringify({
      type: 'event_checkin',
      eventId: event.id.toString()
    });
  };

  // Handle manual QR input submission
  const handleManualSubmit = () => {
    if (!manualQRInput) {
      toast({
        title: "Empty input",
        description: "Please enter QR code data",
        variant: "destructive"
      });
      return;
    }

    try {
      // Try to parse the input as JSON
      const parsedData = JSON.parse(manualQRInput);
      handleScanResult(manualQRInput);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "The input must be valid JSON",
        variant: "destructive"
      });
    }
  };

  // Handle QR scan result
  const handleScanResult = (result: string) => {
    setScanResult(result);
    
    try {
      const data = JSON.parse(result);
      
      if (data.type === 'player_profile') {
        toast({
          title: "Player QR Scanned",
          description: `Passport ID: ${data.passportId}`,
        });
      } else if (data.type === 'event_checkin') {
        toast({
          title: "Event Check-in QR Scanned",
          description: `Event ID: ${data.eventId}`,
        });
      } else {
        toast({
          title: "Unknown QR Type",
          description: "The QR code has an unknown type",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Invalid QR Data",
        description: "Could not parse the QR code data",
        variant: "destructive"
      });
    }
  };

  // Feature flag controls
  const toggleFeature = (feature: string) => {
    if (featureFlags.isEnabled(feature)) {
      // We would disable here, but our current system doesn't support this directly
      // Refreshing the page will reset to the default values
      window.location.reload();
    } else {
      enableFeature(feature);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">QR Code Testing Page</h1>
        <div className="text-sm px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
          Development Mode
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Feature Flag Controls</CardTitle>
          <CardDescription>Enable or disable QR code features for testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {['player-qr-scanning', 'quick-match-recording', 'event-check-in'].map(feature => (
              <div key={feature} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{feature}</div>
                  <div className="text-sm text-gray-500">
                    Status: {featureFlags.isEnabled(feature) ? 
                      <span className="text-green-600 font-medium">Enabled</span> : 
                      <span className="text-red-600 font-medium">Disabled</span>}
                  </div>
                </div>
                <Button 
                  variant={featureFlags.isEnabled(feature) ? "destructive" : "default"}
                  size="sm"
                  onClick={() => toggleFeature(feature)}
                >
                  {featureFlags.isEnabled(feature) ? "Disable" : "Enable"}
                </Button>
              </div>
            ))}
            <div className="text-xs text-gray-500 mt-2">
              Note: Changes require a page reload to take effect. Disabled features will revert on page refresh.
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="player-qr">Player QR Codes</TabsTrigger>
          <TabsTrigger value="event-qr">Event QR Codes</TabsTrigger>
          <TabsTrigger value="scanner">Test Scanner</TabsTrigger>
        </TabsList>
        
        <TabsContent value="player-qr">
          <Card>
            <CardHeader>
              <CardTitle>Player QR Code Generator</CardTitle>
              <CardDescription>Generate QR codes for player interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Select Player</label>
                      <select 
                        className="w-full border rounded-md p-2"
                        value={selectedPlayerId}
                        onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
                      >
                        {SAMPLE_PLAYERS.map(player => (
                          <option key={player.id} value={player.id}>
                            {player.username} ({player.passportId})
                          </option>
                        ))}
                        {currentUser && 
                          <option value={currentUser.id}>
                            {currentUser.username} (Current User)
                          </option>
                        }
                      </select>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">QR Code Data:</h3>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                        {formatPlayerQRData(selectedPlayerId)}
                      </pre>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="border-4 border-[#FF5722] rounded-lg p-2 bg-white">
                    <QRCodeSVG 
                      value={formatPlayerQRData(selectedPlayerId)} 
                      size={200} 
                      level="H"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {SAMPLE_PLAYERS.find(p => p.id === selectedPlayerId)?.username || 'Player'} QR Code
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="event-qr">
          <Card>
            <CardHeader>
              <CardTitle>Event QR Code Generator</CardTitle>
              <CardDescription>Generate QR codes for event check-in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Select Event</label>
                      <select 
                        className="w-full border rounded-md p-2"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(Number(e.target.value))}
                      >
                        {SAMPLE_EVENTS.map(event => (
                          <option key={event.id} value={event.id}>
                            {event.name} ({event.date})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">QR Code Data:</h3>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                        {formatEventQRData(selectedEventId)}
                      </pre>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="border-4 border-[#2196F3] rounded-lg p-2 bg-white">
                    <QRCodeSVG 
                      value={formatEventQRData(selectedEventId)} 
                      size={200} 
                      level="H"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {SAMPLE_EVENTS.find(e => e.id === selectedEventId)?.name || 'Event'} QR Code
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scanner">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner Test</CardTitle>
              <CardDescription>
                Test scanning QR codes without camera access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-6 text-center mb-6">
                <h3 className="text-lg font-medium mb-2">Camera Access Unavailable</h3>
                <p className="text-gray-600 mb-4">
                  Camera access is not available in the Replit environment. 
                  You can test scanning by manually entering QR code data below.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Enter QR Code Data (JSON String):
                  </label>
                  <textarea
                    className="w-full border rounded-md p-2 min-h-[100px]"
                    value={manualQRInput}
                    onChange={(e) => setManualQRInput(e.target.value)}
                    placeholder={'{\n  "type": "player_profile",\n  "passportId": "PKL-0001-MM7"\n}'}
                  />
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={handleManualSubmit}>
                    Process QR Data
                  </Button>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium mb-1">Use Sample Data:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setManualQRInput(formatPlayerQRData(1))}
                    >
                      Player QR Sample
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setManualQRInput(formatEventQRData(101))}
                    >
                      Event QR Sample
                    </Button>
                  </div>
                </div>
                
                {scanResult && (
                  <div className="mt-6 p-4 border rounded-md">
                    <h3 className="text-sm font-medium mb-1">Last Scan Result:</h3>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                      {scanResult}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}