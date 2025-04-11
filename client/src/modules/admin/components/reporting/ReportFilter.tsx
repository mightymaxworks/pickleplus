/**
 * PKL-278651-ADMIN-0010-REPORT
 * Report Filter Component
 * 
 * This component provides filtering controls for the reports
 */

import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, RefreshCw } from "lucide-react";
import { ReportTimePeriod } from "@shared/schema/admin/reports";
import { useState } from "react";

interface ReportFilterProps {
  timePeriod: ReportTimePeriod;
  onFilterChange: (timePeriod: ReportTimePeriod) => void;
}

export function ReportFilter({ timePeriod, onFilterChange }: ReportFilterProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const handleTimePeriodChange = (value: string) => {
    onFilterChange(value as ReportTimePeriod);
  };
  
  const handleRefresh = () => {
    // This would refresh the data
    console.log("Refreshing data...");
  };
  
  const handleExport = () => {
    // This would trigger an export
    console.log("Exporting data...");
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Time Period</span>
              <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ReportTimePeriod.DAY}>Day</SelectItem>
                  <SelectItem value={ReportTimePeriod.WEEK}>Week</SelectItem>
                  <SelectItem value={ReportTimePeriod.MONTH}>Month</SelectItem>
                  <SelectItem value={ReportTimePeriod.QUARTER}>Quarter</SelectItem>
                  <SelectItem value={ReportTimePeriod.YEAR}>Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Date Range</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[200px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}