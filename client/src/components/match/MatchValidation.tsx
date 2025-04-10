/**
 * PKL-278651-VALMAT-0003-UX: Enhanced Match Validation UI
 * 
 * This component provides an improved UI for validating match results, 
 * including participant validation status visualization and progress tracking.
 */
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, formatDistance, isAfter } from 'date-fns';
import { RecordedMatch, matchSDK, ParticipantValidation } from '@/lib/sdk/matchSDK';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  AlertTriangle, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle,
  Trophy
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MatchValidationProps {
  match: RecordedMatch;
  onValidationComplete?: () => void;
}

export default function MatchValidation({ match, onValidationComplete }: MatchValidationProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'confirming' | 'disputing' | 'complete'>('pending');
  const [notes, setNotes] = useState('');
  const [feedbackTab, setFeedbackTab] = useState('validate');
  const [enjoymentRating, setEnjoymentRating] = useState<number>(5);
  const [skillMatchRating, setSkillMatchRating] = useState<number>(5);
  const [comments, setComments] = useState('');
  const { toast } = useToast();
  
  // Fetch validation details for enhanced UI
  const { data: validationDetails, isLoading: isLoadingValidations } = useQuery({
    queryKey: [`/api/match/${match.id}/validations`],
    queryFn: () => matchSDK.getMatchValidationDetails(match.id),
    enabled: !!match.id && status !== 'complete'
  });

  // Check if the current user has already validated
  useEffect(() => {
    if (validationDetails && user) {
      const userValidation = validationDetails.participantValidations.find(
        v => v.userId === user.id
      );
      
      if (userValidation && userValidation.status !== 'pending') {
        setStatus('complete');
      }
    }
  }, [validationDetails, user]);
  
  const handleConfirm = async () => {
    try {
      setStatus('confirming');
      await matchSDK.validateMatch(match.id, 'confirmed', notes);
      toast({
        title: "Match Confirmed",
        description: "You've successfully validated this match result.",
      });
      setStatus('complete');
      if (onValidationComplete) onValidationComplete();
      queryClient.invalidateQueries({ queryKey: ['/api/match/recent'] });
      queryClient.invalidateQueries({ queryKey: [`/api/match/${match.id}/validations`] });
    } catch (error) {
      console.error("Error confirming match:", error);
      toast({
        title: "Validation Failed",
        description: "There was an error confirming the match.",
        variant: "destructive",
      });
      setStatus('pending');
    }
  };
  
  const handleDispute = async () => {
    if (!notes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide details about why you're disputing this match.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setStatus('disputing');
      await matchSDK.validateMatch(match.id, 'disputed', notes);
      toast({
        title: "Match Disputed",
        description: "You've disputed this match result. An admin will review it.",
        variant: "destructive",
      });
      setStatus('complete');
      if (onValidationComplete) onValidationComplete();
      queryClient.invalidateQueries({ queryKey: ['/api/match/recent'] });
      queryClient.invalidateQueries({ queryKey: [`/api/match/${match.id}/validations`] });
    } catch (error) {
      console.error("Error disputing match:", error);
      toast({
        title: "Dispute Failed",
        description: "There was an error disputing the match.",
        variant: "destructive",
      });
      setStatus('pending');
    }
  };
  
  const handleProvideFeedback = async () => {
    try {
      await matchSDK.provideMatchFeedback(
        match.id, 
        enjoymentRating,
        skillMatchRating,
        comments
      );
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      setFeedbackTab('validate');
    } catch (error) {
      console.error("Error providing feedback:", error);
      toast({
        title: "Feedback Failed",
        description: "There was an error submitting your feedback.",
        variant: "destructive",
      });
    }
  };

  // Get participant status counts for progress bar
  const getStatusCounts = () => {
    if (!validationDetails?.participantValidations) {
      return { confirmed: 0, disputed: 0, pending: 0, total: 0 };
    }
    
    const validations = validationDetails.participantValidations;
    const confirmed = validations.filter(v => v.status === 'confirmed').length;
    const disputed = validations.filter(v => v.status === 'disputed').length;
    const pending = validations.filter(v => v.status === 'pending').length;
    
    return {
      confirmed,
      disputed,
      pending,
      total: validations.length
    };
  };

  const statusCounts = getStatusCounts();
  const validationProgress = statusCounts.total 
    ? Math.round(((statusCounts.confirmed + statusCounts.disputed) / statusCounts.total) * 100)
    : 0;
    
  // Calculate remaining time for validation if there's a deadline
  const getValidationTimeRemaining = () => {
    if (!validationDetails?.validationRequiredBy) return null;
    
    const deadline = parseISO(validationDetails.validationRequiredBy);
    const now = new Date();
    
    if (isAfter(now, deadline)) {
      return "Validation period has ended";
    }
    
    return formatDistance(deadline, now, { addSuffix: true });
  };

  // Helper to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50";
      case 'disputed':
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50";
      case 'pending':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50";
      case 'validated':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
      default:
        return "";
    }
  };

  // Helper to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'disputed':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'validated':
        return <ThumbsUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };
  
  // Check if current user has validated
  const hasUserValidated = () => {
    if (!user || !validationDetails?.participantValidations) return false;
    
    const userValidation = validationDetails.participantValidations.find(
      v => v.userId === user.id
    );
    
    return userValidation && userValidation.status !== 'pending';
  };

  // Show completed UI if the user has already validated
  if (hasUserValidated() || status === 'complete') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Match Validated
          </CardTitle>
          <CardDescription>
            Thank you for validating this match result
          </CardDescription>
        </CardHeader>
        
        {validationDetails && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Validation Progress</Label>
                  <span className="text-xs text-muted-foreground">{validationProgress}% Complete</span>
                </div>
                <div className="relative">
                  <Progress value={validationProgress} className="h-2" />
                </div>
              </div>
              
              <div className="border rounded-md p-3">
                <Label className="text-sm mb-2 block">Participant Status</Label>
                <div className="space-y-3">
                  {validationDetails.participantValidations.map((validation) => (
                    <div key={validation.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {match.playerNames?.[validation.userId]?.avatarInitials || 
                             match.playerNames?.[validation.userId]?.displayName?.charAt(0) || 
                             "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{match.playerNames?.[validation.userId]?.displayName || "Player"}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs flex items-center gap-1 ${getStatusColor(validation.status)}`}
                      >
                        {getStatusIcon(validation.status)}
                        <span className="capitalize">{validation.status}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              {validationDetails.validationStatus === 'disputed' && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md p-3 text-sm flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Match Disputed</p>
                    <p className="mt-1">This match has been disputed by at least one participant. An admin will review it.</p>
                  </div>
                </div>
              )}
              
              {validationDetails.validationStatus === 'validated' && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md p-3 text-sm flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Match Validated</p>
                    <p className="mt-1">All participants have confirmed this match result.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }
  
  // Loading state
  if (isLoadingValidations) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-64" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Validate Match Result</CardTitle>
        <CardDescription>
          Please review and confirm this match result
        </CardDescription>
        
        {/* Validation progress tracker */}
        {validationDetails && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Validation Progress</span>
              <span className="text-xs text-muted-foreground">{validationProgress}% Complete</span>
            </div>
            <div className="relative">
              <Progress value={validationProgress} className="h-2" />
            </div>
            
            {/* Display validation status counts */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>{statusCounts.confirmed} Confirmed</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                <span>{statusCounts.disputed} Disputed</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-yellow-500" />
                <span>{statusCounts.pending} Pending</span>
              </div>
            </div>
            
            {/* Validation timer if present */}
            {validationDetails.validationRequiredBy && (
              <div className="mt-3 text-xs flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                <span>Validation {getValidationTimeRemaining()}</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <Tabs value={feedbackTab} onValueChange={setFeedbackTab}>
        <TabsList className="w-full">
          <TabsTrigger value="validate" className="flex-1">Validate Result</TabsTrigger>
          <TabsTrigger value="feedback" className="flex-1">Provide Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="validate">
          <CardContent>
            <div className="space-y-4">
              {/* Match details with improved UI */}
              <div className="rounded-lg border p-4">
                <div className="font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Match Details
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {match.formatType === 'singles' ? 'Singles' : 'Doubles'} Match • {match.matchDate ? format(parseISO(match.matchDate), 'MMMM d, yyyy') : 'Unknown date'}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {match.playerNames?.[match.players?.[0]?.userId]?.avatarInitials || 
                         match.playerNames?.[match.players?.[0]?.userId]?.displayName?.charAt(0) || 
                         "P1"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{match.playerNames?.[match.players?.[0]?.userId]?.displayName || "Player 1"}</div>
                      <div className="text-sm text-muted-foreground">
                        {match.players?.[0]?.isWinner && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs">
                            Winner
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{match.players?.[0]?.score || 0}</div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {match.playerNames?.[match.players?.[1]?.userId]?.avatarInitials || 
                         match.playerNames?.[match.players?.[1]?.userId]?.displayName?.charAt(0) || 
                         "P2"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{match.playerNames?.[match.players?.[1]?.userId]?.displayName || "Player 2"}</div>
                      <div className="text-sm text-muted-foreground">
                        {match.players?.[1]?.isWinner && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs">
                            Winner
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{match.players?.[1]?.score || 0}</div>
                </div>

                {/* Display doubles partners if present */}
                {match.formatType === 'doubles' && match.players?.[0]?.partnerId && match.players?.[1]?.partnerId && (
                  <div className="mt-4 pt-3 border-t">
                    <div className="text-sm font-medium mb-2">Partners</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {match.playerNames?.[match.players?.[0]?.partnerId]?.avatarInitials || 
                             match.playerNames?.[match.players?.[0]?.partnerId]?.displayName?.charAt(0) || 
                             "P3"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">
                          {match.playerNames?.[match.players?.[0]?.partnerId]?.displayName || "Partner 1"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {match.playerNames?.[match.players?.[1]?.partnerId]?.avatarInitials || 
                             match.playerNames?.[match.players?.[1]?.partnerId]?.displayName?.charAt(0) || 
                             "P4"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">
                          {match.playerNames?.[match.players?.[1]?.partnerId]?.displayName || "Partner 2"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Participant validation status */}
              {validationDetails && validationDetails.participantValidations.length > 0 && (
                <div className="border rounded-md p-3">
                  <div className="text-sm font-medium mb-2">Validation Status</div>
                  <div className="space-y-2">
                    {validationDetails.participantValidations.map((validation) => {
                      // Skip showing the current user in this list
                      if (user && validation.userId === user.id) return null;
                      
                      return (
                        <div key={validation.userId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {match.playerNames?.[validation.userId]?.avatarInitials || 
                                 match.playerNames?.[validation.userId]?.displayName?.charAt(0) || 
                                 "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {match.playerNames?.[validation.userId]?.displayName || "Player"}
                            </span>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs flex items-center gap-1 ${getStatusColor(validation.status)}`}
                                >
                                  {getStatusIcon(validation.status)}
                                  <span className="capitalize">{validation.status}</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {validation.status === 'pending' ? 
                                  'Waiting for validation' : 
                                  validation.status === 'confirmed' ?
                                    'Confirmed match results' :
                                    'Disputed match results'}
                                {validation.validatedAt && (
                                  <div className="text-xs mt-1">
                                    {format(parseISO(validation.validatedAt), 'MMM d, h:mm a')}
                                  </div>
                                )}
                                {validation.notes && (
                                  <div className="text-xs mt-1 max-w-48">
                                    "{validation.notes}"
                                  </div>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Notes (required for disputes)</Label>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="If disputing, please explain why..." 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between space-x-2">
            <Button 
              variant="outline" 
              onClick={handleDispute} 
              className="flex-1"
              disabled={status !== 'pending'}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Dispute
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="flex-1"
              disabled={status !== 'pending'}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="feedback">
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>How enjoyable was this match? ({enjoymentRating}/10)</Label>
                <Slider 
                  value={[enjoymentRating]} 
                  min={1} 
                  max={10} 
                  step={1} 
                  onValueChange={(value) => setEnjoymentRating(value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <Label>How well matched were the skill levels? ({skillMatchRating}/10)</Label>
                <Slider 
                  value={[skillMatchRating]} 
                  min={1} 
                  max={10} 
                  step={1} 
                  onValueChange={(value) => setSkillMatchRating(value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Additional Comments (optional)</Label>
                <Textarea 
                  value={comments} 
                  onChange={(e) => setComments(e.target.value)} 
                  placeholder="Any other thoughts about this match..." 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleProvideFeedback} 
              className="w-full"
              disabled={status !== 'pending'}
            >
              Submit Feedback
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
}