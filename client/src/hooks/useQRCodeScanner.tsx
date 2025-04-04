import { useState, useCallback } from "react";
import type { QRScanResult } from "@/types";

export function useQRCodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScanning = useCallback(async () => {
    setError(null);
    setScanResult(null);
    
    try {
      // Check camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Cleanup stream since we just needed to check permissions
      stream.getTracks().forEach(track => track.stop());
      
      setHasCameraPermission(true);
      setIsScanning(true);
    } catch (err) {
      setHasCameraPermission(false);
      setError("Camera permission denied or camera not available.");
      console.error(err);
    }
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  const handleScan = useCallback((data: string | null) => {
    if (data) {
      try {
        if (data.startsWith("PicklePlus:Tournament:")) {
          const tournamentId = parseInt(data.split(":")[2], 10);
          setScanResult({
            type: "tournament-check-in",
            data,
            tournamentId
          });
        } else if (data.startsWith("PicklePlus:")) {
          const playerId = parseInt(data.split(":")[1], 10);
          setScanResult({
            type: "player-connect",
            data,
            playerId
          });
        } else {
          setScanResult({
            type: "unknown",
            data
          });
        }
        setIsScanning(false);
      } catch (error) {
        console.error("Error parsing QR code:", error);
        setScanResult({
          type: "unknown",
          data
        });
        setIsScanning(false);
      }
    }
  }, []);

  const resetScanner = useCallback(() => {
    setIsScanning(false);
    setScanResult(null);
    setError(null);
  }, []);

  return {
    isScanning,
    scanResult,
    hasCameraPermission,
    error,
    startScanning,
    stopScanning,
    handleScan,
    resetScanner
  };
}
