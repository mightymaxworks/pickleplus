/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Passport Verification Mobile View
 * 
 * This component provides a mobile-optimized version of the passport verification interface.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Search, Check, X, User } from 'lucide-react';

/**
 * Mobile-optimized passport verification component
 */
export default function PassportVerificationMobile() {
  const [passportCode, setPassportCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<'success' | 'error' | null>(null);
  
  const handleVerify = () => {
    // Simulate verification process for demo
    if (passportCode.length === 7) {
      setVerificationResult('success');
    } else {
      setVerificationResult('error');
    }
  };

  const handleClear = () => {
    setPassportCode('');
    setVerificationResult(null);
  };
  
  return (
    <div className="container mx-auto px-3 py-4">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-xl font-bold tracking-tight">Passport Verification</h1>
        <p className="text-sm text-muted-foreground">
          Verify PicklePass™ passport codes
        </p>
      </div>
      
      {/* Main verification card */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Verify Passport</CardTitle>
          <CardDescription>Enter or scan passport code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Verification form */}
            <div className="space-y-2">
              <Label htmlFor="passport-code">Passport Code</Label>
              <div className="flex gap-2">
                <Input 
                  id="passport-code"
                  placeholder="Enter 7-digit code"
                  value={passportCode}
                  onChange={(e) => setPassportCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" className="shrink-0">
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={handleVerify}
                disabled={!passportCode}
              >
                <Search className="h-4 w-4 mr-2" />
                Verify
              </Button>
              
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
            
            {/* Verification result */}
            {verificationResult && (
              <Card className={
                verificationResult === 'success' 
                  ? "border-green-500 bg-green-50/50 dark:bg-green-900/20"
                  : "border-red-500 bg-red-50/50 dark:bg-red-900/20"
              }>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      verificationResult === 'success' 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {verificationResult === 'success' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium">
                        {verificationResult === 'success' ? 'Valid Passport' : 'Invalid Passport'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {verificationResult === 'success' 
                          ? 'Passport code is valid and active' 
                          : 'Passport code not recognized'}
                      </p>
                    </div>
                  </div>
                  
                  {verificationResult === 'success' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">John Smith</h4>
                          <p className="text-sm text-muted-foreground">Issued: April 1, 2025</p>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4" size="sm">
                        View Full Profile
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent verifications - simplified for mobile */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Verifications</CardTitle>
          <CardDescription>Last 3 passport checks</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Sample verification history items */}
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium truncate">ABC1234</p>
                  <span className="text-xs text-muted-foreground">5m ago</span>
                </div>
                <p className="text-xs text-muted-foreground">Sarah Johnson</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium truncate">XYZ7890</p>
                  <span className="text-xs text-muted-foreground">17m ago</span>
                </div>
                <p className="text-xs text-muted-foreground">Michael Chang</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center">
                <X className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium truncate">QWE5678</p>
                  <span className="text-xs text-muted-foreground">26m ago</span>
                </div>
                <p className="text-xs text-muted-foreground">Invalid code</p>
              </div>
            </div>
          </div>
          
          <Button className="w-full mt-3" variant="outline" size="sm">
            View All Verifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}