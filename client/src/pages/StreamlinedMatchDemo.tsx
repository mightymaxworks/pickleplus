import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  User, 
  Shield, 
  ArrowLeft,
  CheckCircle2,
  Target,
  Zap
} from "lucide-react";
import StreamlinedMatchRecorderDemo from "@/components/match/StreamlinedMatchRecorderDemo";
import { useLocation } from "wouter";

export default function StreamlinedMatchDemo() {
  const [, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState<'player' | 'admin'>('player');

  const improvements = [
    {
      title: "Smart Templates",
      description: "One-click setup for common match types",
      icon: Target,
      color: "text-orange-500"
    },
    {
      title: "Recent Opponents",
      description: "Quick selection from match history",
      icon: User,
      color: "text-blue-500"
    },
    {
      title: "Touch-Optimized Scoring",
      description: "Large buttons for easy score entry",
      icon: Zap,
      color: "text-green-500"
    },
    {
      title: "Progressive Disclosure",
      description: "Advanced options when you need them",
      icon: CheckCircle2,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-orange-500" />
                <h1 className="text-2xl font-bold">Match Recorder Streamlining Demo</h1>
              </div>
            </div>
            <Badge variant="secondary">UDF Demo</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Overview */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Enhanced Match Recording Experience
              </CardTitle>
              <p className="text-orange-100">
                Demonstrating streamlined UI/UX improvements for both player and admin contexts
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Key Improvements */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Key Improvements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {improvements.map((improvement, index) => {
              const Icon = improvement.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <Icon className={`h-8 w-8 mx-auto mb-3 ${improvement.color}`} />
                    <h3 className="font-semibold mb-2">{improvement.title}</h3>
                    <p className="text-sm text-muted-foreground">{improvement.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choose User Role for Demo</CardTitle>
              <p className="text-muted-foreground">
                See how the interface adapts based on user permissions
              </p>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="player" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Player View
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin View
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Demo Component */}
        <StreamlinedMatchRecorderDemo 
          userRole={selectedRole}
          onClose={() => navigate('/')}
        />

        {/* Technical Notes */}
        <div className="mt-8">
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Technical Implementation Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Unified Component Architecture:</h4>
                <p className="text-sm text-muted-foreground">
                  Single component that adapts based on user role, eliminating code duplication between player and admin interfaces.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Progressive Disclosure Pattern:</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced options hidden by default, revealed when needed. Reduces cognitive load for new users.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mobile-First Design:</h4>
                <p className="text-sm text-muted-foreground">
                  Large touch targets, optimized spacing, and gesture-friendly interactions for mobile devices.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Smart Defaults & Context:</h4>
                <p className="text-sm text-muted-foreground">
                  Templates auto-configure common settings, recent opponents for quick selection, and intelligent form pre-filling.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}