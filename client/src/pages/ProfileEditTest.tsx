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
  Star,
  Gamepad2,
  Dumbbell,
  Shield
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface PlayerProfile {
  // Basic Info
  username: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  location: string;
  bio: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  
  // Pickleball Profile
  tier: 'recreational' | 'competitive' | 'elite' | 'professional';
  rankingPoints: number;
  singlesRankingPoints: number;
  picklePoints: number;
  passportCode: string;
  
  // Playing Info
  playingSince: string;
  skillLevel: string;
  playingStyle: string;
  dominantHand: 'left' | 'right' | 'ambidextrous';
  preferredPosition: string;
  preferredFormat: string;
  regularSchedule: string;
  
  // Equipment
  paddleBrand: string;
  paddleModel: string;
  backupPaddleBrand: string;
  backupPaddleModel: string;
  apparelBrand: string;
  shoesBrand: string;
  otherEquipment: string;
  
  // Physical Attributes
  height: number; // cm
  reach: number; // cm
  fitnessLevel: string;
  mobilityLimitations: string;
  
  // Performance Assessment (1-10)
  forehandStrength: number;
  backhandStrength: number;
  servePower: number;
  dinkAccuracy: number;
  thirdShotConsistency: number;
  courtCoverage: number;
  
  // Preferences
  preferredSurface: string;
  indoorOutdoorPreference: 'indoor' | 'outdoor' | 'both';
  competitiveIntensity: number; // 1-10
  lookingForPartners: boolean;
  mentorshipInterest: boolean;
  playerGoals: string;
  preferredMatchDuration: string;
  travelRadiusKm: number;
  homeCourtLocations: string;
  
  // External Ratings
  duprRating: string;
  utprRating: string;
  wprRating: string;
  
  // Privacy & Communication
  privateMessagePreference: string;
  privacyProfile: 'minimal' | 'standard' | 'enhanced' | 'full';
  languagePreference: 'en' | 'zh' | 'fr' | 'es';
  
  // Social
  socialDataConsentLevel: 'none' | 'basic' | 'enhanced' | 'full';
  
  // System
  avatarUrl?: string;
  profileCompletionPct: number;
}

const mockProfile: PlayerProfile = {
  username: 'alexchen2024',
  email: 'alex.chen@example.com',
  displayName: 'Alex Chen',
  firstName: 'Alex',
  lastName: 'Chen',
  location: 'Vancouver, BC',
  bio: 'Passionate pickleball player always looking to improve and connect with the community.',
  dateOfBirth: '1990-03-15',
  gender: 'male',
  
  tier: 'elite',
  rankingPoints: 1247,
  singlesRankingPoints: 1247,
  picklePoints: 89,
  passportCode: 'ALEX1234',
  
  playingSince: '3 years',
  skillLevel: '4.0',
  playingStyle: 'Aggressive baseline',
  dominantHand: 'right',
  preferredPosition: 'Right side',
  preferredFormat: 'Doubles',
  regularSchedule: 'Weekends, Tuesday evenings',
  
  paddleBrand: 'Selkirk',
  paddleModel: 'Amped Epic',
  backupPaddleBrand: 'JOOLA',
  backupPaddleModel: 'Ben Johns Hyperion',
  apparelBrand: 'HEAD',
  shoesBrand: 'K-Swiss',
  otherEquipment: 'Overgrip, wristbands',
  
  height: 175,
  reach: 180,
  fitnessLevel: 'Good',
  mobilityLimitations: '',
  
  forehandStrength: 7,
  backhandStrength: 6,
  servePower: 8,
  dinkAccuracy: 7,
  thirdShotConsistency: 6,
  courtCoverage: 8,
  
  preferredSurface: 'Outdoor courts',
  indoorOutdoorPreference: 'both',
  competitiveIntensity: 7,
  lookingForPartners: true,
  mentorshipInterest: false,
  playerGoals: 'Reach Professional tier, Improve net game, Tournament participation',
  preferredMatchDuration: '1-2 hours',
  travelRadiusKm: 25,
  homeCourtLocations: 'Community Center, Hillcrest Park',
  
  duprRating: '4.2',
  utprRating: '4.1',
  wprRating: '',
  
  privateMessagePreference: 'all',
  privacyProfile: 'standard',
  languagePreference: 'en',
  
  socialDataConsentLevel: 'enhanced',
  
  profileCompletionPct: 85,
};

