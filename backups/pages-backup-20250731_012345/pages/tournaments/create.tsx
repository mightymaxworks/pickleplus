import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';

export default function CreateTournamentPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    maxParticipants: '',
    format: 'single_elimination',
    division: 'open',
    level: 'intermediate',
    entryFee: '',
    prizePool: '',
    tier: 'club',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createTournamentMutation = useMutation({
    mutationFn: async (tournamentData: any) => {
      const res = await apiRequest('POST', '/api/tournaments', tournamentData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tournament Created",
        description: "The tournament has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      setLocation('/tournaments');
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Tournament",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert numeric fields
    const processedData = {
      ...formData,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      entryFee: formData.entryFee ? parseFloat(formData.entryFee) : null,
      prizePool: formData.prizePool ? parseFloat(formData.prizePool) : null,
    };
    
    createTournamentMutation.mutate(processedData);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => setLocation("/tournaments")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Create Tournament</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tournament Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tournament Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="tier">Tournament Tier</Label>
                  <Select 
                    value={formData.tier} 
                    onValueChange={(value) => handleSelectChange('tier', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
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
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationStartDate">Registration Start</Label>
                  <Input 
                    id="registrationStartDate" 
                    name="registrationStartDate"
                    type="date"
                    value={formData.registrationStartDate}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="registrationEndDate">Registration End</Label>
                  <Input 
                    id="registrationEndDate" 
                    name="registrationEndDate"
                    type="date"
                    value={formData.registrationEndDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select 
                    value={formData.format} 
                    onValueChange={(value) => handleSelectChange('format', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_elimination">Single Elimination</SelectItem>
                      <SelectItem value="double_elimination">Double Elimination</SelectItem>
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                      <SelectItem value="group_stage">Group Stage</SelectItem>
                      <SelectItem value="swiss">Swiss System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="division">Division</Label>
                  <Select 
                    value={formData.division} 
                    onValueChange={(value) => handleSelectChange('division', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mens_singles">Men's Singles</SelectItem>
                      <SelectItem value="womens_singles">Women's Singles</SelectItem>
                      <SelectItem value="mens_doubles">Men's Doubles</SelectItem>
                      <SelectItem value="womens_doubles">Women's Doubles</SelectItem>
                      <SelectItem value="mixed_doubles">Mixed Doubles</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="senior">Senior (50+)</SelectItem>
                      <SelectItem value="junior">Junior (18-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="level">Skill Level</Label>
                  <Select 
                    value={formData.level} 
                    onValueChange={(value) => handleSelectChange('level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (2.0-2.9)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (3.0-3.9)</SelectItem>
                      <SelectItem value="advanced">Advanced (4.0-4.9)</SelectItem>
                      <SelectItem value="pro">Pro (5.0+)</SelectItem>
                      <SelectItem value="open">Open (All Levels)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input 
                    id="maxParticipants" 
                    name="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="entryFee">Entry Fee ($)</Label>
                  <Input 
                    id="entryFee" 
                    name="entryFee"
                    type="number"
                    step="0.01"
                    value={formData.entryFee}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="prizePool">Prize Pool ($)</Label>
                  <Input 
                    id="prizePool" 
                    name="prizePool"
                    type="number"
                    step="0.01"
                    value={formData.prizePool}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" type="button" onClick={() => setLocation('/tournaments')}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createTournamentMutation.isPending}
              >
                {createTournamentMutation.isPending ? 'Creating...' : 'Create Tournament'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}