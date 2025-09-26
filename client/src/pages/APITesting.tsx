import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Code, Play, Copy, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  scopes: string[];
  parameters: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    description: string;
    example?: any;
  }[];
  exampleRequest?: any;
  exampleResponse?: any;
}

const WECHAT_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'wechat_register',
    name: 'Register WeChat User',
    method: 'POST',
    path: '/api/v1/wechat/register-user',
    description: 'Create a new Pickle+ account for WeChat users with comprehensive profile data',
    scopes: ['user:write'],
    parameters: [
      { name: 'wechat_user_data.openid', type: 'string', required: true, description: 'WeChat OpenID', example: 'wx_openid_123456' },
      { name: 'wechat_user_data.nickname', type: 'string', required: true, description: 'WeChat Nickname', example: '张三' },
      { name: 'wechat_user_data.sex', type: 'number', required: false, description: '1=male, 2=female, 0=unknown', example: 1 },
      { name: 'user_profile_data.firstName', type: 'string', required: false, description: 'User first name', example: 'John' },
      { name: 'user_profile_data.lastName', type: 'string', required: false, description: 'User last name', example: 'Doe' }
    ],
    exampleRequest: {
      wechat_user_data: {
        openid: 'wx_openid_123456',
        nickname: '张三',
        sex: 1,
        city: 'Shanghai',
        province: 'Shanghai',
        country: 'China'
      },
      user_profile_data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        skillLevel: 'intermediate'
      }
    },
    exampleResponse: {
      api_version: 'v1',
      data: {
        registration_status: 'success',
        user_account: {
          pickle_user_id: 12345,
          passport_code: 'HVGN0BW0',
          username: 'wechat_wx_openid',
          display_name: 'John Doe'
        }
      }
    }
  },
  {
    id: 'wechat_match_submit',
    name: 'Submit Match Data',
    method: 'POST',
    path: '/api/v1/wechat/match-submit',
    description: 'Submit match results for Pickle+ ranking algorithm processing',
    scopes: ['match:write', 'ranking:advanced'],
    parameters: [
      { name: 'match_data.match_type', type: 'string', required: true, description: 'singles or doubles', example: 'singles' },
      { name: 'participants', type: 'array', required: true, description: 'Array of match participants', example: [] },
      { name: 'wechat_openids', type: 'array', required: true, description: 'Array of WeChat OpenIDs', example: ['wx_123', 'wx_456'] }
    ],
    exampleRequest: {
      match_data: {
        match_type: 'singles',
        duration_minutes: 45,
        score: [11, 9, 11, 7, 11, 5]
      },
      participants: [
        { player_id: 123, wechat_openid: 'wx_123', match_result: 'win' },
        { player_id: 456, wechat_openid: 'wx_456', match_result: 'loss' }
      ],
      wechat_openids: ['wx_123', 'wx_456']
    }
  },
  {
    id: 'wechat_rankings_sync',
    name: 'Sync Rankings',
    method: 'POST',
    path: '/api/v1/wechat/rankings-sync',
    description: 'Get current rankings for WeChat users',
    scopes: ['ranking:advanced'],
    parameters: [
      { name: 'wechat_openids', type: 'array', required: true, description: 'Array of WeChat OpenIDs to sync', example: ['wx_123', 'wx_456'] },
      { name: 'sync_scope', type: 'string', required: false, description: 'local, regional, or global', example: 'regional' }
    ],
    exampleRequest: {
      wechat_openids: ['wx_123', 'wx_456', 'wx_789'],
      sync_scope: 'regional'
    }
  }
];

