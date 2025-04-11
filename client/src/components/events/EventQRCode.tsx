/**
 * PKL-278651-CONN-0003-EVENT - PicklePass™ System
 * Component for displaying an event QR code that can be scanned for check-in
 */

import React, { useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event } from '@shared/schema/events';
import { formatDate } from '@/lib/utils';

// Helper function to safely format dates
const safeFormatDate = (dateString: any, options: any = {}) => {
  try {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date TBD';
    return formatDate(date, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date TBD';
  }
};

interface EventQRCodeProps {
  event: Event;
  size?: number;
  includeDetails?: boolean;
  className?: string;
}

export function EventQRCode({ 
  event, 
  size = 200, 
  includeDetails = true,
  className = ''
}: EventQRCodeProps) {
  // Generate a QR code payload with event ID and basic info
  const qrPayload = useMemo(() => {
    return JSON.stringify({
      type: 'pickle-pass',
      eventId: event.id,
      name: event.name,
      timestamp: new Date().toISOString()
    });
  }, [event]);

  if (!event) return null;

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{event.name}</CardTitle>
        {includeDetails && (
          <CardDescription>
            {safeFormatDate(event.startDateTime)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-0">
        <div className="bg-white p-2 rounded-lg">
          <QRCodeCanvas
            value={qrPayload}
            size={size}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: '/assets/pickle-logo.png',
              height: size * 0.15,
              width: size * 0.15,
              excavate: true
            }}
          />
        </div>
        {includeDetails && (
          <div className="mt-2 text-center">
            <p className="text-sm text-muted-foreground">
              Use PicklePass™ to check in to this event
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {event.location || 'Location not specified'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EventQRCode;