/**
 * PKL-278651-ADMIN-0015-USER
 * User Login History Table Component
 * 
 * Displays the login history for a user account
 */

import { UserLoginHistory } from '../../../../shared/types/admin/user-management';
import { formatDistance, format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Check, X, Info, Smartphone, Monitor, Laptop } from 'lucide-react';

interface UserLoginHistoryTableProps {
  loginHistory: UserLoginHistory[];
}

export const UserLoginHistoryTable = ({ loginHistory }: UserLoginHistoryTableProps) => {
  // Detect device type from user agent
  const getDeviceType = (userAgent?: string): { icon: JSX.Element; name: string } => {
    if (!userAgent) {
      return { icon: <Info className="h-4 w-4" />, name: 'Unknown' };
    }
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('iphone') || ua.includes('android') && ua.includes('mobile')) {
      return { icon: <Smartphone className="h-4 w-4" />, name: 'Mobile' };
    } else if (ua.includes('ipad') || ua.includes('android') && !ua.includes('mobile')) {
      return { icon: <Tablet className="h-4 w-4" />, name: 'Tablet' };
    } else if (ua.includes('macintosh') || ua.includes('mac os')) {
      return { icon: <Laptop className="h-4 w-4" />, name: 'Mac' };
    } else if (ua.includes('windows')) {
      return { icon: <Monitor className="h-4 w-4" />, name: 'Windows' };
    } else if (ua.includes('linux')) {
      return { icon: <Monitor className="h-4 w-4" />, name: 'Linux' };
    }
    
    return { icon: <Monitor className="h-4 w-4" />, name: 'Desktop' };
  };
  
  // Format the device info
  const getDeviceInfo = (loginEntry: UserLoginHistory) => {
    if (loginEntry.deviceInfo) {
      try {
        const deviceInfo = JSON.parse(loginEntry.deviceInfo);
        return deviceInfo.name || 'Unknown Device';
      } catch {
        return loginEntry.deviceInfo;
      }
    }
    
    // If no device info, try to extract from user agent
    if (loginEntry.userAgent) {
      return getDeviceType(loginEntry.userAgent).name;
    }
    
    return 'Unknown Device';
  };
  
  if (loginHistory.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No login history available for this user.</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>IP Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loginHistory.map((entry) => {
            const deviceType = getDeviceType(entry.userAgent);
            
            return (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{format(new Date(entry.loginAt), 'MMM d, yyyy')}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.loginAt), 'h:mm a')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({formatDistance(new Date(entry.loginAt), new Date(), { addSuffix: true })})
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  {entry.success ? (
                    <Badge variant="success" className="gap-1">
                      <Check className="h-3 w-3" />
                      Successful
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <X className="h-3 w-3" />
                      Failed
                    </Badge>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1">
                    {deviceType.icon}
                    <span>{getDeviceInfo(entry)}</span>
                  </div>
                  {entry.userAgent && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 ml-1 inline cursor-help text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm" align="start">
                          <p className="text-xs font-mono break-all">{entry.userAgent}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
                
                <TableCell>
                  {entry.ipAddress || 'Unknown'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

// Tablet icon component
const Tablet = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <line x1="12" x2="12.01" y1="18" y2="18" />
  </svg>
);