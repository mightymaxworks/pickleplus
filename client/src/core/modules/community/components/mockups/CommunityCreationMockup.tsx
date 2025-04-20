/**
 * PKL-278651-COMM-0001-UIMOCK
 * Community Creation Mockup
 * 
 * This component displays a mockup of the community creation wizard.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronRight, ChevronLeft, Upload, MapPin, 
  Info, CheckCircle, Users, Shield, Globe, Calendar,
  Gift, Star 
} from 'lucide-react';
import { ChallengeSoon } from '@/components/community/ChallengeSoon';

// Common example tags
const EXAMPLE_TAGS = [
  'Competitive', 'Recreational', 'Beginners Welcome', 'Advanced Players',
  'Seniors', 'Youth', 'Training Focus', 'Tournament Players', 'Social',
  'Indoor', 'Outdoor', 'Weekly Games', 'Coaching', 'All Levels'
];

const CommunityCreationMockup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  
  const handlePhotoSelection = () => {
    // In a real implementation, this would handle file uploads
    setPreviewUrl('https://via.placeholder.com/400x200');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Create a Community</h2>
          <div className="text-sm text-muted-foreground">Step {step} of 5</div>
        </div>
        <div className="w-full bg-muted h-2 rounded-full">
          <div 
            className="bg-primary h-2 rounded-full transition-all" 
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Step 1: Basic Information */}
      <div className={step === 1 ? 'block' : 'hidden'}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Let's start with the essential details of your pickleball community.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="community-name">Community Name</Label>
              <Input 
                id="community-name" 
                placeholder="E.g., Seattle Pickleball Club" 
                className="max-w-lg"
              />
              <p className="text-xs text-muted-foreground">Choose a clear, descriptive name that reflects your community's identity.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="community-type">Community Type</Label>
              <Select defaultValue="local">
                <SelectTrigger className="max-w-lg">
                  <SelectValue placeholder="Select community type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Club</SelectItem>
                  <SelectItem value="league">League</SelectItem>
                  <SelectItem value="training">Training Group</SelectItem>
                  <SelectItem value="tournament">Tournament Organization</SelectItem>
                  <SelectItem value="social">Social Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Community Description</Label>
              <Textarea 
                id="description" 
                placeholder="Tell potential members about your community..." 
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">Explain your community's mission, activities, and what makes it unique.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="primary-location">Primary Location</Label>
              <div className="flex gap-2">
                <Input 
                  id="primary-location" 
                  placeholder="City, State"
                  className="max-w-lg"
                />
                <Button variant="outline" size="icon">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">This helps players find communities in their area.</p>
            </div>
          </CardContent>
          <CardFooter className="justify-between pt-4 border-t">
            <div></div>
            <Button onClick={nextStep}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Step 2: Community Profile */}
      <div className={step === 2 ? 'block' : 'hidden'}>
        <Card>
          <CardHeader>
            <CardTitle>Community Profile</CardTitle>
            <CardDescription>
              Add visual elements and tags to help your community stand out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Community Logo</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-2">
                      <AvatarImage src={previewUrl} />
                      <AvatarFallback>Logo</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" onClick={() => setPreviewUrl('')} size="sm">
                      Change Logo
                    </Button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">Upload a Logo</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Recommended: Square image, at least 200x200px
                    </p>
                    <Button variant="outline" onClick={handlePhotoSelection}>
                      Select File
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Cover Photo</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                {previewUrl ? (
                  <div className="space-y-2">
                    <div className="h-40 bg-muted rounded-md overflow-hidden">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button variant="outline" onClick={() => setPreviewUrl('')} size="sm">
                      Change Cover Photo
                    </Button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">Upload a Cover Photo</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Recommended: 1200x400px, shows at the top of your community page
                    </p>
                    <Button variant="outline" onClick={handlePhotoSelection}>
                      Select File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          
            <div className="space-y-2">
              <Label>Tags (Select up to 5)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {EXAMPLE_TAGS.map(tag => (
                  <Badge 
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <CheckCircle className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Selected: {selectedTags.length}/5
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-between pt-4 border-t">
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={nextStep}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Step 3: Membership Settings */}
      <div className={step === 3 ? 'block' : 'hidden'}>
        <Card>
          <CardHeader>
            <CardTitle>Membership Settings</CardTitle>
            <CardDescription>
              Configure how players can join and participate in your community.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Membership Type</Label>
              <RadioGroup defaultValue="open" className="space-y-3">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="open" id="open" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="open" className="font-medium">Open Membership</Label>
                    <p className="text-sm text-muted-foreground">
                      Anyone can join instantly. Best for growing your community quickly.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="approval" id="approval" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="approval" className="font-medium">Approval Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Members must be approved by an admin. Best for communities that want to screen members.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="invite" id="invite" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="invite" className="font-medium">Invite Only</Label>
                    <p className="text-sm text-muted-foreground">
                      Members can only join with an invitation. Best for private or exclusive communities.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label>Skill Level Range</Label>
              <div className="flex space-x-4">
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="min-skill">Minimum Skill Level</Label>
                  <Select defaultValue="none">
                    <SelectTrigger>
                      <SelectValue placeholder="Select minimum skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Minimum (All Welcome)</SelectItem>
                      <SelectItem value="beginner">Beginner (1.0-2.5)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (3.0-3.5)</SelectItem>
                      <SelectItem value="advanced">Advanced (4.0+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="max-skill">Maximum Skill Level</Label>
                  <Select defaultValue="none">
                    <SelectTrigger>
                      <SelectValue placeholder="Select maximum skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Maximum (All Welcome)</SelectItem>
                      <SelectItem value="beginner">Beginner (1.0-2.5)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (3.0-3.5)</SelectItem>
                      <SelectItem value="advanced">Advanced (4.0+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Community Privacy</Label>
              <RadioGroup defaultValue="public" className="space-y-3">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="public" id="public" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="public" className="font-medium">
                      <Globe className="h-4 w-4 inline mr-1" />
                      Public
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Anyone can see your community, events, and members.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="limited" id="limited" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="limited" className="font-medium">
                      <Users className="h-4 w-4 inline mr-1" />
                      Limited Visibility
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Community is discoverable, but only members can see full details and events.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="private" id="private" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="private" className="font-medium">
                      <Shield className="h-4 w-4 inline mr-1" />
                      Private
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Only members can see your community exists. Not discoverable in searches.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label>Additional Options</Label>
              <div className="space-y-2">
                <div className="flex items-top space-x-2">
                  <Checkbox id="allow-members-post" className="mt-1" />
                  <div>
                    <Label htmlFor="allow-members-post" className="font-medium">Allow members to create posts</Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, all members can create posts and start discussions.
                    </p>
                  </div>
                </div>
                <div className="flex items-top space-x-2">
                  <Checkbox id="allow-members-events" className="mt-1" />
                  <div>
                    <Label htmlFor="allow-members-events" className="font-medium">Allow members to create events</Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, all members can create and manage community events.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between pt-4 border-t">
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={nextStep}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Step 4: Community Rules */}
      <div className={step === 4 ? 'block' : 'hidden'}>
        <Card>
          <CardHeader>
            <CardTitle>Community Rules & Guidelines</CardTitle>
            <CardDescription>
              Establish the standards for behavior and participation in your community.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="community-rules">Community Rules</Label>
              <Textarea 
                id="community-rules" 
                placeholder="Enter your community rules and guidelines..."
                className="min-h-[150px]"
                defaultValue={
                  "1. Be respectful to all members regardless of skill level.\n" +
                  "2. Follow the official rules of pickleball during play.\n" +
                  "3. Arrive on time for scheduled events and games.\n" +
                  "4. Help maintain court cleanliness and equipment.\n" +
                  "5. Support and encourage new players."
                }
              />
              <p className="text-xs text-muted-foreground">
                Clear rules help maintain a positive community atmosphere.
              </p>
            </div>
            
            <div className="space-y-3">
              <Label>Community Moderation</Label>
              <div className="space-y-2">
                <div className="flex items-top space-x-2">
                  <Checkbox id="code-of-conduct" defaultChecked className="mt-1" />
                  <div>
                    <Label htmlFor="code-of-conduct" className="font-medium">Enforce Pickle+ Code of Conduct</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically includes the platform's standard rules against harassment, discrimination, and unsportsmanlike behavior.
                    </p>
                  </div>
                </div>
                <div className="flex items-top space-x-2">
                  <Checkbox id="mod-approval" className="mt-1" />
                  <div>
                    <Label htmlFor="mod-approval" className="font-medium">Require post approval</Label>
                    <p className="text-sm text-muted-foreground">
                      Admins must approve all posts before they become visible to the community.
                    </p>
                  </div>
                </div>
                <div className="flex items-top space-x-2">
                  <Checkbox id="auto-moderation" defaultChecked className="mt-1" />
                  <div>
                    <Label htmlFor="auto-moderation" className="font-medium">Enable automated content filtering</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically filter inappropriate content and language.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Scheduled Play Expectations</Label>
              <div className="space-y-2">
                <div className="flex items-top space-x-2">
                  <Checkbox id="require-rsvp" defaultChecked className="mt-1" />
                  <div>
                    <Label htmlFor="require-rsvp" className="font-medium">Require RSVP for events</Label>
                    <p className="text-sm text-muted-foreground">
                      Members must RSVP to participate in scheduled events.
                    </p>
                  </div>
                </div>
                <div className="flex items-top space-x-2">
                  <Checkbox id="waitlist" defaultChecked className="mt-1" />
                  <div>
                    <Label htmlFor="waitlist" className="font-medium">Enable waitlists for full events</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow members to join a waitlist when events reach capacity.
                    </p>
                  </div>
                </div>
                <div className="flex items-top space-x-2">
                  <Checkbox id="no-show-policy" className="mt-1" />
                  <div>
                    <Label htmlFor="no-show-policy" className="font-medium">Enforce no-show policy</Label>
                    <p className="text-sm text-muted-foreground">
                      Track no-shows and temporarily restrict event registration after multiple occurrences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between pt-4 border-t">
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={nextStep}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Step 5: Review & Create */}
      <div className={step === 5 ? 'block' : 'hidden'}>
        <Card>
          <CardHeader>
            <CardTitle>Review & Create</CardTitle>
            <CardDescription>
              Review your community settings before launching.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="h-28 w-full max-w-md bg-gradient-to-r from-primary/40 to-primary rounded-t-lg"></div>
                  <div className="absolute -bottom-8 left-4 ring-4 ring-background p-1 rounded-2xl bg-background">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
              
              <div className="pt-8">
                <h3 className="text-xl font-bold">Seattle Pickleball Club</h3>
                <p className="text-sm text-muted-foreground">Open Membership • Public Community</p>
              </div>
              
              <div className="space-y-4 mt-4">
                <div className="p-3 bg-muted/40 rounded-lg">
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <Info className="h-4 w-4 mr-1" />
                    Basic Information
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    The largest pickleball community in Seattle with regular events and training sessions...
                  </p>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">Seattle, WA</span>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/40 rounded-lg">
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <Users className="h-4 w-4 mr-1" />
                    Membership Settings
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Open membership (anyone can join)</li>
                    <li>• All skill levels welcome</li>
                    <li>• Members can create posts</li>
                    <li>• Only admins can create events</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-muted/40 rounded-lg">
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <Shield className="h-4 w-4 mr-1" />
                    Rules & Moderation
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 5 community rules defined</li>
                    <li>• Pickle+ Code of Conduct enforced</li>
                    <li>• Automated content filtering enabled</li>
                    <li>• RSVP required for events</li>
                  </ul>
                </div>
                
                {/* PKL-278651-COMM-0031-CHLG-COMING-SOON: Coming Soon Challenges Banner */}
                <div className="mt-3 mb-3">
                  <ChallengeSoon 
                    communityName="Seattle Pickleball Club"
                    className="border border-dashed border-primary/50"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">Competitive</Badge>
                  <Badge variant="secondary">All Levels</Badge>
                  <Badge variant="secondary">Weekly Matches</Badge>
                  <Badge variant="secondary">Training</Badge>
                </div>
              </div>
              
              <div className="border p-4 rounded-lg bg-muted/20">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Community Launch Checklist
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="first-event" className="mt-0.5" />
                    <Label htmlFor="first-event" className="text-sm">Schedule your first event</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="invite-initial" className="mt-0.5" />
                    <Label htmlFor="invite-initial" className="text-sm">Invite initial members</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="welcome-post" className="mt-0.5" />
                    <Label htmlFor="welcome-post" className="text-sm">Create a welcome post</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="share-social" className="mt-0.5" />
                    <Label htmlFor="share-social" className="text-sm">Share on social media</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between pt-4 border-t">
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button>
              Create Community
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CommunityCreationMockup;