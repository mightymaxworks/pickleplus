/**
 * PKL-278651-PERF-0001.5-SIZE
 * Optimized Data Grid Component
 * 
 * This component demonstrates optimized rendering of large datasets
 * using virtualization and progressive loading techniques.
 */

import { useState, useEffect, useRef, ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import { deviceCapabilities } from '@/utils/assetOptimizer';
import { dynamicImport, deferImport } from '@/utils/bundleOptimizer';

type SortDirection = 'asc' | 'desc' | undefined;

interface OptimizedDataGridProps<T extends Record<string, any>> {
  data: T[];
  columns: Array<{
    accessor: keyof T;
    header: ReactNode;
    cell?: (item: T) => ReactNode;
    width?: number;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
  }>;
  rowHeight?: number;
  className?: string;
  headerClassName?: string;
  rowClassName?: (row: T, index: number) => string;
  emptyMessage?: ReactNode;
  loading?: boolean;
  loadingRows?: number;
  onRowClick?: (row: T, index: number) => void;
  defaultSort?: { column: keyof T; direction: SortDirection };
  onSortChange?: (column: keyof T, direction: SortDirection) => void;
}

/**
 * A high-performance data grid component that:
 * - Uses virtualization for large datasets
 * - Supports dynamic column sizing
 * - Provides progressive loading and sorting
 * - Optimizes rendering based on device capabilities
 */
export function OptimizedDataGrid<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 48,
  className,
  headerClassName,
  rowClassName,
  emptyMessage = 'No data to display',
  loading = false,
  loadingRows = 10,
  onRowClick,
  defaultSort,
  onSortChange
}: OptimizedDataGridProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | undefined>(defaultSort?.column);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Determine if we should use high-performance mode
  const useHighPerformance = deviceCapabilities.isHighPerformance;
  
  // Create virtualized rows for better performance with large datasets
  const rowVirtualizer = useVirtualizer({
    count: loading ? loadingRows : data.length || 0,
    getScrollElement: () => containerRef.current,
    estimateSize: () => rowHeight,
    overscan: useHighPerformance ? 10 : 5, // More overscan on high-performance devices
  });
  
  // Handle sorting
  const handleSort = (column: keyof T) => {
    if (!columns.find(col => col.accessor === column)?.sortable) return;
    
    let newDirection: SortDirection;
    
    if (sortColumn === column) {
      // Cycle through sort directions: asc -> desc -> undefined
      if (sortDirection === 'asc') newDirection = 'desc';
      else if (sortDirection === 'desc') newDirection = undefined;
      else newDirection = 'asc';
    } else {
      // New column, start with ascending
      newDirection = 'asc';
    }
    
    setSortColumn(newDirection ? column : undefined);
    setSortDirection(newDirection);
    
    if (onSortChange) {
      onSortChange(column, newDirection);
    }
  };
  
  // Get sorted and virtualized data
  let processedData = [...data];
  
  // Sort data if needed
  if (sortColumn && sortDirection) {
    processedData.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  // Calculate total content height
  const totalHeight = rowVirtualizer.getTotalSize();
  
  // Deferred loading of export functionality
  const [exportFunctions, setExportFunctions] = useState<{ 
    exportToCsv?: (data: any[]) => void;
    exportToExcel?: (data: any[]) => void;
  }>({});
  
  useEffect(() => {
    // Only load export functionality when user is likely to need it
    deferImport(async () => {
      try {
        const [exportToCsv, exportToExcel] = await Promise.all([
          dynamicImport<(data: any[]) => void>(() => import('@/utils/exportUtils').then(mod => ({ default: mod.exportToCsv }))),
          dynamicImport<(data: any[]) => void>(() => import('@/utils/exportUtils').then(mod => ({ default: mod.exportToExcel })))
        ]);
        
        setExportFunctions({ exportToCsv, exportToExcel });
      } catch (error) {
        console.error('Failed to load export functions:', error);
      }
    });
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent, row: T, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onRowClick?.(row, index);
    }
  };
  
  return (
    <div className={cn("relative flex flex-col overflow-hidden rounded-md border", className)}>
      {/* Header */}
      <div className={cn("flex border-b bg-muted/40", headerClassName)}>
        {columns.map((column, index) => (
          <div 
            key={String(column.accessor)}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium",
              column.sortable && "cursor-pointer select-none",
              column.align === 'center' && "justify-center text-center",
              column.align === 'right' && "justify-end text-right"
            )}
            style={{ width: column.width ? `${column.width}px` : `${100 / columns.length}%` }}
            onClick={() => column.sortable && handleSort(column.accessor)}
            role={column.sortable ? "button" : undefined}
            tabIndex={column.sortable ? 0 : undefined}
          >
            <span>{column.header}</span>
            
            {/* Sort indicator */}
            {column.sortable && sortColumn === column.accessor && (
              <span className="ml-1">
                {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : ''}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* Virtualized rows */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        style={{ height: '100%' }}
      >
        {!loading && data.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div
            className="relative w-full"
            style={{ height: `${totalHeight}px` }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const isLoaderRow = loading || virtualRow.index >= data.length;
              const row = isLoaderRow ? {} as T : processedData[virtualRow.index];
              
              return (
                <div
                  key={virtualRow.index}
                  className={cn(
                    "absolute left-0 top-0 flex w-full border-b",
                    isLoaderRow ? "animate-pulse bg-muted/20" : "hover:bg-accent/30",
                    onRowClick && !isLoaderRow && "cursor-pointer",
                    rowClassName && !isLoaderRow ? rowClassName(row, virtualRow.index) : ""
                  )}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onClick={() => !isLoaderRow && onRowClick?.(row, virtualRow.index)}
                  onKeyDown={(e) => !isLoaderRow && handleKeyDown(e, row, virtualRow.index)}
                  role={onRowClick && !isLoaderRow ? "button" : undefined}
                  tabIndex={onRowClick && !isLoaderRow ? 0 : undefined}
                >
                  {columns.map((column) => (
                    <div
                      key={String(column.accessor)}
                      className={cn(
                        "flex items-center overflow-hidden text-ellipsis px-4 py-2",
                        column.align === 'center' && "justify-center text-center",
                        column.align === 'right' && "justify-end text-right"
                      )}
                      style={{ width: column.width ? `${column.width}px` : `${100 / columns.length}%` }}
                    >
                      {isLoaderRow ? (
                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                      ) : column.cell ? (
                        column.cell(row)
                      ) : (
                        <span>{String(row[column.accessor] ?? '')}</span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OptimizedDataGrid;