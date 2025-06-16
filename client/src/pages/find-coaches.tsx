import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Award, Star, Clock, DollarSign, MapPin } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Coach {
  id: number;
  userId: number;
  name: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  experienceYears: number;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  profileImageUrl: string | null;
  isVerified: boolean;
}

export default function FindCoachesPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const { data: coaches, isLoading } = useQuery({
    queryKey: ['/api/coaches/available'],
    queryFn: () => apiRequest('GET', '/api/coaches/available').then(res => res.json())
  });

  const specialties = [
    'Singles Strategy',
    'Doubles Strategy', 
    'Technical Skills',
    'Mental Game',
    'Beginner Development',
    'Advanced Tactics',
    'Fitness & Conditioning',
    'PCP Assessment'
  ];

  const filteredCoaches = coaches?.filter((coach: Coach) => 
    !selectedSpecialty || coach.specialties.includes(selectedSpecialty)
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Find Your Perfect Coach</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with PCP Coaching Certification Programme certified coaches who can help take your game to the next level
          </p>
        </div>

        {/* Specialty Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Filter by Specialty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSpecialty === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialty(null)}
              >
                All Coaches
              </Button>
              {specialties.map(specialty => (
                <Button
                  key={specialty}
                  variant={selectedSpecialty === specialty ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSpecialty(specialty)}
                >
                  {specialty}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((coach: Coach) => (
            <Card key={coach.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={coach.profileImageUrl || ""} />
                      <AvatarFallback>{coach.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {coach.name}
                        {coach.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{coach.rating?.toFixed(1) || '5.0'}</span>
                        <span>({coach.totalReviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-3">
                  {coach.bio}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Experience & Rate */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    {coach.experienceYears} years experience
                  </div>
                  <div className="flex items-center gap-1 font-semibold">
                    <DollarSign className="h-4 w-4" />
                    ${coach.hourlyRate}/hour
                  </div>
                </div>

                {/* Specialties */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Specialties:</h4>
                  <div className="flex flex-wrap gap-1">
                    {coach.specialties.slice(0, 3).map(specialty => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {coach.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{coach.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Certifications:</h4>
                  <div className="flex flex-wrap gap-1">
                    {coach.certifications.slice(0, 2).map(cert => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    Request Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCoaches.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No coaches found
              </h3>
              <p className="text-gray-500 mb-4">
                {selectedSpecialty 
                  ? `No coaches specialize in ${selectedSpecialty}` 
                  : 'No coaches are currently available'}
              </p>
              {selectedSpecialty && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSpecialty(null)}
                >
                  Clear Filter
                </Button>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}