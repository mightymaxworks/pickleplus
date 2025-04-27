import React, { useState } from 'react';
import { Award, Check, Edit2, Info, Star, Medal, Globe, Flag, BookOpen } from 'lucide-react';
import { EnhancedUser } from '@/types/enhanced-user';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ExternalRatingsProps {
  user: EnhancedUser;
  isEditable?: boolean;
  isCurrentUser?: boolean;
  isEditMode?: boolean;
  onSaveSuccess?: () => void;
}

// Rating system icons
const RATING_SYSTEM_ICONS = {
  DUPR: <Star className="h-5 w-5" />,
  UTPR: <Medal className="h-5 w-5" />,
  WPR: <Globe className="h-5 w-5" />,
  IFP: <Flag className="h-5 w-5" />,
  IPTPA: <BookOpen className="h-5 w-5" />
};

// Rating system descriptions
const RATING_SYSTEM_DESCRIPTIONS = {
  DUPR: "DUPR is a global rating system used across all platforms and events with ratings from 2.0-7.0 that change based on match results.",
  UTPR: "UTPR is the official rating system of USA Pickleball with ratings from 1.0-6.5 used for tournament eligibility.",
  WPR: "WPR provides international ratings based on tournament and league play with a system that updates based on performance against opponents of known ratings.",
  IFP: "IFP uses a rating system with a scale from 1.0-5.0 that is primarily used for international tournament play and rankings.",
  IPTPA: "IPTPA provides ratings from 1.0-5.0 for teaching professionals and players, focusing on both skill level and teaching ability."
};

