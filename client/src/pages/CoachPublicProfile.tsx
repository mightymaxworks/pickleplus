// Enhanced Coach Public Profile Page - Professional coach showcase
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Heart, 
  MessageSquare, 
  Calendar,
  Shield,
  Award,
  ChevronLeft,
  Send,
  Filter,
  Phone,
  Mail,
  Globe,
  Camera,
  Play,
  Download,
  Share2,
  BookOpen,
  Target,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { CoachPublicProfileWithRelations, CoachService, ProfileTestimonial } from '../../../shared/schema/coach-public-profiles';

interface ContactModalProps {
  coach: CoachPublicProfileWithRelations;
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ coach, isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const sendContactMessage = useMutation({
    mutationFn: async (data: { message: string }) => {
      const response = await fetch(`/api/coach-public-profiles/${coach.slug}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Message sent successfully!' });
      setMessage('');
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Contact {coach.displayName}</h3>
        
        <div className="space-y-4">
          {coach.contactEmail && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{coach.contactEmail}</span>
            </div>
          )}
          
          {coach.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{coach.phoneNumber}</span>
            </div>
          )}
          
          <Textarea
            placeholder="Send a message to the coach..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={() => sendContactMessage.mutate({ message })}
              disabled={!message.trim() || sendContactMessage.isPending}
            >
              {sendContactMessage.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceCard: React.FC<{ service: CoachService }> = ({ service }) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="text-lg">{service.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4">{service.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{service.duration} minutes</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm">
            {service.sessionType} • Max {service.maxParticipants} {service.maxParticipants === 1 ? 'participant' : 'participants'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <span className="text-lg font-bold">${(service.price / 100).toFixed(2)}</span>
        </div>
      </div>
      
      <Button className="w-full">Book Session</Button>
    </CardContent>
  </Card>
);

const TestimonialCard: React.FC<{ testimonial: ProfileTestimonial }> = ({ testimonial }) => (
  <Card className="h-full">
    <CardContent className="pt-6">
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < (testimonial.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
      
      <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
      
      <div className="flex items-center gap-2">
        <div>
          <p className="font-medium text-sm">{testimonial.clientName}</p>
          {testimonial.clientTitle && (
            <p className="text-xs text-gray-500">{testimonial.clientTitle}</p>
          )}
        </div>
        {testimonial.isVerified && (
          <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
        )}
      </div>
    </CardContent>
  </Card>
);

const CoachPublicProfile: React.FC = () => {
  const { slug } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Get coach profile by slug
  const { data: coach, isLoading } = useQuery({
    queryKey: ['/api/coach-public-profiles', slug],
    queryFn: async () => {
      const response = await fetch(`/api/coach-public-profiles/${slug}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Coach profile not found');
      return response.json() as CoachPublicProfileWithRelations;
    },
    enabled: !!slug
  });

  // Track profile view
  useEffect(() => {
    if (coach) {
      fetch(`/api/coach-public-profiles/${slug}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventType: 'view' })
      }).catch(() => {}); // Silent fail for analytics
    }
  }, [coach, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading coach profile...</p>
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Coach Not Found</h2>
          <Button onClick={() => setLocation('/coaches')}>
            Back to Coach Directory
          </Button>
        </div>
      </div>
    );
  }

  const featuredTestimonials = coach.testimonials.filter(t => t.isFeatured).slice(0, 3);
  const activeServices = coach.services.filter(s => s.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="relative">
        {/* Cover Image */}
        {coach.coverImageUrl && (
          <div 
            className="h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${coach.coverImageUrl})` }}
          />
        )}
        
        {/* Profile Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Image */}
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={coach.profileImageUrl || ''} />
                <AvatarFallback className="text-2xl">
                  {coach.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{coach.displayName}</h1>
                    {coach.tagline && (
                      <p className="text-lg text-gray-600 mt-1">{coach.tagline}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      {coach.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{coach.location}</span>
                        </div>
                      )}
                      
                      {coach.yearsExperience && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{coach.yearsExperience} years experience</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{coach.viewCount} profile views</span>
                      </div>
                    </div>
                    
                    {/* Specializations */}
                    {coach.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {coach.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="lg" 
                      onClick={() => setContactModalOpen(true)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Coach
                    </Button>
                    
                    <Button variant="outline" size="lg">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Session
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* About Section */}
            {coach.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About {coach.displayName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{coach.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Featured Services */}
            {activeServices.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Featured Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeServices.slice(0, 3).map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </div>
            )}

            {/* Featured Testimonials */}
            {featuredTestimonials.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">What Students Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredTestimonials.map((testimonial) => (
                    <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">Coaching Services</h2>
              <p className="text-gray-600 mt-2">Choose the perfect coaching option for your needs</p>
            </div>
            
            {activeServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">No services available at this time.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">Student Reviews</h2>
              <p className="text-gray-600 mt-2">See what students are saying about their experience</p>
            </div>
            
            {coach.testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coach.testimonials.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">No reviews yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Professional Background */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Background</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {coach.yearsExperience && (
                    <div>
                      <h4 className="font-medium mb-1">Experience</h4>
                      <p className="text-gray-600">{coach.yearsExperience} years of coaching</p>
                    </div>
                  )}
                  
                  {coach.playingLevel && (
                    <div>
                      <h4 className="font-medium mb-1">Playing Level</h4>
                      <p className="text-gray-600">{coach.playingLevel}</p>
                    </div>
                  )}
                  
                  {coach.certifications.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-1">Certifications</h4>
                      <div className="space-y-1">
                        {coach.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              {coach.showContactInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {coach.contactEmail && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <span>{coach.contactEmail}</span>
                      </div>
                    )}
                    
                    {coach.phoneNumber && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <span>{coach.phoneNumber}</span>
                      </div>
                    )}
                    
                    {coach.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <a 
                          href={coach.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Coaching Philosophy */}
            {coach.coachingPhilosophy && (
              <Card>
                <CardHeader>
                  <CardTitle>Coaching Philosophy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{coach.coachingPhilosophy}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        coach={coach} 
        isOpen={contactModalOpen} 
        onClose={() => setContactModalOpen(false)} 
      />
    </div>
  );
};

export default CoachPublicProfile;