/**
 * PKL-278651-ADMIN-0011-DASH
 * Dashboard Grid Component
 * 
 * This component displays a responsive grid of dashboard widgets.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import React from "react";
import { 
  DashboardLayout, 
  DashboardWidgetType,
  DashboardWidget
} from "@shared/schema/admin/dashboard";
import { MetricCard } from "./MetricCard";
import { ChartWidget } from "./ChartWidget";
import { TableWidget } from "./TableWidget";
import { AlertWidget } from "./AlertWidget";
import { ActionCardWidget } from "./ActionCardWidget";

interface DashboardGridProps {
  dashboard: DashboardLayout;
  className?: string;
}

export function DashboardGrid({ dashboard, className = "" }: DashboardGridProps) {
  // Sort widgets by priority
  const sortedWidgets = [...dashboard.widgets].sort((a, b) => a.priority - b.priority);
  
  // Helper function to determine grid span classes based on widget size
  const getGridSpanClass = (widget: DashboardWidget) => {
    const colSpanClasses = {
      1: "col-span-1",
      2: "col-span-2 md:col-span-2",
      3: "col-span-3 md:col-span-3",
      4: "col-span-4 md:col-span-4",
    };
    
    const rowSpanClasses = {
      1: "row-span-1",
      2: "row-span-2",
      3: "row-span-3",
      4: "row-span-4",
    };
    
    return `${colSpanClasses[widget.colSpan as 1|2|3|4]} ${rowSpanClasses[widget.rowSpan as 1|2|3|4]}`;
  };
  
  // Render appropriate widget component based on type
  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.widgetType) {
      case DashboardWidgetType.METRIC_CARD:
        return <MetricCard metric={widget.metric} />;
      
      case DashboardWidgetType.CHART:
        return <ChartWidget widget={widget} />;
      
      case DashboardWidgetType.TABLE:
        return <TableWidget widget={widget} />;
      
      case DashboardWidgetType.ALERT:
        return <AlertWidget widget={widget} />;
      
      case DashboardWidgetType.ACTION_CARD:
        return <ActionCardWidget widget={widget} />;
      
      default:
        return <div>Unknown widget type</div>;
    }
  };
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {sortedWidgets.map((widget) => (
        <div key={widget.id} className={getGridSpanClass(widget)}>
          {renderWidget(widget)}
        </div>
      ))}
    </div>
  );
}