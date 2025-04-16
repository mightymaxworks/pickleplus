/**
 * PKL-278651-COMM-0001-UIMOCK
 * Community Announcements Mockup
 * 
 * This component displays a mockup of the community announcements interface.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, Bell, ThumbsUp, Share, Megaphone,
  Calendar, Flag, Plus, ChevronRight, Clock, Pin,
  Mail, Send
} from 'lucide-react';

// Example announcements for the mockup
const EXAMPLE_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Spring Tournament Registration Open",
    content: "Registration is now open for our Spring Mixer Tournament on April 29th. Sign up early to secure your spot. Limited to 64 players. Registration fee: $25 per player.",
    author: "John Doe",
    role: "President",
    date: "2025-04-10",
    isPinned: true,
    comments: 8,
    likes: 24,
    isImportant: true
  },
  {
    id: 2,
    title: "New Skill-Based Play Sessions",
    content: "Starting next week, we'll be organizing our drop-in sessions by skill level. Beginners: 6-7pm, Intermediate: 7-8pm, Advanced: 8-9pm. This should improve everyone's playing experience!",
    author: "Jane Smith",
    role: "Event Coordinator",
    date: "2025-04-08",
    isPinned: true,
    comments: 12,
    likes: 37,
    isImportant: false
  },
  {
    id: 3,
    title: "Court Maintenance Update",
    content: "Green Lake courts will be closed April 20-21 for resurfacing. We've arranged for temporary play at Ravenna Park during this time. See the event calendar for details.",
    author: "Robert Johnson",
    role: "Membership Manager",
    date: "2025-04-07",
    isPinned: false,
    comments: 5,
    likes: 18,
    isImportant: true
  },
  {
    id: 4,
    title: "Welcome New Members!",
    content: "A warm welcome to the 15 new members who joined our community this month! Don't forget to attend our New Member Orientation on April 15th at Green Lake Community Center.",
    author: "Sarah Williams",
    role: "Secretary",
    date: "2025-04-05",
    isPinned: false,
    comments: 7,
    likes: 32,
    isImportant: false
  },
  {
    id: 5,
    title: "Equipment Discount for Club Members",
    content: "We've partnered with Seattle Paddle Sports for a 15% discount on all pickleball equipment for club members. Show your membership card in store or use code SPC15 online.",
    author: "Michael Brown",
    role: "Treasurer",
    date: "2025-04-02",
    isPinned: false,
    comments: 3,
    likes: 41,
    isImportant: false
  }
];

const CommunityAnnouncementsMockup: React.FC = () => {
  const [viewType, setViewType] = useState('all');
  const [newAnnouncement, setNewAnnouncement] = useState(false);
  
  // Filter announcements based on view type
  const filteredAnnouncements = EXAMPLE_ANNOUNCEMENTS.filter(announcement => {
    if (viewType === 'pinned') return announcement.isPinned;
    if (viewType === 'important') return announcement.isImportant;
    return true; // "all" view
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Community Announcements</h2>
          <p className="text-muted-foreground">
            Important updates and information for community members.
          </p>
        </div>
        <Button onClick={() => setNewAnnouncement(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Create New Announcement Form */}
      {newAnnouncement && (
        <Card className="mb-8 border-primary/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Create New Announcement</CardTitle>
            <CardDescription>
              Share important information with your community members.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Title</Label>
              <Input 
                id="announcement-title" 
                placeholder="Enter announcement title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-content">Content</Label>
              <Textarea 
                id="announcement-content" 
                placeholder="Enter announcement details..."
                className="min-h-[120px]"
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="pin-announcement" />
                <Label htmlFor="pin-announcement">Pin to top</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="mark-important" />
                <Label htmlFor="mark-important">Mark as important</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="send-email" />
                <Label htmlFor="send-email">Email to members</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end space-x-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setNewAnnouncement(false)}>
              Cancel
            </Button>
            <Button>
              Post Announcement
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Announcements View Selector */}
      <Tabs value={viewType} onValueChange={setViewType} className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-3 mb-6">
          <TabsTrigger value="all">All Announcements</TabsTrigger>
          <TabsTrigger value="pinned">Pinned</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0 space-y-4">
          {filteredAnnouncements.map(announcement => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
          <Button variant="outline" className="w-full mt-4">
            View More Announcements
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </TabsContent>
        
        <TabsContent value="pinned" className="mt-0 space-y-4">
          {filteredAnnouncements.length > 0 ? (
            <>
              {filteredAnnouncements.map(announcement => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Pin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Pinned Announcements</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                There are currently no pinned announcements. 
                Important announcements will be pinned to the top for visibility.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="important" className="mt-0 space-y-4">
          {filteredAnnouncements.length > 0 ? (
            <>
              {filteredAnnouncements.map(announcement => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Important Announcements</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                There are currently no important announcements.
                Check back later for critical updates from community admins.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Communication Tools Section */}
      <Card className="mt-8 bg-muted/30">
        <CardHeader>
          <CardTitle>Community Communication Tools</CardTitle>
          <CardDescription>
            Keep your community informed and engaged with multiple communication channels.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-background rounded-lg shadow-sm">
            <Megaphone className="mx-auto h-10 w-10 text-primary/60 mb-3" />
            <h3 className="text-lg font-medium mb-1">Announcements</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Post official updates visible to all community members.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Create Announcement
            </Button>
          </div>
          
          <div className="text-center p-4 bg-background rounded-lg shadow-sm">
            <Mail className="mx-auto h-10 w-10 text-primary/60 mb-3" />
            <h3 className="text-lg font-medium mb-1">Email Campaigns</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Send targeted emails to specific groups within your community.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Create Email
            </Button>
          </div>
          
          <div className="text-center p-4 bg-background rounded-lg shadow-sm">
            <MessageSquare className="mx-auto h-10 w-10 text-primary/60 mb-3" />
            <h3 className="text-lg font-medium mb-1">Discussion Forums</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Enable member discussions on various topics and interests.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Forums
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Announcement Card Component
interface AnnouncementProps {
  announcement: {
    id: number;
    title: string;
    content: string;
    author: string;
    role: string;
    date: string;
    isPinned: boolean;
    comments: number;
    likes: number;
    isImportant: boolean;
  }
}

const AnnouncementCard: React.FC<AnnouncementProps> = ({ announcement }) => {
  return (
    <Card className={`
      ${announcement.isPinned ? 'border-primary/30 shadow-md' : ''}
      ${announcement.isImportant ? 'bg-warning/5 border-warning/30' : ''}
    `}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              {announcement.isPinned && (
                <Badge variant="outline" className="text-primary bg-primary/10 border-0">
                  <Pin className="h-3 w-3 mr-1" /> Pinned
                </Badge>
              )}
              {announcement.isImportant && (
                <Badge variant="outline" className="text-warning bg-warning/10 border-0">
                  <Bell className="h-3 w-3 mr-1" /> Important
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{announcement.title}</CardTitle>
          </div>
          <div className="text-xs text-muted-foreground flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {new Date(announcement.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line mb-4">{announcement.content}</p>
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>{announcement.author[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{announcement.author}</div>
            <div className="text-xs text-muted-foreground">{announcement.role}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3 border-t">
        <div className="flex space-x-4">
          <Button variant="ghost" size="sm" className="h-8">
            <ThumbsUp className="h-4 w-4 mr-2" />
            {announcement.likes}
          </Button>
          <Button variant="ghost" size="sm" className="h-8">
            <MessageSquare className="h-4 w-4 mr-2" />
            {announcement.comments}
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CommunityAnnouncementsMockup;