/**
 * PKL-278651-BOUNCE-0006-MOBILE - Bounce Mobile Optimization
 * Enhanced pagination component for mobile-responsive view
 * 
 * This is a separate implementation of the pagination component
 * that handles data display in a mobile responsive manner.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const MobilePagination: React.FC<MobilePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) return null;
  
  const goToPage = (newPage: number) => {
    // Keep page within valid range
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    onPageChange(validPage);
  };
  
  const goToFirstPage = () => goToPage(1);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToLastPage = () => goToPage(totalPages);
  
  return (
    <div className={`flex items-center justify-between py-4 px-2 ${className}`}>
      <div className="flex-1 text-sm text-muted-foreground">
        Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{" "}
        <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
        <span className="font-medium">{totalItems}</span> findings
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          className="hidden sm:flex h-8 w-8 p-0 min-w-[2rem]"
          aria-label="Go to first page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0 min-w-[2rem]"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1 mx-2">
          <span className="text-sm font-medium">
            {currentPage}
          </span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">
            {totalPages}
          </span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0 min-w-[2rem]"
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={goToLastPage}
          disabled={currentPage >= totalPages}
          className="hidden sm:flex h-8 w-8 p-0 min-w-[2rem]"
          aria-label="Go to last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MobilePagination;