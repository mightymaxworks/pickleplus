import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Check, Camera, Upload, ExternalLink, Shield, User, Trophy, Settings, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  bio?: string;
  yearOfBirth?: number;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bannerPattern?: string;
  avatarInitials?: string;
  playingSince?: string;
  skillLevel?: string;
  duprRating?: string;
  duprProfileUrl?: string;
  usaPickleballRating?: string;
  usaPickleballProfileUrl?: string;
  ifpRating?: string;
  ifpProfileUrl?: string;
  iptpaRating?: string;
  iptpaProfileUrl?: string;
  externalRatings?: any;
  externalRatingsVerified?: boolean;
  primaryPaddle?: string;
  backupPaddle?: string;
  playingStyle?: string;
  privacyProfile?: string;
  pointsLevel?: number;
  picklePoints?: number;
  totalMatches?: number;
  matchesWon?: number;
  totalTournaments?: number;
  isFoundingMember?: boolean;
}

interface PassportDetailModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

interface EditableFieldProps {
  label: string;
  value: string | number | null | undefined;
  type?: 'text' | 'textarea' | 'select' | 'number' | 'url' | 'date' | 'email';
  options?: string[];
  fieldKey: string;
  onSave: (fieldKey: string, value: any) => void;
  placeholder?: string;
  validation?: (value: string) => boolean;
  icon?: React.ReactNode;
  external?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  type = 'text',
  options,
  fieldKey,
  onSave,
  placeholder,
  validation,
  icon,
  external = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const [isValid, setIsValid] = useState(true);

  const handleSave = () => {
    if (validation && !validation(editValue)) {
      setIsValid(false);
      return;
    }
    
    onSave(fieldKey, editValue);
    setIsEditing(false);
    setIsValid(true);
  };

