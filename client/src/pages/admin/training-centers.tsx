/**
 * PKL-278651-TRAINING-CENTER-ADMIN-001 - Training Center Administration Dashboard
 * Complete facility, coach, and class management interface
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, 
  Users, 
  Calendar, 
  QrCode, 
  Plus, 
  Edit, 
  MapPin, 
  Clock, 
  DollarSign,
  Award,
  Eye,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface TrainingCenter {
  id: number;
  name: string;
  address: string;
  qrCode: string;
  capacity: number;
  activeClasses: number;
  totalRevenue: number;
}

interface Coach {
  id: number;
  name: string;
  email: string;
  pcpCertified: boolean;
  specialties: string[];
  hourlyRate: number;
  rating: number;
  totalSessions: number;
  status: 'active' | 'pending' | 'suspended';
}

interface ClassSession {
  id: number;
  name: string;
  coachName: string;
  centerName: string;
  date: string;
  time: string;
  capacity: number;
  enrolled: number;
  price: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

export default function TrainingCentersAdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch training centers data
  const { data: centersResponse, isLoading: centersLoading } = useQuery({
    queryKey: ['/api/admin/training-centers/centers'],
    queryFn: () => apiRequest('GET', '/api/admin/training-centers/centers').then(res => res.json())
  });

  // Fetch coaches data
  const { data: coachesResponse, isLoading: coachesLoading } = useQuery({
    queryKey: ['/api/admin/training-centers/coaches'],
    queryFn: () => apiRequest('GET', '/api/admin/training-centers/coaches').then(res => res.json())
  });

  // Fetch classes data
  const { data: classesResponse, isLoading: classesLoading } = useQuery({
    queryKey: ['/api/admin/training-centers/classes'],
    queryFn: () => apiRequest('GET', '/api/admin/training-centers/classes').then(res => res.json())
  });

  // Extract data from API responses with safe array handling
  const centers = Array.isArray(centersResponse?.data) ? centersResponse.data : [];
  const coaches = Array.isArray(coachesResponse?.data) ? coachesResponse.data : [];
  const classes = Array.isArray(classesResponse?.data) ? classesResponse.data : [];

  const OverviewDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Centers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{centers.length}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Coaches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coaches.filter((c: any) => c.status === 'active').length}</div>
            <p className="text-xs text-gray-500">
              {coaches.filter((c: any) => c.pcp_certified).length} PCP Certified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.filter((c: any) => c.status === 'scheduled').length}</div>
            <p className="text-xs text-blue-600">
              {classes.reduce((sum: number, c: any) => sum + (c.enrolled || 0), 0)} students enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15% vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Users className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm">New coach application from Sarah Johnson</span>
              </div>
              <Badge variant="outline">5 min ago</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm">Advanced Techniques class fully booked</span>
              </div>
              <Badge variant="outline">1 hour ago</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm">Downtown Center approaching capacity limit</span>
              </div>
              <Badge variant="outline">2 hours ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const FacilitiesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Training Centers</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Center
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Training Center</DialogTitle>
              <DialogDescription>
                Create a new training facility with QR code access
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Center Name</Label>
                <Input id="name" placeholder="Downtown Pickleball Center" />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="123 Main St, City, State" />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" placeholder="50" />
              </div>
            </div>
            <Button>Create Center</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {centers.map((center: TrainingCenter) => (
          <Card key={center.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{center.name}</h3>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {center.address}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline">
                        <QrCode className="w-3 h-3 mr-1" />
                        {center.qrCode}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Capacity: {center.capacity}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${center.totalRevenue?.toLocaleString() || 0}
                  </div>
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                  <div className="flex space-x-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const CoachesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coach Management</h2>
        <div className="flex space-x-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Coaches</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Invite Coach
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coach</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>PCP Certified</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.map((coach: Coach) => (
              <TableRow key={coach.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{coach.name}</div>
                    <div className="text-sm text-gray-500">{coach.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={coach.status === 'active' ? 'default' : 
                            coach.status === 'pending' ? 'secondary' : 'destructive'}
                  >
                    {coach.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {coach.pcpCertified ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Award className="w-3 h-3 mr-1" />
                      Certified
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Certified</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {coach.specialties?.slice(0, 2).map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {coach.specialties?.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{coach.specialties.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">${coach.hourlyRate}/hr</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{coach.rating}</span>
                  </div>
                </TableCell>
                <TableCell>{coach.totalSessions}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const ClassesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Class Management</h2>
        <div className="flex space-x-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Class
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Coach</TableHead>
              <TableHead>Center</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Enrollment</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((classSession: ClassSession) => (
              <TableRow key={classSession.id}>
                <TableCell>
                  <div className="font-medium">{classSession.name}</div>
                </TableCell>
                <TableCell>{classSession.coachName}</TableCell>
                <TableCell>{classSession.centerName}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{classSession.date}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {classSession.time}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-gray-500" />
                    <span>{classSession.enrolled}/{classSession.capacity}</span>
                    {classSession.enrolled >= classSession.capacity && (
                      <Badge variant="secondary" className="ml-2">Full</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">${classSession.price}</span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={classSession.status === 'scheduled' ? 'default' : 
                            classSession.status === 'active' ? 'secondary' : 
                            classSession.status === 'completed' ? 'outline' : 'destructive'}
                  >
                    {classSession.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-blue-600" />
            Training Center Administration
          </h1>
          <p className="text-gray-600 mt-2">
            Manage facilities, coaches, classes, and player development programs
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewDashboard />
          </TabsContent>

          <TabsContent value="facilities">
            <FacilitiesTab />
          </TabsContent>

          <TabsContent value="coaches">
            <CoachesTab />
          </TabsContent>

          <TabsContent value="classes">
            <ClassesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}