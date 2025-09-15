/**
 * PKL-278651-FACILITY-MGMT-001 - Advanced Facility Management System
 * World-class facility discovery and booking interface
 * Priority 1: Facility Profile & Discovery System
 */

import React, { useState, useRef, useEffect } from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  Calendar,
  Phone,
  Globe,
  ArrowRight,
  Search,
  Filter,
  Building2,
  Wifi,
  Car,
  Coffee,
  Shield,
  Zap
} from 'lucide-react';
import { format } from "date-fns";

interface Facility {
  id: number;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  email?: string;
  website?: string;
  operatingHours?: {
    monday: { open: string; close: string; closed?: boolean };
    tuesday: { open: string; close: string; closed?: boolean };
    wednesday: { open: string; close: string; closed?: boolean };
    thursday: { open: string; close: string; closed?: boolean };
    friday: { open: string; close: string; closed?: boolean };
    saturday: { open: string; close: string; closed?: boolean };
    sunday: { open: string; close: string; closed?: boolean };
  };
  courtCount: number;
  courtSurface: string;
  amenities?: string[];
  isActive: boolean;
  managerUserId?: number;
  distance?: number;
  rating?: number;
  reviewsCount?: number;
  totalBookings?: number;
  nextAvailableSlot?: string;
}

const amenityIcons: Record<string, React.ReactNode> = {
  'Wi-Fi': <Wifi className="w-4 h-4" />,
  'Parking': <Car className="w-4 h-4" />,
  'Café': <Coffee className="w-4 h-4" />,
  'Locker Rooms': <Shield className="w-4 h-4" />,
  'Lighting': <Zap className="w-4 h-4" />,
  'Pro Shop': <Building2 className="w-4 h-4" />
};

const FacilityCard: React.FC<{ facility: Facility; onBookNow: (facility: Facility) => void }> = ({ 
  facility, 
  onBookNow 
}) => {
  const getCurrentStatus = () => {
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()] as keyof typeof facility.operatingHours;
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const todayHours = facility.operatingHours?.[currentDay];
    if (!todayHours || todayHours.closed) {
      return { status: 'Closed Today', color: 'text-red-600' };
    }
    
    const openTime = parseInt(todayHours.open.replace(':', ''));
    const closeTime = parseInt(todayHours.close.replace(':', ''));
    
    if (currentTime >= openTime && currentTime <= closeTime) {
      return { status: 'Open Now', color: 'text-green-600' };
    }
    
    return { status: 'Closed', color: 'text-red-600' };
  };

  const status = getCurrentStatus();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary" data-testid={`facility-card-${facility.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
              {facility.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{facility.address}, {facility.city}</span>
              {facility.distance && (
                <Badge variant="secondary" className="ml-2">
                  {facility.distance.toFixed(1)} km away
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {facility.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{facility.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({facility.reviewsCount})</span>
              </div>
            )}
            <span className={`text-sm font-medium ${status.color}`}>
              {status.status}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <div>
              <div className="text-sm font-medium">{facility.courtCount} Courts</div>
              <div className="text-xs text-gray-500 capitalize">{facility.courtSurface}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <div>
              <div className="text-sm font-medium">{facility.totalBookings || 0} Bookings</div>
              <div className="text-xs text-gray-500">This month</div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {facility.amenities && facility.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {facility.amenities.slice(0, 4).map((amenity, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {amenityIcons[amenity] || <Building2 className="w-3 h-3" />}
                <span className="text-xs">{amenity}</span>
              </Badge>
            ))}
            {facility.amenities.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{facility.amenities.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Contact Info */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {facility.phoneNumber && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{facility.phoneNumber}</span>
              </div>
            )}
            {facility.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Website</span>
              </div>
            )}
          </div>
          <Button 
            onClick={() => onBookNow(facility)}
            className="bg-primary hover:bg-primary/90 text-white font-medium"
            data-testid={`button-book-${facility.id}`}
          >
            Book Now <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {facility.nextAvailableSlot && (
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-l-green-500">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Next available: {facility.nextAvailableSlot}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function FacilityDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [surfaceFilter, setSurfaceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get user location for distance calculations
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Location access denied:', error)
      );
    }
  }, []);

  // Fetch facilities
  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ['/api/facilities', searchQuery, locationFilter, surfaceFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (locationFilter !== 'all') params.set('city', locationFilter);
      if (surfaceFilter !== 'all') params.set('surface', surfaceFilter);
      if (userLocation) {
        params.set('lat', userLocation.lat.toString());
        params.set('lng', userLocation.lng.toString());
      }
      
      const response = await fetch(`/api/facilities?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch facilities');
      return response.json();
    }
  });

  const handleBookNow = (facility: Facility) => {
    // Navigate to booking interface for this facility
    window.location.href = `/facility/${facility.id}/book`;
  };

  const filteredAndSortedFacilities = facilities.sort((a: Facility, b: Facility) => {
    switch (sortBy) {
      case 'distance':
        return (a.distance || 999) - (b.distance || 999);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'availability':
        return a.nextAvailableSlot ? -1 : 1;
      default:
        return 0;
    }
  });

  const uniqueCities = [...new Set(facilities.map((f: Facility) => f.city))];
  const uniqueSurfaces = [...new Set(facilities.map((f: Facility) => f.courtSurface))];

  return (
    <StandardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-2xl p-8 mb-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect <span className="text-primary">Pickleball Court</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover world-class facilities near you and book instantly with real-time availability
            </p>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search facilities by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg rounded-xl border-2 focus:border-primary"
                data-testid="input-search-facilities"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-40" data-testid="select-location-filter">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueCities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={surfaceFilter} onValueChange={setSurfaceFilter}>
              <SelectTrigger className="w-40" data-testid="select-surface-filter">
                <SelectValue placeholder="Court Surface" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Surfaces</SelectItem>
                {uniqueSurfaces.map(surface => (
                  <SelectItem key={surface} value={surface} className="capitalize">
                    {surface}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40" data-testid="select-sort-by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="availability">Availability</SelectItem>
              </SelectContent>
            </Select>

            {facilities.length > 0 && (
              <Badge variant="secondary" className="ml-auto" data-testid="facilities-count">
                {filteredAndSortedFacilities.length} facilities found
              </Badge>
            )}
          </div>
        </Card>

        {/* Facilities Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedFacilities.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No facilities found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="facilities-grid">
            {filteredAndSortedFacilities.map((facility) => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                onBookNow={handleBookNow}
              />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/5 to-blue-600/5 border-primary/20 p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Don't see your facility?
          </h3>
          <p className="text-gray-600 mb-4">
            Join the Pickle+ network and start attracting more players today
          </p>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            List Your Facility
          </Button>
        </Card>
      </div>
    </StandardLayout>
  );
}