const COACHING_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'coaching_discover',
    name: 'Discover Coaches',
    method: 'GET',
    path: '/api/v1/coaching/discover',
    description: 'Search and filter coaches based on location, specialties, and preferences',
    scopes: ['coaching:read'],
    parameters: [
      { name: 'location', type: 'string', required: false, description: 'City or location name', example: 'Seattle' },
      { name: 'radius', type: 'number', required: false, description: 'Search radius in miles', example: 25 },
      { name: 'price_min', type: 'number', required: false, description: 'Minimum hourly rate', example: 50 },
      { name: 'price_max', type: 'number', required: false, description: 'Maximum hourly rate', example: 150 },
      { name: 'rating_min', type: 'number', required: false, description: 'Minimum rating 0-5', example: 4.0 },
      { name: 'pcp_level', type: 'number', required: false, description: 'PCP certification level 1-5', example: 4 }
    ]
  },
  {
    id: 'coaching_profile',
    name: 'Get Coach Profile',
    method: 'GET',
    path: '/api/v1/coaching/coach/:coachId',
    description: 'Get detailed information about a specific coach',
    scopes: ['coaching:read'],
    parameters: [
      { name: 'coachId', type: 'number', required: true, description: 'Coach ID in path parameter', example: 123 }
    ]
  },
  {
    id: 'coaching_availability',
    name: 'Get Coach Availability',
    method: 'GET',
    path: '/api/v1/coaching/coach/:coachId/availability',
    description: 'Get real-time availability for booking sessions',
    scopes: ['coaching:read'],
    parameters: [
      { name: 'coachId', type: 'number', required: true, description: 'Coach ID in path parameter', example: 123 },
      { name: 'start_date', type: 'string', required: false, description: 'Start date YYYY-MM-DD', example: '2024-01-15' },
      { name: 'end_date', type: 'string', required: false, description: 'End date YYYY-MM-DD', example: '2024-02-14' }
    ]
  },
  {
    id: 'coaching_book',
    name: 'Book Coaching Session',
    method: 'POST',
    path: '/api/v1/coaching/book-session',
    description: 'Book a coaching session with a specific coach',
    scopes: ['coaching:write'],
    parameters: [
      { name: 'slot_id', type: 'number', required: true, description: 'Booking slot ID', example: 789 },
      { name: 'student_info.skill_level', type: 'string', required: true, description: 'Student skill level', example: 'intermediate' },
      { name: 'student_info.goals', type: 'string', required: true, description: 'Session goals', example: 'Improve third shot drop' },
      { name: 'wechat_user_id', type: 'string', required: true, description: 'WeChat user ID', example: 'wx_user_123' }
    ],
    exampleRequest: {
      slot_id: 789,
      student_info: {
        skill_level: 'intermediate',
        goals: 'Improve third shot drop and court positioning',
        emergency_contact: '+1-555-123-4567'
      },
      wechat_user_id: 'wx_user_123',
      payment_method: 'wechat_pay'
    }
  },
  {
    id: 'coaching_verify',
    name: 'Verify Coach Credentials',
    method: 'GET',
    path: '/api/v1/coaching/verify/:coachId',
    description: 'Verify coach credentials and PCP certification status',
    scopes: ['coaching:read'],
    parameters: [
      { name: 'coachId', type: 'number', required: true, description: 'Coach ID in path parameter', example: 123 }
    ]
  }
];

