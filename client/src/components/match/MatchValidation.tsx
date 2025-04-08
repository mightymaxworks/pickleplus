import React, { useState } from 'react';
import { RecordedMatch, matchSDK } from '@/lib/sdk/matchSDK';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface MatchValidationProps {
  match: RecordedMatch;
  onValidationComplete?: () => void;
}

export default function MatchValidation({ match, onValidationComplete }: MatchValidationProps) {
  const [status, setStatus] = useState<'pending' | 'confirming' | 'disputing' | 'complete'>('pending');
  const [notes, setNotes] = useState('');
  const [feedbackTab, setFeedbackTab] = useState('feedback');
  const [enjoymentRating, setEnjoymentRating] = useState<number>(5);
  const [skillMatchRating, setSkillMatchRating] = useState<number>(5);
  const [comments, setComments] = useState('');
  const { toast } = useToast();
  
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
      await matchSDK.provideMatchFeedback(match.id, {
        enjoymentRating,
        skillMatchRating,
        comments
      });
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
  
  if (status === 'complete') {
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
      </CardHeader>
      
      <Tabs value={feedbackTab} onValueChange={setFeedbackTab}>
        <TabsList className="w-full">
          <TabsTrigger value="feedback" className="flex-1">Provide Feedback</TabsTrigger>
          <TabsTrigger value="validate" className="flex-1">Validate Result</TabsTrigger>
        </TabsList>
        
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
        
        <TabsContent value="validate">
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <div className="font-medium">Match Details</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {match.formatType === 'singles' ? 'Singles' : 'Doubles'} Match • {match.date.slice(0, 10)}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div>
                    <div className="font-medium">{match.playerNames[match.players[0].userId]?.displayName}</div>
                    <div className="text-sm text-muted-foreground">
                      {match.players[0].isWinner && "Winner"}
                    </div>
                  </div>
                  <div className="text-xl font-bold">{match.players[0].score}</div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <div className="font-medium">{match.playerNames[match.players[1].userId]?.displayName}</div>
                    <div className="text-sm text-muted-foreground">
                      {match.players[1].isWinner && "Winner"}
                    </div>
                  </div>
                  <div className="text-xl font-bold">{match.players[1].score}</div>
                </div>
              </div>
              
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
      </Tabs>
    </Card>
  );
}