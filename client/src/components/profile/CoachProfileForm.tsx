import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, MapPin, X, Plus, DollarSign, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Coaching profile form schema
const coachProfileSchema = z.object({
  // Basic info
  headline: z.string().max(100, "Headline must be 100 characters or less").optional(),
  shortBio: z.string().max(160, "Short bio must be 160 characters or less").optional(),
  bio: z.string().max(2000, "Bio must be 2000 characters or less").optional(),
  
  // Certification and experience
  isPCPCertified: z.boolean().optional(),
  certifications: z.array(z.string()).optional(),
  yearsCoaching: z.string().optional().transform(val => val ? parseInt(val, 10) : null),
  
  // Teaching details
  teachingPhilosophy: z.string().max(1000, "Teaching philosophy must be 1000 characters or less").optional(),
  specialties: z.array(z.string()).optional(),
  teachingStyles: z.array(z.string()).optional(),
  skillLevelsTaught: z.array(z.string()).optional(),
  
  // Services and logistics
  coachingFormats: z.array(z.string()).optional(),
  location: z.string().optional(),
  availabilitySchedule: z.record(z.array(z.string())).optional(),
  hourlyRate: z.string().optional().transform(val => val ? parseInt(val, 10) : null),
  acceptingNewStudents: z.boolean().optional()
});

type CoachProfileFormData = z.infer<typeof coachProfileSchema>;

