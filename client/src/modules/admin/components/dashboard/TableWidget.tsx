/**
 * PKL-278651-ADMIN-0011-DASH
 * Table Widget Component
 * 
 * This component displays a table widget for the admin dashboard.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableWidget as TableWidgetType } from "@shared/schema/admin/dashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowUpDown } from "lucide-react";
import { useLocation } from "wouter";

interface TableWidgetProps {
  widget: TableWidgetType;
}

export function TableWidget({ widget }: TableWidgetProps) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [, navigate] = useLocation();
  
  // Function to handle column sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      // If already sorting by this column, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new sort column and default to ascending
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };
  
  // Sort the rows if a sort column is selected
  const sortedRows = React.useMemo(() => {
    if (!sortColumn) return widget.tableData.rows;
    
    return [...widget.tableData.rows].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];
      
      if (valueA === valueB) return 0;
      
      // Handle different data types
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }
      
      // Default string comparison
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      
      if (sortDirection === "asc") {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  }, [widget.tableData.rows, sortColumn, sortDirection]);
  
  // Handle row click for navigation
  const handleRowClick = (row: Record<string, any>) => {
    // If row has an id and the widget has a category, navigate to appropriate detail page
    if (row.id && widget.category) {
      const basePath = `/admin/${widget.category.toLowerCase()}`;
      navigate(`${basePath}/${row.id}`);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {widget.tableData.columns.map((column) => (
                <TableHead key={column.key}>
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 p-0 h-auto font-medium"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.title}
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  ) : (
                    column.title
                  )}
                </TableHead>
              ))}
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row, i) => (
              <TableRow 
                key={`row-${i}`}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(row)}
              >
                {widget.tableData.columns.map((column, colIndex) => (
                  <TableCell key={`row-${i}-col-${colIndex}`}>
                    {String(row[column.key] || "")}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
            {sortedRows.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={widget.tableData.columns.length + 1} 
                  className="text-center py-4 text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {widget.tableData.totalCount !== undefined && widget.tableData.totalCount > sortedRows.length && (
          <div className="flex justify-center p-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (widget.category) {
                  navigate(`/admin/${widget.category.toLowerCase()}`);
                }
              }}
            >
              View All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}