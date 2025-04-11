/**
 * PKL-278651-ADMIN-0011-DASH
 * Action Card Widget Component
 * 
 * This component displays an action card widget for the admin dashboard.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionCardWidget as ActionCardWidgetType } from "@shared/schema/admin/dashboard";
import { useLocation } from "wouter";
import { 
  UserPlus, CalendarPlus, BarChart, Settings, 
  User, Calendar, Pencil, FileText, Shield, 
  Layout, MessageSquare, Mail, Bell
} from "lucide-react";

interface ActionCardWidgetProps {
  widget: ActionCardWidgetType;
}

export function ActionCardWidget({ widget }: ActionCardWidgetProps) {
  const [, navigate] = useLocation();
  
  // Get icon component based on the icon name
  const getIcon = (iconName: string) => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (iconName) {
      case "user-plus":
        return <UserPlus {...iconProps} />;
      case "calendar-plus":
        return <CalendarPlus {...iconProps} />;
      case "bar-chart":
        return <BarChart {...iconProps} />;
      case "settings":
        return <Settings {...iconProps} />;
      case "user":
        return <User {...iconProps} />;
      case "calendar":
        return <Calendar {...iconProps} />;
      case "pencil":
        return <Pencil {...iconProps} />;
      case "file-text":
        return <FileText {...iconProps} />;
      case "shield":
        return <Shield {...iconProps} />;
      case "layout":
        return <Layout {...iconProps} />;
      case "message-square":
        return <MessageSquare {...iconProps} />;
      case "mail":
        return <Mail {...iconProps} />;
      case "bell":
        return <Bell {...iconProps} />;
      default:
        return <Settings {...iconProps} />;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md font-medium">{widget.title}</CardTitle>
        <CardDescription>{widget.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 p-4 pt-0">
        {widget.actions.map((action) => (
          <button
            key={action.id}
            className="flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors hover:bg-muted w-full text-left"
            onClick={() => navigate(action.link)}
          >
            {action.icon ? getIcon(action.icon) : null}
            {action.label}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}