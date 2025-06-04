/**
 * PKL-278651-TRAINING-CENTER-CALENDAR - Training Center Calendar Component
 * Comprehensive calendar system for class scheduling and enrollment management
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Users, BookOpen, CheckCircle, XCircle, Calendar as CalendarIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, parseISO } from "date-fns";

interface ClassInstance {
  id: number;
  templateId: number;
  centerId: number;
  coachId: number;
  name: string;
  description: string;
  skillLevel: string;
  maxParticipants: number;
  currentEnrollment: number;
  classDate: string;
  startTime: string;
  endTime: string;
  coachName: string;
  goals: string[];
  pricePerSession?: number;
  status: string;
}

interface EnrollmentResponse {
  success: boolean;
  message: string;
  enrollment?: any;
}

interface TrainingCalendarProps {
  centerId: number;
  centerName: string;
  userId: number;
}

export default function TrainingCalendar({ centerId, centerName, userId }: TrainingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<ClassInstance | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch classes for selected date
  const { data: dailyClasses = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['/api/calendar/classes', centerId, selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/calendar/classes/${centerId}?date=${selectedDate.toISOString().split('T')[0]}`);
      return response.json();
    }
  });

  // Fetch user's enrolled classes
  const { data: enrolledClasses = [] } = useQuery({
    queryKey: ['/api/calendar/my-classes', userId],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/calendar/my-classes?upcoming=true');
      return response.json();
    }
  });

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async (classId: number) => {
      const response = await apiRequest('POST', `/api/calendar/classes/${classId}/enroll`, {
        enrollmentType: 'advance'
      });
      return response.json();
    },
    onSuccess: (data: EnrollmentResponse) => {
      if (data.success) {
        toast({
          title: "Enrolled Successfully",
          description: "You've been enrolled in the class!",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/calendar/classes'] });
        queryClient.invalidateQueries({ queryKey: ['/api/calendar/my-classes'] });
        setSelectedClass(null);
      } else {
        toast({
          title: "Enrollment Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Cancel enrollment mutation
  const cancelMutation = useMutation({
    mutationFn: async (classId: number) => {
      const response = await apiRequest('DELETE', `/api/calendar/classes/${classId}/enroll`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrollment Cancelled",
        description: "Your enrollment has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/my-classes'] });
      setSelectedClass(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Check if user is enrolled in a class
  const isEnrolled = (classId: number) => {
    return enrolledClasses.some((enrollment: any) => enrollment.id === classId);
  };

  // Get skill level color
  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format time display
  const formatTime = (timeString: string) => {
    return format(parseISO(timeString), 'h:mm a');
  };

  // Get availability status
  const getAvailabilityStatus = (classInstance: ClassInstance) => {
    const available = classInstance.maxParticipants - classInstance.currentEnrollment;
    if (available <= 0) return { status: 'full', color: 'bg-red-100 text-red-800', text: 'Full' };
    if (available <= 2) return { status: 'limited', color: 'bg-yellow-100 text-yellow-800', text: `${available} spots` };
    return { status: 'available', color: 'bg-green-100 text-green-800', text: `${available} spots` };
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Class Schedule - {centerName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Widget */}
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </div>

            {/* Selected Date Classes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Classes for {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              
              {loadingClasses ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : dailyClasses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No classes scheduled for this date</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {dailyClasses.map((classInstance: ClassInstance) => {
                      const availability = getAvailabilityStatus(classInstance);
                      const enrolled = isEnrolled(classInstance.id);
                      
                      return (
                        <Card key={classInstance.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold">{classInstance.name}</h4>
                                <p className="text-sm text-gray-600">with {classInstance.coachName}</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={getSkillLevelColor(classInstance.skillLevel)}>
                                  {classInstance.skillLevel}
                                </Badge>
                                <Badge className={availability.color}>
                                  {availability.text}
                                </Badge>
                                {enrolled && (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    Enrolled
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(classInstance.startTime)} - {formatTime(classInstance.endTime)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {classInstance.currentEnrollment}/{classInstance.maxParticipants}
                              </div>
                            </div>

                            <div className="mt-3 flex justify-between items-center">
                              <p className="text-sm text-gray-600 truncate max-w-xs">
                                {classInstance.description}
                              </p>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedClass(classInstance)}
                                  >
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>{classInstance.name}</DialogTitle>
                                  </DialogHeader>
                                  
                                  {selectedClass && selectedClass.id === classInstance.id && (
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">Class Details</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span>Coach:</span>
                                            <span>{classInstance.coachName}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Time:</span>
                                            <span>{formatTime(classInstance.startTime)} - {formatTime(classInstance.endTime)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Skill Level:</span>
                                            <Badge className={getSkillLevelColor(classInstance.skillLevel)}>
                                              {classInstance.skillLevel}
                                            </Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Availability:</span>
                                            <Badge className={availability.color}>
                                              {availability.text}
                                            </Badge>
                                          </div>
                                          {classInstance.pricePerSession && (
                                            <div className="flex justify-between">
                                              <span>Price:</span>
                                              <span>${classInstance.pricePerSession}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div>
                                        <h4 className="font-semibold mb-2">Description</h4>
                                        <p className="text-sm text-gray-600">{classInstance.description}</p>
                                      </div>

                                      {classInstance.goals && classInstance.goals.length > 0 && (
                                        <div>
                                          <h4 className="font-semibold mb-2">Learning Goals</h4>
                                          <ul className="text-sm text-gray-600 space-y-1">
                                            {classInstance.goals.map((goal, index) => (
                                              <li key={index} className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                {goal}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      <div className="flex gap-2 pt-4">
                                        {enrolled ? (
                                          <Button
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={() => cancelMutation.mutate(classInstance.id)}
                                            disabled={cancelMutation.isPending}
                                          >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancel Enrollment
                                          </Button>
                                        ) : availability.status === 'full' ? (
                                          <Button disabled className="flex-1">
                                            Class Full
                                          </Button>
                                        ) : (
                                          <Button
                                            className="flex-1"
                                            onClick={() => enrollMutation.mutate(classInstance.id)}
                                            disabled={enrollMutation.isPending}
                                          >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Enroll in Class
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Upcoming Classes */}
      {enrolledClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {enrolledClasses.slice(0, 3).map((enrollment: any) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{enrollment.name}</h4>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(enrollment.classDate), 'MMM d')} at {formatTime(enrollment.startTime)}
                    </p>
                    <p className="text-sm text-gray-600">with {enrollment.coachName}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    Enrolled
                  </Badge>
                </div>
              ))}
              
              {enrolledClasses.length > 3 && (
                <p className="text-sm text-gray-600 text-center">
                  +{enrolledClasses.length - 3} more classes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}