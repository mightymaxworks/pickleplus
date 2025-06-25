/**
 * PCP Coaching Certification Programme - Main Page
 * Comprehensive certification pathway for aspiring pickleball coaches
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  BookOpen, 
  Users, 
  Clock, 
  DollarSign,
  CheckCircle,
  PlayCircle,
  Target,
  Star,
  Trophy,
  GraduationCap,
  Calendar,
  FileText,
  Video,
  UserCheck
} from 'lucide-react';
import { Link } from 'wouter';

interface CertificationLevel {
  id: number;
  levelName: string;
  levelCode: string;
  description: string;
  prerequisites: any;
  requirements: any;
  benefits: any;
  duration: number;
  cost: number;
  isActive: boolean;
}

interface UserCertificationStatus {
  currentLevel?: string;
  completedLevels: string[];
  inProgress?: {
    levelId: number;
    applicationId: number;
    progress: number;
    status: string;
  };
  availableLevels: number[];
}

export default function PCPCertificationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch certification levels
  const { data: levelsResponse, isLoading: levelsLoading } = useQuery({
    queryKey: ['/api/pcp-certification/levels'],
    queryFn: () => apiRequest('GET', '/api/pcp-certification/levels').then(res => res.json())
  });

  // Fetch user's certification status
  const { data: userStatusResponse, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/pcp-certification/my-status'],
    queryFn: () => apiRequest('GET', '/api/pcp-certification/my-status').then(res => res.json()),
    enabled: !!user
  });

  const levels = levelsResponse?.data || [];
  const userStatus: UserCertificationStatus = userStatusResponse?.data || {
    completedLevels: [],
    availableLevels: levels.map((l: CertificationLevel) => l.id)
  };

  const getLevelIcon = (levelCode: string) => {
    switch (levelCode) {
      case 'PCP-L1': return <GraduationCap className="w-6 h-6" />;
      case 'PCP-L2': return <BookOpen className="w-6 h-6" />;
      case 'PCP-L3': return <Users className="w-6 h-6" />;
      case 'PCP-L4': return <Target className="w-6 h-6" />;
      case 'PCP-L5': return <Trophy className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const getLevelColor = (levelCode: string) => {
    switch (levelCode) {
      case 'PCP-L1': return 'bg-green-100 text-green-800 border-green-200';
      case 'PCP-L2': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PCP-L3': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PCP-L4': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PCP-L5': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const ProgramOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl">
            <Award className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">PCP Coaching Certification Programme</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Master the art of pickleball coaching with our comprehensive certification program. 
          From beginner instruction to advanced strategy development.
        </p>
      </div>

      {/* Program Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Why Choose PCP Certification?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="bg-blue-100 p-3 rounded-lg w-fit mx-auto">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Industry Recognition</h3>
              <p className="text-sm text-gray-600">Recognized by training centers and facilities nationwide</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-green-100 p-3 rounded-lg w-fit mx-auto">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Higher Earning Potential</h3>
              <p className="text-sm text-gray-600">Certified coaches earn 30-50% more than non-certified instructors</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-purple-100 p-3 rounded-lg w-fit mx-auto">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Professional Network</h3>
              <p className="text-sm text-gray-600">Join a community of elite pickleball coaches</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Path */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Your Learning Journey
          </CardTitle>
          <CardDescription>
            Structured progression from fundamental coaching skills to master-level expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {levels.map((level: CertificationLevel, index: number) => {
              const isCompleted = userStatus.completedLevels.includes(level.levelCode);
              const isInProgress = userStatus.inProgress?.levelId === level.id;
              const isAvailable = userStatus.availableLevels.includes(level.id);
              
              return (
                <div key={level.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className={`p-2 rounded-lg ${getLevelColor(level.levelCode)}`}>
                    {getLevelIcon(level.levelCode)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{level.levelName}</h3>
                      <Badge variant="outline">{level.levelCode}</Badge>
                      {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {isInProgress && <PlayCircle className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-600">{level.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {level.duration <= 7 ? `${level.duration} day${level.duration > 1 ? 's' : ''}` : 
                         level.duration === 180 ? '6 months' : `${level.duration} days`}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${(level.cost / 100).toFixed(0)}
                      </span>
                    </div>
                    {isInProgress && (
                      <Progress value={userStatus.inProgress?.progress || 0} className="mt-2" />
                    )}
                  </div>
                  <div>
                    {isCompleted ? (
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    ) : isInProgress ? (
                      <Link href={`/pcp-certification/level/${level.id}`}>
                        <Button size="sm">Continue</Button>
                      </Link>
                    ) : isAvailable ? (
                      <Link href={`/pcp-certification/apply/${level.id}`}>
                        <Button size="sm" variant="outline">Apply</Button>
                      </Link>
                    ) : (
                      <Badge variant="secondary">Locked</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CertificationLevels = () => (
    <div className="grid gap-6">
      {levels.map((level: CertificationLevel) => (
        <Card key={level.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getLevelColor(level.levelCode)}`}>
                  {getLevelIcon(level.levelCode)}
                </div>
                <div>
                  <CardTitle>{level.levelName}</CardTitle>
                  <CardDescription>{level.levelCode}</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${(level.cost / 100).toFixed(0)}</div>
                <div className="text-sm text-gray-500">
                  {level.duration <= 7 ? `${level.duration} day${level.duration > 1 ? 's' : ''}` : 
                   level.duration === 180 ? '6 months' : `${level.duration} days`}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{level.description}</p>
            
            {level.requirements && (
              <div>
                <h4 className="font-semibold mb-2">Requirements</h4>
                <ul className="space-y-1">
                  {level.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {level.benefits && (
              <div>
                <h4 className="font-semibold mb-2">What You'll Gain</h4>
                <ul className="space-y-1">
                  {level.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Link href={`/pcp-certification/apply/${level.id}`}>
                <Button className="flex-1">Apply for {level.levelName}</Button>
              </Link>
              <Button variant="outline">Learn More</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const MyProgress = () => {
    if (!user) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Please log in to view your certification progress</p>
            <Link href="/auth">
              <Button>Log In</Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {userStatus.inProgress ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-500" />
                Current Certification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Level {userStatus.inProgress.levelId}</h3>
                  <Badge>{userStatus.inProgress.status}</Badge>
                </div>
                <Progress value={userStatus.inProgress.progress} />
                <p className="text-sm text-gray-600">
                  {userStatus.inProgress.progress}% complete
                </p>
                <Link href={`/pcp-certification/level/${userStatus.inProgress.levelId}`}>
                  <Button>Continue Learning</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Ready to Start Your Journey?</h3>
              <p className="text-gray-600 mb-4">
                Begin with Level 1 certification and build your coaching expertise
              </p>
              <Button>Start Level 1 Application</Button>
            </CardContent>
          </Card>
        )}

        {userStatus.completedLevels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Your Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {userStatus.completedLevels.map((levelCode, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">{levelCode} Certified</span>
                    </div>
                    <Button variant="outline" size="sm">View Certificate</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (levelsLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading certification information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Program Overview</TabsTrigger>
            <TabsTrigger value="levels">Certification Levels</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProgramOverview />
          </TabsContent>

          <TabsContent value="levels">
            <CertificationLevels />
          </TabsContent>

          <TabsContent value="progress">
            <MyProgress />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}