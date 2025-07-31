import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, DollarSign, Shield, Globe } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Payment form schema
const paymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least $1'),
  currency: z.string().length(3, 'Invalid currency code'),
  paymentType: z.enum(['coach_session', 'pcp_certification', 'subscription']),
  cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
  expiryYear: z.string().regex(/^\d{4}$/, 'Invalid year'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
  cardholderName: z.string().min(2, 'Cardholder name required')
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface WisePaymentFormProps {
  amount: number;
  currency: string;
  paymentType: 'coach_session' | 'pcp_certification' | 'subscription';
  recipientName?: string;
  onSuccess?: (paymentResult: any) => void;
  onError?: (error: string) => void;
}

export default function WisePaymentForm({
  amount,
  currency = 'USD',
  paymentType,
  recipientName,
  onSuccess,
  onError
}: WisePaymentFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'quote' | 'payment' | 'processing' | 'complete'>('quote');
  const [quote, setQuote] = useState<any>(null);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount,
      currency,
      paymentType,
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: ''
    }
  });

  // Get payment quote
  const quoteMutation = useMutation({
    mutationFn: async (data: { amount: number; currency: string; paymentType: string }) => {
      const response = await apiRequest('POST', '/api/wise/quote', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setQuote(data.quote);
        setStep('payment');
      } else {
        throw new Error(data.error);
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Quote Error',
        description: error.message,
        variant: 'destructive'
      });
      onError?.(error.message);
    }
  });

  // Process payment
  const paymentMutation = useMutation({
    mutationFn: async (paymentData: PaymentFormData) => {
      const response = await apiRequest('POST', '/api/wise/process', {
        quoteId: quote.id,
        recipientId: 'coach_recipient_id', // Would be dynamic
        customerTransactionId: `pickle_${Date.now()}`,
        paymentMethod: {
          type: 'card',
          details: {
            cardNumber: paymentData.cardNumber,
            expiryMonth: paymentData.expiryMonth,
            expiryYear: paymentData.expiryYear,
            cvv: paymentData.cvv,
            cardholderName: paymentData.cardholderName
          }
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setStep('complete');
        toast({
          title: 'Payment Successful',
          description: `Payment of ${amount} ${currency} processed successfully!`
        });
        onSuccess?.(data.payment);
      } else {
        throw new Error(data.error);
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive'
      });
      onError?.(error.message);
    }
  });

  const handleGetQuote = () => {
    quoteMutation.mutate({
      amount: form.getValues('amount'),
      currency: form.getValues('currency'),
      paymentType: form.getValues('paymentType')
    });
  };

  const handleProcessPayment = (data: PaymentFormData) => {
    setStep('processing');
    paymentMutation.mutate(data);
  };

  const formatPaymentType = (type: string) => {
    switch (type) {
      case 'coach_session': return 'Coach Session';
      case 'pcp_certification': return 'PCP Certification';
      case 'subscription': return 'Premium Subscription';
      default: return type;
    }
  };

  if (step === 'complete') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold">${amount} {currency}</p>
            <p className="text-sm text-gray-600">
              {formatPaymentType(paymentType)}
              {recipientName && ` - ${recipientName}`}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Secure Payment with Wise
        </CardTitle>
        <CardDescription>
          {step === 'quote' && 'Get instant quote with transparent fees'}
          {step === 'payment' && 'Enter your payment details'}
          {step === 'processing' && 'Processing your payment...'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Summary */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Payment Type:</span>
            <span className="font-medium">{formatPaymentType(paymentType)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-bold text-lg">${amount} {currency}</span>
          </div>
          {recipientName && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">To:</span>
              <span className="font-medium">{recipientName}</span>
            </div>
          )}
          {quote && (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Processing Fee:</span>
                <span>${quote.fee.toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between items-center font-bold border-t pt-2">
                <span>Total:</span>
                <span>${quote.totalCost.toFixed(2)} {currency}</span>
              </div>
            </>
          )}
        </div>

        {/* Wise Benefits */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="flex flex-col items-center">
            <DollarSign className="w-4 h-4 text-green-600 mb-1" />
            <span>Low Fees</span>
          </div>
          <div className="flex flex-col items-center">
            <Shield className="w-4 h-4 text-blue-600 mb-1" />
            <span>Secure</span>
          </div>
          <div className="flex flex-col items-center">
            <Globe className="w-4 h-4 text-purple-600 mb-1" />
            <span>Global</span>
          </div>
        </div>

        {step === 'quote' && (
          <Button 
            onClick={handleGetQuote} 
            disabled={quoteMutation.isPending}
            className="w-full"
          >
            {quoteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting Quote...
              </>
            ) : (
              'Get Quote & Continue'
            )}
          </Button>
        )}

        {step === 'payment' && (
          <form onSubmit={form.handleSubmit(handleProcessPayment)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                {...form.register('cardNumber')}
              />
              {form.formState.errors.cardNumber && (
                <p className="text-sm text-red-600">{form.formState.errors.cardNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Expiry Month</Label>
                <Select onValueChange={(value) => form.setValue('expiryMonth', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = String(i + 1).padStart(2, '0');
                      return (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryYear">Expiry Year</Label>
                <Select onValueChange={(value) => form.setValue('expiryYear', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = String(new Date().getFullYear() + i);
                      return (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  {...form.register('cvv')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  {...form.register('cardholderName')}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={paymentMutation.isPending || step === 'processing'}
              className="w-full"
            >
              {step === 'processing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Pay ${quote ? `$${quote.totalCost.toFixed(2)}` : `$${amount}`} ${currency}`
              )}
            </Button>
          </form>
        )}

        <p className="text-xs text-gray-500 text-center">
          Powered by Wise • Secure & regulated payment processing
        </p>
      </CardContent>
    </Card>
  );
}