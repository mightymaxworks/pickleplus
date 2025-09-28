import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IdCard, 
  Trophy, 
  Target,
  Camera,
  Gamepad2,
  Shield,
  Dumbbell,
  Users
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

// Types
type PlayerTier = 'recreational' | 'competitive' | 'elite' | 'professional';

interface PlayerData {
  name: string;
  tier: PlayerTier;
  rankingPoints: number;
  globalRank: number;
  localRank: number;
  recentChange: number;
}

// Tier configuration
const tierConfig = {
  recreational: { icon: Users, name: 'Recreational', color: 'from-orange-500 to-orange-600' },
  competitive: { icon: Target, name: 'Competitive', color: 'from-blue-500 to-blue-600' },
  elite: { icon: Trophy, name: 'Elite', color: 'from-purple-500 to-purple-600' },
  professional: { icon: Shield, name: 'Professional', color: 'from-yellow-500 to-yellow-600' }
};

// Mock data
const mockPlayer: PlayerData = {
  name: 'Alex Chen',
  tier: 'competitive',
  rankingPoints: 1247,
  globalRank: 23,
  localRank: 5,
  recentChange: 34
};

// Profile Mode Content - Comprehensive version with all fields
function ProfileModeContent({ player }: { player: PlayerData }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const config = tierConfig[player.tier];
  const TierIcon = config.icon;

  const [profile, setProfile] = useState({
    // Basic Info
    displayName: player.name,
    email: 'alex.chen@example.com',
    firstName: 'Alex',
    lastName: 'Chen',
    location: 'Vancouver, BC',
    bio: 'Passionate pickleball player always looking to improve.',
    dateOfBirth: '1990-03-15',
    gender: 'male',
    
    // Playing Profile
    skillLevel: '4.0',
    playingStyle: 'Aggressive baseline',
    dominantHand: 'right',
    preferredPosition: 'Right side',
    preferredFormat: 'Doubles',
    playingSince: '3 years',
    regularSchedule: 'Weekends, Tuesday evenings',
    
    // Equipment
    paddleBrand: 'Selkirk',
    paddleModel: 'Amped Epic',
    backupPaddleBrand: 'JOOLA',
    backupPaddleModel: 'Ben Johns Hyperion',
    apparelBrand: 'HEAD',
    shoesBrand: 'K-Swiss',
    
    // Physical
    height: 175,
    reach: 180,
    fitnessLevel: 'Good',
    
    // Skill Assessment (1-10)
    forehandStrength: 7,
    backhandStrength: 6,
    servePower: 8,
    dinkAccuracy: 7,
    thirdShotConsistency: 6,
    courtCoverage: 8,
    
    // Preferences
    preferredSurface: 'Outdoor courts',
    indoorOutdoorPreference: 'both',
    competitiveIntensity: 7,
    lookingForPartners: true,
    mentorshipInterest: false,
    preferredMatchDuration: '1-2 hours',
    travelRadiusKm: 25,
    
    // External Ratings
    duprRating: '4.2',
    utprRating: '4.1',
    wprRating: '',
    
    // Privacy
    privacyProfile: 'standard',
    languagePreference: 'en',
  });

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Skill Assessment Slider Component
  const SkillSlider = ({ label, value, field }: { label: string; value: number; field: string }) => (
    <div className="p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white font-medium">{label}</div>
        <div className="text-white font-bold text-lg">{value}</div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(newValue) => updateProfile(field, newValue[0])}
        min={1}
        max={10}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>Poor (1)</span>
        <span>Excellent (10)</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <IdCard className="h-8 w-8 text-orange-400" />
            Profile
          </h1>
          <p className="text-slate-300">Manage your player profile and preferences</p>
        </div>

        {/* Profile Header */}
        <Card className={`p-6 bg-gradient-to-r ${config.color} border border-white/20 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          
          <div className="relative text-white text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                <TierIcon className="h-10 w-10" />
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>
            <h2 className="text-2xl font-bold mb-1">{profile.displayName}</h2>
            <Badge className="bg-white/30 text-white px-3 py-1">
              {config.name} Player
            </Badge>
          </div>
        </Card>

        {/* Basic Information */}
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <IdCard className="h-4 w-4 mr-2 text-orange-400" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">First Name</label>
              <Input
                value={profile.firstName}
                onChange={(e) => updateProfile('firstName', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Last Name</label>
              <Input
                value={profile.lastName}
                onChange={(e) => updateProfile('lastName', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Email</label>
              <Input
                value={profile.email}
                onChange={(e) => updateProfile('email', e.target.value)}
                type="email"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Location</label>
              <Input
                value={profile.location}
                onChange={(e) => updateProfile('location', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Birth Date</label>
              <Input
                value={profile.dateOfBirth}
                onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
                type="date"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Gender</label>
              <Select value={profile.gender} onValueChange={(value) => updateProfile('gender', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="male" className="text-white">Male</SelectItem>
                  <SelectItem value="female" className="text-white">Female</SelectItem>
                  <SelectItem value="other" className="text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-slate-400 mb-1 block">Bio</label>
              <Textarea
                value={profile.bio}
                onChange={(e) => updateProfile('bio', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Playing Profile */}
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Gamepad2 className="h-4 w-4 mr-2 text-orange-400" />
            Playing Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Skill Level</label>
              <Select value={profile.skillLevel} onValueChange={(value) => updateProfile('skillLevel', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="2.0" className="text-white">2.0 - Beginner</SelectItem>
                  <SelectItem value="2.5" className="text-white">2.5 - Novice</SelectItem>
                  <SelectItem value="3.0" className="text-white">3.0 - Beginner+</SelectItem>
                  <SelectItem value="3.5" className="text-white">3.5 - Intermediate</SelectItem>
                  <SelectItem value="4.0" className="text-white">4.0 - Advanced</SelectItem>
                  <SelectItem value="4.5" className="text-white">4.5 - Expert</SelectItem>
                  <SelectItem value="5.0+" className="text-white">5.0+ - Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Playing Style</label>
              <Select value={profile.playingStyle} onValueChange={(value) => updateProfile('playingStyle', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Aggressive baseline" className="text-white">Aggressive Baseline</SelectItem>
                  <SelectItem value="Defensive baseline" className="text-white">Defensive Baseline</SelectItem>
                  <SelectItem value="Net rusher" className="text-white">Net Rusher</SelectItem>
                  <SelectItem value="All-court" className="text-white">All-Court</SelectItem>
                  <SelectItem value="Counter puncher" className="text-white">Counter Puncher</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Dominant Hand</label>
              <Select value={profile.dominantHand} onValueChange={(value) => updateProfile('dominantHand', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="right" className="text-white">Right</SelectItem>
                  <SelectItem value="left" className="text-white">Left</SelectItem>
                  <SelectItem value="ambidextrous" className="text-white">Ambidextrous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Preferred Position</label>
              <Select value={profile.preferredPosition} onValueChange={(value) => updateProfile('preferredPosition', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Left side" className="text-white">Left Side (Forehand)</SelectItem>
                  <SelectItem value="Right side" className="text-white">Right Side (Backhand)</SelectItem>
                  <SelectItem value="Either" className="text-white">Either Side</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Preferred Format</label>
              <Select value={profile.preferredFormat} onValueChange={(value) => updateProfile('preferredFormat', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Singles" className="text-white">Singles</SelectItem>
                  <SelectItem value="Doubles" className="text-white">Doubles</SelectItem>
                  <SelectItem value="Mixed doubles" className="text-white">Mixed Doubles</SelectItem>
                  <SelectItem value="Any" className="text-white">Any Format</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Playing Since</label>
              <Input
                value={profile.playingSince}
                onChange={(e) => updateProfile('playingSince', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., 2 years, 6 months"
              />
            </div>
          </div>
        </Card>

        {/* Skill Assessment */}
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Target className="h-4 w-4 mr-2 text-orange-400" />
            Skill Assessment
          </h3>
          <div className="space-y-4">
            <SkillSlider label="Forehand Strength" value={profile.forehandStrength} field="forehandStrength" />
            <SkillSlider label="Backhand Strength" value={profile.backhandStrength} field="backhandStrength" />
            <SkillSlider label="Serve Power" value={profile.servePower} field="servePower" />
            <SkillSlider label="Dink Accuracy" value={profile.dinkAccuracy} field="dinkAccuracy" />
            <SkillSlider label="Third Shot Consistency" value={profile.thirdShotConsistency} field="thirdShotConsistency" />
            <SkillSlider label="Court Coverage" value={profile.courtCoverage} field="courtCoverage" />
          </div>
        </Card>

        {/* Equipment */}
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-orange-400" />
            Equipment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Paddle Brand</label>
              <Select value={profile.paddleBrand} onValueChange={(value) => updateProfile('paddleBrand', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Selkirk" className="text-white">Selkirk</SelectItem>
                  <SelectItem value="JOOLA" className="text-white">JOOLA</SelectItem>
                  <SelectItem value="HEAD" className="text-white">HEAD</SelectItem>
                  <SelectItem value="SHOT3" className="text-white">SHOT3</SelectItem>
                  <SelectItem value="DragonFly" className="text-white">DragonFly</SelectItem>
                  <SelectItem value="Paddletek" className="text-white">Paddletek</SelectItem>
                  <SelectItem value="Engage" className="text-white">Engage</SelectItem>
                  <SelectItem value="Franklin" className="text-white">Franklin</SelectItem>
                  <SelectItem value="Gamma" className="text-white">Gamma</SelectItem>
                  <SelectItem value="Other" className="text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Paddle Model</label>
              <Input
                value={profile.paddleModel}
                onChange={(e) => updateProfile('paddleModel', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., Amped Epic"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Apparel Brand</label>
              <Select value={profile.apparelBrand} onValueChange={(value) => updateProfile('apparelBrand', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="HEAD" className="text-white">HEAD</SelectItem>
                  <SelectItem value="Nike" className="text-white">Nike</SelectItem>
                  <SelectItem value="Adidas" className="text-white">Adidas</SelectItem>
                  <SelectItem value="Under Armour" className="text-white">Under Armour</SelectItem>
                  <SelectItem value="Lululemon" className="text-white">Lululemon</SelectItem>
                  <SelectItem value="Wilson" className="text-white">Wilson</SelectItem>
                  <SelectItem value="Fila" className="text-white">Fila</SelectItem>
                  <SelectItem value="Other" className="text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Shoes Brand</label>
              <Select value={profile.shoesBrand} onValueChange={(value) => updateProfile('shoesBrand', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="K-Swiss" className="text-white">K-Swiss</SelectItem>
                  <SelectItem value="ASICS" className="text-white">ASICS</SelectItem>
                  <SelectItem value="Nike" className="text-white">Nike</SelectItem>
                  <SelectItem value="Adidas" className="text-white">Adidas</SelectItem>
                  <SelectItem value="New Balance" className="text-white">New Balance</SelectItem>
                  <SelectItem value="HEAD" className="text-white">HEAD</SelectItem>
                  <SelectItem value="Wilson" className="text-white">Wilson</SelectItem>
                  <SelectItem value="Fila" className="text-white">Fila</SelectItem>
                  <SelectItem value="Other" className="text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Physical Profile */}
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Dumbbell className="h-4 w-4 mr-2 text-orange-400" />
            Physical Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Height (cm)</label>
              <Input
                value={profile.height}
                onChange={(e) => updateProfile('height', Number(e.target.value))}
                type="number"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Reach (cm)</label>
              <Input
                value={profile.reach}
                onChange={(e) => updateProfile('reach', Number(e.target.value))}
                type="number"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Fitness Level</label>
              <Select value={profile.fitnessLevel} onValueChange={(value) => updateProfile('fitnessLevel', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Poor" className="text-white">Poor</SelectItem>
                  <SelectItem value="Fair" className="text-white">Fair</SelectItem>
                  <SelectItem value="Good" className="text-white">Good</SelectItem>
                  <SelectItem value="Very Good" className="text-white">Very Good</SelectItem>
                  <SelectItem value="Excellent" className="text-white">Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Target className="h-4 w-4 mr-2 text-orange-400" />
            Playing Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Travel Radius (km)</label>
              <Input
                value={profile.travelRadiusKm}
                onChange={(e) => updateProfile('travelRadiusKm', Number(e.target.value))}
                type="number"
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="How far will you travel?"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Preferred Match Duration</label>
              <Select value={profile.preferredMatchDuration} onValueChange={(value) => updateProfile('preferredMatchDuration', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="30 minutes" className="text-white">30 minutes</SelectItem>
                  <SelectItem value="1 hour" className="text-white">1 hour</SelectItem>
                  <SelectItem value="1-2 hours" className="text-white">1-2 hours</SelectItem>
                  <SelectItem value="2+ hours" className="text-white">2+ hours</SelectItem>
                  <SelectItem value="All day" className="text-white">All day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40"
            >
              <Button
                size="lg"
                onClick={() => setHasUnsavedChanges(false)}
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg px-8"
              >
                Save Changes
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PrototypeProfilePage() {
  return <ProfileModeContent player={mockPlayer} />;
}