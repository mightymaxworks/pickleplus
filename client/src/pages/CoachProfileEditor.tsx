// Coach Profile Editor - Self-service profile management
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Save, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Upload,
  Globe,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Star,
  Settings,
  BarChart3,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { CoachPublicProfileWithRelations, CoachService } from '../../../shared/schema/coach-public-profiles';

const ServiceEditor: React.FC<{ 
  service?: CoachService; 
  onSave: (service: Partial<CoachService>) => void;
  onCancel: () => void;
}> = ({ service, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    description: service?.description || '',
    duration: service?.duration || 60,
    price: service?.price || 5000, // in cents
    sessionType: service?.sessionType || 'individual',
    maxParticipants: service?.maxParticipants || 1,
    isActive: service?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service ? 'Edit Service' : 'Add New Service'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Service Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Individual Coaching Session"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what's included in this service..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min="15"
                max="480"
              />
            </div>
            
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price / 100}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) * 100 })}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionType">Session Type</Label>
              <Select value={formData.sessionType} onValueChange={(value) => setFormData({ ...formData, sessionType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                min="1"
                max="50"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active (visible to clients)</Label>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Save Service
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const CoachProfileEditor: React.FC = () => {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [editingService, setEditingService] = useState<CoachService | null>(null);
  const [showServiceEditor, setShowServiceEditor] = useState(false);

  // Get coach's profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/my-coach-profile'],
    queryFn: async () => {
      const response = await fetch('/api/my-coach-profile', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to load profile');
      return response.json() as CoachPublicProfileWithRelations;
    }
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    tagline: '',
    bio: '',
    location: '',
    yearsExperience: '',
    specializations: [] as string[],
    certifications: [] as string[],
    playingLevel: '',
    coachingPhilosophy: '',
    hourlyRate: '',
    contactEmail: '',
    phoneNumber: '',
    website: '',
    isPublic: false,
    acceptingNewClients: true,
    showContactInfo: true,
    showPricing: true,
    showReviews: true
  });

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || '',
        tagline: profile.tagline || '',
        bio: profile.bio || '',
        location: profile.location || '',
        yearsExperience: profile.yearsExperience?.toString() || '',
        specializations: profile.specializations || [],
        certifications: profile.certifications || [],
        playingLevel: profile.playingLevel || '',
        coachingPhilosophy: profile.coachingPhilosophy || '',
        hourlyRate: profile.hourlyRate ? (profile.hourlyRate / 100).toString() : '',
        contactEmail: profile.contactEmail || '',
        phoneNumber: profile.phoneNumber || '',
        website: profile.website || '',
        isPublic: profile.isPublic,
        acceptingNewClients: profile.acceptingNewClients,
        showContactInfo: profile.showContactInfo,
        showPricing: profile.showPricing,
        showReviews: profile.showReviews
      });
    }
  }, [profile]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/my-coach-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience) : null,
          hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) * 100 : null
        })
      });
      if (!response.ok) throw new Error('Failed to save profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-coach-profile'] });
      toast({ title: 'Profile saved successfully!' });
    },
    onError: () => {
      toast({ title: 'Failed to save profile', variant: 'destructive' });
    }
  });

  // Services query
  const { data: services = [] } = useQuery({
    queryKey: ['/api/my-coach-profile/services'],
    queryFn: async () => {
      const response = await fetch('/api/my-coach-profile/services', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to load services');
      return response.json() as CoachService[];
    },
    enabled: !!profile
  });

  // Service mutations
  const saveServiceMutation = useMutation({
    mutationFn: async (data: { service: Partial<CoachService>; isEdit: boolean; serviceId?: number }) => {
      const url = data.isEdit 
        ? `/api/my-coach-profile/services/${data.serviceId}`
        : '/api/my-coach-profile/services';
      
      const response = await fetch(url, {
        method: data.isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data.service)
      });
      if (!response.ok) throw new Error('Failed to save service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-coach-profile/services'] });
      setShowServiceEditor(false);
      setEditingService(null);
      toast({ title: 'Service saved successfully!' });
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      const response = await fetch(`/api/my-coach-profile/services/${serviceId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-coach-profile/services'] });
      toast({ title: 'Service deleted successfully!' });
    }
  });

  const handleSaveProfile = () => {
    saveProfileMutation.mutate(profileForm);
  };

  const handleAddSpecialization = (spec: string) => {
    if (spec && !profileForm.specializations.includes(spec)) {
      setProfileForm({
        ...profileForm,
        specializations: [...profileForm.specializations, spec]
      });
    }
  };

  const handleRemoveSpecialization = (spec: string) => {
    setProfileForm({
      ...profileForm,
      specializations: profileForm.specializations.filter(s => s !== spec)
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-spin">
              <polygon
                points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                fill="none"
                stroke="#f97316"
                strokeWidth="8"
              />
            </svg>
          </div>
          <p>Loading profile editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Edit Coach Profile</h1>
            <p className="text-gray-600 mt-1">Manage your public coaching profile</p>
          </div>
          
          <div className="flex gap-3">
            {profile?.slug && (
              <Button 
                variant="outline"
                onClick={() => window.open(`/coach/${profile.slug}`, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Profile
              </Button>
            )}
            
            <Button 
              onClick={handleSaveProfile}
              disabled={saveProfileMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                      placeholder="Your professional name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={profileForm.tagline}
                      onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                      placeholder="Brief description of your coaching"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell potential clients about yourself..."
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      placeholder="City, State"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      value={profileForm.yearsExperience}
                      onChange={(e) => setProfileForm({ ...profileForm, yearsExperience: e.target.value })}
                      min="0"
                      max="50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="specializations">Specializations</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileForm.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {spec}
                        <button 
                          onClick={() => handleRemoveSpecialization(spec)}
                          className="text-xs hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add specialization (press Enter)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSpecialization((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
                
                <div>
                  <Label htmlFor="playingLevel">Playing Level</Label>
                  <Select value={profileForm.playingLevel} onValueChange={(value) => setProfileForm({ ...profileForm, playingLevel: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your playing level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recreational">Recreational</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="pro">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="coachingPhilosophy">Coaching Philosophy</Label>
                  <Textarea
                    id="coachingPhilosophy"
                    value={profileForm.coachingPhilosophy}
                    onChange={(e) => setProfileForm({ ...profileForm, coachingPhilosophy: e.target.value })}
                    placeholder="Describe your approach to coaching..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={profileForm.contactEmail}
                      onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    placeholder="https://your-website.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Coaching Services</h2>
              <Button onClick={() => setShowServiceEditor(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            {showServiceEditor && (
              <ServiceEditor
                service={editingService || undefined}
                onSave={(service) => {
                  saveServiceMutation.mutate({
                    service,
                    isEdit: !!editingService,
                    serviceId: editingService?.id
                  });
                }}
                onCancel={() => {
                  setShowServiceEditor(false);
                  setEditingService(null);
                }}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingService(service);
                            setShowServiceEditor(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => deleteServiceMutation.mutate(service.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{service.duration} minutes</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span>${(service.price / 100).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{service.sessionType} • Max {service.maxParticipants}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Badge variant={service.isActive ? "default" : "secondary"}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isPublic">Public Profile</Label>
                    <p className="text-sm text-gray-600">Make your profile visible to all users</p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={profileForm.isPublic}
                    onCheckedChange={(checked) => setProfileForm({ ...profileForm, isPublic: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="acceptingNewClients">Accepting New Clients</Label>
                    <p className="text-sm text-gray-600">Show that you're available for new students</p>
                  </div>
                  <Switch
                    id="acceptingNewClients"
                    checked={profileForm.acceptingNewClients}
                    onCheckedChange={(checked) => setProfileForm({ ...profileForm, acceptingNewClients: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showContactInfo">Show Contact Information</Label>
                    <p className="text-sm text-gray-600">Display your contact details publicly</p>
                  </div>
                  <Switch
                    id="showContactInfo"
                    checked={profileForm.showContactInfo}
                    onCheckedChange={(checked) => setProfileForm({ ...profileForm, showContactInfo: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showPricing">Show Pricing</Label>
                    <p className="text-sm text-gray-600">Display your hourly rate and service prices</p>
                  </div>
                  <Switch
                    id="showPricing"
                    checked={profileForm.showPricing}
                    onCheckedChange={(checked) => setProfileForm({ ...profileForm, showPricing: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{profile?.viewCount || 0}</div>
                    <p className="text-gray-600">Profile Views</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{services.length}</div>
                    <p className="text-gray-600">Active Services</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {profile?.testimonials?.length || 0}
                    </div>
                    <p className="text-gray-600">Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CoachProfileEditor;