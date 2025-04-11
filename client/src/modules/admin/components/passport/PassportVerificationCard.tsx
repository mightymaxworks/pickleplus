/**
 * PKL-278651-ADMIN-0002-UI
 * Passport Verification Dashboard Card
 * 
 * This component provides a dashboard card that links to the passport verification dashboard
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, ClipboardCheck } from 'lucide-react';
import { useLocation } from 'wouter';

export const PassportVerificationCard: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-orange-600" />
          Passport Verification
        </CardTitle>
        <CardDescription>
          Verify passport codes and manage verification logs
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground mb-4">
          Scan QR codes or manually verify passport codes for users and events.
          Access detailed verification logs.
        </p>
        <div className="flex items-center justify-between text-sm mb-1">
          <span>Verification tools:</span>
          <span className="font-semibold">QR & Manual</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>User verification:</span>
          <span className="font-semibold">Instant</span>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-900/20">
        <Button 
          variant="default" 
          className="w-full gap-2"
          onClick={() => navigate('/admin/passport-verification')}
        >
          <ClipboardCheck className="h-4 w-4" />
          Open Verification Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PassportVerificationCard;