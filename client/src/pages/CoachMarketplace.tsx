// Coach Marketplace Discovery - Main Component
// UDF Development: Coach Marketplace Discovery System

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Star, MapPin, Clock, Heart, Users, DollarSign, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import type { CoachSearchParams, CoachWithMarketplaceData } from '../../../shared/schema/coach-marketplace';

const CoachMarketplace: React.FC = () => {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Search state
  const [searchParams, setSearchParams] = useState<CoachSearchParams>({
    query: '',
    location: '',
    radius: 25,
    specialties: [],
    priceRange: { min: 0, max: 200 },
    sortBy: 'relevance',
    limit: 20,
    offset: 0
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<CoachWithMarketplaceData | null>(null);

  // Available filter options
  const specialtyOptions = [
    'Beginner Coaching', 'Advanced Strategy', 'Mental Game', 'Physical Conditioning',
    'Technical Skills', 'Tournament Prep', 'Youth Coaching', 'Senior Coaching',
    'Doubles Strategy', 'Singles Strategy', 'Serve & Return', 'Court Movement'
  ];

  // Search coaches query
  const { data: searchResults, isLoading: isSearching, refetch: searchCoaches } = useQuery({
    queryKey: ['/api/coaches/search', searchParams],
    queryFn: async () => {
      const response = await fetch('/api/coaches/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(searchParams)
      });
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: false
  });

  // Get AI recommendations
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['/api/coaches/recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/coaches/recommendations', {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to get recommendations');
      return response.json();
    }
  });

  // Favorite coach mutation
  const favoriteMutation = useMutation({
    mutationFn: async ({ coachId, action }: { coachId: number; action: 'add' | 'remove' }) => {
      const response = await fetch(`/api/coaches/${coachId}/favorite`, {
        method: action === 'add' ? 'POST' : 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update favorites');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/search'] });
      toast({ title: 'Favorites updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update favorites', variant: 'destructive' });
    }
  });

  // Handle search
  const handleSearch = () => {
    searchCoaches();
  };

  // Handle filter changes
  const updateSearchParam = (key: keyof CoachSearchParams, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  // Handle specialty toggle
  const toggleSpecialty = (specialty: string) => {
    const current = searchParams.specialties || [];
    const updated = current.includes(specialty)
      ? current.filter(s => s !== specialty)
      : [...current, specialty];
    updateSearchParam('specialties', updated);
  };

  // Initial search on mount
  useEffect(() => {
    if (!searchParams.query && !searchParams.location) {
      // Load recommendations instead of empty search
      return;
    }
    searchCoaches();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-br from-orange-500 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Pickleball Coach</h1>
            <p className="text-xl mb-8 opacity-90">
              AI-powered matching with certified PCP coaches in your area
            </p>
            
            {/* Main Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1">
                <Input
                  placeholder="Search coaches, specialties, or skills..."
                  value={searchParams.query}
                  onChange={(e) => updateSearchParam('query', e.target.value)}
                  className="h-12 text-gray-900"
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Location (city, state, or zip)"
                  value={searchParams.location}
                  onChange={(e) => updateSearchParam('location', e.target.value)}
                  className="h-12 text-gray-900"
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="h-12 px-8 bg-white text-orange-600 hover:bg-gray-100"
              >
                <Search className="h-5 w-5 mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-white border-white/30 hover:bg-white/10"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Badge variant="secondary" className="text-gray-700">
                {searchResults?.total || 0} coaches found
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Search Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Hourly Rate: ${searchParams.priceRange?.min}-${searchParams.priceRange?.max}
                    </label>
                    <Slider
                      value={[searchParams.priceRange?.min || 0, searchParams.priceRange?.max || 200]}
                      onValueChange={([min, max]) => updateSearchParam('priceRange', { min, max })}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  {/* Radius */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Distance: {searchParams.radius} miles
                    </label>
                    <Slider
                      value={[searchParams.radius]}
                      onValueChange={([radius]) => updateSearchParam('radius', radius)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Specialties */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Specialties</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {specialtyOptions.map(specialty => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={specialty}
                            checked={searchParams.specialties?.includes(specialty)}
                            onCheckedChange={() => toggleSpecialty(specialty)}
                          />
                          <label htmlFor={specialty} className="text-sm">
                            {specialty}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Sort By</label>
                    <Select
                      value={searchParams.sortBy}
                      onValueChange={(value) => updateSearchParam('sortBy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="price">Lowest Price</SelectItem>
                        <SelectItem value="distance">Nearest</SelectItem>
                        <SelectItem value="popularity">Most Popular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSearch} className="w-full">
                    Apply Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Section */}
          <div className="flex-1">
            
            {/* AI Recommendations (shown when no search results) */}
            {!searchResults && recommendations && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Recommended For You</h2>
                <p className="text-gray-600 mb-6">
                  Based on your preferences and search history
                </p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {recommendations.recommendations.map((coach: any) => (
                    <CoachCard key={coach.id} coach={coach} onFavorite={favoriteMutation.mutate} />
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {searchResults.total} Coaches Found
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>

                {/* Coach Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.results.map((coach: any) => (
                    <CoachCard key={coach.id} coach={coach} onFavorite={favoriteMutation.mutate} />
                  ))}
                </div>

                {/* Load More */}
                {searchResults.hasMore && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={() => {
                        updateSearchParam('offset', searchParams.offset + searchParams.limit);
                        searchCoaches();
                      }}
                      disabled={isSearching}
                    >
                      Load More Coaches
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {searchResults && searchResults.results.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No coaches found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or location
                </p>
                <Button onClick={() => setShowFilters(true)}>
                  Adjust Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Coach Card Component
const CoachCard: React.FC<{
  coach: any;
  onFavorite: (params: { coachId: number; action: 'add' | 'remove' }) => void;
}> = ({ coach, onFavorite }) => {
  const [location, setLocation] = useLocation();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{coach.displayName}</CardTitle>
            {coach.tagline && (
              <p className="text-sm text-gray-600 mt-1">{coach.tagline}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFavorite({ 
              coachId: coach.coachId, 
              action: coach.isFavorited ? 'remove' : 'add' 
            })}
          >
            <Heart className={`h-4 w-4 ${coach.isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 font-medium">{coach.averageRating || '0.0'}</span>
          </div>
          <span className="text-sm text-gray-500">
            ({coach.totalReviews} reviews)
          </span>
        </div>

        {/* Specialties */}
        {coach.specialties && coach.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {coach.specialties.slice(0, 3).map((specialty: string) => (
              <Badge key={specialty} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {coach.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{coach.specialties.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Location & Price */}
        <div className="space-y-2 mb-4">
          {coach.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {coach.location}
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 mr-2" />
            ${coach.hourlyRate}/hour
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            Responds in {coach.responseTime || 24}h
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {coach.totalSessions || 0} sessions completed
          </div>
        </div>

        {/* View Profile Button */}
        <Button 
          className="w-full" 
          onClick={() => setLocation(`/coaches/${coach.coachId}`)}
        >
          View Profile
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default CoachMarketplace;