  const handleCancel = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(false);
    setIsValid(true);
  };

  useEffect(() => {
    setEditValue(value?.toString() || '');
  }, [value]);

  const displayValue = value || 'Not specified';

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <div className="flex gap-2">
          <div className="flex-1">
            {type === 'textarea' ? (
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={placeholder}
                className={`resize-none ${!isValid ? 'border-red-500' : ''}`}
                rows={3}
              />
            ) : type === 'select' && options ? (
              <Select value={editValue} onValueChange={setEditValue}>
                <SelectTrigger className={!isValid ? 'border-red-500' : ''}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={placeholder}
                className={!isValid ? 'border-red-500' : ''}
              />
            )}
            {!isValid && (
              <p className="text-sm text-red-500 mt-1">Invalid input</p>
            )}
          </div>
          <Button size="sm" onClick={handleSave} className="px-3">
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} className="px-3">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div 
        className="flex items-center justify-between p-2 rounded-md border bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => setIsEditing(true)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {displayValue}
        </span>
        <div className="flex items-center gap-2">
          {external && value && (
            <ExternalLink className="h-4 w-4 text-blue-500" />
          )}
          <Edit3 className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export const PassportDetailModal: React.FC<PassportDetailModalProps> = ({
  user,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('identity');

  const updateProfileMutation = useMutation({
    mutationFn: async (updateData: Partial<User>) => {
      const response = await apiRequest('PUT', '/api/users/profile', updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleFieldSave = (fieldKey: string, value: any) => {
    updateProfileMutation.mutate({ [fieldKey]: value });
  };

  const tabs = [
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'playing', label: 'Playing', icon: Gamepad2 },
    { id: 'ratings', label: 'Ratings', icon: Trophy },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const skillLevelOptions = ['1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0'];
  const privacyOptions = ['public', 'friends', 'private'];

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateUrl = (url: string) => !url || /^https?:\/\/.+/.test(url);
  const validateYear = (year: string) => {
    const y = parseInt(year);
    return y >= 1900 && y <= new Date().getFullYear() - 13;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.avatarInitials || user.displayName?.slice(0, 2) || 'PL'}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Player Passport</h2>
                  <p className="text-sm text-gray-600">{user.displayName || user.username}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b bg-gray-50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'identity' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditableField
                      label="Display Name"
                      value={user.displayName}
                      fieldKey="displayName"
                      onSave={handleFieldSave}
                      placeholder="Your public display name"
                      icon={<User className="h-4 w-4" />}
                    />
                    <EditableField
                      label="Username"
                      value={user.username}
                      fieldKey="username"
                      onSave={handleFieldSave}
                      placeholder="Unique username"
                      icon={<User className="h-4 w-4" />}
                    />
                    <EditableField
                      label="First Name"
                      value={user.firstName}
                      fieldKey="firstName"
                      onSave={handleFieldSave}
                      placeholder="Your first name"
                    />
                    <EditableField
                      label="Last Name"
                      value={user.lastName}
                      fieldKey="lastName"
                      onSave={handleFieldSave}
                      placeholder="Your last name"
                    />
                    <EditableField
                      label="Email"
                      value={user.email}
                      fieldKey="email"
                      onSave={handleFieldSave}
                      type="email"
                      placeholder="your.email@example.com"
                      validation={validateEmail}
                    />
                    <EditableField
                      label="Location"
                      value={user.location}
                      fieldKey="location"
                      onSave={handleFieldSave}
                      placeholder="City, State/Province"
                    />
                    <EditableField
                      label="Year of Birth"
                      value={user.yearOfBirth}
                      fieldKey="yearOfBirth"
                      onSave={handleFieldSave}
                      type="number"
                      placeholder="1990"
                      validation={validateYear}
                    />
                    <EditableField
                      label="Gender"
                      value={user.gender}
                      fieldKey="gender"
                      onSave={handleFieldSave}
                      type="select"
                      options={genderOptions}
                      placeholder="Select gender"
                    />
                  </div>
                  <EditableField
                    label="Bio"
                    value={user.bio}
                    fieldKey="bio"
                    onSave={handleFieldSave}
                    type="textarea"
                    placeholder="Tell others about yourself, your playing style, and what you enjoy about pickleball..."
                  />
                </div>
              )}

              {activeTab === 'playing' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditableField
                      label="Playing Since"
                      value={user.playingSince}
                      fieldKey="playingSince"
                      onSave={handleFieldSave}
                      placeholder="When did you start playing?"
                    />
                    <EditableField
                      label="Skill Level"
                      value={user.skillLevel}
                      fieldKey="skillLevel"
                      onSave={handleFieldSave}
                      type="select"
                      options={skillLevelOptions}
                      placeholder="Select skill level"
                    />
                    <EditableField
                      label="Primary Paddle"
                      value={user.primaryPaddle}
                      fieldKey="primaryPaddle"
                      onSave={handleFieldSave}
                      placeholder="Brand and model of your main paddle"
                    />
                    <EditableField
                      label="Backup Paddle"
                      value={user.backupPaddle}
                      fieldKey="backupPaddle"
                      onSave={handleFieldSave}
                      placeholder="Your secondary paddle"
                    />
                  </div>
                  <EditableField
                    label="Playing Style"
                    value={user.playingStyle}
                    fieldKey="playingStyle"
                    onSave={handleFieldSave}
                    type="textarea"
                    placeholder="Describe your playing style, preferred strategies, and court positioning..."
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold">{user.totalMatches || 0}</div>
                          <div className="text-sm text-gray-600">Total Matches</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold">{user.matchesWon || 0}</div>
                          <div className="text-sm text-gray-600">Matches Won</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Trophy className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold">{user.totalTournaments || 0}</div>
                          <div className="text-sm text-gray-600">Tournaments</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'ratings' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">DUPR Rating</h3>
                      <EditableField
                        label="DUPR Rating"
                        value={user.duprRating}
                        fieldKey="duprRating"
                        onSave={handleFieldSave}
                        placeholder="e.g., 4.125"
                      />
                      <EditableField
                        label="DUPR Profile URL"
                        value={user.duprProfileUrl}
                        fieldKey="duprProfileUrl"
                        onSave={handleFieldSave}
                        type="url"
                        placeholder="https://mydupr.com/..."
                        validation={validateUrl}
                        external
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">USA Pickleball</h3>
                      <EditableField
                        label="USA PB Rating"
                        value={user.usaPickleballRating}
                        fieldKey="usaPickleballRating"
                        onSave={handleFieldSave}
                        placeholder="e.g., 4.0"
                      />
                      <EditableField
                        label="USA PB Profile URL"
                        value={user.usaPickleballProfileUrl}
                        fieldKey="usaPickleballProfileUrl"
                        onSave={handleFieldSave}
                        type="url"
                        placeholder="https://usapickleball.org/..."
                        validation={validateUrl}
                        external
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">IFP Rating</h3>
                      <EditableField
                        label="IFP Rating"
                        value={user.ifpRating}
                        fieldKey="ifpRating"
                        onSave={handleFieldSave}
                        placeholder="e.g., 4.2"
                      />
                      <EditableField
                        label="IFP Profile URL"
                        value={user.ifpProfileUrl}
                        fieldKey="ifpProfileUrl"
                        onSave={handleFieldSave}
                        type="url"
                        placeholder="https://ifpickleball.org/..."
                        validation={validateUrl}
                        external
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">IPTPA Rating</h3>
                      <EditableField
                        label="IPTPA Rating"
                        value={user.iptpaRating}
                        fieldKey="iptpaRating"
                        onSave={handleFieldSave}
                        placeholder="e.g., Pro Level 1"
                      />
                      <EditableField
                        label="IPTPA Profile URL"
                        value={user.iptpaProfileUrl}
                        fieldKey="iptpaProfileUrl"
                        onSave={handleFieldSave}
                        type="url"
                        placeholder="https://iptpa.com/..."
                        validation={validateUrl}
                        external
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Rating Verification</div>
                      <div className="text-sm text-gray-600">
                        {user.externalRatingsVerified ? 'Your ratings have been verified' : 'Ratings pending verification'}
                      </div>
                    </div>
                    <Badge variant={user.externalRatingsVerified ? "default" : "secondary"}>
                      {user.externalRatingsVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <EditableField
                    label="Privacy Profile"
                    value={user.privacyProfile}
                    fieldKey="privacyProfile"
                    onSave={handleFieldSave}
                    type="select"
                    options={privacyOptions}
                    placeholder="Select privacy level"
                    icon={<Shield className="h-4 w-4" />}
                  />
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Account Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Founding Member</div>
                          <div className="text-sm text-gray-600">Early adopter status</div>
                        </div>
                        <Badge variant={user.isFoundingMember ? "default" : "secondary"}>
                          {user.isFoundingMember ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Pickle Points</div>
                          <div className="text-sm text-gray-600">Current point balance</div>
                        </div>
                        <Badge variant="outline">
                          {user.picklePoints || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};