const tierConfig = {
  recreational: { name: 'Recreational', color: 'from-slate-500 to-slate-600', icon: User },
  competitive: { name: 'Competitive', color: 'from-blue-500 to-blue-600', icon: Target },
  elite: { name: 'Elite', color: 'from-purple-500 to-purple-600', icon: Star },
  professional: { name: 'Professional', color: 'from-orange-500 to-orange-600', icon: Trophy },
};

interface EditableFieldProps {
  label: string;
  value: string | number;
  onSave: (value: string | number) => void;
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'number' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  unit?: string;
}

function EditableField({ label, value, onSave, type = 'text', placeholder, options, unit }: EditableFieldProps) {
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
                value={tempValue as string}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder={placeholder}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                rows={3}
              />
            ) : type === 'select' && options ? (
              <Select value={tempValue as string} onValueChange={setTempValue}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type={type}
                  value={tempValue}
                  onChange={(e) => setTempValue(type === 'number' ? Number(e.target.value) : e.target.value)}
                  placeholder={placeholder}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                {unit && <span className="text-white text-sm">{unit}</span>}
              </div>
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

  const displayValue = typeof value === 'number' ? `${value}${unit ? ` ${unit}` : ''}` : value;

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.3)' }}
      className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors"
      onClick={() => setIsEditing(true)}
    >
      <div>
        <div className="text-sm text-slate-400">{label}</div>
        <div className="text-white font-medium">{displayValue || placeholder}</div>
      </div>
      <Edit className="h-4 w-4 text-slate-400" />
    </motion.div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  onSave: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

