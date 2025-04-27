/**
 * PKL-278651-JOUR-001.3: Journal Timeline Component
 * 
 * A component that displays journal entries in a timeline format
 * with rich formatting and emotional context.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { useJournalEntry } from '../hooks/useJournalEntry';
import { format } from 'date-fns';
import { JournalEntry, EmotionalState } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, BookOpen, Calendar, Clock, Eye, Pencil, Trash2 } from 'lucide-react';

interface JournalTimelineProps {
  className?: string;
  limit?: number;
  emotionalState?: EmotionalState;
}

/**
 * Component that displays journal entries in a timeline
 */
export function JournalTimeline({ className, limit = 10, emotionalState }: JournalTimelineProps) {
  const { entries, getEntries, deleteEntry } = useJournalEntry();
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  
  // Format tags as a string
  const formatTags = (tags?: string[]) => {
    if (!tags || tags.length === 0) return 'No tags';
    return tags.join(', ');
  };
  
  // Get visibility label
  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return 'Private';
      case 'coach-shared':
        return 'Coach Only';
      case 'team-shared':
        return 'Team';
      case 'public':
        return 'Public';
      default:
        return 'Private';
    }
  };
  
  // Get the emotion color class
  const getEmotionColorClass = (emotion: EmotionalState) => {
    switch (emotion) {
      case 'frustrated-disappointed':
        return 'border-red-500';
      case 'anxious-uncertain':
        return 'border-amber-500';
      case 'neutral-focused':
        return 'border-blue-500';
      case 'excited-proud':
        return 'border-green-500';
      case 'determined-growth':
        return 'border-purple-500';
      default:
        return 'border-gray-500';
    }
  };
  
  // Get the emotion label
  const getEmotionLabel = (emotion: EmotionalState) => {
    switch (emotion) {
      case 'frustrated-disappointed':
        return 'Frustrated';
      case 'anxious-uncertain':
        return 'Anxious';
      case 'neutral-focused':
        return 'Neutral';
      case 'excited-proud':
        return 'Excited';
      case 'determined-growth':
        return 'Determined';
      default:
        return 'Unknown';
    }
  };
  
  // Get filtered entries
  const filteredEntries = emotionalState 
    ? getEntries({ limit, emotionalState }) 
    : getEntries({ limit });
  
  // Handle entry deletion
  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      deleteEntry(id);
    }
  };
  
  // Handle entry expansion
  const toggleExpand = (id: string) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <BookOpen className="h-5 w-5 mr-2" />
          Recent Journal Entries
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredEntries.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No journal entries found.</p>
            <p className="text-sm mt-1">Start journaling to track your pickleball journey!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div 
                key={entry.id} 
                className={`border-l-4 pl-4 pb-4 ${getEmotionColorClass(entry.emotionalState)}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg">{entry.title}</h3>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => toggleExpand(entry.id || '')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-red-600" 
                      onClick={() => handleDeleteEntry(entry.id || '')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground mt-1 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{format(new Date(entry.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{format(new Date(entry.createdAt), 'h:mm a')}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    <span>{getVisibilityLabel(entry.visibility)}</span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <Badge variant="outline">
                    {getEmotionLabel(entry.emotionalState)}
                  </Badge>
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={`mt-2 text-sm ${expandedEntryId === entry.id ? '' : 'line-clamp-2'}`}>
                  {entry.content}
                </div>
                
                {expandedEntryId !== entry.id && entry.content.length > 100 && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-1 h-auto p-0" 
                    onClick={() => toggleExpand(entry.id || '')}
                  >
                    Read more
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default JournalTimeline;