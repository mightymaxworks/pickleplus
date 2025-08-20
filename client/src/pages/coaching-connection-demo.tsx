import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, GraduationCap, Users, ArrowRight } from 'lucide-react';
import { StudentCoachConnection } from '@/components/coaching/StudentCoachConnection';
import { CoachStudentRequests } from '@/components/coaching/CoachStudentRequests';

export default function CoachingConnectionDemo() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Student-Coach Connection System
        </h1>
        <p className="text-lg text-gray-600">
          Simple passport code validation for establishing coaching relationships
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="student">Student View</TabsTrigger>
          <TabsTrigger value="coach">Coach View</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                How It Works
              </CardTitle>
              <CardDescription>
                Simple, secure coaching connections through passport code validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Step 1: Meet In Person</h3>
                    <p className="text-sm text-gray-600">
                      Student meets coach at a court, clinic, or pickleball event
                    </p>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <ArrowRight className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Step 2: Share Code</h3>
                    <p className="text-sm text-gray-600">
                      Coach shares their 8-character passport code with the student
                    </p>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <GraduationCap className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Step 3: Connect</h3>
                    <p className="text-sm text-gray-600">
                      Student enters code, coach approves, coaching relationship begins
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <User className="w-5 h-5" />
                  For Students
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span className="text-sm text-blue-800">Connect with multiple certified coaches</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span className="text-sm text-blue-800">Receive diverse training perspectives</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span className="text-sm text-blue-800">Get professional skill assessments from each coach</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span className="text-sm text-blue-800">Build comprehensive development portfolio</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <GraduationCap className="w-5 h-5" />
                  For Coaches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span className="text-sm text-green-800">Manage student connection requests</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span className="text-sm text-green-800">Approve students who meet quality standards</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span className="text-sm text-green-800">Provide professional assessment tools</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span className="text-sm text-green-800">Build coaching relationship portfolio</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Why Multiple Coach Relationships?
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Students benefit from diverse coaching perspectives - one coach might excel at technical skills while another specializes in strategy or mental game. 
                  Our passport system enables secure connections with multiple qualified instructors for comprehensive development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student" className="space-y-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Interface</h2>
            <p className="text-gray-600">
              Connect with coaches using their passport codes and manage your coaching relationships
            </p>
          </div>
          <StudentCoachConnection />
        </TabsContent>

        <TabsContent value="coach" className="space-y-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Coach Interface</h2>
            <p className="text-gray-600">
              Review and approve student connection requests to build your coaching roster
            </p>
          </div>
          <CoachStudentRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}