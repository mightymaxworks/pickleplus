import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User,
  QrCode,
  Trophy,
  TrendingUp,
  Edit3,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Star,
  Award,
  Target,
  Activity,
  Users,
  Clock,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Share2,
  Download,
  Zap,
  Shield,
  Sparkles,
  Crown,
  Medal,
  Hash,
  Check,
  X,
  Plus,
  Minus
} from "lucide-react";

export default function AppleStyleDemo() {
  const [selectedView, setSelectedView] = useState<'passport' | 'coaching' | 'community'>('passport');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Alex Chen",
    location: "San Francisco, CA",
    dupr: 4.2,
    memberSince: "Jan 2024"
  });

  // Clean Apple-style color scheme
  const colors = {
    primary: '#007AFF', // Apple Blue
    secondary: '#34C759', // Apple Green  
    accent: '#FF9500', // Apple Orange
    neutral: '#8E8E93', // Apple Gray
    background: '#F2F2F7', // Apple Light Gray
    surface: '#FFFFFF',
    text: '#1C1C1E',
    textSecondary: '#3A3A3C'
  };

  const EditableField = ({ 
    label, 
    value, 
    fieldKey, 
    type = 'text' 
  }: { 
    label: string; 
    value: string | number; 
    fieldKey: string; 
    type?: 'text' | 'number' 
  }) => {
    const isEditing = editingField === fieldKey;
    const [tempValue, setTempValue] = useState(value);

    const handleSave = () => {
      setProfileData(prev => ({ ...prev, [fieldKey]: tempValue }));
      setEditingField(null);
    };

    const handleCancel = () => {
      setTempValue(value);
      setEditingField(null);
    };

    return (
      <div className="group relative">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type={type}
              value={tempValue}
              onChange={(e) => setTempValue(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <Button size="sm" onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-3">
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} className="px-3">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 cursor-pointer transition-all group-hover:shadow-sm"
            onClick={() => setEditingField(fieldKey)}
          >
            <span className="text-gray-900 font-medium">{value}</span>
            <Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    );
  };

  const AppleStylePassport = () => (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="text-center pb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
          AC
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Player Passport</h2>
        <p className="text-gray-500">Digital identity and performance tracking</p>
      </div>

      {/* Clean Cards Layout */}
      <div className="grid gap-4">
        {/* Profile Information Card */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EditableField label="Name" value={profileData.name} fieldKey="name" />
            <EditableField label="Location" value={profileData.location} fieldKey="location" />
            <EditableField label="Member Since" value={profileData.memberSince} fieldKey="memberSince" />
          </CardContent>
        </Card>

        {/* Performance Card */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-500" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EditableField label="DUPR Rating" value={profileData.dupr} fieldKey="dupr" type="number" />
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">156</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Matches</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">68%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Win Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Access Card */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-orange-500" />
              Facility Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Button
                onClick={() => setShowQRCode(!showQRCode)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
              >
                {showQRCode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
              </Button>
              {showQRCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">PKL-AC-2024-7719</p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const AppleStyleCoaching = () => (
    <div className="space-y-6">
      <div className="text-center pb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Coaching Hub</h2>
        <p className="text-gray-500">Professional development and certification</p>
      </div>

      <div className="grid gap-4">
        {/* Certification Progress */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">PCP Certification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level 2: Stroke Development</span>
                <span className="text-gray-500">65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Badge className="bg-green-100 text-green-700 border-0">L1 Complete</Badge>
              <Badge className="bg-blue-100 text-blue-700 border-0">L2 Active</Badge>
              <Badge className="bg-gray-100 text-gray-500 border-0">L3 Locked</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Student Management */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Sarah Chen", level: "3.5 DUPR", sessions: 24, progress: 78 },
                { name: "Mike Rodriguez", level: "4.2 DUPR", sessions: 18, progress: 62 },
                { name: "Jenny Park", level: "2.8 DUPR", sessions: 32, progress: 85 }
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.level} • {student.sessions} sessions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{student.progress}%</div>
                    <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const AppleStyleCommunity = () => (
    <div className="space-y-6">
      <div className="text-center pb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Community</h2>
        <p className="text-gray-500">Connect and engage with players</p>
      </div>

      <div className="grid gap-4">
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "match", text: "Won against Mike Rodriguez", time: "2 hours ago", icon: Trophy },
                { type: "achievement", text: "Earned 'Consistency Master'", time: "1 day ago", icon: Medal },
                { type: "training", text: "Completed L2 Module 3", time: "3 days ago", icon: Target }
              ].map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{activity.text}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="max-w-md mx-auto pt-8 pb-20">
        {/* Clean Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apple-Style Design</h1>
          <p className="text-gray-600">Clean, minimal, functional</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-sm">
          {[
            { key: 'passport', label: 'Passport', color: 'blue' },
            { key: 'coaching', label: 'Coaching', color: 'green' },
            { key: 'community', label: 'Community', color: 'purple' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedView(tab.key as any)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                selectedView === tab.key
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedView === 'passport' && <AppleStylePassport />}
            {selectedView === 'coaching' && <AppleStyleCoaching />}
            {selectedView === 'community' && <AppleStyleCommunity />}
          </motion.div>
        </AnimatePresence>

        {/* Design Principles */}
        <Card className="mt-8 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Design Principles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Minimal color palette (Blue, Green, Gray)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Preserved inline editing functionality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                <span>Clean typography and generous spacing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Subtle shadows and transparency</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}