/**
 * PKL-278651-COMM-0014-UI
 * Date Range Picker Hook
 * 
 * This custom hook handles the DateRange type compatibility issues with the Calendar component.
 */

import { useState, useCallback } from "react";
import { DateRange } from "react-day-picker";

export interface SimpleDateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export function useDateRangePicker(initialRange?: SimpleDateRange) {
  const [dateRange, setDateRange] = useState<SimpleDateRange>(
    initialRange || { from: undefined, to: undefined }
  );

  // This handler works with both DateRange and undefined from react-day-picker
  const handleRangeChange = useCallback((range: DateRange | undefined) => {
    if (range) {
      setDateRange({
        from: range.from,
        to: range.to
      });
      return { from: range.from, to: range.to };
    } else {
      setDateRange({ from: undefined, to: undefined });
      return { from: undefined, to: undefined };
    }
  }, []);

  return {
    dateRange,
    setDateRange,
    handleRangeChange
  };
}