/**
 * PKL-278651-SPUI-0001: Profile Overview Tab
 * Main tab with essential player information and contextual editing
 */
import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Calendar, Clock, Type, User, Bookmark, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProfileOverviewTabProps {
  user: any;
}

interface ProfileField {
  label: string;
  key: string;
  value: string | number | null;
  icon: JSX.Element;
  xpValue: number;
  isEditable?: boolean;
}

const ProfileOverviewTab: FC<ProfileOverviewTabProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Calculate profile completion
  const profileCompletion = user.profileCompletionPct || 0;
  
  // Essential fields for the overview tab with their XP values
  const essentialFields: ProfileField[] = [
    {
      label: 'Bio',
      key: 'bio',
      value: user.bio,
      icon: <Type className="h-4 w-4" />,
      xpValue: 15,
      isEditable: true,
    },
    {
      label: 'Playing Since',
      key: 'playingSince',
      value: user.playingSince,
      icon: <Clock className="h-4 w-4" />,
      xpValue: 10,
      isEditable: true,
    },
    {
      label: 'Year of Birth',
      key: 'yearOfBirth',
      value: user.yearOfBirth,
      icon: <Calendar className="h-4 w-4" />,
      xpValue: 10,
      isEditable: true,
    },
    {
      label: 'Playing Style',
      key: 'playingStyle',
      value: formatPlayingStyle(user.playingStyle),
      icon: <User className="h-4 w-4" />,
      xpValue: 15,
      isEditable: true,
    },
    {
      label: 'Player Goals',
      key: 'playerGoals',
      value: user.playerGoals,
      icon: <Award className="h-4 w-4" />,
      xpValue: 20,
      isEditable: true,
    },
    {
      label: 'Shot Strengths',
      key: 'shotStrengths',
      value: formatShotStrengths(user.shotStrengths),
      icon: <Bookmark className="h-4 w-4" />,
      xpValue: 15,
      isEditable: true,
    },
  ];

  // Start editing a field
  const handleEdit = (field: ProfileField) => {
    if (field.isEditable) {
      setIsEditing(field.key);
      setEditValue(field.value?.toString() || '');
    }
  };

  // Save the edited field
  const handleSave = async (field: ProfileField) => {
    try {
      await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          [field.key]: editValue
        })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      setIsEditing(null);
      
      toast({
        title: 'Field updated',
        description: `Your ${field.label.toLowerCase()} has been updated.`,
      });
    } catch (err) {
      console.error('Error updating field:', err);
      toast({
        title: 'Update failed',
        description: 'Failed to update the field.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Completion Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Profile {profileCompletion}% complete</span>
              <span className="text-primary font-medium">
                {Math.floor(profileCompletion * 0.8)} XP earned
              </span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Complete your profile to unlock XP bonuses and enhanced matchmaking features.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Player Information Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Player Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {essentialFields.map((field) => (
              <div key={field.key} className="group">
                {isEditing === field.key ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    <div className="flex gap-2">
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md"
                      />
                      <Button size="sm" onClick={() => handleSave(field)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
                    </div>
                    {!field.value && (
                      <div className="text-xs text-primary">+{field.xpValue} XP for completing this field</div>
                    )}
                  </div>
                ) : (
                  <div 
                    className="flex items-start hover:bg-muted/50 p-2 rounded-md -mx-2 cursor-pointer"
                    onClick={() => handleEdit(field)}
                  >
                    <div className="mr-2 mt-0.5 text-muted-foreground">
                      {field.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{field.label}</div>
                      <div className="text-sm">
                        {field.value ? (
                          field.value
                        ) : (
                          <span className="text-muted-foreground italic">
                            Not specified <span className="text-xs text-primary ml-1">+{field.xpValue} XP</span>
                          </span>
                        )}
                      </div>
                    </div>
                    {field.isEditable && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="opacity-0 group-hover:opacity-100"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions to format fields nicely
function formatPlayingStyle(style: string | null): string {
  if (!style) return '';
  
  const styles: Record<string, string> = {
    'aggressive': 'Aggressive',
    'defensive': 'Defensive',
    'strategic': 'Strategic',
    'all-court': 'All-Court',
    'baseline': 'Baseline',
    'net-rusher': 'Net Rusher',
  };
  
  return styles[style] || style;
}

function formatShotStrengths(strengths: string | null): string {
  if (!strengths) return '';
  
  const strengthMap: Record<string, string> = {
    'third-shot-drops': 'Third Shot Drops',
    'dinks': 'Dinks',
    'drives': 'Drives',
    'lobs': 'Lobs',
    'volleys': 'Volleys',
    'serves': 'Serves',
    'returns': 'Returns',
    'passing-shots': 'Passing Shots',
  };
  
  if (strengthMap[strengths]) {
    return strengthMap[strengths];
  }
  
  return strengths;
}

export default ProfileOverviewTab;