/**
 * PKL-278651-COACH-0021-WIDGET-DEMO
 * SAGE Widget Demo Page
 * 
 * This is a special development-only page that allows testing the
 * SAGE Recommendations Widget without authentication.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @sprint 7
 * @lastModified 2025-04-25
 */
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import SageRecommendationsWidget from '@/components/sage/SageRecommendationsWidget';

export default function SageDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SAGE Widget Development Demo</h1>
        <p className="text-muted-foreground">
          This page allows testing the SAGE Recommendations Widget in isolation, without requiring authentication.
        </p>
      </div>
      
      {/* Widget Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Widget Preview</CardTitle>
            </CardHeader>
          </Card>
          <SageRecommendationsWidget />
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Development Notes</CardTitle>
            </CardHeader>
            <div className="p-6">
              <div className="prose max-w-none">
                <h3>Implementation Details</h3>
                <ul>
                  <li>Widget uses a dedicated unauthenticated endpoint <code>/api/coach/sage/dashboard/widget</code></li>
                  <li>Displays a single recommendation focused on Technical skills (TECH dimension)</li>
                  <li>Handles loading and error states gracefully</li>
                  <li>Provides navigation to full SAGE coaching experience</li>
                </ul>
                
                <h3>Next Steps</h3>
                <ul>
                  <li>Integrate with authenticated routes when authentication system is complete</li>
                  <li>Add more personalized recommendations based on CourtIQ metrics</li>
                  <li>Connect to user match history for more tailored suggestions</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}