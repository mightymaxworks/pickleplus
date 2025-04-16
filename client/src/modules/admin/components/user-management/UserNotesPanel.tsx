/**
 * PKL-278651-ADMIN-0015-USER
 * User Notes Panel
 * 
 * This component displays and allows admin users to add notes to a user account
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Info, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDateTime } from '@/lib/utils';
import { addUserNote } from '@/lib/api/admin/user-management';
import { AdminUserNote } from '@shared/types/admin/user-management';

interface UserNotesPanelProps {
  userId: number;
  notes: AdminUserNote[];
}

export function UserNotesPanel({ userId, notes }: UserNotesPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle submit new note
  const handleSubmit = async () => {
    if (!newNote.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await addUserNote(userId, { note: newNote, visibility: 'admin' });
      
      // Reset form
      setNewNote('');
      setIsAdding(false);
      
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      
      toast({
        title: 'Note Added',
        description: 'The note has been added to the user profile.',
      });
    } catch (error) {
      console.error('Failed to add note:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Add Note',
        description: 'There was an error adding the note. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Admin Notes</CardTitle>
            <CardDescription>
              Add notes and observations about this user
            </CardDescription>
          </div>
          
          {!isAdding && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setIsAdding(true)}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Note</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add note form */}
        {isAdding && (
          <div className="space-y-2">
            <Textarea
              placeholder="Enter note content..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewNote('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newNote.trim() || isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </div>
        )}
        
        {/* Note list */}
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="p-4 rounded-md border">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold">
                        {note.authorName || `Admin #${note.authorId}`}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-line">{note.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <Info className="h-10 w-10 mb-2 opacity-20" />
            <p>No notes have been added to this user profile yet.</p>
            {!isAdding && (
              <Button
                variant="link"
                className="mt-2"
                onClick={() => setIsAdding(true)}
              >
                Add the first note
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}