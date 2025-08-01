import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Globe, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Building,
  Users,
  Zap
} from 'lucide-react';

interface ApiResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export default function WiseBusinessDemo() {
  const [profiles, setProfiles] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [payout, setPayout] = useState<any>(null);
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  
  // Form states
  const [quoteForm, setQuoteForm] = useState({
    sourceCurrency: 'USD',
    targetCurrency: 'EUR',
    sourceAmount: 95
  });
  
  const [payoutForm, setPayoutForm] = useState({
    coachId: 'coach_123',
    amount: 95,
    currency: 'EUR',
    sessionReference: 'Coaching Session - January 2025'
  });

  const callApi = async (endpoint: string, method = 'GET', data?: any): Promise<ApiResponse> => {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined
      });
      return await response.json();
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };

  const testProfiles = async () => {
    setLoading('profiles');
    const result = await callApi('/api/wise/business/profiles');
    setProfiles(result);
    setLoading(null);
  };

  const testQuote = async () => {
    setLoading('quote');
    const result = await callApi('/api/wise/business/quotes', 'POST', quoteForm);
    setQuote(result);
    setLoading(null);
  };

  const testPayout = async () => {
    setLoading('payout');
    const payoutData = {
      ...payoutForm,
      coachBankDetails: {
        accountHolderName: 'Coach Name',
        details: {
          iban: 'DE89370400440532013000' // Example German IBAN
        }
      }
    };
    const result = await callApi('/api/wise/business/coach-payout', 'POST', payoutData);
    setPayout(result);
    setLoading(null);
  };

  const testBalances = async () => {
    setLoading('balances');
    const result = await callApi('/api/wise/business/balances');
    setBalances(result);
    setLoading(null);
  };

  const StatusBadge = ({ result }: { result: any }) => {
    if (!result) return null;
    return (
      <Badge variant={result.success ? "default" : "destructive"} className="ml-2">
        {result.success ? "Success" : "Error"}
      </Badge>
    );
  };

  const IntegrationOverview = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-orange-500" />
          Wise Business API Integration
        </CardTitle>
        <CardDescription>
          Self-service payment processing for coach payouts and international transfers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            <span className="text-sm">40+ Currencies</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            <span className="text-sm">160+ Countries</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Real-time Processing</span>
          </div>
        </div>
        
        <Alert className="mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Ready for Production:</strong> Set WISE_BUSINESS_API_TOKEN environment variable to enable live transfers.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Wise Business API Demo
          </h1>
          <p className="text-xl text-gray-600">
            International Coach Payment System
          </p>
        </div>

        <IntegrationOverview />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Profiles Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Business Profiles
                <StatusBadge result={profiles} />
              </CardTitle>
              <CardDescription>
                Verify Wise Business account access and profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testProfiles}
                disabled={loading === 'profiles'}
                className="mb-4"
              >
                {loading === 'profiles' ? 'Testing...' : 'Test Profiles API'}
              </Button>
              
              {profiles && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(profiles, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transfer Quote Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Transfer Quote
                <StatusBadge result={quote} />
              </CardTitle>
              <CardDescription>
                Get real exchange rates and fees for coach payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>From Currency</Label>
                    <Input
                      value={quoteForm.sourceCurrency}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, sourceCurrency: e.target.value }))}
                      placeholder="USD"
                    />
                  </div>
                  <div>
                    <Label>To Currency</Label>
                    <Input
                      value={quoteForm.targetCurrency}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, targetCurrency: e.target.value }))}
                      placeholder="EUR"
                    />
                  </div>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={quoteForm.sourceAmount}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, sourceAmount: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
              
              <Button 
                onClick={testQuote}
                disabled={loading === 'quote'}
                className="mb-4"
              >
                {loading === 'quote' ? 'Getting Quote...' : 'Get Quote'}
              </Button>
              
              {quote && (
                <div className="bg-gray-50 p-3 rounded-md">
                  {quote.success ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span className="font-mono">{quote.quote?.rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fee:</span>
                        <span className="font-mono">${quote.quote?.fee?.value}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Target Amount:</span>
                        <span className="font-mono">{quote.quote?.targetAmount} {quote.quote?.targetCurrency}</span>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-xs text-red-600">
                      {JSON.stringify(quote, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coach Payout Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Coach Payout
                <StatusBadge result={payout} />
              </CardTitle>
              <CardDescription>
                Simulate complete coach payment workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div>
                  <Label>Coach ID</Label>
                  <Input
                    value={payoutForm.coachId}
                    onChange={(e) => setPayoutForm(prev => ({ ...prev, coachId: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={payoutForm.amount}
                      onChange={(e) => setPayoutForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Input
                      value={payoutForm.currency}
                      onChange={(e) => setPayoutForm(prev => ({ ...prev, currency: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Session Reference</Label>
                  <Textarea
                    value={payoutForm.sessionReference}
                    onChange={(e) => setPayoutForm(prev => ({ ...prev, sessionReference: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
              
              <Button 
                onClick={testPayout}
                disabled={loading === 'payout'}
                className="mb-4"
              >
                {loading === 'payout' ? 'Processing...' : 'Simulate Payout'}
              </Button>
              
              {payout && (
                <div className="bg-gray-50 p-3 rounded-md">
                  {payout.success ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-semibold">Payout Simulated Successfully</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Amount:</strong> ${payout.payout_simulation?.amount}</p>
                        <p><strong>Target:</strong> {payout.payout_simulation?.targetAmount} {payout.payout_simulation?.currency}</p>
                        <p><strong>Rate:</strong> {payout.payout_simulation?.rate}</p>
                        <p><strong>Status:</strong> {payout.payout_simulation?.status}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      {payout.error}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Balances Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Account Balances
                <StatusBadge result={balances} />
              </CardTitle>
              <CardDescription>
                Check Wise Business account balances across currencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testBalances}
                disabled={loading === 'balances'}
                className="mb-4"
              >
                {loading === 'balances' ? 'Loading...' : 'Check Balances'}
              </Button>
              
              {balances && (
                <div className="bg-gray-50 p-3 rounded-md">
                  {balances.success ? (
                    <div className="space-y-2">
                      {balances.balances?.map((balance: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-mono">{balance.currency}</span>
                          <div className="text-right">
                            <div className="font-bold">{balance.amount}</div>
                            <div className="text-xs text-gray-500">Available: {balance.available}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      {balances.error}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Production Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-semibold">Create Wise Business Account</p>
                  <p className="text-sm text-gray-600">Visit wise.com/register and set up business account</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-semibold">Generate API Token</p>
                  <p className="text-sm text-gray-600">Settings → API Tokens → Create new token</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-semibold">Configure Environment</p>
                  <p className="text-sm text-gray-600">Set WISE_BUSINESS_API_TOKEN environment variable</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">✓</div>
                <div>
                  <p className="font-semibold">Start Processing Payments</p>
                  <p className="text-sm text-gray-600">All APIs ready for production use immediately</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}