/**
 * PCP Certification Promotion Card
 * Displays on dashboard and other strategic locations to drive awareness
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Star, ArrowRight, Users, DollarSign } from 'lucide-react';
import { useLocation } from 'wouter';

export function PcpCertificationPromoCard() {
  const [location, navigate] = useLocation();

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-lg">Become a Certified Coach</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            New Program
          </Badge>
        </div>
        <CardDescription>
          Join the PCP Coaching Certification Programme and advance your coaching career
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="bg-blue-100 p-2 rounded-lg w-fit mx-auto">
                <Star className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs font-medium">5 Levels</p>
              <p className="text-xs text-gray-600">Foundation to Master</p>
            </div>
            <div className="space-y-1">
              <div className="bg-green-100 p-2 rounded-lg w-fit mx-auto">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs font-medium">Higher Earnings</p>
              <p className="text-xs text-gray-600">30-50% increase</p>
            </div>
            <div className="space-y-1">
              <div className="bg-purple-100 p-2 rounded-lg w-fit mx-auto">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs font-medium">Network</p>
              <p className="text-xs text-gray-600">Elite coaches</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/pcp-certification')}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              Explore Certification
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}