export function ExternalRatingsSection({ user, isEditable = false, isCurrentUser = false, isEditMode = false, onSaveSuccess }: ExternalRatingsProps) {
  const { toast } = useToast();
  // Initialize editing state based on isEditMode
  const [isEditing, setIsEditing] = useState(isEditMode);
  // Default active tab
  const [activeTab, setActiveTab] = useState("DUPR");
  
  const [form, setForm] = useState({
    duprRating: user.duprRating || '',
    duprProfileUrl: user.duprProfileUrl || '',
    utprRating: user.utprRating || '',
    utprProfileUrl: user.utprProfileUrl || '',
    wprRating: user.wprRating || '',
    wprProfileUrl: user.wprProfileUrl || '',
    ifpRating: user.ifpRating || '',
    ifpProfileUrl: user.ifpProfileUrl || '',
    iptpaRating: user.iptpaRating || '',
    iptpaProfileUrl: user.iptpaProfileUrl || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate rating formats
      if (form.duprRating && !/^\d+(\.\d{1,2})?$/.test(String(form.duprRating))) {
        toast({
          title: "Invalid DUPR Rating",
          description: "Please enter a valid rating (e.g., 4.5)",
          variant: "destructive",
        });
        return;
      }
      
      if (form.utprRating && !/^\d+(\.\d{1,2})?$/.test(String(form.utprRating))) {
        toast({
          title: "Invalid UTPR Rating",
          description: "Please enter a valid rating (e.g., 4.5)",
          variant: "destructive",
        });
        return;
      }
      
      if (form.wprRating && !/^\d+(\.\d{1,2})?$/.test(String(form.wprRating))) {
        toast({
          title: "Invalid WPR Rating",
          description: "Please enter a valid rating (e.g., 4.5)",
          variant: "destructive",
        });
        return;
      }
      
      if (form.ifpRating && !/^\d+(\.\d{1,2})?$/.test(String(form.ifpRating))) {
        toast({
          title: "Invalid IFP Rating",
          description: "Please enter a valid rating (e.g., 3.5)",
          variant: "destructive",
        });
        return;
      }
      
      if (form.iptpaRating && !/^\d+(\.\d{1,2})?$/.test(String(form.iptpaRating))) {
        toast({
          title: "Invalid IPTPA Rating",
          description: "Please enter a valid rating (e.g., 3.5)",
          variant: "destructive",
        });
        return;
      }
      
      // Create update data
      const updateData = {
        userId: user.id,
        duprRating: form.duprRating || null,
        duprProfileUrl: form.duprProfileUrl || null,
        utprRating: form.utprRating || null,
        utprProfileUrl: form.utprProfileUrl || null,
        wprRating: form.wprRating || null,
        wprProfileUrl: form.wprProfileUrl || null,
        ifpRating: form.ifpRating || null,
        ifpProfileUrl: form.ifpProfileUrl || null,
        iptpaRating: form.iptpaRating || null,
        iptpaProfileUrl: form.iptpaProfileUrl || null,
        lastExternalRatingUpdate: new Date().toISOString(),
      };
      
      console.log('Submitting external ratings update:', updateData);
      
      const response = await apiRequest('POST', '/api/profile/update-external-ratings', updateData);
      
      // Reset form to view mode
      setIsEditing(false);
      
      // Invalidate cached user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      
      // Call onSaveSuccess callback if provided
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
      toast({
        title: "External Ratings Updated",
        description: "Your rating information has been updated and is pending verification.",
      });
    } catch (error) {
      console.error('Error updating external ratings:', error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your ratings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (date?: Date | string) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const renderRatingSection = (
    system: string, 
    rating?: string | number, 
    profileUrl?: string, 
    description?: string
  ) => {
    if (isEditing) {
      return (
        <div className="space-y-3 mb-4">
          <div className="space-y-1">
            <Label htmlFor={`${system.toLowerCase()}Rating`}>{system} Rating</Label>
            <Input
              id={`${system.toLowerCase()}Rating`}
              name={`${system.toLowerCase()}Rating`}
              value={form[`${system.toLowerCase()}Rating` as keyof typeof form] || ''}
              onChange={handleChange}
              placeholder={`Enter your ${system} rating (e.g., 4.5)`}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor={`${system.toLowerCase()}ProfileUrl`}>{system} Player ID</Label>
            <Input
              id={`${system.toLowerCase()}ProfileUrl`}
              name={`${system.toLowerCase()}ProfileUrl`}
              value={form[`${system.toLowerCase()}ProfileUrl` as keyof typeof form] || ''}
              onChange={handleChange}
              placeholder={`Enter your ${system} player ID for verification`}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="font-medium">{system} Rating</div>
          {rating && user.externalRatingsVerified && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
              <Check className="h-3 w-3" /> Verified
            </Badge>
          )}
          {rating && !user.externalRatingsVerified && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Pending Verification
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {rating ? (
            <div className="text-2xl font-bold">{rating}</div>
          ) : (
            <div className="text-muted-foreground italic">Not provided</div>
          )}
          
          {profileUrl && (
            <span className="text-sm text-muted-foreground">
              Player ID: {profileUrl}
            </span>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Official Rating Systems</CardTitle>
          </div>
          
          {isEditable && isCurrentUser && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs h-8"
            >
              {isEditing ? 'Cancel' : (
                <>
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  Edit
                </>
              )}
            </Button>
          )}
        </div>
        
        <CardDescription>
          Add your official ratings from verified pickleball rating systems.
          {user.lastExternalRatingUpdate && (
            <span className="block text-xs mt-1">
              Last updated: {formatDate(user.lastExternalRatingUpdate)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="bg-muted/50 p-3 rounded-md mb-4">
              <p className="text-sm text-muted-foreground">
                <Info className="h-4 w-4 inline mr-1" />
                Add your ratings from official systems along with your player ID for verification.
                All submissions will be marked as "Pending Verification" until an admin reviews them.
              </p>
            </div>
            
            {renderRatingSection('DUPR', user.duprRating, user.duprProfileUrl)}
            <Separator className="my-3" />
            
            {renderRatingSection('UTPR', user.utprRating, user.utprProfileUrl)}
            <Separator className="my-3" />
            
            {renderRatingSection('WPR', user.wprRating, user.wprProfileUrl)}
            <Separator className="my-3" />
            
            {renderRatingSection('IFP', user.ifpRating !== undefined ? String(user.ifpRating) : undefined, user.ifpProfileUrl)}
            <Separator className="my-3" />
            
            {renderRatingSection('IPTPA', user.iptpaRating !== undefined ? String(user.iptpaRating) : undefined, user.iptpaProfileUrl)}
            
            <div className="flex justify-end mt-4">
              <Button type="submit" className="w-full sm:w-auto">
                Save Rating Information
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 mb-6">
                {Object.entries(RATING_SYSTEM_ICONS).map(([system, icon]) => (
                  <TabsTrigger key={system} value={system} className="flex items-center gap-1 data-[state=active]:bg-primary/10">
                    <div className={`${activeTab === system ? 'text-primary' : 'text-muted-foreground'}`}>
                      {icon}
                    </div>
                    <span className="hidden md:inline">{system}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Object.entries(RATING_SYSTEM_ICONS).map(([system, _]) => (
                <TabsContent key={system} value={system} className="pt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold text-lg">
                      {system === 'DUPR' && 'Dynamic Universal Pickleball Rating'}
                      {system === 'UTPR' && 'USA Pickleball Tournament Player Rating'}
                      {system === 'WPR' && 'World Pickleball Rating'}
                      {system === 'IFP' && 'International Federation of Pickleball'}
                      {system === 'IPTPA' && 'International Pickleball Teaching Professional Association'}
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {RATING_SYSTEM_DESCRIPTIONS[system as keyof typeof RATING_SYSTEM_DESCRIPTIONS]}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  {system === 'DUPR' && renderRatingSection(
                    'DUPR', 
                    user.duprRating, 
                    user.duprProfileUrl
                  )}
                  
                  {system === 'UTPR' && renderRatingSection(
                    'UTPR', 
                    user.utprRating, 
                    user.utprProfileUrl
                  )}
                  
                  {system === 'WPR' && renderRatingSection(
                    'WPR', 
                    user.wprRating, 
                    user.wprProfileUrl
                  )}
                  
                  {system === 'IFP' && renderRatingSection(
                    'IFP', 
                    user.ifpRating !== undefined ? String(user.ifpRating) : undefined, 
                    user.ifpProfileUrl
                  )}
                  
                  {system === 'IPTPA' && renderRatingSection(
                    'IPTPA', 
                    user.iptpaRating !== undefined ? String(user.iptpaRating) : undefined, 
                    user.iptpaProfileUrl
                  )}
                </TabsContent>
              ))}
            </Tabs>
            
            {!user.duprRating && !user.utprRating && !user.wprRating && !user.ifpRating && !user.iptpaRating && (
              <div className="bg-muted/50 p-4 rounded-md text-center">
                <p className="text-muted-foreground">
                  No external ratings have been added yet.
                  {isEditable && isCurrentUser && " Click Edit to add your official ratings."}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}