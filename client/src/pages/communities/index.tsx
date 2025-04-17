/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Communities List Page
 * 
 * This page displays a list of communities that users can browse and join.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Community } from '@/lib/api/community';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Users,
  MessageSquare,
  Calendar,
  MapPin,
  Filter,
  Lock,
  Plus
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    showPrivate: true,
    locationNearby: false,
    requiresApproval: true,
  });
  
  // Fetch communities
  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['/api/communities'],
    queryFn: async () => {
      const response = await apiRequest('/api/communities');
      return response as Community[];
    },
  });
  
  // Filter and sort communities
  const filteredCommunities = communities
    .filter(community => {
      // Filter by search query
      if (searchQuery && !community.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !community.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by private status
      if (!filters.showPrivate && community.isPrivate) {
        return false;
      }
      
      // Filter by approval requirement
      if (!filters.requiresApproval && community.requiresApproval) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort communities
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'members':
          return b.memberCount - a.memberCount;
        case 'activity':
          return (b.postCount + b.eventCount) - (a.postCount + a.eventCount);
        default:
          return 0;
      }
    });
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle filter changes
  const handleFilterChange = (key: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communities</h1>
            <p className="text-muted-foreground mt-1">
              Browse and join communities to connect with other players.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link href="/communities/create">
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Create Community
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Search and filters */}
          <div className="w-full md:w-3/4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search communities..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-1/4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="members">Most Members</SelectItem>
                <SelectItem value="activity">Most Active</SelectItem>
              </SelectContent>
            </Select>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your community search results.
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Privacy</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="showPrivate" 
                        checked={filters.showPrivate}
                        onCheckedChange={() => handleFilterChange('showPrivate')}
                      />
                      <Label htmlFor="showPrivate">Show private communities</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Location</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="locationNearby" 
                        checked={filters.locationNearby}
                        onCheckedChange={() => handleFilterChange('locationNearby')}
                      />
                      <Label htmlFor="locationNearby">Only show nearby communities</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Approval</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="requiresApproval" 
                        checked={filters.requiresApproval}
                        onCheckedChange={() => handleFilterChange('requiresApproval')}
                      />
                      <Label htmlFor="requiresApproval">Include communities requiring approval</Label>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Communities Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex gap-3">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardContent>
                <CardFooter className="pb-4">
                  <Skeleton className="h-9 w-28" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredCommunities.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No communities found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? `No communities match your search for "${searchQuery}"`
                    : "There are no communities that match your filters"
                  }
                </p>
                {searchQuery && (
                  <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map((community) => (
                  <Link key={community.id} href={`/communities/${community.id}`}>
                    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                      <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 relative">
                        {community.bannerUrl && (
                          <img 
                            src={community.bannerUrl} 
                            alt={`${community.name} banner`} 
                            className="w-full h-full object-cover absolute inset-0"
                          />
                        )}
                        {community.isPrivate && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardHeader className="pb-2 flex-none">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="mb-1 flex items-center gap-2">
                              <span className="line-clamp-1">{community.name}</span>
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {community.description}
                            </CardDescription>
                          </div>
                          <Avatar className="h-10 w-10 -mt-10 border-2 border-background">
                            <AvatarImage src={community.avatarUrl || ""} />
                            <AvatarFallback>{community.name[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-2 flex-none">
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{community.memberCount}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>{community.postCount}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{community.eventCount}</span>
                          </div>
                        </div>
                        
                        {community.location && (
                          <div className="mt-2 flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="truncate">{community.location}</span>
                          </div>
                        )}
                        
                        {community.tags && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {community.tags.split(',').slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                            {community.tags.split(',').length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{community.tags.split(',').length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="mt-auto pt-4">
                        <Button variant="secondary" size="sm" className="w-full">
                          View Community
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}