/**
 * PKL-278651-MATCH-0003-DS: Match Identifier Component
 * This component handles QR code generation and scanning for match identification
 */
import { useRef, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, QrCode, Scan, Clipboard, Check } from "lucide-react";

interface MatchIdentifierProps {
  matchId?: number;
  matchCode?: string;
  onMatchIdentified: (matchId: number) => void;
  generationMode?: boolean;
}

/**
 * MatchIdentifier component
 * 
 * In generation mode: Creates and displays a QR code for a match
 * In scanning mode: Allows scanning of QR codes or manual entry of match codes
 */
export function MatchIdentifier({
  matchId,
  matchCode,
  onMatchIdentified,
  generationMode = false
}: MatchIdentifierProps) {
  const [activeTab, setActiveTab] = useState<'qrcode' | 'manual'>('qrcode');
  const [manualCode, setManualCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [scannerStarted, setScannerStarted] = useState(false);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<any>(null);

  // Generate a unique match code if not provided
  const uniqueMatchCode = matchCode || `MATCH-${matchId || Math.floor(Math.random() * 9000) + 1000}`;

  // QR Code content (URL for the match or just the code)
  const qrCodeContent = `https://pickle.plus/match/${matchId || uniqueMatchCode}`;

  // Start the QR scanner when the component mounts and the tab is 'qrcode'
  useEffect(() => {
    if (!generationMode && activeTab === 'qrcode' && !scannerStarted && scannerContainerRef.current) {
      setScannerStarted(true);
      
      try {
        scannerInstanceRef.current = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
          }, 
          false
        );
        
        scannerInstanceRef.current.render(
          (decodedText: string) => {
            console.log("QR Code scanned:", decodedText);
            
            // Extract match ID from the scanned URL or code
            let scannedMatchId: number | null = null;
            
            if (decodedText.includes('/match/')) {
              // Extract match ID from URL pattern
              const matchPattern = /\/match\/(\d+)/;
              const matches = decodedText.match(matchPattern);
              if (matches && matches[1]) {
                scannedMatchId = parseInt(matches[1], 10);
              }
            } else if (decodedText.startsWith('MATCH-')) {
              // Extract match ID from code pattern
              const codePattern = /MATCH-(\d+)/;
              const matches = decodedText.match(codePattern);
              if (matches && matches[1]) {
                scannedMatchId = parseInt(matches[1], 10);
              }
            } else if (!isNaN(parseInt(decodedText, 10))) {
              // Try to parse as a direct match ID
              scannedMatchId = parseInt(decodedText, 10);
            }
            
            if (scannedMatchId) {
              // Clean up scanner
              if (scannerInstanceRef.current) {
                scannerInstanceRef.current.clear();
              }
              
              // Notify parent component of the identified match
              onMatchIdentified(scannedMatchId);
              
              toast({
                title: "Match Identified",
                description: `Successfully identified match #${scannedMatchId}`,
              });
            } else {
              toast({
                title: "Invalid QR Code",
                description: "The scanned QR code doesn't contain valid match information.",
                variant: "destructive",
              });
            }
          },
          (errorMessage: string) => {
            console.error("QR Code scanner error:", errorMessage);
          }
        );
      } catch (error) {
        console.error("Error initializing QR scanner:", error);
        toast({
          title: "Scanner Error",
          description: "Failed to initialize the QR code scanner. Please try the manual code entry.",
          variant: "destructive",
        });
        setActiveTab('manual');
      }
    }
    
    // Clean up on unmount
    return () => {
      if (scannerInstanceRef.current) {
        try {
          scannerInstanceRef.current.clear();
        } catch (error) {
          console.error("Error cleaning up scanner:", error);
        }
      }
    };
  }, [generationMode, activeTab, scannerStarted, onMatchIdentified]);

  // Handle manual code submission
  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      toast({
        title: "Missing Code",
        description: "Please enter a match code.",
        variant: "destructive",
      });
      return;
    }
    
    // Extract match ID from manual code
    let matchId: number | null = null;
    
    if (manualCode.startsWith('MATCH-')) {
      const codePattern = /MATCH-(\d+)/;
      const matches = manualCode.match(codePattern);
      if (matches && matches[1]) {
        matchId = parseInt(matches[1], 10);
      }
    } else if (!isNaN(parseInt(manualCode, 10))) {
      matchId = parseInt(manualCode, 10);
    }
    
    if (matchId) {
      onMatchIdentified(matchId);
      toast({
        title: "Match Identified",
        description: `Successfully identified match #${matchId}`,
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "The entered code isn't a valid match code.",
        variant: "destructive",
      });
    }
  };

  // Copy match code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(uniqueMatchCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Code Copied",
      description: "Match code copied to clipboard.",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode size={18} />
          {generationMode ? "Match Identifier" : "Scan Match Code"}
        </CardTitle>
        <CardDescription>
          {generationMode 
            ? "Share this code with match recorders" 
            : "Scan the match QR code or enter the code manually"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {generationMode ? (
          // QR Code generation mode
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-3 rounded-md">
              <QRCode 
                value={qrCodeContent} 
                size={200} 
                bgColor={"#FFFFFF"} 
                fgColor={"#000000"} 
                ecLevel={"H"}
              />
            </div>
            
            <div className="flex items-center gap-2 bg-muted p-2 rounded-md w-full">
              <code className="text-sm flex-1 text-center font-mono">
                {uniqueMatchCode}
              </code>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copyToClipboard} 
                className="h-8 w-8"
              >
                {copied ? <Check size={16} /> : <Clipboard size={16} />}
              </Button>
            </div>
          </div>
        ) : (
          // QR Code scanning mode
          <Tabs 
            defaultValue="qrcode" 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as 'qrcode' | 'manual')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qrcode" className="flex items-center gap-1">
                <Scan size={14} />
                Scan QR
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-1">
                <Clipboard size={14} />
                Enter Code
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="qrcode" className="mt-4">
              <div 
                id="qr-reader" 
                ref={scannerContainerRef} 
                className="w-full max-w-md mx-auto"
              ></div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Point your camera at the match QR code
              </p>
            </TabsContent>
            
            <TabsContent value="manual" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="match-code">Match Code</Label>
                <div className="flex gap-2">
                  <Input 
                    id="match-code" 
                    placeholder="MATCH-1234" 
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                  />
                  <Button onClick={handleManualSubmit}>Submit</Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle size={14} />
                <span>
                  Enter the match code from the match organizer or player
                </span>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      {generationMode && (
        <CardFooter className="text-xs text-muted-foreground text-center">
          Share this QR code or match code with others who need to record statistics for this match
        </CardFooter>
      )}
    </Card>
  );
}