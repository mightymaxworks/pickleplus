import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, User, QrCode, Keyboard, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface StudentInfo {
  id: number;
  displayName: string;
  username: string;
  passportCode: string;
  rankingPoints: number;
  profilePicture?: string;
}

interface CoachStudentScannerProps {
  onStudentFound: (student: StudentInfo) => void;
  onClose: () => void;
}

export function CoachStudentScanner({ onStudentFound, onClose }: CoachStudentScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [foundStudent, setFoundStudent] = useState<StudentInfo | null>(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerId = 'coach-student-qr-scanner';

  // Find student by passport code mutation
  const findStudentMutation = useMutation({
    mutationFn: async (passportCode: string) => {
      const response = await fetch(`/api/coach/find-student-by-passport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ passportCode })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to find student');
      }

      return response.json();
    },
    onSuccess: (student: StudentInfo) => {
      setFoundStudent(student);
      toast({
        title: 'Student Found!',
        description: `Found ${student.displayName} (${student.passportCode})`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Student Not Found',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Request connection mutation
  const requestConnectionMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const response = await fetch('/api/coach/request-student-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ studentId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request connection');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Connection Requested!',
        description: 'Student will receive your connection request.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/student-requests'] });
      onStudentFound(foundStudent!);
    },
    onError: (error: Error) => {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Initialize QR scanner
  const startScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }

    try {
      scannerRef.current = new Html5QrcodeScanner(
        scannerContainerId,
        {
          fps: 10,
          qrbox: {
            width: window.innerWidth < 480 ? 200 : 250,
            height: window.innerWidth < 480 ? 200 : 250,
          },
          rememberLastUsedCamera: true,
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        // Success callback
        (decodedText: string) => {
          console.log('QR Code scanned:', decodedText);
          
          // Extract passport code from QR data
          let passportCode = decodedText;
          try {
            // Handle URL format: website.com/profile/user?code=ABC123
            if (decodedText.includes('http')) {
              const url = new URL(decodedText);
              passportCode = url.searchParams.get('code') || 
                           url.pathname.split('/').pop() || decodedText;
            }
            // Handle JSON format: {"passportCode": "ABC123", ...}
            else if (decodedText.startsWith('{')) {
              const data = JSON.parse(decodedText);
              passportCode = data.passportCode || data.code || decodedText;
            }
          } catch (e) {
            console.warn('Could not parse QR code format, using raw text');
          }

          findStudentMutation.mutate(passportCode);
          stopScanner();
        },
        // Error callback
        (errorMessage: string) => {
          // Ignore routine scanning errors
          if (!errorMessage.includes('No QR code found')) {
            console.error('QR Scanner error:', errorMessage);
          }
        }
      );

      setIsScanning(true);
      setScannerStarted(true);
    } catch (error) {
      console.error('Failed to start scanner:', error);
      toast({
        title: 'Scanner Error',
        description: 'Unable to access camera. Please check permissions or use manual entry.',
        variant: 'destructive',
      });
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
        setScannerStarted(false);
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
  };

  // Manual code search
  const handleManualSearch = () => {
    if (!manualCode.trim()) {
      toast({
        title: 'Enter Passport Code',
        description: 'Please enter a student passport code to search.',
        variant: 'destructive',
      });
      return;
    }
    findStudentMutation.mutate(manualCode.trim().toUpperCase());
  };

  // Connect to student
  const handleConnect = () => {
    if (foundStudent) {
      requestConnectionMutation.mutate(foundStudent.id);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Find Student
            </CardTitle>
            <CardDescription>
              Scan student QR code or enter passport code to connect
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {foundStudent ? (
          // Student found - show connection option
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Student found! You can now request a coaching connection.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{foundStudent.displayName}</div>
                <div className="text-sm text-gray-600">
                  @{foundStudent.username} • {foundStudent.passportCode}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {foundStudent.rankingPoints} points
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleConnect}
                className="flex-1"
                disabled={requestConnectionMutation.isPending}
              >
                {requestConnectionMutation.isPending ? 'Requesting...' : 'Request Connection'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setFoundStudent(null)}
              >
                Search Again
              </Button>
            </div>
          </div>
        ) : (
          // Search interface
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">
                <Camera className="w-4 h-4 mr-2" />
                Scan QR
              </TabsTrigger>
              <TabsTrigger value="manual">
                <Keyboard className="w-4 h-4 mr-2" />
                Enter Code
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="scan" className="space-y-4">
              {!isScanning ? (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                    <Camera className="w-10 h-10 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium">Ready to Scan</div>
                    <div className="text-sm text-gray-600">
                      Point camera at student's QR code
                    </div>
                  </div>
                  <Button onClick={startScanner} className="w-full">
                    Start Camera
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div id={scannerContainerId} className="w-full" />
                  <Button 
                    variant="outline" 
                    onClick={stopScanner} 
                    className="w-full"
                  >
                    Stop Scanner
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passport-code">Student Passport Code</Label>
                <Input
                  id="passport-code"
                  placeholder="e.g., HVGN0BW0"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleManualSearch();
                    }
                  }}
                />
                <div className="text-xs text-gray-600">
                  Enter the 8-character code from student's passport
                </div>
              </div>
              
              <Button 
                onClick={handleManualSearch}
                className="w-full"
                disabled={findStudentMutation.isPending}
              >
                {findStudentMutation.isPending ? 'Searching...' : 'Find Student'}
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {findStudentMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Student not found. Please check the passport code and try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}