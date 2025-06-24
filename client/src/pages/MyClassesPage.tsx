/**
 * My Classes Page - View enrolled classes and manage bookings
 * PKL-278651-PLAYER-DEVELOPMENT-HUB
 */

import React, { useState } from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building2
} from 'lucide-react';
import { format, parseISO, isPast, isFuture } from 'date-fns';

interface EnrolledClass {
  id: number;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  coach_name: string;
  center_name: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}

export default function MyClassesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upcoming");

  // Fetch enrolled classes
  const { data: classesData, isLoading } = useQuery({
    queryKey: ['/api/calendar/my-classes'],
    queryFn: () => apiRequest('GET', '/api/calendar/my-classes').then(res => res.json()),
  });

  // Cancel enrollment mutation
  const cancelMutation = useMutation({
    mutationFn: async (classId: number) => {
      const response = await apiRequest('DELETE', `/api/calendar/classes/${classId}/enroll`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Class Cancelled",
        description: "Your enrollment has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/my-classes'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const enrolledClasses: EnrolledClass[] = classesData?.enrolledClasses || [];
  
  // Filter classes by status
  const upcomingClasses = enrolledClasses.filter(cls => 
    cls.status === 'confirmed' && isFuture(parseISO(`${cls.date}T${cls.start_time}`))
  );
  
  const pastClasses = enrolledClasses.filter(cls => 
    cls.status === 'completed' || isPast(parseISO(`${cls.date}T${cls.start_time}`))
  );

  const getStatusBadge = (classItem: EnrolledClass) => {
    const classDateTime = parseISO(`${classItem.date}T${classItem.start_time}`);
    
    if (classItem.status === 'cancelled') {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Cancelled
      </Badge>;
    }
    
    if (isPast(classDateTime)) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Completed
      </Badge>;
    }
    
    return <Badge className="flex items-center gap-1 bg-green-100 text-green-800">
      <CheckCircle className="w-3 h-3" />
      Confirmed
    </Badge>;
  };

  const formatClassTime = (date: string, startTime: string, endTime: string) => {
    const classDate = parseISO(date);
    return {
      date: format(classDate, 'EEE, MMM d, yyyy'),
      time: `${startTime} - ${endTime}`
    };
  };

  const handleCancelClass = (classId: number, className: string) => {
    if (window.confirm(`Are you sure you want to cancel your enrollment in "${className}"?`)) {
      cancelMutation.mutate(classId);
    }
  };

  const renderClassCard = (classItem: EnrolledClass) => {
    const { date, time } = formatClassTime(classItem.date, classItem.start_time, classItem.end_time);
    const canCancel = classItem.status === 'confirmed' && isFuture(parseISO(`${classItem.date}T${classItem.start_time}`));
    
    return (
      <Card key={classItem.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{classItem.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {time}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Coach {classItem.coach_name}
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {classItem.center_name}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              {getStatusBadge(classItem)}
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelClass(classItem.id, classItem.name)}
                  disabled={cancelMutation.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <StandardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your classes...</p>
          </div>
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8" />
              <h1 className="text-3xl font-bold">My Classes</h1>
            </div>
            <p className="text-blue-100">Manage your enrolled classes and track your training progress</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Upcoming ({upcomingClasses.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Past Classes ({pastClasses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingClasses.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Classes</h3>
                    <p className="text-gray-600 mb-6">You haven't enrolled in any upcoming classes yet.</p>
                    <Button 
                      onClick={() => window.location.href = '/player-development-hub'}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Browse Classes
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                upcomingClasses.map(renderClassCard)
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastClasses.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Past Classes</h3>
                    <p className="text-gray-600">Your completed classes will appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                pastClasses.map(renderClassCard)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </StandardLayout>
  );
}