import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, UserCheck, Star, Plus, Settings } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  coachLevel: number;
  totalMatches: number;
  rankingPoints: number;
  createdAt: string;
}

interface CoachStudentAssignment {
  id: number;
  coachId: number;
  studentId: number;
  assignedBy: number;
  assignedAt: string;
  isActive: boolean;
  notes: string;
  coach: User;
  student: User;
  assignedByUser: User;
}

export default function CoachManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoach, setSelectedCoach] = useState<User | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const { toast } = useToast();

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    refetchInterval: 30000
  });

  // Fetch coach-student assignments  
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/admin/coach-assignments"],
    refetchInterval: 30000
  });

  // Coach level update mutation
  const coachLevelMutation = useMutation({
    mutationFn: async ({ userId, coachLevel }: { userId: number; coachLevel: number }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/coach-level`, {
        coachLevel
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Coach Level Updated",
        description: "Coach level has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Student assignment mutation
  const assignStudentsMutation = useMutation({
    mutationFn: async ({ coachId, studentIds, notes }: { coachId: number; studentIds: number[]; notes: string }) => {
      const response = await apiRequest("POST", "/api/admin/coach-assignments", {
        coachId,
        studentIds,
        notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coach-assignments"] });
      setAssignmentDialogOpen(false);
      setSelectedStudents([]);
      setAssignmentNotes("");
      toast({
        title: "Students Assigned",
        description: "Students have been successfully assigned to the coach.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove assignment mutation
  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/coach-assignments/${assignmentId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coach-assignments"] });
      toast({
        title: "Assignment Removed",
        description: "Coach-student assignment has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Removal Failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCoachLevelBadge = (level: number) => {
    if (level === 0) return <Badge variant="secondary">Player</Badge>;
    return <Badge variant="default" className="bg-orange-500">L{level} Coach</Badge>;
  };

  const getCoachLevelColor = (level: number) => {
    const colors = {
      0: "bg-gray-100",
      1: "bg-green-100", 
      2: "bg-blue-100",
      3: "bg-purple-100",
      4: "bg-orange-100",
      5: "bg-red-100"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100";
  };

  const userList = users as User[];
  const assignmentList = assignments as CoachStudentAssignment[];

  const filteredUsers = userList.filter((user: User) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const coaches = userList.filter((user: User) => user.coachLevel > 0);
  const availableStudents = userList.filter((user: User) => user.coachLevel === 0);

  const getAssignedStudents = (coachId: number) => {
    return assignmentList.filter((assignment: CoachStudentAssignment) => 
      assignment.coachId === coachId && assignment.isActive
    );
  };

  if (usersLoading || assignmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coach Management</h1>
          <p className="text-gray-600 mt-1">Manage coach levels and student assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {coaches.length} Active Coaches
          </Badge>
        </div>
      </div>

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            User Coach Level Management
          </CardTitle>
          <CardDescription>
            Activate users as coaches and set their coaching level (L1-L5)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Current Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: User) => (
                  <TableRow key={user.id} className={getCoachLevelColor(user.coachLevel)}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.displayName || user.username}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.totalMatches} matches</div>
                        <div className="text-gray-600">{user.rankingPoints} points</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCoachLevelBadge(user.coachLevel)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.coachLevel.toString()}
                        onValueChange={(value) => {
                          const newLevel = parseInt(value);
                          coachLevelMutation.mutate({ userId: user.id, coachLevel: newLevel });
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Player</SelectItem>
                          <SelectItem value="1">L1 Coach</SelectItem>
                          <SelectItem value="2">L2 Coach</SelectItem>
                          <SelectItem value="3">L3 Coach</SelectItem>
                          <SelectItem value="4">L4 Coach</SelectItem>
                          <SelectItem value="5">L5 Coach</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Coach-Student Assignments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Coach-Student Assignments
          </CardTitle>
          <CardDescription>
            Assign students to coaches for assessment and coaching sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {coaches.map((coach: User) => {
            const assignedStudents = getAssignedStudents(coach.id);
            return (
              <div key={coach.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{coach.displayName || coach.username}</h3>
                      <div className="flex items-center gap-2">
                        {getCoachLevelBadge(coach.coachLevel)}
                        <span className="text-sm text-gray-600">
                          {assignedStudents.length} assigned students
                        </span>
                      </div>
                    </div>
                  </div>
                  <Dialog open={assignmentDialogOpen && selectedCoach?.id === coach.id} onOpenChange={(open) => {
                    setAssignmentDialogOpen(open);
                    if (open) setSelectedCoach(coach);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Assign Students
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Assign Students to {coach.displayName || coach.username}</DialogTitle>
                        <DialogDescription>
                          Select students to assign to this coach for assessments and coaching
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="max-h-60 overflow-y-auto border rounded-md p-4">
                          <div className="space-y-2">
                            {availableStudents.map((student: User) => (
                              <label key={student.id} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.includes(student.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStudents([...selectedStudents, student.id]);
                                    } else {
                                      setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                    }
                                  }}
                                  className="rounded"
                                />
                                <div>
                                  <div className="font-medium">{student.displayName || student.username}</div>
                                  <div className="text-sm text-gray-600">{student.email}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Assignment Notes</label>
                          <Textarea
                            value={assignmentNotes}
                            onChange={(e) => setAssignmentNotes(e.target.value)}
                            placeholder="Optional notes about this assignment..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => {
                            if (selectedCoach && selectedStudents.length > 0) {
                              assignStudentsMutation.mutate({
                                coachId: selectedCoach.id,
                                studentIds: selectedStudents,
                                notes: assignmentNotes
                              });
                            }
                          }}
                          disabled={selectedStudents.length === 0 || assignStudentsMutation.isPending}
                        >
                          Assign {selectedStudents.length} Students
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Assigned Students List */}
                {assignedStudents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Assigned Students:</h4>
                    <div className="grid gap-2">
                      {assignedStudents.map((assignment: CoachStudentAssignment) => (
                        <div key={assignment.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <div className="flex-1">
                            <div className="font-medium">{assignment.student.displayName || assignment.student.username}</div>
                            <div className="text-sm text-gray-600">
                              Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                              {assignment.notes && ` • ${assignment.notes}`}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAssignmentMutation.mutate(assignment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {coaches.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No active coaches yet. Activate users as coaches above to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}