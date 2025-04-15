/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Dashboard Component
 * 
 * This component serves as the main dashboard for bug report management in the admin interface.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BugReportStatus, BugReportSeverity, BugReport } from '@/shared/bug-report-schema';
import { Heading } from '@/components/ui/heading';
import { Bug, AlertTriangle, CheckCircle, XCircle, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllBugReports } from '@/modules/feedback/api/feedbackAdminApi';
import BugReportList from './BugReportList';
import BugReportDetail from './BugReportDetail';

/**
 * Bug Report Dashboard component for the admin interface
 */
const BugReportDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [metrics, setMetrics] = useState({
    new: 0,
    in_progress: 0,
    resolved: 0,
    wont_fix: 0,
    duplicate: 0
  });

  // Function to fetch bug reports
  const fetchBugReports = async () => {
    setLoading(true);
    try {
      // Use the params to filter by status if not 'all'
      const params = activeTab !== 'all' ? { status: activeTab } : undefined;
      const reports = await getAllBugReports(params);
      setBugReports(reports);

      // Calculate metrics
      const counts = reports.reduce((acc, report) => {
        const status = report.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setMetrics({
        new: counts[BugReportStatus.NEW] || 0,
        in_progress: counts[BugReportStatus.IN_PROGRESS] || 0,
        resolved: counts[BugReportStatus.RESOLVED] || 0,
        wont_fix: counts[BugReportStatus.WONT_FIX] || 0,
        duplicate: counts[BugReportStatus.DUPLICATE] || 0
      });
    } catch (error) {
      console.error('Failed to fetch bug reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reports on mount and when tab changes
  useEffect(() => {
    fetchBugReports();
  }, [activeTab]);

  // Handle selecting a report for detailed view
  const handleSelectReport = (report: BugReport) => {
    setSelectedReport(report);
  };
  
  // Handle updating a report
  const handleReportUpdate = (updatedReport: BugReport) => {
    // Update the report in the list
    setBugReports(prevReports => 
      prevReports.map(report => 
        report.id === updatedReport.id ? updatedReport : report
      )
    );
    
    // Refresh metrics
    const updatedCounts = bugReports.reduce((acc, report) => {
      const status = report.id === updatedReport.id 
        ? updatedReport.status 
        : report.status;
      
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    setMetrics({
      new: updatedCounts[BugReportStatus.NEW] || 0,
      in_progress: updatedCounts[BugReportStatus.IN_PROGRESS] || 0,
      resolved: updatedCounts[BugReportStatus.RESOLVED] || 0,
      wont_fix: updatedCounts[BugReportStatus.WONT_FIX] || 0,
      duplicate: updatedCounts[BugReportStatus.DUPLICATE] || 0
    });
    
    // Update the selected report
    setSelectedReport(updatedReport);
  };
  
  return (
    <div className="container mx-auto p-6">
      {selectedReport ? (
        <div>
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedReport(null)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
            
            <BugReportDetail 
              report={selectedReport} 
              onStatusChange={handleReportUpdate}
              onClose={() => setSelectedReport(null)}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <Heading
              title="Bug Report Management"
              description="View and manage bug reports submitted by users"
              icon={<Bug className="h-6 w-6 mr-2" />}
            />
            <Button 
              variant="outline" 
              onClick={fetchBugReports} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-4 mb-6">
            <MetricCard 
              title="New Reports" 
              value={metrics.new.toString()} 
              description="Pending review"
              icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} 
            />
            <MetricCard 
              title="In Progress" 
              value={metrics.in_progress.toString()} 
              description="Currently being addressed"
              icon={<Bug className="h-5 w-5 text-blue-500" />} 
            />
            <MetricCard 
              title="Resolved" 
              value={metrics.resolved.toString()} 
              description="Fixed issues"
              icon={<CheckCircle className="h-5 w-5 text-green-500" />} 
            />
            <MetricCard 
              title="Won't Fix" 
              value={metrics.wont_fix.toString()} 
              description="Not planned for resolution"
              icon={<XCircle className="h-5 w-5 text-gray-500" />} 
            />
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value={BugReportStatus.NEW}>New</TabsTrigger>
              <TabsTrigger value={BugReportStatus.IN_PROGRESS}>In Progress</TabsTrigger>
              <TabsTrigger value={BugReportStatus.RESOLVED}>Resolved</TabsTrigger>
              <TabsTrigger value={BugReportStatus.WONT_FIX}>Won't Fix</TabsTrigger>
              <TabsTrigger value={BugReportStatus.DUPLICATE}>Duplicate</TabsTrigger>
            </TabsList>
            
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin mr-2" />
                <p>Loading bug reports...</p>
              </div>
            ) : (
              <>
                <TabsContent value="all" className="p-0">
                  {bugReports.length > 0 ? (
                    <BugReportList 
                      reports={bugReports}
                      onSelectReport={handleSelectReport}
                    />
                  ) : (
                    <PlaceholderContent message="No bug reports found" />
                  )}
                </TabsContent>
                
                <TabsContent value={BugReportStatus.NEW} className="p-0">
                  {bugReports.length > 0 ? (
                    <BugReportList 
                      reports={bugReports.filter(r => r.status === BugReportStatus.NEW)}
                      onSelectReport={handleSelectReport}
                    />
                  ) : (
                    <PlaceholderContent message="No new bug reports found" />
                  )}
                </TabsContent>
                
                <TabsContent value={BugReportStatus.IN_PROGRESS} className="p-0">
                  {bugReports.length > 0 ? (
                    <BugReportList 
                      reports={bugReports.filter(r => r.status === BugReportStatus.IN_PROGRESS)}
                      onSelectReport={handleSelectReport}
                    />
                  ) : (
                    <PlaceholderContent message="No in-progress bug reports found" />
                  )}
                </TabsContent>
                
                <TabsContent value={BugReportStatus.RESOLVED} className="p-0">
                  {bugReports.length > 0 ? (
                    <BugReportList 
                      reports={bugReports.filter(r => r.status === BugReportStatus.RESOLVED)}
                      onSelectReport={handleSelectReport}
                    />
                  ) : (
                    <PlaceholderContent message="No resolved bug reports found" />
                  )}
                </TabsContent>
                
                <TabsContent value={BugReportStatus.WONT_FIX} className="p-0">
                  {bugReports.length > 0 ? (
                    <BugReportList 
                      reports={bugReports.filter(r => r.status === BugReportStatus.WONT_FIX)}
                      onSelectReport={handleSelectReport}
                    />
                  ) : (
                    <PlaceholderContent message="No won't fix bug reports found" />
                  )}
                </TabsContent>
                
                <TabsContent value={BugReportStatus.DUPLICATE} className="p-0">
                  {bugReports.length > 0 ? (
                    <BugReportList 
                      reports={bugReports.filter(r => r.status === BugReportStatus.DUPLICATE)}
                      onSelectReport={handleSelectReport}
                    />
                  ) : (
                    <PlaceholderContent message="No duplicate bug reports found" />
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </>
      )}
    </div>
  );
};

/**
 * Metric Card component for displaying bug report metrics
 */
interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, description, icon }: MetricCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

/**
 * Placeholder Content component for empty states
 */
interface PlaceholderContentProps {
  message: string;
}

const PlaceholderContent = ({ message }: PlaceholderContentProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
      <Bug className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  );
};

export default BugReportDashboard;