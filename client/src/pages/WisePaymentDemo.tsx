import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import WisePaymentForm from '@/components/payments/WisePaymentForm';
import { 
  DollarSign, 
  Users, 
  Award, 
  Crown,
  ArrowLeft,
  CheckCircle,
  Globe,
  Shield,
  Zap
} from 'lucide-react';

export default function WisePaymentDemo() {
  const [selectedPayment, setSelectedPayment] = useState<{
    amount: number;
    currency: string;
    type: 'coach_session' | 'pcp_certification' | 'subscription';
    title: string;
    recipient?: string;
  } | null>(null);

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const paymentOptions = [
    {
      id: 'coach_session',
      title: 'Coach Session',
      subtitle: 'Book 1-hour session with PCP Level 5 Coach',
      amount: 95,
      currency: 'USD',
      type: 'coach_session' as const,
      icon: Users,
      recipient: 'Coach Sarah Wilson',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'pcp_l1',
      title: 'PCP Level 1 Certification',
      subtitle: '2-day intensive coaching fundamentals',
      amount: 699,
      currency: 'USD',
      type: 'pcp_certification' as const,
      icon: Award,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      id: 'pcp_l5',
      title: 'PCP Level 5 Master Certification',
      subtitle: '6-month comprehensive mastery program',
      amount: 2499,
      currency: 'USD',
      type: 'pcp_certification' as const,
      icon: Crown,
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      id: 'premium',
      title: 'Premium Subscription',
      subtitle: 'Annual premium features and analytics',
      amount: 99,
      currency: 'USD',
      type: 'subscription' as const,
      icon: Zap,
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600'
    }
  ];

  const handlePaymentSuccess = (paymentResult: any) => {
    console.log('Payment successful:', paymentResult);
    setPaymentSuccess(true);
    // In real app, would update user's purchase history, send confirmation email, etc.
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    // In real app, would show detailed error handling
  };

  const resetDemo = () => {
    setSelectedPayment(null);
    setPaymentSuccess(false);
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
              <CardDescription>
                Your {selectedPayment?.title} purchase has been confirmed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Purchase:</span>
                  <span className="font-medium">{selectedPayment?.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-bold">${selectedPayment?.amount} {selectedPayment?.currency}</span>
                </div>
                {selectedPayment?.recipient && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Coach:</span>
                    <span className="font-medium">{selectedPayment.recipient}</span>
                  </div>
                )}
              </div>

              <div className="text-center space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center">
                    <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                    <span className="font-medium">Lower Fees</span>
                    <span className="text-xs text-gray-600">30-40% savings vs traditional processors</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Shield className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="font-medium">Secure</span>
                    <span className="text-xs text-gray-600">FCA regulated & PCI compliant</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Globe className="w-6 h-6 text-purple-600 mb-2" />
                    <span className="font-medium">Global</span>
                    <span className="text-xs text-gray-600">40+ currencies supported</span>
                  </div>
                </div>

                <Button onClick={resetDemo} variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Try Another Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="mb-6">
            <Button 
              onClick={() => setSelectedPayment(null)} 
              variant="ghost" 
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Options
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Complete Your {selectedPayment.title} Purchase
            </h1>
            <p className="text-gray-600">
              Secure payment processing powered by Wise
            </p>
          </div>

          <WisePaymentForm
            amount={selectedPayment.amount}
            currency={selectedPayment.currency}
            paymentType={selectedPayment.type}
            recipientName={selectedPayment.recipient}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wise Payment Integration Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience seamless, low-cost payment processing for Pickle+ coaching services and certifications
          </p>
          
          {/* Benefits Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-md border border-white/20 rounded-lg p-4">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">35% Lower Fees</h3>
              <p className="text-sm text-gray-600">
                1% domestic cards vs 2.9% + 30¢ with traditional processors
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-md border border-white/20 rounded-lg p-4">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Bank-Level Security</h3>
              <p className="text-sm text-gray-600">
                FCA regulated with PCI DSS compliance for secure payments
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-md border border-white/20 rounded-lg p-4">
              <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Global Coverage</h3>
              <p className="text-sm text-gray-600">
                40+ currencies with mid-market exchange rates
              </p>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Choose a Payment to Demo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card 
                  key={option.id}
                  className={`${option.color} cursor-pointer transition-all hover:shadow-lg hover:scale-105`}
                  onClick={() => setSelectedPayment({
                    amount: option.amount,
                    currency: option.currency,
                    type: option.type,
                    title: option.title,
                    recipient: option.recipient
                  })}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${option.iconColor}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{option.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {option.subtitle}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ${option.amount}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {option.currency}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Shield className="w-4 h-4" />
                        <span>Secure payment via Wise</span>
                      </div>
                      {option.recipient && (
                        <span className="text-gray-600">→ {option.recipient}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-8">
            Why Wise for Pickle+ Payments?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Perfect for Coaching</h4>
              <p className="text-sm text-gray-600">
                Ideal for recurring coach payments, international students, and multi-currency support.
              </p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">API-First Platform</h4>
              <p className="text-sm text-gray-600">
                RESTful API with webhooks, automated payouts, and real-time payment tracking.
              </p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Revenue Optimization</h4>
              <p className="text-sm text-gray-600">
                Lower fees mean higher coach retention and better platform economics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}