import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit3, Save, X, Upload, MapPin, Clock, Star, Users, Phone, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { CoachPublicProfileWithRelations } from '../../../shared/schema/coach-public-profiles';

interface InlineEditableFieldProps {
  value: string;
  onSave: (newValue: string) => void;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}

const InlineEditableField: React.FC<InlineEditableFieldProps> = ({
  value,
  onSave,
  isEditing,
  onEdit,
  onCancel,
  multiline = false,
  placeholder,
  className = ""
}) => {
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
  };

  const handleCancel = () => {
    setTempValue(value);
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        {multiline ? (
          <Textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            rows={3}
          />
        ) : (
          <Input
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
        )}
        <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
          <Save className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`group relative cursor-pointer ${className}`} onClick={onEdit}>
      <span className="block">
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
      </span>
      <Edit3 className="w-4 h-4 absolute -right-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
    </div>
  );
};

interface InlineEditableProfileProps {
  profile: CoachPublicProfileWithRelations;
  isOwner: boolean;
}

export const InlineEditableProfile: React.FC<InlineEditableProfileProps> = ({
  profile,
  isOwner
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState(profile.profileImageUrl || '');
  const [coverImage, setCoverImage] = useState(profile.coverImageUrl || '');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<CoachPublicProfileWithRelations>) => {
      const response = await fetch(`/api/coach-public-profiles/${profile.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update profile');
      }
      return response.json();
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData([`/api/coach-public-profiles/${profile.slug}`], updatedProfile);
      toast({ title: 'Profile updated successfully!' });
      setEditingField(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Update failed', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File, type: 'profile' | 'cover' }) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);
      
      const response = await fetch(`/api/coach-public-profiles/${profile.slug}/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload image');
      return response.json();
    },
    onSuccess: (data) => {
      const updates = data.type === 'profile' 
        ? { profileImageUrl: data.imageUrl }
        : { coverImageUrl: data.imageUrl };
      
      updateProfileMutation.mutate(updates);
      
      if (data.type === 'profile') {
        setProfileImage(data.imageUrl);
      } else {
        setCoverImage(data.imageUrl);
      }
    },
    onError: () => {
      toast({ title: 'Image upload failed', variant: 'destructive' });
    }
  });

  const handleFieldSave = (field: string, value: string) => {
    updateProfileMutation.mutate({ [field]: value });
  };

  const handleImageUpload = (type: 'profile' | 'cover') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast({ title: 'Image too large', description: 'Please select an image under 5MB', variant: 'destructive' });
          return;
        }
        uploadImageMutation.mutate({ file, type });
      }
    };
    input.click();
  };

  const featuredTestimonials = profile.testimonials?.filter(t => t.isFeatured).slice(0, 3) || [];
  const activeServices = profile.services?.filter(s => s.isActive) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="relative">
        {/* Cover Image */}
        <div 
          className="h-64 bg-cover bg-center relative group"
          style={{ 
            backgroundImage: coverImage ? `url(${coverImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          {isOwner && (
            <Button
              onClick={() => handleImageUpload('cover')}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              size="sm"
              disabled={uploadImageMutation.isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              Change Cover
            </Button>
          )}
        </div>
        
        {/* Profile Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Image */}
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profileImage} />
                  <AvatarFallback className="text-2xl">
                    {profile.displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isOwner && (
                  <Button
                    onClick={() => handleImageUpload('profile')}
                    className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8 p-0"
                    size="sm"
                    disabled={uploadImageMutation.isPending}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {isOwner ? (
                        <InlineEditableField
                          value={profile.displayName}
                          onSave={(value) => handleFieldSave('displayName', value)}
                          isEditing={editingField === 'displayName'}
                          onEdit={() => setEditingField('displayName')}
                          onCancel={() => setEditingField(null)}
                          placeholder="Your professional name"
                        />
                      ) : (
                        profile.displayName
                      )}
                    </h1>
                    
                    {profile.tagline && (
                      <p className="text-lg text-gray-600 mt-1">
                        {isOwner ? (
                          <InlineEditableField
                            value={profile.tagline}
                            onSave={(value) => handleFieldSave('tagline', value)}
                            isEditing={editingField === 'tagline'}
                            onEdit={() => setEditingField('tagline')}
                            onCancel={() => setEditingField(null)}
                            placeholder="Brief description of your coaching"
                          />
                        ) : (
                          profile.tagline
                        )}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      {profile.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {isOwner ? (
                              <InlineEditableField
                                value={profile.location}
                                onSave={(value) => handleFieldSave('location', value)}
                                isEditing={editingField === 'location'}
                                onEdit={() => setEditingField('location')}
                                onCancel={() => setEditingField(null)}
                                placeholder="Your location"
                                className="inline"
                              />
                            ) : (
                              profile.location
                            )}
                          </span>
                        </div>
                      )}
                      
                      {profile.yearsExperience && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{profile.yearsExperience} years experience</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {profile.contactEmail && (
                      <Button size="sm" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Contact Coach
                      </Button>
                    )}
                    
                    {activeServices.length > 0 && (
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Book Session
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <div className="prose max-w-none">
                  {isOwner ? (
                    <InlineEditableField
                      value={profile.bio || ''}
                      onSave={(value) => handleFieldSave('bio', value)}
                      isEditing={editingField === 'bio'}
                      onEdit={() => setEditingField('bio')}
                      onCancel={() => setEditingField(null)}
                      multiline
                      placeholder="Tell potential clients about yourself..."
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">
                      {profile.bio || 'No bio available'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services Section */}
            {activeServices.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Services</h2>
                  <div className="grid gap-4">
                    {activeServices.map((service, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{service.title}</h3>
                          <span className="text-lg font-bold text-green-600">
                            ${(service.price / 100).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{service.duration} minutes</span>
                          <span>{service.sessionType}</span>
                          {service.maxParticipants > 1 && (
                            <span>Up to {service.maxParticipants} participants</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Testimonials Section */}
            {featuredTestimonials.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">What Students Say</h2>
                  <div className="space-y-4">
                    {featuredTestimonials.map((testimonial, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < testimonial.rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <blockquote className="text-gray-700 italic mb-2">
                          "{testimonial.content}"
                        </blockquote>
                        <cite className="text-sm text-gray-500">
                          — {testimonial.studentName}
                        </cite>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Specializations */}
            {profile.specializations && profile.specializations.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">{spec}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Certifications</h3>
                  <div className="space-y-2">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline">{cert}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            {(profile.contactEmail || profile.phoneNumber || profile.website) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Contact</h3>
                  <div className="space-y-3">
                    {profile.contactEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{profile.contactEmail}</span>
                      </div>
                    )}
                    {profile.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{profile.phoneNumber}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineEditableProfile;