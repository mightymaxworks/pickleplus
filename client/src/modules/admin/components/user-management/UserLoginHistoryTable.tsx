/**
 * PKL-278651-ADMIN-0015-USER
 * User Login History Table
 * 
 * This component displays a table of user login history
 */

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MapPin, Monitor, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { UserLoginHistory } from '@shared/types/admin/user-management';

interface UserLoginHistoryTableProps {
  loginHistory: UserLoginHistory[];
}

export function UserLoginHistoryTable({ loginHistory }: UserLoginHistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      {loginHistory.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date/Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Device</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loginHistory.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatDateTime(entry.timestamp)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {entry.success ? (
                    <Badge variant="success" className="gap-1 px-2 py-0.5">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Success</span>
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1 px-2 py-0.5">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Failed</span>
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {entry.ipAddress || '—'}
                </TableCell>
                <TableCell>
                  {entry.location ? (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{entry.location}</span>
                    </div>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  {entry.device ? (
                    <div className="flex items-center gap-1">
                      <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{entry.device}</span>
                    </div>
                  ) : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No login history recorded for this user.
        </div>
      )}
    </div>
  );
}