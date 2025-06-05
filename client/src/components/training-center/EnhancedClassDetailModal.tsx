/**
 * PKL-278651-PHASE2-SPRINT2.1 - Enhanced Class Detail Modal
 * Comprehensive class information display with capacity management,
 * coach profiles, prerequisites, and enrollment features
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Users, MapPin, CheckCircle, AlertCircle, Calendar, Award, BookOpen, Zap } from "lucide-react";

interface EnhancedClassData {
  id: number;
  name: string;
  description: string;
  detailedDescription: string;
  category: string;
  skillLevel: string;
  intensityLevel: string;
  classFormat: string;
  maxParticipants: number;
  minEnrollment: number;
  optimalCapacity: number;
  currentEnrollment: number;
  duration: number;
  price: number;
  goals: string[];
  prerequisites: string[];
  equipmentRequired: string[];
  equipmentProvided: string[];
  skillsFocused: string[];
  teachingMethods: string[];
  cancellationPolicy: string;
  makeupPolicy: string;
  startTime: string;
  endTime: string;
  date: string;
  court: number;
  waitlistCount: number;
  waitlistPosition?: number;
  coach: {
    id: number;
    name: string;
    avatar: string;
    bio: string;
    yearsExperience: number;
    certifications: string[];
    specializations: string[];
    rating: number;
    reviewCount: number;
    teachingStyle: string;
  };
  facility: {
    name: string;
    address: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classData: EnhancedClassData | null;
  onEnroll: (classId: number) => void;
  onJoinWaitlist: (classId: number) => void;
  userEnrollmentStatus?: 'not_enrolled' | 'enrolled' | 'waitlisted';
}

export function EnhancedClassDetailModal({ 
  isOpen, 
  onClose, 
  classData, 
  onEnroll, 
  onJoinWaitlist,
  userEnrollmentStatus = 'not_enrolled'
}: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'coach' | 'policies'>('overview');

  if (!classData) return null;

  const capacityPercentage = (classData.currentEnrollment / classData.maxParticipants) * 100;
  const isNearCapacity = capacityPercentage >= 80;
  const isFull = classData.currentEnrollment >= classData.maxParticipants;
  const isOptimal = classData.currentEnrollment >= classData.optimalCapacity && classData.currentEnrollment <= classData.maxParticipants;

  const getIntensityColor = (level: string) => {
    switch (level) {
      case 'light': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'intense': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderEnrollmentButton = () => {
    if (userEnrollmentStatus === 'enrolled') {
      return (
        <Button disabled className="w-full">
          <CheckCircle className="h-4 w-4 mr-2" />
          Enrolled
        </Button>
      );
    }

    if (userEnrollmentStatus === 'waitlisted') {
      return (
        <div className="space-y-2">
          <Button disabled className="w-full">
            <Clock className="h-4 w-4 mr-2" />
            On Waitlist
          </Button>
          {classData.waitlistPosition && (
            <p className="text-sm text-center text-gray-600">
              Position #{classData.waitlistPosition} • {classData.waitlistCount} total waiting
            </p>
          )}
        </div>
      );
    }

    if (isFull) {
      return (
        <Button onClick={() => onJoinWaitlist(classData.id)} className="w-full">
          <Clock className="h-4 w-4 mr-2" />
          Join Waitlist ({classData.waitlistCount})
        </Button>
      );
    }

    return (
      <Button onClick={() => onEnroll(classData.id)} className="w-full">
        <CheckCircle className="h-4 w-4 mr-2" />
        Enroll Now - ${classData.price}
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{classData.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Class Overview */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getSkillLevelColor(classData.skillLevel)}>
                    {classData.skillLevel}
                  </Badge>
                  <Badge className={getIntensityColor(classData.intensityLevel)}>
                    <Zap className="h-3 w-3 mr-1" />
                    {classData.intensityLevel}
                  </Badge>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {classData.classFormat}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {classData.duration}min
                  </Badge>
                </div>
                <CardTitle>Class Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{classData.description}</p>
                
                {/* Capacity Display */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Class Capacity</span>
                    <span className="text-sm text-gray-600">
                      {classData.currentEnrollment}/{classData.maxParticipants} enrolled
                    </span>
                  </div>
                  <Progress value={capacityPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Min: {classData.minEnrollment}</span>
                    <span>Optimal: {classData.optimalCapacity}</span>
                    <span>Max: {classData.maxParticipants}</span>
                  </div>
                  {isOptimal && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Optimal class size for best learning experience
                    </div>
                  )}
                  {isNearCapacity && !isFull && (
                    <div className="flex items-center text-amber-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Almost full - only {classData.maxParticipants - classData.currentEnrollment} spots left
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 border-b">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'coach', label: 'Coach' },
                    { id: 'policies', label: 'Policies' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-semibold mb-2">Detailed Description</h4>
                      <p className="text-gray-600">{classData.detailedDescription}</p>
                    </div>

                    {classData.goals.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Learning Goals</h4>
                        <ul className="space-y-1">
                          {classData.goals.map((goal, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {classData.prerequisites.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-amber-700">Prerequisites</h4>
                        <ul className="space-y-1">
                          {classData.prerequisites.map((prereq, index) => (
                            <li key={index} className="flex items-start">
                              <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{prereq}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Equipment Required</h4>
                        <ul className="space-y-1">
                          {classData.equipmentRequired.map((item, index) => (
                            <li key={index} className="text-gray-600 text-sm">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Equipment Provided</h4>
                        <ul className="space-y-1">
                          {classData.equipmentProvided.map((item, index) => (
                            <li key={index} className="text-gray-600 text-sm">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Skills Focused</h4>
                      <div className="flex flex-wrap gap-2">
                        {classData.skillsFocused.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {skill.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Teaching Methods</h4>
                      <div className="flex flex-wrap gap-2">
                        {classData.teachingMethods.map((method, index) => (
                          <Badge key={index} variant="outline">
                            {method.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'coach' && (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={classData.coach.avatar} />
                        <AvatarFallback>{classData.coach.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{classData.coach.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium">{classData.coach.rating}</span>
                            <span className="ml-1 text-sm text-gray-500">({classData.coach.reviewCount} reviews)</span>
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="text-sm text-gray-600">{classData.coach.yearsExperience} years experience</span>
                        </div>
                        <p className="text-gray-600 text-sm">{classData.coach.bio}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {classData.coach.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary">
                            <Award className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {classData.coach.specializations.map((spec, index) => (
                          <Badge key={index} variant="outline">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Teaching Style</h4>
                      <p className="text-gray-600 capitalize">{classData.coach.teachingStyle}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'policies' && (
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-semibold mb-2">Cancellation Policy</h4>
                      <p className="text-gray-600">{classData.cancellationPolicy}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Make-up Policy</h4>
                      <p className="text-gray-600">{classData.makeupPolicy}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Class Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{classData.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{classData.startTime} - {classData.endTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div className="text-sm">
                    <div className="font-medium">{classData.facility.name}</div>
                    <div className="text-gray-600">Court {classData.court}</div>
                    <div className="text-gray-500">{classData.facility.address}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${classData.price}</div>
                  <div className="text-sm text-gray-500">per session</div>
                </div>

                {renderEnrollmentButton()}
              </CardContent>
            </Card>

            {/* Coach Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Coach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={classData.coach.avatar} />
                    <AvatarFallback>{classData.coach.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{classData.coach.name}</div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                      {classData.coach.rating} • {classData.coach.reviewCount} reviews
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}