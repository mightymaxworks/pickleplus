/**
 * Universal Development Workflow Utilities
 * Handles automatic navigation back to development analysis dashboard
 * Works for ALL development modules (coaching, franchise, retail, facilities)
 */

/**
 * Automatically redirects to the Universal Development Analysis Dashboard
 * Should be called after completing any development phase
 */
export function redirectToDevelopmentDashboard(feature?: string, delay: number = 2000) {
  if (feature) {
    console.log(`[DEV-WORKFLOW] Feature "${feature}" completed. Redirecting to development dashboard...`);
  } else {
    console.log(`[DEV-WORKFLOW] Development phase completed. Redirecting to development dashboard...`);
  }
  
  setTimeout(() => {
    window.location.href = '/coaching-workflow-analysis';
  }, delay);
}

/**
 * Shows a completion notification before redirecting to dashboard
 */
export function completeFeatureAndRedirect(featureName: string, status: 'complete' | 'partial' | 'blocked') {
  const statusMessages = {
    complete: `✅ ${featureName} is now operationally complete!`,
    partial: `⚠️ ${featureName} partially implemented.`,
    blocked: `🚫 ${featureName} blocked - needs attention.`
  };
  
  // Show completion notification
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  notification.textContent = statusMessages[status];
  document.body.appendChild(notification);
  
  // Remove notification and redirect
  setTimeout(() => {
    document.body.removeChild(notification);
    redirectToDevelopmentDashboard(featureName);
  }, 3000);
}

/**
 * Development phase completion tracker
 * Logs completion and triggers automatic workflow
 */
export function logFeatureCompletion(
  module: string, 
  feature: string, 
  phase: 'schema' | 'api' | 'frontend' | 'integration' | 'testing' | 'complete'
) {
  const timestamp = new Date().toISOString();
  console.log(`[DEV-WORKFLOW] ${timestamp} - Module: ${module}, Feature: ${feature}, Phase: ${phase}`);
  
  // Store in localStorage for development tracking
  const completionLog = JSON.parse(localStorage.getItem('dev-completion-log') || '[]');
  completionLog.push({ module, feature, phase, timestamp });
  localStorage.setItem('dev-completion-log', JSON.stringify(completionLog));
  
  // Auto-redirect for integration and complete phases
  if (phase === 'integration' || phase === 'complete') {
    completeFeatureAndRedirect(`${module} - ${feature}`, phase === 'complete' ? 'complete' : 'partial');
  }
}

/**
 * Get development completion history
 */
export function getDevelopmentHistory() {
  return JSON.parse(localStorage.getItem('dev-completion-log') || '[]');
}

/**
 * Clear development history (for testing/reset)
 */
export function clearDevelopmentHistory() {
  localStorage.removeItem('dev-completion-log');
  console.log('[DEV-WORKFLOW] Development history cleared');
}