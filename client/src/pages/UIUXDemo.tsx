import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Calendar, 
  Users, 
  Settings, 
  BarChart3, 
  MessageSquare,
  Bell,
  ChevronDown,
  Plus,
  Filter,
  MapPin,
  Clock,
  Trophy,
  Target,
  BookOpen,
  Zap,
  Activity,
  Phone,
  Mail,
  Check,
  ArrowRight,
  X,
  Menu,
  Home,
  UserCircle,
  Building
} from "lucide-react";

type UserRole = 'player' | 'coach' | 'facility';
type ViewMode = 'dashboard' | 'booking' | 'management';

export default function UIUXDemo() {
  const [userRole, setUserRole] = useState<UserRole>('player');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Demo data
  const quickActions = {
    player: [
      { id: 'book', icon: Calendar, label: 'Book Session', color: 'bg-blue-500' },
      { id: 'find-coach', icon: Search, label: 'Find Coach', color: 'bg-green-500' },
      { id: 'record-match', icon: Trophy, label: 'Record Match', color: 'bg-orange-500' },
      { id: 'view-progress', icon: BarChart3, label: 'View Progress', color: 'bg-purple-500' }
    ],
    coach: [
      { id: 'manage-students', icon: Users, label: 'Manage Students', color: 'bg-blue-500' },
      { id: 'schedule', icon: Calendar, label: 'Schedule', color: 'bg-green-500' },
      { id: 'assessments', icon: Target, label: 'Assessments', color: 'bg-orange-500' },
      { id: 'analytics', icon: BarChart3, label: 'Analytics', color: 'bg-purple-500' }
    ],
    facility: [
      { id: 'court-status', icon: Activity, label: 'Court Status', color: 'bg-blue-500' },
      { id: 'bookings', icon: Calendar, label: 'Bookings', color: 'bg-green-500' },
      { id: 'staff', icon: Users, label: 'Staff', color: 'bg-orange-500' },
      { id: 'reports', icon: BarChart3, label: 'Reports', color: 'bg-purple-500' }
    ]
  };

  const demoPages = [
    { label: 'Apple Style Demo', path: '/demo/apple-style' },
    { label: 'Clean Passport Demo', path: '/demo/clean-passport' }, 
    { label: 'Wise Integration Demo', path: '/demo/wise-integration' },
    { label: 'Current Demo', path: '/demo/ui-ux' }
  ];

  const navigationItems = {
    player: [
      { icon: Home, label: 'Dashboard', key: 'dashboard' },
      { icon: Calendar, label: 'Bookings', key: 'booking' },
      { icon: Trophy, label: 'Matches', key: 'matches' },
      { icon: UserCircle, label: 'Profile', key: 'profile' }
    ],
    coach: [
      { icon: Home, label: 'Dashboard', key: 'dashboard' },
      { icon: Users, label: 'Students', key: 'students' },
      { icon: Calendar, label: 'Schedule', key: 'schedule' },
      { icon: BarChart3, label: 'Analytics', key: 'analytics' }
    ],
    facility: [
      { icon: Building, label: 'Overview', key: 'dashboard' },
      { icon: Activity, label: 'Courts', key: 'courts' },
      { icon: Calendar, label: 'Bookings', key: 'booking' },
      { icon: Settings, label: 'Management', key: 'management' }
    ]
  };

  const ActionDialog = ({ action, onClose }: { action: string, onClose: () => void }) => (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold capitalize">{action.replace('-', ' ')}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-gray-600 mb-6">
          This demonstrates the streamlined {action} workflow. In the real app, this would be a 
          optimized interface with minimal clicks to complete the action.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Check className="w-5 h-5 text-green-500" />
            <span>One-click access from dashboard</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Check className="w-5 h-5 text-green-500" />
            <span>Context-aware interface</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Check className="w-5 h-5 text-green-500" />
            <span>Smart defaults and suggestions</span>
          </div>
        </div>
        <Button className="w-full mt-6" onClick={onClose}>
          Continue to {action.replace('-', ' ')} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P+</span>
              </div>
              <span className="font-bold text-xl hidden sm:block">Pickle+ UI/UX Demo</span>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-600">View as:</span>
                {(['player', 'coach', 'facility'] as UserRole[]).map((role) => (
                  <Button
                    key={role}
                    variant={userRole === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUserRole(role)}
                    className="capitalize"
                  >
                    {role}
                  </Button>
                ))}
              </div>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Role Switcher */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-b border-gray-200 p-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="space-y-2">
              <span className="text-sm text-gray-600 block">View as:</span>
              <div className="flex gap-2">
                {(['player', 'coach', 'facility'] as UserRole[]).map((role) => (
                  <Button
                    key={role}
                    variant={userRole === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setUserRole(role);
                      setMobileMenuOpen(false);
                    }}
                    className="capitalize flex-1"
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="hidden lg:block w-64 bg-white border-r border-gray-200 h-[calc(100vh-64px)] sticky top-16">
          <div className="p-4">
            <div className="space-y-2">
              {navigationItems[userRole].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setViewMode(item.key as ViewMode)}
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold">
                {userRole === 'player' && 'Player Dashboard'}
                {userRole === 'coach' && 'Coach Hub'}
                {userRole === 'facility' && 'Facility Command Center'}
              </h1>
              <Badge variant="outline" className="capitalize">
                {userRole} view
              </Badge>
            </div>
            <p className="text-gray-600">
              {userRole === 'player' && 'Your pickleball journey at a glance'}
              {userRole === 'coach' && 'Manage your students and grow your coaching business'}
              {userRole === 'facility' && 'Complete facility operations and management'}
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions[userRole].map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    className="p-4 lg:p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all group"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAction(action.id)}
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{action.label}</h3>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Demo Cards Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: 'Session completed', time: '2 hours ago', status: 'success' },
                  { action: 'Match recorded', time: '1 day ago', status: 'info' },
                  { action: 'Goal achieved', time: '3 days ago', status: 'success' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-gray-600">{item.time}</p>
                    </div>
                    <Badge variant={item.status === 'success' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {userRole === 'player' && 'Performance Stats'}
                  {userRole === 'coach' && 'Business Overview'}
                  {userRole === 'facility' && 'Facility Metrics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {userRole === 'player' && [
                    { label: 'DUPR Rating', value: '3.8', trend: '+0.2' },
                    { label: 'Matches Won', value: '12', trend: '+3' },
                    { label: 'Sessions', value: '8', trend: '+2' },
                    { label: 'Achievements', value: '5', trend: '+1' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-xs text-green-600">{stat.trend}</p>
                    </div>
                  ))}

                  {userRole === 'coach' && [
                    { label: 'Students', value: '24', trend: '+3' },
                    { label: 'Sessions', value: '156', trend: '+12' },
                    { label: 'Revenue', value: '$2.4K', trend: '+15%' },
                    { label: 'Rating', value: '4.9', trend: '+0.1' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-xs text-green-600">{stat.trend}</p>
                    </div>
                  ))}

                  {userRole === 'facility' && [
                    { label: 'Courts Active', value: '8/12', trend: '67%' },
                    { label: 'Bookings', value: '45', trend: '+8' },
                    { label: 'Revenue', value: '$1.8K', trend: '+12%' },
                    { label: 'Utilization', value: '78%', trend: '+5%' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-xs text-green-600">{stat.trend}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="flex justify-around">
              {navigationItems[userRole].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    className="flex flex-col items-center gap-1 p-2"
                    onClick={() => setViewMode(item.key as ViewMode)}
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Action Dialog */}
      <AnimatePresence>
        {selectedAction && (
          <ActionDialog
            action={selectedAction}
            onClose={() => setSelectedAction(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}