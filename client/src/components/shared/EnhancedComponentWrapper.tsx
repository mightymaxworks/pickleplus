/**
 * Enhanced Component Wrapper - PKL-278651 Migration System
 * Provides safe rollout of enhanced components with automatic fallback
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { isFeatureEnabled, FeatureFlagKey } from '@/utils/featureFlags';

interface ErrorBoundaryState {
  hasError: boolean;
  errorCount: number;
  lastError?: Error;
}

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      errorCount: 1,
      lastError: error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    
    // Log error for monitoring
    console.error('Enhanced component error:', error, errorInfo);
    
    // Track error for rollback decisions
    this.trackComponentError(error);
  }

  private trackComponentError(error: Error) {
    const errorKey = 'component_errors';
    const stored = localStorage.getItem(errorKey);
    const errors = stored ? JSON.parse(stored) : [];
    
    errors.push({
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack
    });
    
    // Keep only last 10 errors
    const recentErrors = errors.slice(-10);
    localStorage.setItem(errorKey, JSON.stringify(recentErrors));
    
    // Auto-rollback if too many errors
    if (recentErrors.length >= 3) {
      const recentErrorsInLastHour = recentErrors.filter(
        e => Date.now() - e.timestamp < 3600000
      );
      
      if (recentErrorsInLastHour.length >= 3) {
        console.warn('Multiple errors detected, triggering auto-rollback');
        this.triggerAutoRollback();
      }
    }
  }

  private triggerAutoRollback() {
    // This would trigger a rollback mechanism
    localStorage.setItem('auto_rollback_triggered', 'true');
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

interface EnhancedWrapperProps {
  enhanced: React.ComponentType<any>;
  legacy: React.ComponentType<any>;
  featureFlag: FeatureFlagKey;
  fallbackOnError?: boolean;
  performanceThreshold?: number; // milliseconds
  [key: string]: any; // Allow passing props to components
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  componentName: string;
  isEnhanced: boolean;
}

export function EnhancedComponentWrapper({ 
  enhanced: Enhanced, 
  legacy: Legacy, 
  featureFlag,
  fallbackOnError = true,
  performanceThreshold = 2000,
  ...props
}: EnhancedWrapperProps) {
  const [performanceData, setPerformanceData] = React.useState<PerformanceMetrics | null>(null);
  const isEnabled = isFeatureEnabled(featureFlag);
  
  // Performance monitoring
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const metrics: PerformanceMetrics = {
        loadTime: endTime - startTime,
        renderTime: endTime - startTime,
        componentName: featureFlag,
        isEnhanced: isEnabled
      };
      
      setPerformanceData(metrics);
      
      // Track performance for monitoring
      trackComponentPerformance(metrics);
      
      // Auto-rollback if performance is too poor
      if (isEnabled && metrics.loadTime > performanceThreshold) {
        console.warn(`Performance issue detected: ${featureFlag} took ${metrics.loadTime}ms`);
        // Could trigger automatic rollback here
      }
    };
  }, [featureFlag, isEnabled, performanceThreshold]);

  // Component selection logic
  const ComponentToRender = isEnabled ? Enhanced : Legacy;
  
  // If feature is disabled, render legacy component directly
  if (!isEnabled) {
    return <ComponentToRender {...props} />;
  }
  
  // If fallback is enabled, wrap enhanced component with error boundary
  if (fallbackOnError) {
    return (
      <ErrorBoundary 
        fallback={<Legacy {...props} />}
        onError={(error, errorInfo) => {
          // Send error to monitoring system
          reportComponentError(featureFlag, error, errorInfo);
        }}
      >
        <Enhanced {...props} />
      </ErrorBoundary>
    );
  }
  
  // Render enhanced component without error boundary
  return <Enhanced {...props} />;
}

/**
 * Track component performance for monitoring
 */
function trackComponentPerformance(metrics: PerformanceMetrics) {
  const storageKey = 'component_performance';
  const stored = localStorage.getItem(storageKey);
  const performances = stored ? JSON.parse(stored) : {};
  
  if (!performances[metrics.componentName]) {
    performances[metrics.componentName] = [];
  }
  
  performances[metrics.componentName].push({
    ...metrics,
    timestamp: Date.now()
  });
  
  // Keep only last 50 measurements per component
  performances[metrics.componentName] = performances[metrics.componentName].slice(-50);
  
  localStorage.setItem(storageKey, JSON.stringify(performances));
}

/**
 * Report component errors to monitoring system
 */
function reportComponentError(componentName: string, error: Error, errorInfo: ErrorInfo) {
  // In a real implementation, this would send to your monitoring service
  console.error(`Component Error Report: ${componentName}`, {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString()
  });
}

/**
 * Hook for accessing performance data
 */
export function useComponentPerformance(componentName: string) {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics[]>([]);
  
  React.useEffect(() => {
    const storageKey = 'component_performance';
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      const performances = JSON.parse(stored);
      setMetrics(performances[componentName] || []);
    }
  }, [componentName]);
  
  return metrics;
}

/**
 * Administrative component for monitoring enhanced component status
 */
export function EnhancedComponentMonitor() {
  const [errorLog, setErrorLog] = React.useState<any[]>([]);
  const [performanceLog, setPerformanceLog] = React.useState<any>({});
  
  React.useEffect(() => {
    // Load error log
    const errors = localStorage.getItem('component_errors');
    if (errors) {
      setErrorLog(JSON.parse(errors));
    }
    
    // Load performance log
    const performance = localStorage.getItem('component_performance');
    if (performance) {
      setPerformanceLog(JSON.parse(performance));
    }
  }, []);
  
  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">PKL-278651 Monitor</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Recent Errors:</strong> {errorLog.length}
        </div>
        
        <div>
          <strong>Components Tracked:</strong> {Object.keys(performanceLog).length}
        </div>
        
        {errorLog.length > 0 && (
          <div className="text-red-600">
            Last Error: {errorLog[errorLog.length - 1]?.message}
          </div>
        )}
      </div>
    </div>
  );
}