interface CoachProfileFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function CoachProfileForm({ initialData, onSuccess }: CoachProfileFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Arrays for select options
  const [certifications, setCertifications] = useState<string[]>(initialData?.certifications || []);
  const [specialties, setSpecialties] = useState<string[]>(initialData?.specialties || []);
  const [teachingStyles, setTeachingStyles] = useState<string[]>(initialData?.teachingStyles || []);
  const [coachingFormats, setCoachingFormats] = useState<string[]>(initialData?.coachingFormats || []);
  
  // New item inputs
  const [newCertification, setNewCertification] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newTeachingStyle, setNewTeachingStyle] = useState("");
  const [newCoachingFormat, setNewCoachingFormat] = useState("");
  
  // Default availability schedule
  const defaultAvailability = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  };
  
  // Initialize form
  const form = useForm<CoachProfileFormData>({
    resolver: zodResolver(coachProfileSchema),
    defaultValues: {
      headline: initialData?.headline || "",
      shortBio: initialData?.shortBio || "",
      bio: initialData?.bio || "",
      isPCPCertified: initialData?.isPCPCertified || false,
      certifications: initialData?.certifications || [],
      yearsCoaching: initialData?.yearsCoaching?.toString() || "",
      teachingPhilosophy: initialData?.teachingPhilosophy || "",
      specialties: initialData?.specialties || [],
      teachingStyles: initialData?.teachingStyles || [],
      skillLevelsTaught: initialData?.skillLevelsTaught || [],
      coachingFormats: initialData?.coachingFormats || [],
      location: initialData?.location || "",
      availabilitySchedule: initialData?.availabilitySchedule || defaultAvailability,
      hourlyRate: initialData?.hourlyRate?.toString() || "",
      acceptingNewStudents: initialData?.acceptingNewStudents || true
    }
  });
  
  // Add item to array functions
  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      const updated = [...certifications, newCertification.trim()];
      setCertifications(updated);
      form.setValue("certifications", updated);
      setNewCertification("");
    }
  };
  
  const removeCertification = (cert: string) => {
    const updated = certifications.filter((c) => c !== cert);
    setCertifications(updated);
    form.setValue("certifications", updated);
  };
  
  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      const updated = [...specialties, newSpecialty.trim()];
      setSpecialties(updated);
      form.setValue("specialties", updated);
      setNewSpecialty("");
    }
  };
  
  const removeSpecialty = (specialty: string) => {
    const updated = specialties.filter((s) => s !== specialty);
    setSpecialties(updated);
    form.setValue("specialties", updated);
  };
  
  const addTeachingStyle = () => {
    if (newTeachingStyle.trim() && !teachingStyles.includes(newTeachingStyle.trim())) {
      const updated = [...teachingStyles, newTeachingStyle.trim()];
      setTeachingStyles(updated);
      form.setValue("teachingStyles", updated);
      setNewTeachingStyle("");
    }
  };
  
  const removeTeachingStyle = (style: string) => {
    const updated = teachingStyles.filter((s) => s !== style);
    setTeachingStyles(updated);
    form.setValue("teachingStyles", updated);
  };
  
  const addCoachingFormat = () => {
    if (newCoachingFormat.trim() && !coachingFormats.includes(newCoachingFormat.trim())) {
      const updated = [...coachingFormats, newCoachingFormat.trim()];
      setCoachingFormats(updated);
      form.setValue("coachingFormats", updated);
      setNewCoachingFormat("");
    }
  };
  
  const removeCoachingFormat = (format: string) => {
    const updated = coachingFormats.filter((f) => f !== format);
    setCoachingFormats(updated);
    form.setValue("coachingFormats", updated);
  };
  
  const onSubmit = async (data: CoachProfileFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/coach/profile", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save coaching profile");
      }
      
      toast({
        title: "Profile Saved",
        description: "Your coaching profile has been updated successfully",
      });
      
      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ["/api/coach/profile"] });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save coaching profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Coach Profile</CardTitle>
            <CardDescription>
              Build your coaching profile to attract students and showcase your expertise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="mb-4 grid grid-cols-3 sm:grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="expertise">Expertise</TabsTrigger>
                <TabsTrigger value="teaching">Teaching</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>
              
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Headline</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. USAPA Certified Pickleball Coach | 5+ Years Experience" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A brief tagline that appears under your name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="shortBio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A brief summary about you as a coach (max 160 characters)" 
                          {...field} 
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        This appears in search results and previews (max 160 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Biography</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share your background, achievements, and coaching approach..." 
                          {...field} 
                          rows={6}
                        />
                      </FormControl>
                      <FormDescription>
                        Tell potential students about your background and coaching journey
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Location</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="relative flex-1">
                            <MapPin className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              className="pl-8" 
                              placeholder="Where do you typically coach?"
                              {...field} 
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        City, state, or specific courts where you regularly coach
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Expertise Tab */}
              <TabsContent value="expertise" className="space-y-4">
                <FormField
                  control={form.control}
                  name="isPCPCertified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Award className="mr-2 h-4 w-4 text-orange-500" />
                          <FormLabel className="font-medium">PCP Certified</FormLabel>
                        </div>
                        <FormDescription>
                          Do you have a Pickleball Certification?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="yearsCoaching"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Coaching Experience</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="How many years have you been coaching?" 
                          value={field.value === null ? "" : field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormDescription>
                        Your total experience as a pickleball coach
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Certifications & Credentials</FormLabel>
                  <div className="flex mt-2 mb-3">
                    <Input 
                      placeholder="Add certification or credential"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      className="mr-2"
                    />
                    <Button type="button" onClick={addCertification}>Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {certifications.map((cert, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        {cert}
                        <button 
                          type="button" 
                          onClick={() => removeCertification(cert)}
                          className="ml-1 rounded-full hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormDescription className="mt-2">
                    Add all relevant certifications and credentials
                  </FormDescription>
                </div>
              </TabsContent>
              
              {/* Teaching Tab */}
              <TabsContent value="teaching" className="space-y-4">
                <FormField
                  control={form.control}
                  name="teachingPhilosophy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teaching Philosophy</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your approach to teaching and coaching..." 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Share your coaching philosophy and approach to teaching
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Specialties</FormLabel>
                  <div className="flex mt-2 mb-3">
                    <Input 
                      placeholder="Add specialty (e.g. Third Shot Drop)"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      className="mr-2"
                    />
                    <Button type="button" onClick={addSpecialty}>Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {specialties.map((specialty, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        {specialty}
                        <button 
                          type="button" 
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-1 rounded-full hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormDescription className="mt-2">
                    Add specific skills or techniques you specialize in teaching
                  </FormDescription>
                </div>
                
                <div>
                  <FormLabel>Teaching Styles</FormLabel>
                  <div className="flex mt-2 mb-3">
                    <Input 
                      placeholder="Add teaching style (e.g. Visual Learning)"
                      value={newTeachingStyle}
                      onChange={(e) => setNewTeachingStyle(e.target.value)}
                      className="mr-2"
                    />
                    <Button type="button" onClick={addTeachingStyle}>Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teachingStyles.map((style, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {style}
                        <button 
                          type="button" 
                          onClick={() => removeTeachingStyle(style)}
                          className="ml-1 rounded-full hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormDescription className="mt-2">
                    How do you approach teaching (e.g. Drill-based, Game scenarios, Video analysis)
                  </FormDescription>
                </div>
                
                <FormField
                  control={form.control}
                  name="skillLevelsTaught"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Levels You Teach</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-4">
                          {["Beginner", "Intermediate", "Advanced", "Professional"].map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <Checkbox 
                                id={level} 
                                checked={field.value?.includes(level)} 
                                onCheckedChange={(checked: boolean) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, level]);
                                  } else {
                                    field.onChange(currentValues.filter((v: string) => v !== level));
                                  }
                                }}
                              />
                              <label
                                htmlFor={level}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {level}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select all skill levels you're comfortable teaching
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Services Tab */}
              <TabsContent value="services" className="space-y-4">
                <div>
                  <FormLabel>Session Types</FormLabel>
                  <div className="flex mt-2 mb-3">
                    <Input 
                      placeholder="Add session type (e.g. Private Lessons)"
                      value={newCoachingFormat}
                      onChange={(e) => setNewCoachingFormat(e.target.value)}
                      className="mr-2"
                    />
                    <Button type="button" onClick={addCoachingFormat}>Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {coachingFormats.map((format, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        {format}
                        <button 
                          type="button" 
                          onClick={() => removeCoachingFormat(format)}
                          className="ml-1 rounded-full hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormDescription className="mt-2">
                    Add the types of coaching sessions you offer (e.g. Private lessons, Group clinics)
                  </FormDescription>
                </div>
                
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            className="pl-8" 
                            type="number" 
                            min="0" 
                            placeholder="Your standard hourly rate" 
                            value={field.value === null ? "" : field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Your typical hourly rate for private lessons (you can adjust for different formats)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="acceptingNewStudents"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="font-medium">Accepting New Students</FormLabel>
                        <FormDescription>
                          Are you currently taking on new students?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Availability Tab */}
              <TabsContent value="availability" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Set your typical weekly availability for coaching
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {Object.keys(defaultAvailability).map((day) => (
                    <AccordionItem key={day} value={day}>
                      <AccordionTrigger className="text-left">{day}</AccordionTrigger>
                      <AccordionContent>
                        <div className="mb-4">
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="text-sm"
                              onClick={() => {
                                const updated = {...form.getValues().availabilitySchedule};
                                updated[day] = [...(updated[day] || []), "Morning"];
                                form.setValue("availabilitySchedule", updated);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Morning
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="text-sm"
                              onClick={() => {
                                const updated = {...form.getValues().availabilitySchedule};
                                updated[day] = [...(updated[day] || []), "Afternoon"];
                                form.setValue("availabilitySchedule", updated);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Afternoon
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="text-sm"
                              onClick={() => {
                                const updated = {...form.getValues().availabilitySchedule};
                                updated[day] = [...(updated[day] || []), "Evening"];
                                form.setValue("availabilitySchedule", updated);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Evening
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="text-sm"
                              onClick={() => {
                                const updated = {...form.getValues().availabilitySchedule};
                                updated[day] = [];
                                form.setValue("availabilitySchedule", updated);
                              }}
                            >
                              <X className="h-3 w-3 mr-1" /> Clear
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {form.getValues().availabilitySchedule?.[day]?.map((time, i) => (
                            <Badge key={i} variant="secondary" className="flex items-center gap-1">
                              {time}
                              <button 
                                type="button" 
                                onClick={() => {
                                  const updated = {...form.getValues().availabilitySchedule};
                                  updated[day] = updated[day].filter(t => t !== time);
                                  form.setValue("availabilitySchedule", updated);
                                }}
                                className="ml-1 rounded-full hover:bg-muted"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          
                          {(!form.getValues().availabilitySchedule?.[day] || form.getValues().availabilitySchedule?.[day].length === 0) && (
                            <div className="text-sm text-muted-foreground">No availability set for {day}</div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {/* Skip button can be added here if needed */}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}