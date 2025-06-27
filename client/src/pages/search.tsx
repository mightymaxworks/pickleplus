/**
 * PKL-278651-SEARCH-0001-GLOBAL
 * Global Search Page
 * 
 * Comprehensive search functionality across players, coaches, matches, communities,
 * and other platform content with advanced filtering and real-time results.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-27
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  Calendar, 
  Award, 
  User, 
  Filter,
  X,
  ChevronDown,
  ArrowLeft,
  Loader2,
  Trophy,
  MapPin,
  Star
} from 'lucide-react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  type: 'player' | 'coach' | 'match' | 'community' | 'tournament';
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  rating?: number;
  location?: string;
  tags?: string[];
  relevanceScore: number;
}

interface SearchFilters {
  type: string;
  location: string;
  skillLevel: string;
  dateRange: string;
}

export default function SearchPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    location: 'all',
    skillLevel: 'all',
    dateRange: 'all'
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search API call
  const { data: searchResults = [], isLoading, error } = useQuery({
    queryKey: ['/api/search', debouncedSearchQuery, filters, activeTab],
    enabled: debouncedSearchQuery.length > 0,
    staleTime: 30000, // Cache results for 30 seconds
  });

  // Filter results by active tab
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return searchResults;
    return searchResults.filter((result: SearchResult) => result.type === activeTab);
  }, [searchResults, activeTab]);

  // Group results by type for the "all" tab
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    filteredResults.forEach((result: SearchResult) => {
      if (!groups[result.type]) groups[result.type] = [];
      groups[result.type].push(result);
    });
    return groups;
  }, [filteredResults]);

  // Auto-focus search input
  useEffect(() => {
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'player':
        navigate(`/profile/${result.id}`);
        break;
      case 'coach':
        navigate(`/coaches/${result.id}`);
        break;
      case 'match':
        navigate(`/matches/${result.id}`);
        break;
      case 'community':
        navigate(`/communities/${result.id}`);
        break;
      case 'tournament':
        navigate(`/tournaments/${result.id}`);
        break;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'player': return <User size={16} />;
      case 'coach': return <Award size={16} />;
      case 'match': return <Calendar size={16} />;
      case 'community': return <Users size={16} />;
      case 'tournament': return <Trophy size={16} />;
      default: return <Search size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'player': return 'bg-blue-100 text-blue-800';
      case 'coach': return 'bg-green-100 text-green-800';
      case 'match': return 'bg-purple-100 text-purple-800';
      case 'community': return 'bg-orange-100 text-orange-800';
      case 'tournament': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ResultCard = ({ result }: { result: SearchResult }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
      onClick={() => handleResultClick(result)}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {result.avatar ? (
              <img 
                src={result.avatar} 
                alt={result.title}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white">
                {getResultIcon(result.type)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm truncate">{result.title}</h3>
                <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                  {result.type}
                </Badge>
              </div>
              
              {result.subtitle && (
                <p className="text-sm text-gray-600 mb-1">{result.subtitle}</p>
              )}
              
              {result.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{result.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {result.location && (
                    <div className="flex items-center">
                      <MapPin size={12} className="mr-1" />
                      {result.location}
                    </div>
                  )}
                  {result.rating && (
                    <div className="flex items-center">
                      <Star size={12} className="mr-1 fill-yellow-400 text-yellow-400" />
                      {result.rating.toFixed(1)}
                    </div>
                  )}
                </div>
                
                {result.tags && result.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {result.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <StandardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Search</h1>
              <p className="text-gray-600">Find players, coaches, matches, and communities</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center space-x-2"
          >
            <Filter size={16} />
            <span>Filters</span>
            <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Search Input */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="global-search-input"
                type="text"
                placeholder="Search for anything..."
                className="pl-10 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Search Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type</label>
                      <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="player">Players</SelectItem>
                          <SelectItem value="coach">Coaches</SelectItem>
                          <SelectItem value="match">Matches</SelectItem>
                          <SelectItem value="community">Communities</SelectItem>
                          <SelectItem value="tournament">Tournaments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="local">Local (50 miles)</SelectItem>
                          <SelectItem value="state">State/Province</SelectItem>
                          <SelectItem value="national">National</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Skill Level</label>
                      <Select value={filters.skillLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, skillLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="beginner">Beginner (2.0-3.0)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (3.5-4.0)</SelectItem>
                          <SelectItem value="advanced">Advanced (4.5-5.0+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date Range</label>
                      <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {debouncedSearchQuery.length > 0 && (
          <Card>
            <CardContent className="p-6">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="player">Players</TabsTrigger>
                  <TabsTrigger value="coach">Coaches</TabsTrigger>
                  <TabsTrigger value="match">Matches</TabsTrigger>
                  <TabsTrigger value="community">Communities</TabsTrigger>
                  <TabsTrigger value="tournament">Tournaments</TabsTrigger>
                </TabsList>

                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#FF5722]" />
                    <span className="ml-2 text-gray-600">Searching...</span>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-center py-12">
                    <p className="text-red-600">Search temporarily unavailable. Please try again.</p>
                  </div>
                )}

                {/* No Results */}
                {!isLoading && !error && filteredResults.length === 0 && debouncedSearchQuery.length > 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600">Try adjusting your search terms or filters</p>
                  </div>
                )}

                {/* Results */}
                <TabsContent value="all" className="mt-0">
                  {Object.entries(groupedResults).map(([type, results]) => (
                    <div key={type} className="mb-8">
                      <h3 className="text-lg font-semibold mb-4 capitalize flex items-center">
                        {getResultIcon(type)}
                        <span className="ml-2">{type}s ({results.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                          {results.slice(0, 4).map((result) => (
                            <ResultCard key={result.id} result={result} />
                          ))}
                        </AnimatePresence>
                      </div>
                      {results.length > 4 && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setActiveTab(type)}
                        >
                          View all {results.length} {type}s
                        </Button>
                      )}
                    </div>
                  ))}
                </TabsContent>

                {['player', 'coach', 'match', 'community', 'tournament'].map((type) => (
                  <TabsContent key={type} value={type} className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence>
                        {filteredResults.map((result) => (
                          <ResultCard key={result.id} result={result} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Search Suggestions */}
        {debouncedSearchQuery.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Popular Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  'Beginner players',
                  'Advanced coaches',
                  'Local tournaments',
                  'Practice partners',
                  'Coaching certification',
                  'Singles matches',
                  'Community events'
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StandardLayout>
  );
}