function SliderField({ label, value, onSave, min = 1, max = 10, step = 1, description }: SliderFieldProps) {
  const [tempValue, setTempValue] = useState([value]);

  const handleChange = (newValue: number[]) => {
    setTempValue(newValue);
    onSave(newValue[0]);
  };

  return (
    <div className="p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-white font-medium">{label}</div>
          {description && <div className="text-sm text-slate-400">{description}</div>}
        </div>
        <div className="text-white font-bold text-lg">{tempValue[0]}</div>
      </div>
      <Slider
        value={tempValue}
        onValueChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>Poor ({min})</span>
        <span>Excellent ({max})</span>
      </div>
    </div>
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

  const saveProfile = () => {
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
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.displayName}
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
              
              <h2 className="text-2xl font-bold text-white mb-1">{profile.displayName}</h2>
              <Badge className="bg-white/30 text-white px-3 py-1 mb-2">
                {config.name} Player
              </Badge>
              <div className="text-white/90 text-sm">🎫 {profile.passportCode}</div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{profile.rankingPoints.toLocaleString()}</div>
                <div className="text-white/90 text-sm">Ranking Points</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{profile.picklePoints}</div>
                <div className="text-white/90 text-sm">Pickle Points</div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex justify-between text-white text-sm mb-2">
                <span>Profile Completion</span>
                <span>{profile.profileCompletionPct}%</span>
              </div>
              <div className="bg-white/30 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-1000"
                  style={{ width: `${profile.profileCompletionPct}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <ProfileSection title="Personal Information" icon={User} defaultExpanded>
          <EditableField
            label="Username"
            value={profile.username}
            onSave={(value) => updateProfile('username', value)}
            placeholder="Enter username"
          />
          <EditableField
            label="Email"
            value={profile.email}
            onSave={(value) => updateProfile('email', value)}
            type="email"
            placeholder="your.email@example.com"
          />
          <EditableField
            label="Display Name"
            value={profile.displayName}
            onSave={(value) => updateProfile('displayName', value)}
            placeholder="How others see you"
          />
          <EditableField
            label="First Name"
            value={profile.firstName}
            onSave={(value) => updateProfile('firstName', value)}
            placeholder="First name"
          />
          <EditableField
            label="Last Name"
            value={profile.lastName}
            onSave={(value) => updateProfile('lastName', value)}
            placeholder="Last name"
          />
          <EditableField
            label="Location"
            value={profile.location}
            onSave={(value) => updateProfile('location', value)}
            placeholder="City, Province/State"
          />
          <EditableField
            label="Birth Date"
            value={profile.dateOfBirth}
            onSave={(value) => updateProfile('dateOfBirth', value)}
            type="date"
          />
          <EditableField
            label="Gender"
            value={profile.gender}
            onSave={(value) => updateProfile('gender', value)}
            type="select"
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <EditableField
            label="Bio"
            value={profile.bio}
            onSave={(value) => updateProfile('bio', value)}
            type="textarea"
            placeholder="Tell others about your pickleball journey..."
          />
        </ProfileSection>

        {/* Playing Profile */}
        <ProfileSection title="Playing Profile" icon={Gamepad2}>
          <EditableField
            label="Playing Since"
            value={profile.playingSince}
            onSave={(value) => updateProfile('playingSince', value)}
            placeholder="e.g., 2 years, 6 months"
          />
          <EditableField
            label="Skill Level"
            value={profile.skillLevel}
            onSave={(value) => updateProfile('skillLevel', value)}
            type="select"
            options={[
              { value: '2.0', label: '2.0 - Beginner' },
              { value: '2.5', label: '2.5 - Novice' },
              { value: '3.0', label: '3.0 - Beginner+' },
              { value: '3.5', label: '3.5 - Intermediate' },
              { value: '4.0', label: '4.0 - Advanced' },
              { value: '4.5', label: '4.5 - Expert' },
              { value: '5.0+', label: '5.0+ - Professional' },
            ]}
          />
          <EditableField
            label="Play Style"
            value={profile.playingStyle}
            onSave={(value) => updateProfile('playingStyle', value)}
            type="select"
            options={[
              { value: 'Aggressive baseline', label: 'Aggressive Baseline' },
              { value: 'Defensive baseline', label: 'Defensive Baseline' },
              { value: 'Net rusher', label: 'Net Rusher' },
              { value: 'All-court', label: 'All-Court' },
              { value: 'Counter puncher', label: 'Counter Puncher' },
            ]}
          />
          <EditableField
            label="Dominant Hand"
            value={profile.dominantHand}
            onSave={(value) => updateProfile('dominantHand', value)}
            type="select"
            options={[
              { value: 'right', label: 'Right' },
              { value: 'left', label: 'Left' },
              { value: 'ambidextrous', label: 'Ambidextrous' },
            ]}
          />
          <EditableField
            label="Preferred Position"
            value={profile.preferredPosition}
            onSave={(value) => updateProfile('preferredPosition', value)}
            type="select"
            options={[
              { value: 'Left side', label: 'Left Side (Forehand)' },
              { value: 'Right side', label: 'Right Side (Backhand)' },
              { value: 'Either', label: 'Either Side' },
            ]}
          />
          <EditableField
            label="Preferred Format"
            value={profile.preferredFormat}
            onSave={(value) => updateProfile('preferredFormat', value)}
            type="select"
            options={[
              { value: 'Singles', label: 'Singles' },
              { value: 'Doubles', label: 'Doubles' },
              { value: 'Mixed doubles', label: 'Mixed Doubles' },
              { value: 'Any', label: 'Any Format' },
            ]}
          />
          <EditableField
            label="Regular Schedule"
            value={profile.regularSchedule}
            onSave={(value) => updateProfile('regularSchedule', value)}
            placeholder="When do you usually play?"
          />
        </ProfileSection>

        {/* Physical Profile */}
        <ProfileSection title="Physical Profile" icon={Dumbbell}>
          <EditableField
            label="Height"
            value={profile.height}
            onSave={(value) => updateProfile('height', value)}
            type="number"
            unit="cm"
            placeholder="Height in centimeters"
          />
          <EditableField
            label="Reach"
            value={profile.reach}
            onSave={(value) => updateProfile('reach', value)}
            type="number"
            unit="cm"
            placeholder="Arm reach in centimeters"
          />
          <EditableField
            label="Fitness Level"
            value={profile.fitnessLevel}
            onSave={(value) => updateProfile('fitnessLevel', value)}
            type="select"
            options={[
              { value: 'Excellent', label: 'Excellent' },
              { value: 'Good', label: 'Good' },
              { value: 'Average', label: 'Average' },
              { value: 'Fair', label: 'Fair' },
              { value: 'Poor', label: 'Poor' },
            ]}
          />
          <EditableField
            label="Mobility Limitations"
            value={profile.mobilityLimitations}
            onSave={(value) => updateProfile('mobilityLimitations', value)}
            type="textarea"
            placeholder="Any physical limitations to be aware of"
          />
        </ProfileSection>

        {/* Skill Assessment */}
        <ProfileSection title="Skill Assessment" icon={Target}>
          <SliderField
            label="Forehand Strength"
            value={profile.forehandStrength}
            onSave={(value) => updateProfile('forehandStrength', value)}
            description="Power and accuracy of your forehand"
          />
          <SliderField
            label="Backhand Strength"
            value={profile.backhandStrength}
            onSave={(value) => updateProfile('backhandStrength', value)}
            description="Power and accuracy of your backhand"
          />
          <SliderField
            label="Serve Power"
            value={profile.servePower}
            onSave={(value) => updateProfile('servePower', value)}
            description="Power and placement of your serve"
          />
          <SliderField
            label="Dink Accuracy"
            value={profile.dinkAccuracy}
            onSave={(value) => updateProfile('dinkAccuracy', value)}
            description="Precision in the non-volley zone"
          />
          <SliderField
            label="Third Shot Consistency"
            value={profile.thirdShotConsistency}
            onSave={(value) => updateProfile('thirdShotConsistency', value)}
            description="Reliability of your third shot drop/drive"
          />
          <SliderField
            label="Court Coverage"
            value={profile.courtCoverage}
            onSave={(value) => updateProfile('courtCoverage', value)}
            description="Movement and positioning on court"
          />
        </ProfileSection>

        {/* Equipment */}
        <ProfileSection title="Equipment" icon={Shield}>
          <EditableField
            label="Paddle Brand"
            value={profile.paddleBrand}
            onSave={(value) => updateProfile('paddleBrand', value)}
            placeholder="e.g., Selkirk, JOOLA, HEAD"
          />
          <EditableField
            label="Paddle Model"
            value={profile.paddleModel}
            onSave={(value) => updateProfile('paddleModel', value)}
            placeholder="e.g., Amped Epic, Ben Johns Hyperion"
          />
          <EditableField
            label="Backup Paddle Brand"
            value={profile.backupPaddleBrand}
            onSave={(value) => updateProfile('backupPaddleBrand', value)}
            placeholder="Secondary paddle brand"
          />
          <EditableField
            label="Backup Paddle Model"
            value={profile.backupPaddleModel}
            onSave={(value) => updateProfile('backupPaddleModel', value)}
            placeholder="Secondary paddle model"
          />
          <EditableField
            label="Apparel Brand"
            value={profile.apparelBrand}
            onSave={(value) => updateProfile('apparelBrand', value)}
            placeholder="Preferred clothing brand"
          />
          <EditableField
            label="Shoes Brand"
            value={profile.shoesBrand}
            onSave={(value) => updateProfile('shoesBrand', value)}
            placeholder="Court shoe brand"
          />
          <EditableField
            label="Other Equipment"
            value={profile.otherEquipment}
            onSave={(value) => updateProfile('otherEquipment', value)}
            type="textarea"
            placeholder="Grips, accessories, etc."
          />
        </ProfileSection>

        {/* Preferences */}
        <ProfileSection title="Preferences" icon={Settings}>
          <EditableField
            label="Preferred Surface"
            value={profile.preferredSurface}
            onSave={(value) => updateProfile('preferredSurface', value)}
            type="select"
            options={[
              { value: 'Outdoor courts', label: 'Outdoor Courts' },
              { value: 'Indoor courts', label: 'Indoor Courts' },
              { value: 'Both', label: 'Both Indoor/Outdoor' },
            ]}
          />
          <EditableField
            label="Indoor/Outdoor Preference"
            value={profile.indoorOutdoorPreference}
            onSave={(value) => updateProfile('indoorOutdoorPreference', value)}
            type="select"
            options={[
              { value: 'indoor', label: 'Indoor' },
              { value: 'outdoor', label: 'Outdoor' },
              { value: 'both', label: 'Both' },
            ]}
          />
          <SliderField
            label="Competitive Intensity"
            value={profile.competitiveIntensity}
            onSave={(value) => updateProfile('competitiveIntensity', value)}
            description="How competitive you prefer matches to be"
          />
          <EditableField
            label="Match Duration"
            value={profile.preferredMatchDuration}
            onSave={(value) => updateProfile('preferredMatchDuration', value)}
            type="select"
            options={[
              { value: '30 minutes', label: '30 minutes' },
              { value: '1 hour', label: '1 hour' },
              { value: '1-2 hours', label: '1-2 hours' },
              { value: '2+ hours', label: '2+ hours' },
            ]}
          />
          <EditableField
            label="Travel Radius"
            value={profile.travelRadiusKm}
            onSave={(value) => updateProfile('travelRadiusKm', value)}
            type="number"
            unit="km"
            placeholder="How far will you travel?"
          />
          <EditableField
            label="Home Courts"
            value={profile.homeCourtLocations}
            onSave={(value) => updateProfile('homeCourtLocations', value)}
            type="textarea"
            placeholder="Your regular playing locations"
          />
          
          {/* Toggle Preferences */}
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
              <div>
                <div className="text-white font-medium">Looking for Partners</div>
                <div className="text-sm text-slate-400">Open to playing with new people</div>
              </div>
              <Switch
                checked={profile.lookingForPartners}
                onCheckedChange={(checked) => updateProfile('lookingForPartners', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
              <div>
                <div className="text-white font-medium">Mentorship Interest</div>
                <div className="text-sm text-slate-400">Open to coaching or being coached</div>
              </div>
              <Switch
                checked={profile.mentorshipInterest}
                onCheckedChange={(checked) => updateProfile('mentorshipInterest', checked)}
              />
            </div>
          </div>
        </ProfileSection>

        {/* External Ratings */}
        <ProfileSection title="External Ratings" icon={Trophy}>
          <EditableField
            label="DUPR Rating"
            value={profile.duprRating}
            onSave={(value) => updateProfile('duprRating', value)}
            placeholder="e.g., 4.2"
          />
          <EditableField
            label="UTPR Rating"
            value={profile.utprRating}
            onSave={(value) => updateProfile('utprRating', value)}
            placeholder="e.g., 4.1"
          />
          <EditableField
            label="WPR Rating"
            value={profile.wprRating}
            onSave={(value) => updateProfile('wprRating', value)}
            placeholder="e.g., 4.0"
          />
        </ProfileSection>

        {/* Privacy & Settings */}
        <ProfileSection title="Privacy & Settings" icon={Settings}>
          <EditableField
            label="Privacy Profile"
            value={profile.privacyProfile}
            onSave={(value) => updateProfile('privacyProfile', value)}
            type="select"
            options={[
              { value: 'minimal', label: 'Minimal - Basic info only' },
              { value: 'standard', label: 'Standard - Normal visibility' },
              { value: 'enhanced', label: 'Enhanced - More details shared' },
              { value: 'full', label: 'Full - Maximum visibility' },
            ]}
          />
          <EditableField
            label="Language Preference"
            value={profile.languagePreference}
            onSave={(value) => updateProfile('languagePreference', value)}
            type="select"
            options={[
              { value: 'en', label: 'English' },
              { value: 'zh', label: '中文 (Chinese)' },
              { value: 'fr', label: 'Français' },
              { value: 'es', label: 'Español' },
            ]}
          />
          <EditableField
            label="Message Preferences"
            value={profile.privateMessagePreference}
            onSave={(value) => updateProfile('privateMessagePreference', value)}
            type="select"
            options={[
              { value: 'all', label: 'All Players' },
              { value: 'partners_only', label: 'Playing Partners Only' },
              { value: 'friends_only', label: 'Friends Only' },
              { value: 'none', label: 'No Messages' },
            ]}
          />
          <EditableField
            label="Social Data Consent"
            value={profile.socialDataConsentLevel}
            onSave={(value) => updateProfile('socialDataConsentLevel', value)}
            type="select"
            options={[
              { value: 'none', label: 'None - No social data' },
              { value: 'basic', label: 'Basic - Limited sharing' },
              { value: 'enhanced', label: 'Enhanced - Community features' },
              { value: 'full', label: 'Full - All features enabled' },
            ]}
          />
        </ProfileSection>

        {/* Player Goals */}
        <ProfileSection title="Goals & Aspirations" icon={Target}>
          <EditableField
            label="Player Goals"
            value={profile.playerGoals}
            onSave={(value) => updateProfile('playerGoals', value)}
            type="textarea"
            placeholder="What are your pickleball goals? Tournament play, skill improvement, etc."
          />
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