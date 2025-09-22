/**
 * INDIVIDUAL CREDITS PAGE
 * 
 * Comprehensive credit management interface for individual users.
 * Features real-time balance display, top-up functionality, transaction history,
 * and UDF-compliant credit operations with proper security validation.
 * 
 * Version: 1.0.0 - Sprint 1: Individual Credit System
 * Last Updated: September 17, 2025
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  Plus, 
  History, 
  TrendingUp, 
  DollarSign, 
  ArrowUpCircle,
  Clock,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import CreditTopUpForm from '@/components/credits/CreditTopUpForm';
import CreditTransactionHistory from '@/components/credits/CreditTransactionHistory';

// Types
interface CreditAccount {
  id: number;
  userId: number;
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  dailyLimit: number;
  createdAt: string;
  updatedAt: string;
}

interface CreditTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  wiseTransferState?: string;
  picklePointsAwarded: number;
  createdAt: string;
}

interface DailyLimits {
  isValid: boolean;
  remainingDaily: number;
  errors: string[];
}

export default function CreditsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch credit account data
  const { data: account, isLoading: accountLoading, error: accountError } = useQuery<CreditAccount>({
    queryKey: ['/api/credits/account'],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time balance
  });

  // Fetch transaction history
  const { data: historyData, isLoading: historyLoading } = useQuery<{
    data: {
      transactions: CreditTransaction[];
      totalCount: number;
      currentBalance: number;
      pagination: any;
    }
  }>({
    queryKey: ['/api/credits/history'],
    enabled: !!account,
  });
  
  const transactions = historyData?.data?.transactions || [];

  // Fetch daily limits
  const { data: limits } = useQuery<DailyLimits>({
    queryKey: ['/api/credits/limits'],
    enabled: !!account,
  });

  // Credit balance display with real-time updates
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Loading state
  if (accountLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your credit account...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (accountError) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Unable to Load Account</h2>
              <p className="text-muted-foreground mb-4">
                We couldn't load your credit account. Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Wallet className="h-8 w-8 text-primary" />
          My Pickle Credits
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your credit balance, view transaction history, and top up your account
        </p>
      </div>

      {/* Credit Balance Overview */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Current Balance */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(account?.balance || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Available to spend
            </p>
          </CardContent>
        </Card>

        {/* Total Purchased */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Purchased
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(account?.totalPurchased || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Lifetime purchases
            </p>
          </CardContent>
        </Card>

        {/* Daily Limit */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Daily Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(limits?.remainingDaily || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Remaining today
            </p>
            <Progress 
              value={limits ? ((account?.dailyLimit || 0) - limits.remainingDaily) / (account?.dailyLimit || 1) * 100 : 0} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="topup" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Top Up
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common credit management actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setActiveTab('topup')} 
                  className="w-full justify-start"
                  data-testid="button-quick-topup"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credits ($25 - $500)
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('history')} 
                  className="w-full justify-start"
                  data-testid="button-view-history"
                >
                  <History className="h-4 w-4 mr-2" />
                  View Transaction History
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest credit transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions?.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'top_up' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {transaction.type === 'top_up' ? <ArrowUpCircle className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium text-sm ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </p>
                          {transaction.picklePointsAwarded > 0 && (
                            <p className="text-xs text-muted-foreground">
                              +{transaction.picklePointsAwarded} Pickle Points
                            </p>
                          )}
                        </div>
                      </div>
                    )) || (
                      <p className="text-center text-muted-foreground py-4">
                        No recent transactions
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Information Banner */}
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    How Pickle Credits Work
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Credits are stored securely in your account and never expire</li>
                    <li>• Earn 3 Pickle Points for every $1 in credits you purchase</li>
                    <li>• Use credits for coaching sessions, tournaments, and facility bookings</li>
                    <li>• Daily spending limits help protect your account from unauthorized use</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Up Tab */}
        <TabsContent value="topup" className="space-y-6 mt-6">
          <CreditTopUpForm account={account} onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/credits/account'] });
            queryClient.invalidateQueries({ queryKey: ['/api/credits/history'] });
            toast({ 
              title: "Credits Added Successfully!",
              description: "Your account balance has been updated."
            });
          }} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <CreditTransactionHistory transactions={transactions} loading={historyLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}