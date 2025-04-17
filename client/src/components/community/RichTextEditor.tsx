/**
 * @component RichTextEditor
 * @layer UI
 * @version 1.0.0
 * @description A rich text editor component for community posts
 * 
 * This component provides a customizable text editor with basic formatting
 * features for creating rich text content in community posts.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  onSubmit?: () => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Share something with the community...',
  minHeight = '100px',
  onSubmit
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize the editor content once
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Handle manual changes to the editor content
  const handleContentChange = () => {
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      onChange(newValue);
    }
  };

  // Apply formatting to the selected text
  const formatText = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  // Handle keyboard shortcuts (e.g., Ctrl+B for bold)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Insert an image from URL
  const insertImage = () => {
    const url = prompt('Enter the URL of the image:');
    if (url) {
      formatText('insertImage', url);
    }
  };

  // Create a link from selected text
  const createLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      formatText('createLink', url);
    }
  };

  return (
    <div 
      className={cn(
        "rich-text-editor-container space-y-2",
        isFocused && "ring-2 ring-primary/50"
      )}
    >
      <div className="flex flex-wrap gap-1 p-1 bg-muted/20 rounded-t-md border border-input">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('bold')}
          className="h-8 px-2 text-muted-foreground"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('italic')}
          className="h-8 px-2 text-muted-foreground"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('insertUnorderedList')}
          className="h-8 px-2 text-muted-foreground"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('insertOrderedList')}
          className="h-8 px-2 text-muted-foreground"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={createLink}
          className="h-8 px-2 text-muted-foreground"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertImage}
          className="h-8 px-2 text-muted-foreground"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('justifyLeft')}
          className="h-8 px-2 text-muted-foreground"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('justifyCenter')}
          className="h-8 px-2 text-muted-foreground"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "min-h-[100px] w-full rounded-b-md border border-input border-t-0 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !value && "before:text-muted-foreground before:content-[attr(data-placeholder)]"
        )}
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={handleContentChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
      />

      {onSubmit && (
        <div className="text-xs text-muted-foreground text-right">
          Press Ctrl+Enter to submit
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;