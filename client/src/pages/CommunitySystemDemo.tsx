import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users,
  MapPin,
  Calendar,
  Search,
  Plus,
  Star,
  MessageCircle,
  Heart,
  Share2,
  Filter,
  ChevronRight,
  Clock,
  TrendingUp,
  Award,
  Globe,
  BarChart3
} from "lucide-react";

export default function CommunitySystemDemo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const communities = [
    {
      id: 1,
      name: "Bay Area Pickleball Elite",
      location: "San Francisco, CA",
      members: 1247,
      category: "competitive",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400",
      description: "Competitive play for 4.0+ players in the Bay Area",
      events: 12,
      posts: 89,
      trending: true
    },
    {
      id: 2,
      name: "Beginner Friendly Picklers",
      location: "Austin, TX",
      members: 892,
      category: "recreational",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
      description: "Welcoming community for new players to learn and grow",
      events: 8,
      posts: 156,
      trending: false
    },
    {
      id: 3,
      name: "Senior Pickleball Masters",
      location: "Phoenix, AZ",
      members: 567,
      category: "senior",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1609012482953-7a8a5fd84b4e?w=400",
      description: "Active community for players 55+ with regular tournaments",
      events: 6,
      posts: 73,
      trending: false
    },
    {
      id: 4,
      name: "College Pickleball Network",
      location: "Multiple Cities",
      members: 2156,
      category: "student",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1571266028243-40306e1a146b?w=400",
      description: "Connecting college students across universities",
      events: 24,
      posts: 234,
      trending: true
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Weekly Mixed Doubles Tournament",
      community: "Bay Area Pickleball Elite",
      date: "Today 6:00 PM",
      participants: 32,
      maxParticipants: 40,
      location: "Golden Gate Park Courts",
      type: "tournament"
    },
    {
      id: 2,
      title: "Beginner Skills Workshop",
      community: "Beginner Friendly Picklers",
      date: "Tomorrow 10:00 AM",
      participants: 18,
      maxParticipants: 20,
      location: "Zilker Park Recreation Center",
      type: "workshop"
    },
    {
      id: 3,
      title: "Senior Social Hour & Play",
      community: "Senior Pickleball Masters",
      date: "Friday 2:00 PM",
      participants: 24,
      maxParticipants: 30,
      location: "Desert Ridge Community Center",
      type: "social"
    }
  ];

  const recentPosts = [
    {
      id: 1,
      author: "Sarah M.",
      community: "Bay Area Pickleball Elite", 
      content: "Just won my first 4.5 tournament! Thank you to everyone in this community for the support and practice matches. Couldn't have done it without you! 🏆",
      likes: 47,
      comments: 12,
      timeAgo: "2 hours ago",
      type: "achievement"
    },
    {
      id: 2,
      author: "Mike R.",
      community: "Beginner Friendly Picklers",
      content: "Looking for doubles partners for Thursday evening play. I'm around 3.0 level and always up for some fun games. Who's in?",
      likes: 23,
      comments: 8,
      timeAgo: "4 hours ago",
      type: "partner-search"
    },
    {
      id: 3,
      author: "Jennifer L.",
      community: "Senior Pickleball Masters",
      content: "Weather looks perfect for our Friday social! Don't forget to bring water and maybe some snacks to share. See you all there!",
      likes: 31,
      comments: 5,
      timeAgo: "6 hours ago",
      type: "event-update"
    }
  ];

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || community.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'competitive': return 'bg-red-100 text-red-800 border-red-200';
      case 'recreational': return 'bg-green-100 text-green-800 border-green-200';
      case 'senior': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'student': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Community System Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover, join, and engage with pickleball communities worldwide. 
            Modern design with advanced search, event management, and social features.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">4,862</div>
              <div className="text-sm text-gray-600">Total Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">50</div>
              <div className="text-sm text-gray-600">Active Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-600">Communities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">4.7</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="discovery" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="discovery" className="text-xs sm:text-sm px-2 py-3 sm:px-4">
              <span className="hidden sm:inline">Community Discovery</span>
              <span className="sm:hidden">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm px-2 py-3 sm:px-4">
              <span className="hidden sm:inline">Events</span>
              <span className="sm:hidden">Events</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="text-xs sm:text-sm px-2 py-3 sm:px-4">
              <span className="hidden sm:inline">Social Feed</span>
              <span className="sm:hidden">Social</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="text-xs sm:text-sm px-2 py-3 sm:px-4">
              <span className="hidden sm:inline">Management</span>
              <span className="sm:hidden">Manage</span>
            </TabsTrigger>
          </TabsList>

          {/* Community Discovery Tab */}
          <TabsContent value="discovery" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search communities by name or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedFilter === "all" ? "default" : "outline"}
                      onClick={() => setSelectedFilter("all")}
                      size="sm"
                    >
                      All
                    </Button>
                    <Button
                      variant={selectedFilter === "competitive" ? "default" : "outline"}
                      onClick={() => setSelectedFilter("competitive")}
                      size="sm"
                    >
                      Competitive
                    </Button>
                    <Button
                      variant={selectedFilter === "recreational" ? "default" : "outline"}
                      onClick={() => setSelectedFilter("recreational")}
                      size="sm"
                    >
                      Recreation
                    </Button>
                    <Button
                      variant={selectedFilter === "senior" ? "default" : "outline"}
                      onClick={() => setSelectedFilter("senior")}
                      size="sm"
                    >
                      Senior
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredCommunities.map((community, index) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold">{community.name}</h3>
                            {community.trending && (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{community.location}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{community.description}</p>
                        </div>
                        <Badge className={getCategoryColor(community.category)}>
                          {community.category}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{community.members.toLocaleString()} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{community.events} events</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{community.rating}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1">Join Community</Button>
                        <Button variant="outline" size="icon">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{event.title}</h4>
                              <p className="text-sm text-gray-600">{event.community}</p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {event.type}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span>{event.participants}/{event.maxParticipants} participants</span>
                            </div>
                            <Button size="sm">Join Event</Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Create Event
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full">Create Tournament</Button>
                    <Button className="w-full" variant="outline">Create Workshop</Button>
                    <Button className="w-full" variant="outline">Create Social</Button>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-3">Event Categories</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tournaments</span>
                          <span className="font-medium">24</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Workshops</span>
                          <span className="font-medium">16</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Social Events</span>
                          <span className="font-medium">10</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Social Feed Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Community Feed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {recentPosts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">
                                {post.author.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{post.author}</span>
                                <span className="text-sm text-gray-500">in</span>
                                <span className="text-sm text-blue-600 font-medium">{post.community}</span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-500">{post.timeAgo}</span>
                              </div>
                              <p className="text-gray-800 mb-3">{post.content}</p>
                              <div className="flex items-center gap-4">
                                <button className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors">
                                  <Heart className="w-4 h-4" />
                                  <span className="text-sm">{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors">
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="text-sm">{post.comments}</span>
                                </button>
                                <button className="flex items-center gap-1 text-gray-600 hover:text-green-500 transition-colors">
                                  <Share2 className="w-4 h-4" />
                                  <span className="text-sm">Share</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Community Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold text-sm">Top Performer</span>
                      </div>
                      <p className="text-sm">Sarah M. won 3 tournaments this month!</p>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-sm">Growing Community</span>
                      </div>
                      <p className="text-sm">Bay Area Elite gained 47 new members</p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-sm">Most Active</span>
                      </div>
                      <p className="text-sm">College Network hosted 12 events</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Community Administration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Members
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Event Calendar
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Moderate Posts
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>New Members (30d)</span>
                    <span className="font-bold text-green-600">+156</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Events</span>
                    <span className="font-bold text-blue-600">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Posts This Week</span>
                    <span className="font-bold text-purple-600">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engagement Rate</span>
                    <span className="font-bold text-orange-600">87%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}