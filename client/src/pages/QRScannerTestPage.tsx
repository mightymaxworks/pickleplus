/**
 * QR Scanner Test Page
 * Tests the unified QR scanner implementation
 */
import { useState } from 'react';
import { UnifiedQRScanner } from '@/components/UnifiedQRScanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, ArrowLeft, CheckCircle, User, Trophy, Calendar } from "lucide-react";
import { useLocation } from "wouter";

export default function QRScannerTestPage() {
  const [, navigate] = useLocation();
  const [scanResults, setScanResults] = useState<string[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  const handleScanSuccess = (data: string) => {
    console.log("Scanned data:", data);
    
    // Add to results
    setScanResults(prev => [data, ...prev.slice(0, 4)]); // Keep last 5 results
    
    // Parse different types of QR codes
    let scanType = 'unknown';
    let displayData = data;
    
    if (data.includes('PICKLE+ID:') || data.includes('passport')) {
      scanType = 'player';
      displayData = `Player Passport: ${data}`;
    } else if (data.includes('/match/') || data.includes('MATCH-')) {
      scanType = 'match';
      displayData = `Match Code: ${data}`;
    } else if (data.includes('/tournament/') || data.includes('TOURN-')) {
      scanType = 'tournament';
      displayData = `Tournament: ${data}`;
    } else if (data.includes('/event/')) {
      scanType = 'event';
      displayData = `Event: ${data}`;
    }
    
    // Show success notification
    console.log(`Successfully scanned ${scanType}:`, displayData);
  };

  const getScanTypeIcon = (data: string) => {
    if (data.includes('PICKLE+ID:') || data.includes('passport')) {
      return <User className="h-4 w-4" />;
    } else if (data.includes('/match/') || data.includes('MATCH-')) {
      return <QrCode className="h-4 w-4" />;
    } else if (data.includes('/tournament/') || data.includes('TOURN-')) {
      return <Trophy className="h-4 w-4" />;
    } else if (data.includes('/event/')) {
      return <Calendar className="h-4 w-4" />;
    }
    return <QrCode className="h-4 w-4" />;
  };

  const getScanTypeBadge = (data: string) => {
    if (data.includes('PICKLE+ID:') || data.includes('passport')) {
      return <Badge variant="default">Player</Badge>;
    } else if (data.includes('/match/') || data.includes('MATCH-')) {
      return <Badge variant="secondary">Match</Badge>;
    } else if (data.includes('/tournament/') || data.includes('TOURN-')) {
      return <Badge variant="outline">Tournament</Badge>;
    } else if (data.includes('/event/')) {
      return <Badge variant="destructive">Event</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">QR Scanner Test</h1>
          <p className="text-muted-foreground">
            Test the unified QR scanner functionality
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scanner Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Scanner</h2>
            <Button
              onClick={() => setShowScanner(!showScanner)}
              variant={showScanner ? "destructive" : "default"}
            >
              {showScanner ? "Hide Scanner" : "Show Scanner"}
            </Button>
          </div>

          {showScanner && (
            <UnifiedQRScanner
              onScanSuccess={handleScanSuccess}
              onClose={() => setShowScanner(false)}
              title="Pickle+ QR Scanner"
              description="Scan player passports, match codes, tournaments, or events"
              scanTypes={['player', 'match', 'tournament', 'event']}
            />
          )}

          {!showScanner && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Click "Show Scanner" to test QR scanning
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Scan Results</h2>
            {scanResults.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScanResults([])}
              >
                Clear Results
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {scanResults.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No scans yet
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              scanResults.map((result, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getScanTypeIcon(result)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getScanTypeBadge(result)}
                          {index === 0 && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Latest
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm break-all">{result}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Test QR Codes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test QR Codes</CardTitle>
          <CardDescription>
            Use these sample QR codes to test the scanner functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center space-y-2">
              <div className="p-4 border rounded-lg">
                <QrCode className="h-12 w-12 mx-auto text-blue-600" />
              </div>
              <Badge variant="default">Player Passport</Badge>
              <p className="text-xs text-muted-foreground">
                PICKLE+ID:MX8K7P2N
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="p-4 border rounded-lg">
                <QrCode className="h-12 w-12 mx-auto text-green-600" />
              </div>
              <Badge variant="secondary">Match Code</Badge>
              <p className="text-xs text-muted-foreground">
                MATCH-1234
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="p-4 border rounded-lg">
                <QrCode className="h-12 w-12 mx-auto text-purple-600" />
              </div>
              <Badge variant="outline">Tournament</Badge>
              <p className="text-xs text-muted-foreground">
                TOURN-5678
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="p-4 border rounded-lg">
                <QrCode className="h-12 w-12 mx-auto text-orange-600" />
              </div>
              <Badge variant="destructive">Event</Badge>
              <p className="text-xs text-muted-foreground">
                EVENT-9012
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}