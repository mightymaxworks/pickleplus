import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserCog, Calendar, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfileColorsByLevel } from "@/hooks/useXPTier";

interface RequestCoachConnectionProps {
  coach: {
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;
    level?: number;
    isPCPCertified?: boolean;
    yearsCoaching?: number;
    bio?: string;
  };
  onRequestSent?: () => void;
}

export function RequestCoachConnection({ coach, onRequestSent }: RequestCoachConnectionProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const colors = getProfileColorsByLevel(coach.level || 1);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await apiRequest('POST', '/api/connections', {
        recipientId: coach.id,
        type: 'coach',
        message
      });
      
      // Invalidate any connections queries
      await queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      
      toast({
        title: "Request Sent",
        description: `Your coaching request has been sent to ${coach.displayName || coach.username}.`,
      });
      
      // Reset form
      setMessage("");
      
      // Call the callback if provided
      if (onRequestSent) {
        onRequestSent();
      }
    } catch (error) {
      console.error('Error sending coach request:', error);
      toast({
        title: "Request Failed",
        description: "There was an error sending your coaching request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserCog className="mr-2 h-5 w-5" />
          Request {coach.displayName || coach.username} as Your Coach
        </CardTitle>
        <CardDescription>
          Connect with a coach to get personalized guidance and improve your game
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
          <Avatar className={`h-16 w-16 border-2 ${colors.border}`}>
            <AvatarImage src={coach.profilePicture} />
            <AvatarFallback className={colors.bg}>
              {coach.username?.substring(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{coach.displayName || coach.username}</h3>
            <div className="flex items-center mt-1 space-x-4 text-sm text-muted-foreground">
              {coach.isPCPCertified && (
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  <span>Certified</span>
                </div>
              )}
              {coach.yearsCoaching && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{coach.yearsCoaching} {coach.yearsCoaching === 1 ? 'year' : 'years'} coaching</span>
                </div>
              )}
            </div>
            {coach.bio && (
              <p className="mt-2 text-sm line-clamp-2">{coach.bio}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message (optional)
          </label>
          <Textarea
            id="message"
            placeholder="Introduce yourself and let them know why you'd like them as your coach..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="resize-none"
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Request"}
        </Button>
      </CardFooter>
    </Card>
  );
}