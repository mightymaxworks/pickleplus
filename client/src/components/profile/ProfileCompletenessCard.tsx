import { CheckCircle2, AlertCircle } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";

interface ProfileCompletenessCardProps {
  user: any;
  profileCompletion: number;
}

export function ProfileCompletenessCard({ user, profileCompletion }: ProfileCompletenessCardProps) {
  // List of fields that should be filled out
  const requiredFields = [
    { name: 'location', label: 'Add your location' },
    { name: 'playingSince', label: 'Add when you started playing' },
    { name: 'skillLevel', label: 'Add your skill level' },
    { name: 'bio', label: 'Add a short bio' },
    { name: 'paddleBrand', label: 'Add your paddle brand' },
    { name: 'paddleModel', label: 'Add your paddle model' },
    { name: 'preferredPosition', label: 'Add your preferred position' },
    { name: 'dominantHand', label: 'Add your dominant hand' },
    { name: 'playingStyle', label: 'Add your playing style' }
  ];

  // Filter missing fields
  const missingFields = requiredFields.filter(field => !user[field.name]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" /> 
          Profile Completeness
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Completion: <span className="font-semibold">{profileCompletion}%</span></span>
            <Button variant="link" className="p-0 h-auto text-[#2196F3]" asChild>
              <Link to="/profile/edit">Complete Profile</Link>
            </Button>
          </div>
          
          <Progress 
            value={profileCompletion} 
            className="h-2" 
            indicatorClassName={`${
              profileCompletion < 40 ? 'bg-[#FF5722]' :
              profileCompletion < 70 ? 'bg-[#FFC107]' :
              'bg-[#4CAF50]'
            }`} 
          />
          
          {missingFields.length > 0 && (
            <div className="grid grid-cols-1 gap-2 mt-2">
              {missingFields.slice(0, 3).map((field, index) => (
                <div key={index} className="flex items-center text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mr-2 text-[#FF5722]" />
                  <span>{field.label}</span>
                </div>
              ))}
              
              {missingFields.length > 3 && (
                <div className="text-xs text-muted-foreground text-center mt-1">
                  + {missingFields.length - 3} more fields to complete
                </div>
              )}
            </div>
          )}
          
          {missingFields.length === 0 && (
            <div className="flex items-center text-sm text-[#4CAF50] mt-2">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span>Your profile is complete! Great job!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}