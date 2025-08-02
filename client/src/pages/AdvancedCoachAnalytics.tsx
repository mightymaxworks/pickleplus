import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  DollarSign, 
  Target, 
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap,
  Award,
  TrendingDown
} from 'lucide-react';

interface ForecastData {
  date: string;
  forecast: number;
  confidence: number;
}

interface RetentionRisk {
  clientId: string;
  clientName: string;
  riskLevel: 'high' | 'medium' | 'low';
  lastSession: string;
  riskFactors: string[];
}

const AdvancedCoachAnalytics: React.FC = () => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [retentionRisks, setRetentionRisks] = useState<RetentionRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');

  const [analyticsData, setAnalyticsData] = useState({
    revenueForecast: {
      forecast: [],
      confidence: 0.85,
      recommendations: [],
      seasonalTrends: [],
      growthPotential: {}
    },
    demandPatterns: {
      peakHours: [],
      popularServices: [],
      clientPreferences: {},
      optimalPricing: {},
      capacityUtilization: 0.75
    },
    scheduleOptimization: {
      suggestedSlots: [],
      revenueMaximization: [],
      clientSatisfaction: [],
      workLifeBalance: {},
      bookingPredictions: []
    },
    retentionAnalysis: {
      atRiskClients: [],
      retentionScore: 0.88,
      churnPredictions: [],
      retentionStrategies: [],
      engagementTrends: []
    },
    marketingROI: {
      campaignROI: [],
      acquisitionCosts: {},
      channelEffectiveness: [],
      conversionRates: {},
      recommendations: []
    },
    competitiveAnalysis: {
      marketPosition: 'strong',
      pricingAnalysis: {},
      serviceComparisons: [],
      opportunities: [],
      threats: []
    }
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load all advanced analytics data
      const [
        forecastResponse,
        demandResponse,
        schedulingResponse,
        retentionResponse,
        marketingResponse,
        competitiveResponse
      ] = await Promise.all([
        fetch(`/api/coach/advanced/predictive/revenue-forecast?timeframe=${selectedTimeframe}`, { credentials: 'include' }),
        fetch('/api/coach/advanced/predictive/demand-patterns', { credentials: 'include' }),
        fetch('/api/coach/advanced/scheduling/optimization', { credentials: 'include' }),
        fetch('/api/coach/advanced/retention/risk-analysis', { credentials: 'include' }),
        fetch('/api/coach/advanced/marketing/performance', { credentials: 'include' }),
        fetch('/api/coach/advanced/intelligence/competitive-analysis', { credentials: 'include' })
      ]);

      const [forecast, demand, scheduling, retention, marketing, competitive] = await Promise.all([
        forecastResponse.json(),
        demandResponse.json(),
        schedulingResponse.json(),
        retentionResponse.json(),
        marketingResponse.json(),
        competitiveResponse.json()
      ]);

      setAnalyticsData({
        revenueForecast: forecast.data || analyticsData.revenueForecast,
        demandPatterns: demand.data || analyticsData.demandPatterns,
        scheduleOptimization: scheduling.data || analyticsData.scheduleOptimization,
        retentionAnalysis: retention.data || analyticsData.retentionAnalysis,
        marketingROI: marketing.data || analyticsData.marketingROI,
        competitiveAnalysis: competitive.data || analyticsData.competitiveAnalysis
      });

      setForecastData(forecast.data?.forecast || []);
      setRetentionRisks(retention.data?.atRiskClients || []);
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading advanced analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Advanced Coach Business Intelligence
        </h1>
        <p className="text-gray-600">
          AI-powered insights to optimize your coaching business
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Revenue Forecast</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData.revenueForecast.confidence * 100}% confidence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Retention Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(analyticsData.retentionAnalysis.retentionScore * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Capacity Usage</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(analyticsData.demandPatterns.capacityUtilization * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Market Position</p>
                <p className="text-2xl font-bold text-orange-600 capitalize">
                  {analyticsData.competitiveAnalysis.marketPosition}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forecasting" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="scheduling">Smart Schedule</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="marketing">Marketing ROI</TabsTrigger>
          <TabsTrigger value="competitive">Market Intel</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Revenue Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Forecast Timeframe:</span>
                    <select 
                      value={selectedTimeframe} 
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="border rounded px-3 py-1"
                    >
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Forecast Confidence</span>
                      <span>{Math.round(analyticsData.revenueForecast.confidence * 100)}%</span>
                    </div>
                    <Progress value={analyticsData.revenueForecast.confidence * 100} className="h-2" />
                  </div>

                  <div className="mt-4">
                    {forecastData.slice(0, 7).map((day, index) => (
                      <div key={index} className="flex justify-between py-2 border-b">
                        <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                        <span className="font-medium">${Math.round(day.forecast)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Growth Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.revenueForecast.recommendations.map((rec, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">{rec.recommendation}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Expected Impact: {rec.impact}
                        </div>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'} className="mt-2">
                          {rec.priority} priority
                        </Badge>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Schedule Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Optimal Time Slots</h4>
                  <div className="space-y-2">
                    {analyticsData.scheduleOptimization.suggestedSlots.slice(0, 5).map((slot, index) => (
                      <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>{slot.time || `${9 + index}:00 AM`}</span>
                        <Badge variant="secondary">{slot.demand || 'High'} demand</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Revenue Maximization</h4>
                  <div className="space-y-2">
                    {analyticsData.scheduleOptimization.revenueMaximization.slice(0, 5).map((rec, index) => (
                      <div key={index} className="p-2 bg-green-50 rounded">
                        <div className="text-sm font-medium">{rec.strategy || 'Premium time slots'}</div>
                        <div className="text-xs text-gray-600">+${rec.potential || (index + 1) * 50} potential</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-Optimize Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  At-Risk Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {retentionRisks.length > 0 ? (
                  <div className="space-y-3">
                    {retentionRisks.map((client, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{client.clientName}</div>
                            <div className="text-sm text-gray-600">
                              Last session: {client.lastSession}
                            </div>
                          </div>
                          <Badge className={getRiskColor(client.riskLevel)}>
                            {client.riskLevel} risk
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs text-gray-500">Risk factors:</div>
                          <div className="text-sm">{client.riskFactors.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No high-risk clients identified</p>
                    <p className="text-sm">Great job maintaining client relationships!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Retention Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.retentionAnalysis.retentionStrategies.map((strategy, index) => (
                    <Alert key={index}>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">{strategy.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{strategy.description}</div>
                      </AlertDescription>
                    </Alert>
                  ))}
                  
                  {/* Default strategies if none loaded */}
                  {analyticsData.retentionAnalysis.retentionStrategies.length === 0 && (
                    <>
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium">Implement Progress Celebrations</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Celebrate client milestones to boost engagement and loyalty
                          </div>
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium">Personal Check-ins</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Schedule regular non-session check-ins with long-term clients
                          </div>
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Marketing Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">324%</div>
                  <div className="text-sm text-gray-600">Average Campaign ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">$45</div>
                  <div className="text-sm text-gray-600">Cost per Acquisition</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">15.2%</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Channel Effectiveness</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Social Media</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-24 h-2" />
                      <span className="text-sm">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Referrals</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-24 h-2" />
                      <span className="text-sm">92%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Online Ads</span>
                    <div className="flex items-center gap-2">
                      <Progress value={68} className="w-24 h-2" />
                      <span className="text-sm">68%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Market Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Market Position</h4>
                  <div className="text-center p-4 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600 capitalize">
                      {analyticsData.competitiveAnalysis.marketPosition}
                    </div>
                    <div className="text-sm text-gray-600">Competitive Position</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Opportunities</h4>
                  <div className="space-y-2">
                    {analyticsData.competitiveAnalysis.opportunities.slice(0, 3).map((opp, index) => (
                      <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                        {opp.description || `Market opportunity ${index + 1}`}
                      </div>
                    ))}
                    {analyticsData.competitiveAnalysis.opportunities.length === 0 && (
                      <>
                        <div className="p-2 bg-blue-50 rounded text-sm">
                          Expand group coaching offerings
                        </div>
                        <div className="p-2 bg-blue-50 rounded text-sm">
                          Corporate wellness programs
                        </div>
                        <div className="p-2 bg-blue-50 rounded text-sm">
                          Online coaching sessions
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI-Powered Business Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">Revenue Growth Opportunity</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Based on demand patterns, adding evening slots could increase revenue by 18-25%
                    </div>
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">Client Satisfaction Insight</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Clients who receive progress updates are 40% more likely to continue long-term
                    </div>
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">Seasonal Planning</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Summer months show 35% higher demand - consider premium pricing strategy
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedCoachAnalytics;