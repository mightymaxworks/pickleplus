// Admin Match Management - Enhanced version of EnhancedMatchRecorder with admin functions
// Follows UDF standardization: reuse existing components instead of creating new ones
import React from 'react';
import EnhancedMatchRecorder from '../EnhancedMatchRecorder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Trophy, Settings } from 'lucide-react';

export default function UnifiedMatchManagement() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Admin Header */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-orange-600" />
            <div>
              <CardTitle className="text-orange-900">Admin Match Management</CardTitle>
              <CardDescription className="text-orange-700">
                Enhanced match recorder with admin capabilities including competition linking, point overrides, and audit trails
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="outline" className="border-orange-300 text-orange-800">
              <Trophy className="h-3 w-3 mr-1" />
              Competition Management
            </Badge>
            <Badge variant="outline" className="border-orange-300 text-orange-800">
              <Settings className="h-3 w-3 mr-1" />
              Point Override System
            </Badge>
            <Badge variant="outline" className="border-orange-300 text-orange-800">
              <Shield className="h-3 w-3 mr-1" />
              Audit Trail
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Match Recorder Component - Admin Version */}
      <EnhancedMatchRecorder />
    </div>
  );
}