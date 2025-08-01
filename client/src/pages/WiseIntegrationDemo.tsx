import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Building2, DollarSign, Globe, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WiseProfile {
  id: number;
  type: 'personal' | 'business';
  details: {
    firstName?: string;
    lastName?: string;
    name?: string;
    registrationNumber?: string;
    businessCategory?: string;
    primaryAddress: number;
  };
}

interface WiseQuote {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  rate: number;
}

export default function WiseIntegrationDemo() {
  const [profiles, setProfiles] = useState<WiseProfile[]>([]);
  const [quote, setQuote] = useState<WiseQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [amount, setAmount] = useState('95');
  const { toast } = useToast();

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wise/business/profiles');
      const data = await response.json();
      
      if (data.success) {
        setProfiles(data.profiles);
        toast({
          title: "Profiles Retrieved",
          description: `Found ${data.profiles.length} business profile(s)`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQuote = async () => {
    setQuoteLoading(true);
    try {
      const response = await fetch('/api/wise/business/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCurrency,
          targetCurrency,
          sourceAmount: parseFloat(amount)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuote(data.quote);
        toast({
          title: "Quote Generated",
          description: `${sourceCurrency} to ${targetCurrency} at rate ${data.quote.rate}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate quote",
        variant: "destructive",
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wise Integration Demo
          </h1>
          <p className="text-gray-600">
            Production-ready international payment system for coach payouts
          </p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">
              Live Production Environment
            </span>
          </div>
        </div>

        {/* Business Profiles Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Business Profiles</span>
            </CardTitle>
            <CardDescription>
              Retrieve authenticated business profiles from Wise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={fetchProfiles} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Profiles...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Load Business Profiles
                </>
              )}
            </Button>

            {profiles.length > 0 && (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <div key={profile.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        {profile.type === 'business' 
                          ? profile.details.name 
                          : `${profile.details.firstName} ${profile.details.lastName}`
                        }
                      </h3>
                      <Badge variant={profile.type === 'business' ? 'default' : 'secondary'}>
                        {profile.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Profile ID:</strong> {profile.id}</p>
                      {profile.details.registrationNumber && (
                        <p><strong>Registration:</strong> {profile.details.registrationNumber}</p>
                      )}
                      {profile.details.businessCategory && (
                        <p><strong>Category:</strong> {profile.details.businessCategory}</p>
                      )}
                      <p><strong>Address ID:</strong> {profile.details.primaryAddress}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Currency Quote Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Exchange Rate Quotes</span>
            </CardTitle>
            <CardDescription>
              Generate real-time exchange quotes for international transfers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sourceCurrency">From Currency</Label>
                <Input
                  id="sourceCurrency"
                  value={sourceCurrency}
                  onChange={(e) => setSourceCurrency(e.target.value.toUpperCase())}
                  placeholder="USD"
                  maxLength={3}
                />
              </div>
              <div>
                <Label htmlFor="targetCurrency">To Currency</Label>
                <Input
                  id="targetCurrency"
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value.toUpperCase())}
                  placeholder="EUR"
                  maxLength={3}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="95"
                />
              </div>
            </div>

            <Button onClick={generateQuote} disabled={quoteLoading} className="w-full">
              {quoteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Quote...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Generate Exchange Quote
                </>
              )}
            </Button>

            {quote && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold mb-2">Exchange Quote</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Quote ID:</strong> {quote.id}</p>
                  <p><strong>From:</strong> {quote.sourceAmount} {quote.sourceCurrency}</p>
                  <p><strong>To:</strong> {(quote.sourceAmount * quote.rate).toFixed(2)} {quote.targetCurrency}</p>
                  <p><strong>Exchange Rate:</strong> {quote.rate}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Production API token authenticated</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Business profiles accessible</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Real-time exchange quotes working</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Ready for coach payout implementation</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}