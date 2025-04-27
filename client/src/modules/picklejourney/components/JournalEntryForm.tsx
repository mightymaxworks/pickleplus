/**
 * PKL-278651-JOUR-001.3: Journal Entry Form Component
 * 
 * A form component that allows users to create journal entries
 * with automated emotion detection.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useJournalEntry } from '../hooks/useJournalEntry';
import { useEmotionDetection } from '../hooks/useEmotionDetection';
import { JournalVisibility, EmotionalState } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LucideBookOpen, LucideEye, LucideFrown, LucideMeh, LucideSmile, LucideAward, LucideBrain } from 'lucide-react';

interface JournalEntryFormProps {
  className?: string;
}

/**
 * Form for creating journal entries with emotion detection
 */
export function JournalEntryForm({ className }: JournalEntryFormProps) {
  const { createEntry } = useJournalEntry();
  const { currentEmotionalState, detectEmotionFromText } = useEmotionDetection();
  const { toast } = useToast();
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<JournalVisibility>('private');
  const [emotionalState, setEmotionalState] = useState<EmotionalState>(currentEmotionalState);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Update emotional state when currentEmotionalState changes
  useEffect(() => {
    setEmotionalState(currentEmotionalState);
  }, [currentEmotionalState]);
  
  // Handle content changes with debounced emotion detection
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Only perform emotion detection if content is substantial
    if (newContent.length > 30) {
      // Debounce emotion detection to avoid too many analyses
      setIsAnalyzing(true);
      const timerId = setTimeout(() => {
        const detectionResult = detectEmotionFromText(newContent);
        if (detectionResult.confidence > 0.5) {
          setEmotionalState(detectionResult.primaryEmotion);
        }
        setIsAnalyzing(false);
      }, 1000);
      
      return () => clearTimeout(timerId);
    }
  };
  
  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Submit the journal entry
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please add a title for your journal entry.",
        variant: "destructive"
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content to your journal entry.",
        variant: "destructive"
      });
      return;
    }
    
    // Create the new entry
    const newEntry = createEntry({
      title,
      content,
      emotionalState,
      visibility,
      createdAt: new Date(),
      tags,
      analyzed: true
    });
    
    // Success message
    toast({
      title: "Journal Entry Saved",
      description: "Your thoughts have been recorded successfully.",
      variant: "default"
    });
    
    // Reset form
    setTitle('');
    setContent('');
    setTags([]);
    setTagInput('');
  };
  
  // Get emotion icon
  const getEmotionIcon = (emotion: EmotionalState) => {
    switch (emotion) {
      case 'frustrated-disappointed':
        return <LucideFrown className="h-4 w-4 mr-1 text-red-500" />;
      case 'anxious-uncertain':
        return <LucideMeh className="h-4 w-4 mr-1 text-amber-500" />;
      case 'neutral-focused':
        return <LucideMeh className="h-4 w-4 mr-1 text-blue-500" />;
      case 'excited-proud':
        return <LucideSmile className="h-4 w-4 mr-1 text-green-500" />;
      case 'determined-growth':
        return <LucideAward className="h-4 w-4 mr-1 text-purple-500" />;
      default:
        return <LucideMeh className="h-4 w-4 mr-1" />;
    }
  };
  
  // Get emotion label
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
        return 'Neutral';
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LucideBookOpen className="h-5 w-5 mr-2" />
          New Journal Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your entry a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          {/* Content textarea */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <div className="relative">
              <Textarea
                id="content"
                placeholder="Write about your pickleball experience today..."
                className="min-h-[150px]"
                value={content}
                onChange={handleContentChange}
              />
              {isAnalyzing && (
                <div className="absolute bottom-2 right-2">
                  <Badge variant="outline" className="animate-pulse flex items-center">
                    <LucideBrain className="h-3 w-3 mr-1" />
                    Analyzing...
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Emotion and visibility selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emotional state */}
            <div className="space-y-2">
              <Label htmlFor="emotional-state">How are you feeling?</Label>
              <Select 
                value={emotionalState} 
                onValueChange={(value) => setEmotionalState(value as EmotionalState)}
              >
                <SelectTrigger id="emotional-state">
                  <SelectValue>
                    <div className="flex items-center">
                      {getEmotionIcon(emotionalState)}
                      {getEmotionLabel(emotionalState)}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frustrated-disappointed">
                    <div className="flex items-center">
                      <LucideFrown className="h-4 w-4 mr-1 text-red-500" />
                      Frustrated
                    </div>
                  </SelectItem>
                  <SelectItem value="anxious-uncertain">
                    <div className="flex items-center">
                      <LucideMeh className="h-4 w-4 mr-1 text-amber-500" />
                      Anxious
                    </div>
                  </SelectItem>
                  <SelectItem value="neutral-focused">
                    <div className="flex items-center">
                      <LucideMeh className="h-4 w-4 mr-1 text-blue-500" />
                      Neutral
                    </div>
                  </SelectItem>
                  <SelectItem value="excited-proud">
                    <div className="flex items-center">
                      <LucideSmile className="h-4 w-4 mr-1 text-green-500" />
                      Excited
                    </div>
                  </SelectItem>
                  <SelectItem value="determined-growth">
                    <div className="flex items-center">
                      <LucideAward className="h-4 w-4 mr-1 text-purple-500" />
                      Determined
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Visibility */}
            <div className="space-y-2">
              <Label htmlFor="visibility">Who can see this?</Label>
              <Select 
                value={visibility} 
                onValueChange={(value) => setVisibility(value as JournalVisibility)}
              >
                <SelectTrigger id="visibility">
                  <SelectValue>
                    <div className="flex items-center">
                      <LucideEye className="h-4 w-4 mr-1" />
                      {visibility === 'private' && 'Private'}
                      {visibility === 'coach-shared' && 'Share with Coach'}
                      {visibility === 'team-shared' && 'Share with Team'}
                      {visibility === 'public' && 'Public'}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (Only You)</SelectItem>
                  <SelectItem value="coach-shared">Coach Only</SelectItem>
                  <SelectItem value="team-shared">Team Members</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Press Enter to add)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="tags"
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
              />
            </div>
            
            {/* Tag display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit button */}
          <Button type="submit" className="w-full">Save Journal Entry</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default JournalEntryForm;