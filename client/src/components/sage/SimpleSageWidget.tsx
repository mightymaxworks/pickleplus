/**
 * PKL-278651-COACH-0021-WIDGET-SIMPLE
 * Simple SAGE Recommendations Widget
 * 
 * This is a simplified SAGE widget for the dashboard that displays
 * a single recommendation without complex authentication handling.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @sprint 7
 * @lastModified 2025-04-25
 */
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrainCircuit, ChevronRight } from "lucide-react";
import { useLocation } from 'wouter';

export default function SimpleSageWidget() {
  const [, navigate] = useLocation();
  
  // Function to navigate to SAGE page
  const navigateToSage = () => {
    navigate('/coach');
  };
  
  // Just use a direct recommendation for simplicity
  const recommendation = {
    id: 'rec-1',
    type: 'drill',
    title: 'Improve Your Dink Accuracy',
    summary: 'Based on your recent matches, focusing on controlled dinking will improve your consistency in kitchen exchanges. Try the "Four Corners" drill to build precision.',
    dimensionCode: 'TECH'
  };
  
  // Helper function to get dimension badge color
  const getDimensionColor = (code: string) => {
    switch (code) {
      case 'TECH': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'TACT': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'PHYS': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'MENT': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'CONS': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Helper function to get dimension name
  const getDimensionName = (code: string) => {
    switch (code) {
      case 'TECH': return 'Technical';
      case 'TACT': return 'Tactical';
      case 'PHYS': return 'Physical';
      case 'MENT': return 'Mental';
      case 'CONS': return 'Consistency';
      default: return 'General';
    }
  };
  
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
            SAGE Insights
          </CardTitle>
          
          <Badge variant="outline" className={getDimensionColor(recommendation.dimensionCode)}>
            {getDimensionName(recommendation.dimensionCode)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 pb-2">
        <h3 className="font-medium mb-1">{recommendation.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {recommendation.summary}
        </p>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button onClick={navigateToSage} variant="default" className="w-full group">
          <span>Open SAGE Coach</span>
          <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}