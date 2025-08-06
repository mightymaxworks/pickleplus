import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Award, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function FindCoachesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 mt-[56px] mb-[56px]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-6">
              <Users className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Coach Discovery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Coming Soon in Phase 2! We're building an enhanced coach marketplace with advanced filtering, 
            detailed profiles, booking system, and direct messaging.
          </p>
        </motion.div>

        {/* Coming Soon Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-700">
                <Award className="h-6 w-6" />
                Enhanced Coach Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Detailed coach profiles with certifications, specialties, reviews, 
                pricing, and availability calendars.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-700">
                <Calendar className="h-6 w-6" />
                Direct Booking System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Book coaching sessions directly through the platform with 
                automated scheduling and payment processing.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-700">
                <Users className="h-6 w-6" />
                Smart Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI-powered coach recommendations based on your skill level, 
                goals, and playing style preferences.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-700">
                <Clock className="h-6 w-6" />
                Session Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track your coaching progress, session history, and 
                skill development over time.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current V1.0 Action */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ready to Get Certified?
              </h3>
              <p className="text-gray-600 mb-6">
                In the meantime, you can apply to become a PCP certified coach yourself!
              </p>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                onClick={() => window.location.href = '/coach-application'}
              >
                Apply for PCP Certification
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

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
                        <span>{coach.rating ? Number(coach.rating).toFixed(1) : '0.0'}</span>
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
                    ${coach.hourlyRate ? Number(coach.hourlyRate).toFixed(0) : '0'}/hour
                  </div>
                </div>

                {/* Specialties */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Specialties:</h4>
                  <div className="flex flex-wrap gap-1">
                    {coach.specialties && Array.isArray(coach.specialties) && coach.specialties.slice(0, 3).map(specialty => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {coach.specialties && coach.specialties.length > 3 && (
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
                    {coach.certifications && Array.isArray(coach.certifications) && coach.certifications.slice(0, 2).map(cert => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                    {(!coach.certifications || !Array.isArray(coach.certifications) || coach.certifications.length === 0) && (
                      <span className="text-xs text-gray-500">No certifications listed</span>
                    )}
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