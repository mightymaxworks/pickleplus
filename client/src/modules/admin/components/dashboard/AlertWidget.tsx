/**
 * PKL-278651-ADMIN-0011-DASH
 * Alert Widget Component
 * 
 * This component displays an alert widget for the admin dashboard.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertWidget as AlertWidgetType, DashboardAlertType } from "@shared/schema/admin/dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertWidgetProps {
  widget: AlertWidgetType;
}

export function AlertWidget({ widget }: AlertWidgetProps) {
  const [dismissed, setDismissed] = useState(false);
  const [, navigate] = useLocation();
  
  if (dismissed && widget.dismissible) {
    return null;
  }
  
  // Get the appropriate alert icon and variant based on alert type
  const getAlertConfig = () => {
    switch (widget.alertType) {
      case DashboardAlertType.ERROR:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          variant: "destructive" as const
        };
      case DashboardAlertType.WARNING:
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          variant: "warning" as const
        };
      case DashboardAlertType.SUCCESS:
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          variant: "success" as const
        };
      case DashboardAlertType.INFO:
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          variant: "info" as const
        };
    }
  };
  
  const { icon, variant } = getAlertConfig();
  
  // Handle action click (if action link is provided)
  const handleActionClick = () => {
    if (widget.actionLink) {
      navigate(widget.actionLink);
    }
  };
  
  return (
    <Card>
      <CardContent className="p-0">
        <Alert 
          // Custom variants will be handled with className
          variant={variant === "destructive" ? "destructive" : "default"}
          className={`rounded-none border-0 ${
            variant === "info" ? "bg-blue-500/10 text-blue-700 dark:text-blue-300" :
            variant === "warning" ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300" : 
            variant === "success" ? "bg-green-500/10 text-green-700 dark:text-green-300" : ""
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              {icon}
              <div>
                <AlertTitle>{widget.title}</AlertTitle>
                <AlertDescription>{widget.message}</AlertDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {widget.actionText && widget.actionLink && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleActionClick}
                  className="ml-auto"
                >
                  {widget.actionText}
                </Button>
              )}
              
              {widget.dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDismissed(true)}
                  className="h-6 w-6 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Dismiss</span>
                </Button>
              )}
            </div>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}