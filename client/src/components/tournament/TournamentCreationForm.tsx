import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

// Define the schema for tournament creation form
const tournamentFormSchema = z.object({
  name: z.string().min(5, "Tournament name must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  startDate: z.date(),
  endDate: z.date(),
  registrationStartDate: z.date(),
  registrationEndDate: z.date(),
  maxParticipants: z.number().int().positive().optional(),
  format: z.string(),
  division: z.string(),
  level: z.string(),
  entryFee: z.number().int().nonnegative().optional(),
  organizer: z.string().optional(),
  minRating: z.number().int().nonnegative().optional(),
  maxRating: z.number().int().nonnegative().optional(),
  status: z.string().default("upcoming"),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
}).refine(data => data.registrationEndDate >= data.registrationStartDate, {
  message: "Registration end date must be after registration start date",
  path: ["registrationEndDate"]
}).refine(data => data.registrationEndDate <= data.startDate, {
  message: "Registration must end before tournament starts",
  path: ["registrationEndDate"]
});

type TournamentFormValues = z.infer<typeof tournamentFormSchema>;

export default function TournamentCreationForm() {
  const [isTeamTournament, setIsTeamTournament] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Tournament creation mutation
  const createTournament = useMutation({
    mutationFn: async (data: TournamentFormValues) => {
      const response = await apiRequest("POST", "/api/tournaments", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tournament created successfully",
        description: "The tournament has been created and is now visible to players",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create tournament",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Form setup
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      startDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 31)),
      registrationStartDate: new Date(),
      registrationEndDate: new Date(new Date().setDate(new Date().getDate() + 25)),
      format: "single_elimination",
      division: "singles",
      level: "club",
      status: "upcoming",
    },
  });

  // Form submission handler
  function onSubmit(data: TournamentFormValues) {
    // Convert dates to ISO strings for API
    const submitData = {
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      registrationStartDate: data.registrationStartDate.toISOString(),
      registrationEndDate: data.registrationEndDate.toISOString(),
    };
    
    createTournament.mutate(submitData as any);
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create New Tournament</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Tournament Info */}
              <div className="space-y-4 col-span-2">
                <h3 className="text-lg font-semibold">Tournament Information</h3>
                <Separator />
              
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Championship 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tournament details, rules, and information..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Pickleball Complex, City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organizer</FormLabel>
                      <FormControl>
                        <Input placeholder="Organizing Club or Person" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tournament Classification */}
              <div className="space-y-4 col-span-2">
                <h3 className="text-lg font-semibold">Classification</h3>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tournament Format</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single_elimination">Single Elimination</SelectItem>
                            <SelectItem value="double_elimination">Double Elimination</SelectItem>
                            <SelectItem value="round_robin">Round Robin</SelectItem>
                            <SelectItem value="round_robin_to_bracket">Round Robin to Bracket</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tournament Tier</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="club">Club (1.2x)</SelectItem>
                            <SelectItem value="district">District (1.5x)</SelectItem>
                            <SelectItem value="city">City (1.8x)</SelectItem>
                            <SelectItem value="provincial">Provincial (2.0x)</SelectItem>
                            <SelectItem value="national">National (2.5x)</SelectItem>
                            <SelectItem value="regional">Regional (3.0x)</SelectItem>
                            <SelectItem value="international">International (4.0x)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="singles">Singles</SelectItem>
                            <SelectItem value="doubles">Doubles</SelectItem>
                            <SelectItem value="mixed">Mixed Doubles</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={isTeamTournament}
                      onCheckedChange={setIsTeamTournament} 
                      id="team-tournament" 
                    />
                    <label htmlFor="team-tournament" className="text-sm font-medium">
                      Team Tournament
                    </label>
                  </div>
                </div>
              </div>

              {/* Date Information */}
              <div className="space-y-4 col-span-2">
                <h3 className="text-lg font-semibold">Tournament Dates</h3>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="date"
                              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                              onChange={(e) => {
                                field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                              }}
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="date"
                              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                              onChange={(e) => {
                                field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                              }}
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registrationStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Open Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="date"
                              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                              onChange={(e) => {
                                field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                              }}
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registrationEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Close Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="date"
                              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                              onChange={(e) => {
                                field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                              }}
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Registration Options */}
              <div className="space-y-4 col-span-2">
                <h3 className="text-lg font-semibold">Registration Options</h3>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Participants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0 for unlimited"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="entryFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Fee</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0 for free entry"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft (Hidden)</SelectItem>
                            <SelectItem value="upcoming">Upcoming (Visible)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Player Requirements */}
              <div className="space-y-4 col-span-2">
                <h3 className="text-lg font-semibold">Player Requirements</h3>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Rating</FormLabel>
                        <FormDescription>Minimum rating required to register (optional)</FormDescription>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Leave empty for open entry"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Rating</FormLabel>
                        <FormDescription>Maximum rating allowed (optional)</FormDescription>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Leave empty for no maximum"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Team Tournament Options (conditionally shown) */}
              {isTeamTournament && (
                <div className="space-y-4 col-span-2">
                  <h3 className="text-lg font-semibold">Team Tournament Options</h3>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium">Minimum Team Size</label>
                      <Input type="number" defaultValue="2" />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium">Maximum Team Size</label>
                      <Input type="number" defaultValue="4" />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium">Minimum Female Players</label>
                      <Input type="number" defaultValue="0" />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium">Minimum Male Players</label>
                      <Input type="number" defaultValue="0" />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium">Minimum Combined Age</label>
                      <Input type="number" placeholder="Optional" />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium">Additional Requirements</label>
                      <Textarea placeholder="Any special team composition requirements..." />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={createTournament.isPending}>
                {createTournament.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Tournament
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}