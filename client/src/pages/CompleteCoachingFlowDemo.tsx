/**
 * Complete Coaching Flow Demo Page
 * PKL-278651-PCP-BASIC-TIER - End-to-End Coaching Journey
 * 
 * Demonstrates the complete flow from PCP certification payment to coach directory listing
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  CreditCard, 
  User, 
  Award, 
  DollarSign,
  ArrowRight,
  Star,
  MapPin,
  Calendar,
  BookOpen,
  Shield
} from 'lucide-react';
import { ProfileAutoFill } from '@/components/coach/ProfileAutoFill';

interface PCP_Level {
  level: number;
  name: string;
  badge: string;
  cost: number;
  commission: number;
  description: string;
  skills: string[];
}

const PCP_LEVELS: PCP_Level[] = [
  {
    level: 1,
    name: 'Entry Coach',
    badge: '🥉',
    cost: 699,
    commission: 15,
    description: 'Foundation skills for beginning coaches',
    skills: ['Basic Rules & Scoring', 'Fundamental Strokes', 'Court Positioning', 'Safety Guidelines']
  },
  {
    level: 2,
    name: 'Certified Coach',
    badge: '🥈',
    cost: 1299,
    commission: 13,
    description: 'Advanced teaching techniques and assessment',
    skills: ['Advanced Techniques', 'Strategy Development', 'Student Assessment', 'Lesson Planning']
  },
  {
    level: 3,
    name: 'Advanced Coach',
    badge: '🥇',
    cost: 2499,
    commission: 12,
    description: 'Specialized coaching and performance optimization',
    skills: ['Game Psychology', 'Advanced Tactics', 'Performance Analysis', 'Injury Prevention']
  },
  {
    level: 4,
    name: 'Master Coach',
    badge: '💎',
    cost: 4999,
    commission: 10,
    description: 'Elite coaching for competitive players',
    skills: ['Tournament Preparation', 'Advanced Strategy', 'Player Development', 'Business Skills']
  },
  {
    level: 5,
    name: 'Grand Master',
    badge: '👑',
    cost: 7999,
    commission: 8,
    description: 'Pinnacle of coaching excellence',
    skills: ['Coaching Mastery', 'Program Development', 'Leadership Skills', 'Innovation Methods']
  }
];

const CompleteCoachingFlowDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Coaching Profile
    bio: '',
    coachingPhilosophy: '',
    specializations: [] as string[],
    hourlyRate: 95.00,
    languagesSpoken: ['English'],
    
    // PCP Certification
    pcpCertificationNumber: '',
    
    // Payment
    paymentMethod: 'wise',
    paymentStatus: 'pending'
  });

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const [certificationStatus, setCertificationStatus] = useState<'provisional' | 'active' | 'pending'>('pending');

  const handleLevelSelect = (level: number) => {
    setSelectedLevel(level);
  };

  const simulatePayment = async () => {
    setPaymentProcessing(true);
    
    // Simulate WISE payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setPaymentProcessing(false);
    setPaymentComplete(true);
    setCertificationStatus('provisional');
    setFormData(prev => ({ 
      ...prev, 
      paymentStatus: 'completed',
      pcpCertificationNumber: `PCP-${selectedLevel}-${Date.now().toString().slice(-6)}`
    }));
    setCurrentStep(4);
  };

  const createCoachProfile = async () => {
    // Simulate profile creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProfileCreated(true);
    setCurrentStep(5);
  };

  const selectedLevelInfo = PCP_LEVELS.find(l => l.level === selectedLevel)!;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Coaching Flow Demo</h1>
        <p className="text-gray-600">
          Experience the full journey from PCP certification selection to coach directory listing
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: 'Select Level', icon: Award },
            { step: 2, label: 'Personal Info', icon: User },
            { step: 3, label: 'Payment', icon: CreditCard },
            { step: 4, label: 'Certification', icon: CheckCircle },
            { step: 5, label: 'Coach Profile', icon: Star }
          ].map(({ step, label, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`ml-2 text-sm ${currentStep >= step ? 'text-primary font-medium' : 'text-gray-500'}`}>
                {label}
              </span>
              {step < 5 && <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />}
            </div>
          ))}
        </div>
      </div>

      <Tabs value={currentStep.toString()} className="space-y-6">
        {/* Step 1: Level Selection */}
        <TabsContent value="1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Select Your PCP Certification Level
              </CardTitle>
              <CardDescription>
                Choose the certification level that matches your coaching experience. 
                Remember: levels must be completed sequentially.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {PCP_LEVELS.map((level) => (
                  <Card 
                    key={level.level}
                    className={`cursor-pointer transition-all ${
                      selectedLevel === level.level 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleLevelSelect(level.level)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{level.badge}</span>
                          <div>
                            <div className="font-semibold">
                              Level {level.level}: {level.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {level.description}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {level.skills.map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ${level.cost.toLocaleString()}
                          </div>
                          <div className="text-sm text-green-600">
                            {level.commission}% commission rate
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Alert>
                <AlertDescription>
                  <strong>Sequential Progression:</strong> You must complete Level 1 before Level 2, 
                  Level 2 before Level 3, and so on. This ensures proper skill development.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={() => setCurrentStep(2)}
                className="w-full"
                size="lg"
              >
                Continue with Level {selectedLevel}: {selectedLevelInfo.name}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Personal Information */}
        <TabsContent value="2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Provide your basic information for certification and profile creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfileAutoFill
                onAutoFill={(data) => setFormData(prev => ({ ...prev, ...data }))}
                currentData={formData}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="bio">Coaching Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell potential students about your coaching background and approach..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="95.00"
                />
                <p className="text-sm text-gray-600 mt-1">
                  ${formData.hourlyRate.toFixed(2)} per session
                </p>
              </div>

              <Button 
                onClick={() => setCurrentStep(3)}
                className="w-full"
                size="lg"
                disabled={!formData.firstName || !formData.lastName || !formData.email}
              >
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Payment */}
        <TabsContent value="3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Processing
              </CardTitle>
              <CardDescription>
                Complete your PCP Level {selectedLevel} certification payment via WISE
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="flex items-center justify-between mb-2">
                  <span>{selectedLevelInfo.badge} PCP Level {selectedLevel}: {selectedLevelInfo.name}</span>
                  <span className="font-semibold">${selectedLevelInfo.cost.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Commission Rate: {selectedLevelInfo.commission}% per session
                </div>
                <div className="border-t pt-2 flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span>${selectedLevelInfo.cost.toLocaleString()}</span>
                </div>
              </div>

              {/* WISE Payment Integration */}
              <div className="border p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">WISE Payment Gateway</span>
                  <Badge variant="secondary">Secure</Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Payment Method</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, paymentMethod: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wise">WISE Transfer</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>WISE Integration:</strong> Low-cost international payments with transparent fees. 
                      Supports 40+ currencies across 160+ countries.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={simulatePayment}
                    className="w-full"
                    size="lg"
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay ${selectedLevelInfo.cost.toLocaleString()} via WISE
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Certification Complete */}
        <TabsContent value="4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                PCP Certification Complete!
              </CardTitle>
              <CardDescription>
                Your payment has been processed and certification is now active
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 p-6 rounded-lg text-center border border-amber-200">
                <div className="text-4xl mb-4">{selectedLevelInfo.badge}</div>
                <h3 className="text-xl font-bold text-amber-800 mb-2">
                  PCP Level {selectedLevel}: {selectedLevelInfo.name}
                </h3>
                <p className="text-amber-700 mb-4">
                  Certification Number: {formData.pcpCertificationNumber}
                </p>
                <Badge className="bg-amber-600">Provisional Certification</Badge>
                <p className="text-sm text-amber-700 mt-2">
                  Complete course modules and await admin approval for full activation
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {selectedLevelInfo.commission}%
                  </div>
                  <div className="text-sm text-gray-600">Commission Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    ${(formData.hourlyRate * (1 - selectedLevelInfo.commission / 100)).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">You Earn Per Session</div>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Next Steps:</strong> Your certification is now provisional. Complete the required course modules 
                  and practical assessments to receive full certification approval from our administrators.
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Required Course Modules:</h4>
                <ul className="text-sm space-y-1">
                  {selectedLevelInfo.skills.map((skill, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      {skill} Module (Pending)
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                onClick={createCoachProfile}
                className="w-full"
                size="lg"
              >
                Create Coach Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 5: Coach Profile Created */}
        <TabsContent value="5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Star className="w-5 h-5" />
                Welcome to the Coach Directory!
              </CardTitle>
              <CardDescription>
                Your profile is now live and students can book sessions with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Coach Profile Preview */}
              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">
                        {formData.firstName} {formData.lastName}
                      </h3>
                      <span className="text-2xl">{selectedLevelInfo.badge}</span>
                      <Badge variant="secondary">PCP Level {selectedLevel}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${formData.hourlyRate.toFixed(2)}/session
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Available Worldwide
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Available Now
                      </span>
                    </div>
                    <p className="text-gray-700">
                      {formData.bio || "Professional PCP-certified pickleball coach ready to help you improve your game."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-lg font-bold text-amber-800">Provisional</div>
                  <div className="text-sm text-amber-600">Profile Status</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-gray-600">Pending</div>
                  <div className="text-sm text-gray-500">Directory Status</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-gray-600">Restricted</div>
                  <div className="text-sm text-gray-500">Booking Status</div>
                </div>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertDescription>
                  <strong>Provisional Status:</strong> Your coach profile has been created with provisional certification. 
                  Complete your course modules and receive admin approval to begin accepting student bookings. 
                  Your comprehensive basic tier includes unlimited sessions once fully certified.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  View My Profile
                </Button>
                <Button className="w-full">
                  Go to Coach Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompleteCoachingFlowDemo;