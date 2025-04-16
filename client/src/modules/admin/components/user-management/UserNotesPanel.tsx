/**
 * PKL-278651-ADMIN-0015-USER
 * User Notes Panel Component
 * 
 * Displays admin notes for a user and allows adding new notes
 */

import { useState } from 'react';
import { AdminUserNote } from '../../../../shared/types/admin/user-management';
import { formatDistance } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Shield, User } from 'lucide-react';

interface UserNotesPanelProps {
  notes: AdminUserNote[];
  onAddNote: (noteData: { note: string; visibility: 'admin' | 'system' }) => void;
  isAddingNote: boolean;
}

export const UserNotesPanel = ({ notes, onAddNote, isAddingNote }: UserNotesPanelProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [visibility, setVisibility] = useState<'admin' | 'system'>('admin');
  
  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote({
        note: newNote.trim(),
        visibility
      });
      setNewNote('');
      setVisibility('admin');
      setIsDialogOpen(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Admin Notes</CardTitle>
        <CardDescription>Notes and comments from administrators</CardDescription>
      </CardHeader>
      <CardContent>
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {note.authorUsername?.slice(0, 2).toUpperCase() || 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{note.authorUsername}</p>
                    <Badge variant={note.visibility === 'system' ? 'secondary' : 'outline'} className="text-xs">
                      {note.visibility === 'system' ? 'System' : 'Admin'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(new Date(note.createdAt), new Date(), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{note.note}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <User className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No admin notes have been added for this user.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Admin Note</DialogTitle>
              <DialogDescription>
                Add a note to this user's profile that will be visible to administrators.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="note-visibility" className="text-sm font-medium">
                  Note Visibility
                </label>
                <Select value={visibility} onValueChange={(value: 'admin' | 'system') => setVisibility(value)}>
                  <SelectTrigger id="note-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>Admin Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        <span>System Note</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {visibility === 'system' 
                    ? 'System notes appear with special formatting and are used for important account notices.' 
                    : 'Admin notes are only visible to other administrators.'}
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <label htmlFor="note-content" className="text-sm font-medium">
                  Note Content
                </label>
                <Textarea
                  id="note-content"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter your note here..."
                  rows={5}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddNote} 
                disabled={isAddingNote || !newNote.trim()}
              >
                {isAddingNote ? 'Adding...' : 'Add Note'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};