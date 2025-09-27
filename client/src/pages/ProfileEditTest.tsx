import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Trophy, 
  Target, 
  Settings,
  Save,
  Edit,
  Check,
  X,
  ChevronRight,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface PlayerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  birthDate: string;
  bio: string;
  avatar?: string;
  tier: 'recreational' | 'competitive' | 'elite' | 'professional';
  rankingPoints: number;
  picklePoints: number;
  playStyle: string;
  dominantHand: 'left' | 'right' | 'ambidextrous';
  experience: string;
  goals: string[];
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    matchRequests: boolean;
    coaching: boolean;
  };
  stats: {
    matchesPlayed: number;
    winRate: number;
    favoriteCourt: string;
  };
}

const mockProfile: PlayerProfile = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  phone: '+1 (604) 555-0123',
  location: 'Vancouver, BC',
  birthDate: '1990-03-15',
  bio: 'Passionate pickleball player always looking to improve and connect with the community.',
  tier: 'elite',
  rankingPoints: 1247,
  picklePoints: 89,
  playStyle: 'Aggressive baseline',
  dominantHand: 'right',
  experience: '3 years',
  goals: ['Reach Professional tier', 'Improve net game', 'Tournament participation'],
  preferences: {
    notifications: true,
    publicProfile: true,
    matchRequests: true,
    coaching: false,
  },
  stats: {
    matchesPlayed: 156,
    winRate: 0.73,
    favoriteCourt: 'Community Center Court 1',
  },
};

const tierConfig = {
  recreational: { name: 'Recreational', color: 'from-slate-500 to-slate-600', icon: User },
  competitive: { name: 'Competitive', color: 'from-blue-500 to-blue-600', icon: Target },
  elite: { name: 'Elite', color: 'from-purple-500 to-purple-600', icon: Star },
  professional: { name: 'Professional', color: 'from-orange-500 to-orange-600', icon: Trophy },
};

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea';
  placeholder?: string;
}

function EditableField({ label, value, onSave, type = 'text', placeholder }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium text-white">{label}</label>
        <div className="flex gap-2">
          <div className="flex-1">
            {type === 'textarea' ? (
              <Textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder={placeholder}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                rows={3}
              />
            ) : (
              <Input
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder={placeholder}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            )}
          </div>
          <div className="flex gap-1">
            <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} className="border-slate-600 text-white hover:bg-slate-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.3)' }}
      className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors"
      onClick={() => setIsEditing(true)}
    >
      <div>
        <div className="text-sm text-slate-400">{label}</div>
        <div className="text-white font-medium">{value || placeholder}</div>
      </div>
      <Edit className="h-4 w-4 text-slate-400" />
    </motion.div>
  );
}

interface ProfileSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function ProfileSection({ title, icon: Icon, children, defaultExpanded = false }: ProfileSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function ProfileEditTest() {
  const [profile, setProfile] = useState<PlayerProfile>(mockProfile);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const config = tierConfig[profile.tier];
  const Icon = config.icon;

  const updateProfile = (field: keyof PlayerProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const updatePreference = (key: keyof PlayerProfile['preferences'], value: boolean) => {
    setProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const saveProfile = () => {
    // Here you would typically save to the backend
    console.log('Saving profile:', profile);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
          <p className="text-slate-400">Manage your pickleball identity and preferences</p>
        </div>

        {/* Profile Overview Card */}
        <Card className={`p-6 bg-gradient-to-r ${config.color} border border-white/20 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          
          <div className="relative">
            {/* Avatar Section */}
            <div className="text-center mb-6">
              <div className="relative w-20 h-20 mx-auto mb-3">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-white/30"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                )}
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
              <Badge className="bg-white/30 text-white px-3 py-1">
                {config.name} Player
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{profile.rankingPoints.toLocaleString()}</div>
                <div className="text-white/90 text-sm">Ranking Points</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{profile.picklePoints}</div>
                <div className="text-white/90 text-sm">Pickle Points</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <ProfileSection title="Personal Information" icon={User} defaultExpanded>
          <EditableField
            label="Full Name"
            value={profile.name}
            onSave={(value) => updateProfile('name', value)}
            placeholder="Enter your full name"
          />
          <EditableField
            label="Email"
            value={profile.email}
            onSave={(value) => updateProfile('email', value)}
            type="email"
            placeholder="your.email@example.com"
          />
          <EditableField
            label="Phone"
            value={profile.phone}
            onSave={(value) => updateProfile('phone', value)}
            type="tel"
            placeholder="+1 (555) 123-4567"
          />
          <EditableField
            label="Location"
            value={profile.location}
            onSave={(value) => updateProfile('location', value)}
            placeholder="City, Province/State"
          />
          <EditableField
            label="Birth Date"
            value={profile.birthDate}
            onSave={(value) => updateProfile('birthDate', value)}
            type="date"
          />
          <EditableField
            label="Bio"
            value={profile.bio}
            onSave={(value) => updateProfile('bio', value)}
            type="textarea"
            placeholder="Tell others about your pickleball journey..."
          />
        </ProfileSection>

        {/* Athletic Profile */}
        <ProfileSection title="Athletic Profile" icon={Trophy}>
          <EditableField
            label="Play Style"
            value={profile.playStyle}
            onSave={(value) => updateProfile('playStyle', value)}
            placeholder="e.g., Aggressive baseline, Defensive net play"
          />
          <EditableField
            label="Dominant Hand"
            value={profile.dominantHand}
            onSave={(value) => updateProfile('dominantHand', value)}
            placeholder="Left, Right, or Ambidextrous"
          />
          <EditableField
            label="Experience"
            value={profile.experience}
            onSave={(value) => updateProfile('experience', value)}
            placeholder="e.g., 2 years, 6 months"
          />
          <EditableField
            label="Favorite Court"
            value={profile.stats.favoriteCourt}
            onSave={(value) => updateProfile('stats', { ...profile.stats, favoriteCourt: value })}
            placeholder="Where do you love to play?"
          />
        </ProfileSection>

        {/* Privacy & Preferences */}
        <ProfileSection title="Privacy & Preferences" icon={Settings}>
          <div className="space-y-4">
            {Object.entries(profile.preferences).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                <div>
                  <div className="text-white font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-sm text-slate-400">
                    {key === 'notifications' && 'Receive match updates and alerts'}
                    {key === 'publicProfile' && 'Allow others to view your profile'}
                    {key === 'matchRequests' && 'Accept match requests from other players'}
                    {key === 'coaching' && 'Open to coaching opportunities'}
                  </div>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => updatePreference(key as keyof PlayerProfile['preferences'], checked)}
                />
              </div>
            ))}
          </div>
        </ProfileSection>

        {/* Save Button */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            >
              <Button
                onClick={saveProfile}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg px-8"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
}