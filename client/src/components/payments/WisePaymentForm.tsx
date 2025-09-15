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

// Payment form schema - Secure bank transfer flow (PCI compliant)
const paymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least $1'),
  currency: z.string().length(3, 'Invalid currency code'),
  paymentType: z.enum(['coach_session', 'pcp_certification', 'subscription', 'facility_booking', 'tournament_entry']),
  senderName: z.string().min(2, 'Name is required'),
  senderEmail: z.string().email('Valid email is required')
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface WisePaymentFormProps {
  amount: number;
  currency: string;
  paymentType: 'coach_session' | 'pcp_certification' | 'subscription' | 'facility_booking' | 'tournament_entry';
  resourceId: string; // Facility ID, Tournament ID, Coach ID, etc.
  recipientName?: string;
  onSuccess?: (paymentResult: any) => void;
  onError?: (error: string) => void;
}

export default function WisePaymentForm({
  amount,
  currency = 'USD',
  paymentType,
  resourceId,
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
      senderName: '',
      senderEmail: ''
    }
  });

  // Get payment quote
  const quoteMutation = useMutation({
    mutationFn: async (data: { amount: number; currency: string; paymentType: string }) => {
      const quoteData = {
        sourceAmount: data.amount,
        sourceCurrency: data.currency,
        targetCurrency: data.currency,
        paymentType: data.paymentType
      };
      const response = await apiRequest('POST', '/api/wise/quote', quoteData);
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

  // Process payment via secure bank transfer (PCI compliant)
  const paymentMutation = useMutation({
    mutationFn: async (paymentData: PaymentFormData) => {
      const response = await apiRequest('POST', '/api/wise/process', {
        quoteId: quote.id,
        customerTransactionId: `pickle_${Date.now()}`,
        paymentType: paymentType,
        resourceId: resourceId, // Server will securely map to recipient
        paymentMethod: {
          type: 'bank_transfer',
          details: {
            senderName: paymentData.senderName,
            senderEmail: paymentData.senderEmail
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

  // Dynamic recipient ID based on payment type
  const getRecipientId = () => {
    switch (paymentType) {
      case 'facility_booking': return `facility_${recipientName?.toLowerCase().replace(/\s+/g, '_') || 'default'}`;
      case 'tournament_entry': return `tournament_${recipientName?.toLowerCase().replace(/\s+/g, '_') || 'default'}`;
      case 'coach_session': return `coach_${recipientName?.toLowerCase().replace(/\s+/g, '_') || 'default'}`;
      default: return 'default_recipient';
    }
  };

  const formatPaymentType = (type: string) => {
    switch (type) {
      case 'coach_session': return 'Coach Session';
      case 'pcp_certification': return 'PCP Certification';
      case 'subscription': return 'Premium Subscription';
      case 'facility_booking': return 'Facility Booking';
      case 'tournament_entry': return 'Tournament Entry';
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
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Secure Bank Transfer</span>
              </div>
              <p className="text-xs text-blue-700">
                We'll provide you with secure bank transfer instructions. No credit card details required.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderName">Your Full Name</Label>
              <Input
                id="senderName"
                placeholder="John Doe"
                {...form.register('senderName')}
              />
              {form.formState.errors.senderName && (
                <p className="text-sm text-red-600">{form.formState.errors.senderName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderEmail">Email Address</Label>
              <Input
                id="senderEmail"
                type="email"
                placeholder="john@example.com"
                {...form.register('senderEmail')}
              />
              {form.formState.errors.senderEmail && (
                <p className="text-sm text-red-600">{form.formState.errors.senderEmail.message}</p>
              )}
            </div>

            <div className="bg-green-50 p-3 rounded-lg text-xs text-green-700">
              <strong>Next:</strong> You'll receive secure payment instructions via email with bank details and reference number.
            </div>

            <Button 
              type="submit" 
              disabled={paymentMutation.isPending || step === 'processing'}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {step === 'processing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Payment Instructions...
                </>
              ) : (
                `Get Payment Instructions - ${quote ? `$${quote.totalCost.toFixed(2)}` : `$${amount}`} ${currency}`
              )}
            </Button>
          </form>
        )}

        <p className="text-xs text-gray-500 text-center">
          Powered by Wise • PCI-compliant bank transfer • No card details stored
        </p>
      </CardContent>
    </Card>
  );
}