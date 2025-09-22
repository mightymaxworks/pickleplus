/**
 * CREDIT TOP-UP FORM COMPONENT
 * 
 * Specialized form for individual credit purchases with UDF-compliant validation,
 * bonus calculations, and secure Wise payment integration.
 * 
 * Version: 1.0.0 - Sprint 1: Individual Credit System
 * Last Updated: September 17, 2025
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  CreditCard, 
  Gift, 
  Loader2, 
  CheckCircle,
  Info,
  Calculator
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Form validation schema
const topUpSchema = z.object({
  amount: z.number().min(2500, 'Minimum top-up is $25').max(250000, 'Maximum top-up is $2500'),
  currency: z.enum(['USD', 'SGD', 'AUD', 'MYR', 'CNY']).default('USD'),
  customerEmail: z.string().email('Valid email address required'),
});

type TopUpFormData = z.infer<typeof topUpSchema>;

interface CreditAccount {
  id: number;
  balance: number;
  totalPurchased: number;
  dailyLimit: number;
}

interface CreditTopUpFormProps {
  account?: CreditAccount;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

// Predefined credit amounts with bonus calculations
const PRESET_AMOUNTS = [
  { 
    value: 2500, // $25
    label: '$25',
    bonus: 0,
    picklePoints: 75, // 3:1 ratio
    popular: false
  },
  { 
    value: 5000, // $50
    label: '$50', 
    bonus: 250, // $2.50 bonus
    picklePoints: 158, // Includes bonus
    popular: false
  },
  { 
    value: 10000, // $100
    label: '$100',
    bonus: 750, // $7.50 bonus
    picklePoints: 323, // Includes bonus
    popular: true
  },
  { 
    value: 25000, // $250
    label: '$250',
    bonus: 2500, // $25 bonus
    picklePoints: 825, // Includes bonus
    popular: false
  },
  { 
    value: 50000, // $500
    label: '$500',
    bonus: 6250, // $62.50 bonus
    picklePoints: 1688, // Includes bonus
    popular: false
  },
  { 
    value: 100000, // $1000
    label: '$1000',
    bonus: 15000, // $150 bonus
    picklePoints: 3450, // Includes bonus
    popular: false
  },
  { 
    value: 250000, // $2500
    label: '$2500',
    bonus: 50000, // $500 bonus
    picklePoints: 8250, // Includes bonus
    popular: false
  }
];

// Currency data interface
interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export default function CreditTopUpForm({ account, onSuccess, onError }: CreditTopUpFormProps) {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number>(10000); // Default $100
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [step, setStep] = useState<'amount' | 'payment' | 'processing' | 'complete'>('amount');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // Fetch supported currencies on component mount
  useEffect(() => {
    console.log('[CREDITS] Fetching currencies...');
    
    const fetchCurrencies = async () => {
      try {
        const response = await apiRequest('/api/credits/currencies');
        console.log('[CREDITS] Currency API response:', response);
        
        if (response.success && response.data && response.data.currencies) {
          console.log('[CREDITS] Setting currencies from API:', response.data.currencies);
          setCurrencies(response.data.currencies);
        } else {
          console.log('[CREDITS] Invalid API response, using fallback currencies');
          setFallbackCurrencies();
        }
      } catch (error) {
        console.error('[CREDITS] Failed to fetch currencies:', error);
        setFallbackCurrencies();
      }
    };
    
    const setFallbackCurrencies = () => {
      const fallbackCurrencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
      ];
      console.log('[CREDITS] Setting fallback currencies:', fallbackCurrencies);
      setCurrencies(fallbackCurrencies);
    };
    
    fetchCurrencies();
  }, []);

  // Debug effect to track currencies state changes
  useEffect(() => {
    console.log('[CREDITS] Currencies state changed:', currencies, 'Length:', currencies.length);
  }, [currencies]);

  const form = useForm<TopUpFormData>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      amount: selectedAmount,
      currency: 'USD',
      customerEmail: ''
    }
  });

  // Update form when selected amount changes
  useEffect(() => {
    form.setValue('amount', selectedAmount);
  }, [selectedAmount, form]);

  // Use server-side bonus calculations when available, fall back to client estimation
  const getAmountDetails = (amount: number) => {
    const preset = PRESET_AMOUNTS.find(p => p.value === amount);
    if (preset) {
      return preset;
    }
    
    // Client-side estimation for preview (server will provide accurate values)
    let bonus = 0;
    if (amount >= 5000) bonus = Math.floor(amount * 0.05); // 5% bonus for $50+
    if (amount >= 10000) bonus = Math.floor(amount * 0.075); // 7.5% bonus for $100+
    if (amount >= 25000) bonus = Math.floor(amount * 0.1); // 10% bonus for $250+
    if (amount >= 50000) bonus = Math.floor(amount * 0.125); // 12.5% bonus for $500+
    
    const totalCredits = amount + bonus;
    const picklePoints = Math.floor(totalCredits * 3); // 3:1 ratio
    
    return {
      value: amount,
      label: `$${(amount / 100).toFixed(2)}`,
      bonus,
      picklePoints,
      popular: false,
      note: "Final amounts will be calculated by server"
    };
  };

  const currentDetails = getAmountDetails(selectedAmount);

  // Top-up mutation
  const topUpMutation = useMutation({
    mutationFn: async (data: TopUpFormData) => {
      const response = await apiRequest('/api/credits/top-up', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: (result) => {
      setPaymentResult(result);
      setStep('processing');
      
      // Use server-calculated values instead of client-side calculations
      if (result.expectedBonusCredits) {
        setSelectedAmount(result.expectedTotalCredits || selectedAmount);
      }
      
      // Poll for payment status
      setTimeout(() => {
        setStep('complete');
        onSuccess?.(result);
        toast({
          title: "Top-Up Initiated!",
          description: "Your payment is being processed. Credits will be added once payment is confirmed."
        });
      }, 2000); // Show processing state briefly
    },
    onError: (error: any) => {
      toast({
        title: "Top-Up Failed",
        description: error.message || "Unable to process top-up request",
        variant: "destructive"
      });
      onError?.(error.message);
    }
  });

  const handleSubmit = (data: TopUpFormData) => {
    setStep('processing');
    topUpMutation.mutate(data);
  };

  // Dynamic currency formatter that adapts to selected currency
  const formatCurrency = (cents: number, currencyCode?: string) => {
    const currency = currencyCode || selectedCurrency;
    const selectedCurrencyInfo = currencies.find(c => c.code === currency);
    const symbol = selectedCurrencyInfo?.symbol || '$';
    return `${symbol}${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {step === 'amount' && (
        <>
          {/* Amount Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Select Amount & Currency
              </CardTitle>
              <CardDescription>
                Choose your currency and how much you'd like to add to your credit balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Currency Selector - Moved to top */}
              <div className="mb-6">
                <Label htmlFor="currency" className="text-base font-medium">Currency</Label>
                <Select 
                  value={selectedCurrency} 
                  onValueChange={(value) => {
                    setSelectedCurrency(value);
                    form.setValue('currency', value as any);
                  }}
                >
                  <SelectTrigger data-testid="select-currency" className="mt-2">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.length === 0 ? (
                      <SelectItem value="loading" disabled>Loading currencies...</SelectItem>
                    ) : (
                      currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.currency && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.currency.message}
                  </p>
                )}
              </div>
              {/* Preset Amount Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setSelectedAmount(preset.value)}
                    className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                      selectedAmount === preset.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    data-testid={`button-amount-${preset.value}`}
                  >
                    {preset.popular && (
                      <Badge className="absolute -top-2 -right-2 text-xs">
                        Popular
                      </Badge>
                    )}
                    <div className="font-semibold text-lg">{preset.label}</div>
                    {preset.bonus > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        +{formatCurrency(preset.bonus)} bonus
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {preset.picklePoints} Pickle Points
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="space-y-3">
                <Label htmlFor="custom-amount">Custom Amount ($25 - $2500)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="custom-amount"
                    type="number"
                    min={25}
                    max={2500}
                    step={0.01}
                    placeholder="Enter amount..."
                    className="pl-9"
                    value={selectedAmount / 100}
                    onChange={(e) => {
                      const dollars = parseFloat(e.target.value) || 0;
                      setSelectedAmount(Math.round(dollars * 100));
                    }}
                    data-testid="input-custom-amount"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amount Summary */}
          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Calculator className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                    Purchase Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-800 dark:text-green-200">Base Amount:</span>
                      <span className="font-medium text-green-900 dark:text-green-100">
                        {formatCurrency(selectedAmount)}
                      </span>
                    </div>
                    {currentDetails.bonus > 0 && (
                      <div className="flex justify-between">
                        <span className="text-green-800 dark:text-green-200">Bonus Credits:</span>
                        <span className="font-medium text-green-900 dark:text-green-100">
                          +{formatCurrency(currentDetails.bonus)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-green-300 dark:border-green-700 pt-2 flex justify-between">
                      <span className="font-semibold text-green-900 dark:text-green-100">Total Credits:</span>
                      <span className="font-semibold text-green-900 dark:text-green-100">
                        {formatCurrency(selectedAmount + currentDetails.bonus)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800 dark:text-green-200">Pickle Points Earned:</span>
                      <span className="font-medium text-green-900 dark:text-green-100">
                        {currentDetails.picklePoints} points
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>
                Enter your email to receive payment confirmation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...form.register('customerEmail')}
                    data-testid="input-customer-email"
                  />
                  {form.formState.errors.customerEmail && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.customerEmail.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={topUpMutation.isPending}
                  data-testid="button-proceed-payment"
                >
                  {topUpMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <DollarSign className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your payment will be processed securely through Wise. Credits will be added to your account 
              once payment is confirmed, typically within a few minutes.
            </AlertDescription>
          </Alert>
        </>
      )}

      {step === 'processing' && (
        <Card className="text-center">
          <CardContent className="pt-6">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Processing Payment...</h2>
            <p className="text-muted-foreground">
              Please wait while we process your credit top-up request.
            </p>
          </CardContent>
        </Card>
      )}

      {step === 'complete' && paymentResult && (
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Top-Up Initiated!</h2>
            <p className="text-muted-foreground mb-4">
              Your payment request has been submitted successfully.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm">
                <strong>Transaction ID:</strong> {paymentResult.transaction?.id}
              </p>
              <p className="text-sm">
                <strong>Amount:</strong> {formatCurrency(selectedAmount + currentDetails.bonus)}
              </p>
            </div>
            <Button 
              onClick={() => {
                setStep('amount');
                setPaymentResult(null);
              }}
              className="mt-4"
            >
              Make Another Top-Up
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}