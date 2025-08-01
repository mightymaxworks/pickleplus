import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Check,
  X,
  Plus,
  Minus,
  Shield,
  Crown,
  Medal
} from "lucide-react";

type ViewMode = 'full' | 'compact' | 'facility';

export default function CleanPassportDemo() {
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Clean data structure
  const [playerData, setPlayerData] = useState({
    // Basic Info
    name: "Alex Chen",
    profileImage: "/api/placeholder/80/80",
    location: "San Francisco, CA",
    memberSince: "January 2024",
    
    // Performance
    dupr: 4.2,
    pcp: 6.8,
    matchesPlayed: 156,
    matchesWon: 98,
    winRate: 62.8,
    currentStreak: 5,
    
    // Rankings
    globalRank: 2847,
    localRank: 89,
    ageGroupRank: 23,
    
    // QR & Access
    passportId: "PKL-AC-2024-7719",
    membershipLevel: "Premium",
    facilityAccess: true
  });

  const EditableField = ({ 
    label, 
    value, 
    fieldKey, 
    type = 'text',
    suffix = '' 
  }: { 
    label: string; 
    value: string | number; 
    fieldKey: string; 
    type?: 'text' | 'number';
    suffix?: string;
  }) => {
    const isEditing = editingField === fieldKey;
    const [tempValue, setTempValue] = useState(value);

    const handleSave = () => {
      setPlayerData(prev => ({ ...prev, [fieldKey]: tempValue }));
      setEditingField(null);
    };

    const handleCancel = () => {
      setTempValue(value);
      setEditingField(null);
    };

    return (
      <div className="group">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type={type}
              value={tempValue}
              onChange={(e) => setTempValue(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
              className="flex-1 px-4 py-3 bg-white border-0 rounded-xl text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:shadow-md transition-all"
              autoFocus
            />
            <Button 
              size="sm" 
              onClick={handleSave} 
              className="bg-green-500 hover:bg-green-600 text-white rounded-xl border-0 shadow-sm"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancel} 
              className="border-0 bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border-0 hover:shadow-md cursor-pointer transition-all group-hover:bg-gray-50"
            onClick={() => setEditingField(fieldKey)}
          >
            <span className="text-gray-900 font-medium">
              {value}{suffix}
            </span>
            <Edit3 className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        )}
      </div>
    );
  };

  const CleanSection = ({ 
    title, 
    icon: Icon, 
    children, 
    sectionKey,
    collapsible = false 
  }: { 
    title: string; 
    icon: any; 
    children: React.ReactNode; 
    sectionKey: string;
    collapsible?: boolean;
  }) => {
    const isExpanded = !collapsible || expandedSection === sectionKey || expandedSection === null;
    
    return (
      <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all">
        <CardHeader 
          className={`pb-4 ${collapsible ? 'cursor-pointer' : ''}`}
          onClick={() => collapsible && setExpandedSection(isExpanded ? null : sectionKey)}
        >
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              {title}
            </div>
            {collapsible && (
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </CardTitle>
        </CardHeader>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0">
                {children}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  };

  const StatCard = ({ 
    value, 
    label, 
    trend, 
    color = 'blue' 
  }: { 
    value: string | number; 
    label: string; 
    trend?: string;
    color?: 'blue' | 'green' | 'orange' | 'gray';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      orange: 'bg-orange-50 text-orange-700',
      gray: 'bg-gray-50 text-gray-700'
    };

    return (
      <div className={`p-4 rounded-xl ${colorClasses[color]} text-center`}>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
        {trend && (
          <div className="text-xs mt-1 opacity-60">{trend}</div>
        )}
      </div>
    );
  };

  const FullPassportView = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center py-6">
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {playerData.name.split(' ').map(n => n[0]).join('')}
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{playerData.name}</h2>
        <p className="text-gray-500">{playerData.location}</p>
        <Badge className="mt-2 bg-blue-100 text-blue-700 border-0">
          {playerData.membershipLevel} Member
        </Badge>
      </div>

      {/* Basic Information */}
      <CleanSection title="Profile" icon={User} sectionKey="profile">
        <div className="space-y-4">
          <EditableField label="Name" value={playerData.name} fieldKey="name" />
          <EditableField label="Location" value={playerData.location} fieldKey="location" />
          <EditableField label="Member Since" value={playerData.memberSince} fieldKey="memberSince" />
        </div>
      </CleanSection>

      {/* Performance Metrics */}
      <CleanSection title="Performance" icon={Trophy} sectionKey="performance">
        <div className="space-y-4">
          <EditableField label="DUPR Rating" value={playerData.dupr} fieldKey="dupr" type="number" />
          <EditableField label="PCP Score" value={playerData.pcp} fieldKey="pcp" type="number" />
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <StatCard value={playerData.matchesPlayed} label="Matches" color="blue" />
            <StatCard value={`${playerData.winRate}%`} label="Win Rate" color="green" />
          </div>
        </div>
      </CleanSection>

      {/* Rankings */}
      <CleanSection title="Rankings" icon={Crown} sectionKey="rankings" collapsible>
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={`#${playerData.globalRank}`} label="Global" color="blue" />
          <StatCard value={`#${playerData.localRank}`} label="Local" color="green" />
          <StatCard value={`#${playerData.ageGroupRank}`} label="Age Group" color="orange" />
        </div>
      </CleanSection>

      {/* QR Access */}
      <CleanSection title="Facility Access" icon={QrCode} sectionKey="access">
        <div className="text-center space-y-4">
          <Button
            onClick={() => setShowQRCode(!showQRCode)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl border-0 shadow-sm"
          >
            {showQRCode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
          </Button>
          
          <AnimatePresence>
            {showQRCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="p-6 bg-gray-50 rounded-xl"
              >
                <div className="w-32 h-32 bg-white rounded-xl mx-auto flex items-center justify-center shadow-sm mb-3">
                  <QrCode className="w-20 h-20 text-gray-300" />
                </div>
                <p className="text-sm font-mono text-gray-600">{playerData.passportId}</p>
                <p className="text-xs text-gray-400 mt-1">Scan for facility access</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CleanSection>
    </div>
  );

  const CompactPassportView = () => (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            {playerData.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">{playerData.name}</h3>
            <p className="text-gray-500 text-sm">{playerData.location}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                {playerData.dupr} DUPR
              </Badge>
              <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                #{playerData.globalRank}
              </Badge>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowQRCode(!showQRCode)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-xl"
          >
            <QrCode className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const FacilityPassportView = () => (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {playerData.name.split(' ').map(n => n[0]).join('')}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{playerData.name}</h2>
        <Badge className="bg-green-100 text-green-700 border-0 mb-6">
          <Shield className="w-3 h-3 mr-1" />
          Verified Member
        </Badge>
        
        <div className="w-40 h-40 bg-gray-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <QrCode className="w-24 h-24 text-gray-300" />
        </div>
        <p className="text-sm font-mono text-gray-600 mb-2">{playerData.passportId}</p>
        <p className="text-xs text-gray-400">Present to facility staff</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto pt-8 pb-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clean Passport</h1>
          <p className="text-gray-600">Preserving all editing functions</p>
        </div>

        {/* View Mode Selector */}
        <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-sm">
          {[
            { key: 'full', label: 'Full' },
            { key: 'compact', label: 'Compact' },
            { key: 'facility', label: 'Facility' }
          ].map((mode) => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key as ViewMode)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                viewMode === mode.key
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Passport Views */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'full' && <FullPassportView />}
            {viewMode === 'compact' && <CompactPassportView />}
            {viewMode === 'facility' && <FacilityPassportView />}
          </motion.div>
        </AnimatePresence>

        {/* Preserved Features Note */}
        <Card className="mt-8 border-0 shadow-sm bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-green-800 mb-2">✅ Preserved Features</h4>
            <div className="space-y-1 text-sm text-green-700">
              <div>• Inline editing with save/cancel</div>
              <div>• QR code show/hide functionality</div>
              <div>• Expandable sections</div>
              <div>• Three view modes (Full/Compact/Facility)</div>
              <div>• Smooth animations and transitions</div>
              <div>• All original data fields</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}