/**
 * PKL-278651-BOUNCE-0006-MOBILE - Bounce Mobile Optimization
 * 
 * Mobile-friendly card view for Bounce findings, used as an alternative to the
 * table view on smaller screens.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Check, 
  Info, 
  MoreVertical,
  Copy,
  X,
  Flag
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BounceFindingSeverity, BounceFindingStatus } from '@shared/schema/bounce';
import { cn } from '@/lib/utils';

interface BounceFindingCardProps {
  finding: {
    id: number;
    title: string;
    description: string;
    severity: BounceFindingSeverity;
    status: BounceFindingStatus;
    area?: string;
    component?: string;
    createdAt: string;
    assignedTo?: string;
  };
  onViewDetails: () => void;
  onStatusChange: (status: BounceFindingStatus) => void;
  onAssign: () => void;
}

/**
 * Mobile-optimized card view for a single finding
 */
export const BounceFindingCard: React.FC<BounceFindingCardProps> = ({
  finding,
  onViewDetails,
  onStatusChange,
  onAssign
}) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case BounceFindingStatus.NEW:
        return <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200">New</Badge>;
      case BounceFindingStatus.IN_PROGRESS:
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Progress</Badge>;
      case BounceFindingStatus.FIXED:
        return <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">Fixed</Badge>;
      case BounceFindingStatus.WONT_FIX:
        return <Badge variant="outline" className="bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Won't Fix</Badge>;
      case BounceFindingStatus.DUPLICATE:
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Duplicate</Badge>;
      case BounceFindingStatus.TRIAGE:
        return <Badge variant="outline" className="bg-orange-50 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Triage</Badge>;
      case BounceFindingStatus.CONFIRMED:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Confirmed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card 
      className={cn(
        "mb-4 transition-shadow active:bg-gray-50 dark:active:bg-gray-800",
        "touch-manipulation", // Improves performance on touch devices
        finding.severity === 'critical' ? 'border-l-4 border-l-red-500' : 
        finding.status === BounceFindingStatus.NEW ? 'border-l-4 border-l-red-400' : 
        finding.status === BounceFindingStatus.IN_PROGRESS ? 'border-l-4 border-l-blue-400' : 
        ''
      )}
    >
      {/* Make entire card clickable for details with appropriate styling */}
      <div 
        onClick={onViewDetails} 
        className="tap-highlight-transparent cursor-pointer"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base mb-2 break-words">
                {finding.title}
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {finding.description}
              </div>
            </div>
            {/* Prevent propagation so dropdown clicks don't trigger card click */}
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-11 w-11 rounded-full" // Larger touch target (44x44px)
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={onViewDetails}
                    className="h-11 cursor-pointer flex items-center" // Taller menu items for better touch
                  >
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(BounceFindingStatus.NEW)}
                    className="h-11 cursor-pointer flex items-center"
                  >
                    <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> Mark New
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(BounceFindingStatus.IN_PROGRESS)}
                    className="h-11 cursor-pointer flex items-center"
                  >
                    <AlertTriangle className="h-5 w-5 mr-2 text-blue-500" /> Mark In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(BounceFindingStatus.FIXED)}
                    className="h-11 cursor-pointer flex items-center"
                  >
                    <Check className="h-5 w-5 mr-2 text-green-500" /> Mark Fixed
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(BounceFindingStatus.WONT_FIX)}
                    className="h-11 cursor-pointer flex items-center"
                  >
                    <X className="h-5 w-5 mr-2 text-gray-500" /> Won't Fix
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(BounceFindingStatus.DUPLICATE)}
                    className="h-11 cursor-pointer flex items-center"
                  >
                    <Copy className="h-5 w-5 mr-2 text-purple-500" /> Mark Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onAssign}
                    className="h-11 cursor-pointer flex items-center"
                  >
                    <Flag className="h-5 w-5 mr-2" /> Assign to Me
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
              {getSeverityIcon(finding.severity)}
              <span className="ml-1 capitalize">{finding.severity}</span>
            </div>
            <div className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
              {getStatusBadge(finding.status)}
            </div>
            {finding.area && (
              <div className="text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
                {finding.area}
              </div>
            )}
            <div className="text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
              {formatDate(finding.createdAt)}
            </div>
            {finding.assignedTo && (
              <div className="text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
                Assigned: {finding.assignedTo}
              </div>
            )}
          </div>
        </CardContent>
      </div>
      
      {/* Action buttons outside the clickable area for independent interaction */}
      <div 
        className="flex justify-end px-5 pb-4 pt-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Button 
          variant="ghost" 
          size="default" 
          className="h-11 min-w-[96px]" // Larger touch target
          onClick={onViewDetails}
        >
          View Details
        </Button>
        {!finding.assignedTo && (
          <Button 
            variant="outline" 
            size="default" 
            className="h-11 min-w-[110px] ml-2" // Larger touch target
            onClick={onAssign}
          >
            Assign to Me
          </Button>
        )}
      </div>
    </Card>
  );
};

export default BounceFindingCard;