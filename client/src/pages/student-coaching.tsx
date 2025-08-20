import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, BookOpen, Users, TrendingUp } from 'lucide-react';
import { StudentCoachConnection } from '@/components/coaching/StudentCoachConnection';

export default function StudentCoachingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Coaching Hub</h1>
        <p className="text-lg text-gray-600">
          Connect with certified coaches and track your pickleball development journey
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        {/* Feature Overview Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-1">Connect with Coaches</h3>
              <p className="text-sm text-blue-700">
                Request connections with certified coaches using their passport codes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-1">Skill Assessments</h3>
              <p className="text-sm text-green-700">
                Receive detailed skill assessments from your connected coaches
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-1">Track Progress</h3>
              <p className="text-sm text-purple-700">
                Monitor your PCP rating improvements and skill development over time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Student Coach Connection Interface */}
        <StudentCoachConnection />

        {/* Information Panel */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              How Student Coaching Works
            </CardTitle>
            <CardDescription>
              Learn about the coaching process and what to expect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Getting Started</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs px-2 py-0.5 mt-0.5">1</Badge>
                    <span>Meet a certified coach in person at a court or event</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs px-2 py-0.5 mt-0.5">2</Badge>
                    <span>Ask for their 8-character passport code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs px-2 py-0.5 mt-0.5">3</Badge>
                    <span>Enter the code above to send a connection request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs px-2 py-0.5 mt-0.5">4</Badge>
                    <span>Wait for your coach to approve the request</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">After Connection</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 mt-0.5">📋</Badge>
                    <span>Receive comprehensive skill assessments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 mt-0.5">📈</Badge>
                    <span>Get your official PCP (Pickleball Coaching Profile) rating</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 mt-0.5">🎯</Badge>
                    <span>Access personalized training recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 mt-0.5">📊</Badge>
                    <span>Track your progress over time with detailed reports</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}