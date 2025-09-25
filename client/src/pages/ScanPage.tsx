import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Camera, User, Shield, Trophy, Flag, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { ScanQRModal } from "@/components/ScanQRModal";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Dedicated QR Code Scanning Page
 * Provides full-screen QR scanning experience with role-based functionality
 */
export default function ScanPage() {
  const [, navigate] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  // Determine user role for display
  const getUserRole = () => {
    if (!user) return 'guest';
    if (user.isAdmin || user.username === 'mightymax') return 'admin';
    if ((user as any).tournament_director) return 'tournament_director';
    if ((user as any).league_official) return 'league_official';
    if ((user as any).referee) return 'referee';
    if ((user as any).coach) return 'coach';
    return 'player';
  };

  const userRole = getUserRole();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'tournament_director': return <Trophy className="h-4 w-4" />;
      case 'referee': return <Flag className="h-4 w-4" />;
      case 'coach': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'tournament_director': return 'default';
      case 'referee': return 'secondary';
      case 'coach': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleCapabilities = (role: string): string[] => {
    const capabilities: Record<string, string[]> = {
      'player': [
        'Connect with other players',
        'Challenge players to matches',
        'View player profiles and stats',
        'Check in to tournaments'
      ],
      'coach': [
        'Analyze player performance',
        'Schedule coaching lessons',
        'Add players to coaching roster',
        'View detailed analytics'
      ],
      'tournament_director': [
        'Verify player registration',
        'Add players to tournament brackets',
        'Manage tournament operations',
        'Record match results'
      ],
      'league_official': [
        'Verify player eligibility',
        'Manage league operations',
        'Record official results',
        'Coordinate league events'
      ],
      'referee': [
        'Supervise official matches',
        'Record match results',
        'Verify player identities',
        'Officiate tournaments'
      ],
      'admin': [
        'Full system administration',
        'Identity verification',
        'System overrides',
        'Complete player management'
      ]
    };

    return capabilities[role] || capabilities['player'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="text-orange-700 hover:text-orange-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Badge 
            variant={getRoleBadgeVariant(userRole)}
            className="px-3 py-1"
          >
            {getRoleIcon(userRole)}
            <span className="ml-2 capitalize">{userRole.replace('_', ' ')}</span>
          </Badge>
        </div>

        {/* Main Scanner Card */}
        <Card className="mb-6 border-orange-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-orange-800 flex items-center justify-center gap-2">
              <QrCode className="h-6 w-6" />
              QR Code Scanner
            </CardTitle>
            <p className="text-orange-600">
              Scan player QR codes, tournament check-ins, and event registrations
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Scan Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="w-full max-w-sm h-16 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                <Camera className="h-6 w-6 mr-3" />
                Start Scanning
              </Button>
            </div>

            {/* User Info */}
            {user && (
              <div className="text-center text-sm text-orange-700">
                Scanning as <strong>{user.displayName || user.username}</strong>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Capabilities */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg text-orange-800">
              Your Scanning Capabilities
            </CardTitle>
            <p className="text-sm text-orange-600">
              Based on your role, you have access to these actions when scanning QR codes:
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {getRoleCapabilities(userRole).map((capability: string, index: number) => (
                <li key={index} className="flex items-center text-sm text-orange-700">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3 flex-shrink-0" />
                  {capability}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mt-6 border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg text-orange-800">
              How Role-Based Scanning Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-orange-700">
            <p>
              <strong>Automatic Detection:</strong> Your role is automatically detected when you scan - no manual selection needed.
            </p>
            <p>
              <strong>Smart Responses:</strong> The system shows different actions and data based on your permissions and role.
            </p>
            <p>
              <strong>Secure Access:</strong> All scans are validated and logged for security and anti-gaming protection.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* QR Scanner Modal */}
      <ScanQRModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}