export default function APITesting() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('wechat');
  const [apiKey, setApiKey] = useState('');
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  const handleTestEndpoint = async (endpoint: ApiEndpoint, formData: any) => {
    const loadingKey = endpoint.id;
    setIsLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      let url = endpoint.path;
      let body = null;
      const headers: any = {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      };

      // Handle path parameters
      if (endpoint.path.includes(':')) {
        Object.keys(formData).forEach(key => {
          if (endpoint.path.includes(`:${key}`)) {
            url = url.replace(`:${key}`, formData[key]);
            delete formData[key];
          }
        });
      }

      // Handle query parameters for GET requests
      if (endpoint.method === 'GET' && Object.keys(formData).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
        if (queryParams.toString()) {
          url += '?' + queryParams.toString();
        }
      } else if (endpoint.method !== 'GET') {
        body = JSON.stringify(formData);
      }

      console.log(`Making ${endpoint.method} request to ${url}`);
      if (body) console.log('Request body:', body);

      const response = await fetch(url, {
        method: endpoint.method,
        headers,
        body
      });

      const responseData = await response.json();
      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => ({ ...prev, [endpoint.id]: result }));

      toast({
        title: response.ok ? 'Success' : 'Error',
        description: `${endpoint.method} ${endpoint.path} - ${response.status} ${response.statusText}`,
        variant: response.ok ? 'default' : 'destructive'
      });

    } catch (error: any) {
      const errorResult = {
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      };
      setTestResults(prev => ({ ...prev, [endpoint.id]: errorResult }));

      toast({
        title: 'Network Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Code copied to clipboard'
    });
  };

  const EndpointTester = ({ endpoint }: { endpoint: ApiEndpoint }) => {
    const [formData, setFormData] = useState<any>({});

    const handleInputChange = (name: string, value: any) => {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const testResult = testResults[endpoint.id];
    const isEndpointLoading = isLoading[endpoint.id];

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                {endpoint.method}
              </Badge>
              <span>{endpoint.name}</span>
            </CardTitle>
            <div className="flex gap-2">
              {endpoint.scopes.map(scope => (
                <Badge key={scope} variant="outline" className="text-xs">
                  {scope}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code className="h-4 w-4" />
            <code className="bg-muted px-2 py-1 rounded">{endpoint.path}</code>
          </div>
          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Parameters Form */}
          <div className="space-y-4">
            <h4 className="font-medium">Parameters</h4>
            {endpoint.parameters.map(param => (
              <div key={param.name} className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="flex items-center gap-2">
                    {param.name}
                    {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">{param.description}</p>
                </div>
                <div>
                  {param.type === 'boolean' ? (
                    <Select onValueChange={(value) => handleInputChange(param.name, value === 'true')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">true</SelectItem>
                        <SelectItem value="false">false</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : param.type === 'object' || param.type === 'array' ? (
                    <Textarea
                      placeholder={`JSON ${param.type}`}
                      value={formData[param.name] || ''}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value || '{}');
                          handleInputChange(param.name, parsed);
                        } catch {
                          handleInputChange(param.name, e.target.value);
                        }
                      }}
                    />
                  ) : (
                    <Input
                      type={param.type === 'number' ? 'number' : 'text'}
                      placeholder={param.example ? String(param.example) : param.type}
                      value={formData[param.name] || ''}
                      onChange={(e) => handleInputChange(param.name, param.type === 'number' ? Number(e.target.value) : e.target.value)}
                    />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {param.example && (
                    <code className="bg-muted px-1 rounded">
                      {typeof param.example === 'object' ? JSON.stringify(param.example) : String(param.example)}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Test Button */}
          <div className="flex gap-4">
            <Button
              onClick={() => handleTestEndpoint(endpoint, formData)}
              disabled={isEndpointLoading || !apiKey}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isEndpointLoading ? 'Testing...' : 'Test Endpoint'}
            </Button>
            
            {endpoint.exampleRequest && (
              <Button
                variant="outline"
                onClick={() => setFormData(endpoint.exampleRequest)}
              >
                Load Example
              </Button>
            )}
          </div>

          {/* Example Request */}
          {endpoint.exampleRequest && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Example Request</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(endpoint.exampleRequest, null, 2))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                {JSON.stringify(endpoint.exampleRequest, null, 2)}
              </pre>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Response</h4>
                {testResult.error ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : testResult.status < 400 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <Badge variant={testResult.status < 400 ? 'default' : 'destructive'}>
                  {testResult.status || 'Network Error'}
                </Badge>
              </div>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(testResult.error ? testResult : testResult.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pickle+ API Testing Interface</h1>
        <p className="text-muted-foreground">
          Test and explore the Pickle+ API endpoints interactively. The world's first AI-powered pickleball data operating system.
        </p>
      </div>

      {/* API Key Setup */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>API Authentication</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your API key to test endpoints. Keys are managed through the developer portal.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <Badge variant={apiKey ? 'default' : 'secondary'}>
              {apiKey ? 'Authenticated' : 'No API Key'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wechat">WeChat Integration</TabsTrigger>
          <TabsTrigger value="coaching">Coaching API</TabsTrigger>
        </TabsList>

        <TabsContent value="wechat" className="mt-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">WeChat Integration API</h2>
            <p className="text-muted-foreground">
              API endpoints for WeChat mini-programs and apps to integrate with Pickle+ ecosystem.
              Functions as "Pickleball Stripe" - external apps send data, get processed results.
            </p>
          </div>
          {WECHAT_ENDPOINTS.map(endpoint => (
            <EndpointTester key={endpoint.id} endpoint={endpoint} />
          ))}
        </TabsContent>

        <TabsContent value="coaching" className="mt-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Coaching API</h2>
            <p className="text-muted-foreground">
              Comprehensive coaching ecosystem access for external applications. Discover coaches,
              book sessions, manage relationships, and access educational content.
            </p>
          </div>
          {COACHING_ENDPOINTS.map(endpoint => (
            <EndpointTester key={endpoint.id} endpoint={endpoint} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Additional Resources */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Developer Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Documentation</h4>
              <p className="text-sm text-muted-foreground">
                Complete API documentation with examples and best practices.
              </p>
              <Button variant="outline" size="sm">
                View Docs
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">SDKs</h4>
              <p className="text-sm text-muted-foreground">
                Official SDKs for WeChat Mini-Programs and other platforms.
              </p>
              <Button variant="outline" size="sm">
                Download SDKs
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Support</h4>
              <p className="text-sm text-muted-foreground">
                Get help from our developer community and support team.
              </p>
              <Button variant="outline" size="sm">
                Get Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}