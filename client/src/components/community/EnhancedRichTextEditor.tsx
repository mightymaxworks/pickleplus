/**
 * @component EnhancedRichTextEditor
 * @layer UI
 * @version 1.0.0
 * @description An enhanced rich text editor component for community posts
 * 
 * This component provides a customizable text editor with robust formatting
 * features and fixes issues with text direction and content clearing.
 * Built with Framework 5.1 principles for accessibility and usability.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Type,
  Eraser,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface EnhancedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  onSubmit?: () => void;
  className?: string;
}

/**
 * Enhanced Rich Text Editor Component
 * 
 * PKL-278651-COMM-0007-ENGAGE
 * Framework 5.1 Compliant
 * 
 * @version 1.0.0
 * @lastModified 2025-04-17
 */
const EnhancedRichTextEditor: React.FC<EnhancedRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Share something with the community...',
  minHeight = '150px',
  onSubmit,
  className,
}) => {
  // Editor state and refs
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commandHistoryRef = useRef<string[]>([]);
  const historyPositionRef = useRef<number>(-1);
  
  // Character counter
  const [charCount, setCharCount] = useState(0);
  
  // Initialize editor content
  useEffect(() => {
    if (editorRef.current) {
      // Always ensure the editor's content matches the value prop
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
      
      // Update character count
      setCharCount(editorRef.current.textContent?.length || 0);
    }
  }, [value]);
  
  // Handle content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      
      // Save current state to history
      if (historyPositionRef.current < commandHistoryRef.current.length - 1) {
        // If we're in the middle of history, truncate
        commandHistoryRef.current = commandHistoryRef.current.slice(0, historyPositionRef.current + 1);
      }
      
      // Add current state to history
      commandHistoryRef.current.push(newContent);
      historyPositionRef.current = commandHistoryRef.current.length - 1;
      
      // Update character count
      setCharCount(editorRef.current.textContent?.length || 0);
      
      // Update parent component
      onChange(newContent);
      
      // Visual feedback for typing
      setIsTyping(true);
      
      // Clear previous timeout
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      // Set a new timeout to turn off the typing indicator
      typingTimerRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    }
  };
  
  // Handle commands
  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };
  
  // Undo and redo
  const handleUndo = () => {
    if (historyPositionRef.current > 0) {
      historyPositionRef.current--;
      if (editorRef.current && commandHistoryRef.current[historyPositionRef.current]) {
        editorRef.current.innerHTML = commandHistoryRef.current[historyPositionRef.current];
        onChange(editorRef.current.innerHTML);
      }
    }
  };
  
  const handleRedo = () => {
    if (historyPositionRef.current < commandHistoryRef.current.length - 1) {
      historyPositionRef.current++;
      if (editorRef.current && commandHistoryRef.current[historyPositionRef.current]) {
        editorRef.current.innerHTML = commandHistoryRef.current[historyPositionRef.current];
        onChange(editorRef.current.innerHTML);
      }
    }
  };
  
  // Insert link
  const insertLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };
  
  // Insert image
  const insertImage = () => {
    const url = prompt('Enter the image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };
  
  // Clear formatting
  const clearFormatting = () => {
    execCommand('removeFormat');
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter
    if (e.key === 'Enter' && e.ctrlKey && onSubmit) {
      e.preventDefault();
      onSubmit();
      return;
    }
    
    // Undo on Ctrl+Z
    if (e.key === 'z' && e.ctrlKey) {
      e.preventDefault();
      handleUndo();
      return;
    }
    
    // Redo on Ctrl+Y or Ctrl+Shift+Z
    if ((e.key === 'y' && e.ctrlKey) || (e.key === 'z' && e.ctrlKey && e.shiftKey)) {
      e.preventDefault();
      handleRedo();
      return;
    }
    
    // Bold on Ctrl+B
    if (e.key === 'b' && e.ctrlKey) {
      e.preventDefault();
      execCommand('bold');
      return;
    }
    
    // Italic on Ctrl+I
    if (e.key === 'i' && e.ctrlKey) {
      e.preventDefault();
      execCommand('italic');
      return;
    }
  };
  
  // Reset the editor content programmatically
  const resetContent = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      onChange('');
      setCharCount(0);
      
      // Reset history
      commandHistoryRef.current = [''];
      historyPositionRef.current = 0;
    }
  };
  
  // Expose reset method to parent component
  React.useImperativeHandle(
    { current: { resetContent } },
    () => ({ resetContent }),
    []
  );
  
  // Function to create toolbar buttons with tooltips
  const ToolbarButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    shortcut 
  }: { 
    icon: React.ElementType; 
    label: string; 
    onClick: () => void;
    shortcut?: string;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            className="h-8 w-8 p-0"
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label} {shortcut && <span className="text-xs opacity-70">({shortcut})</span>}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  
  return (
    <div 
      className={cn(
        "enhanced-rich-text-editor space-y-2",
        className
      )}
      data-testid="enhanced-rich-text-editor"
    >
      <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/20 rounded-t-md border border-input">
        <div className="flex items-center">
          <ToolbarButton icon={Bold} label="Bold" onClick={() => execCommand('bold')} shortcut="Ctrl+B" />
          <ToolbarButton icon={Italic} label="Italic" onClick={() => execCommand('italic')} shortcut="Ctrl+I" />
          <ToolbarButton icon={Type} label="Heading" onClick={() => execCommand('formatBlock', '<h3>')} />
        </div>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <div className="flex items-center">
          <ToolbarButton icon={List} label="Bullet List" onClick={() => execCommand('insertUnorderedList')} />
          <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => execCommand('insertOrderedList')} />
        </div>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <div className="flex items-center">
          <ToolbarButton icon={AlignLeft} label="Align Left" onClick={() => execCommand('justifyLeft')} />
          <ToolbarButton icon={AlignCenter} label="Align Center" onClick={() => execCommand('justifyCenter')} />
          <ToolbarButton icon={AlignRight} label="Align Right" onClick={() => execCommand('justifyRight')} />
        </div>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <div className="flex items-center">
          <ToolbarButton icon={LinkIcon} label="Insert Link" onClick={insertLink} />
          <ToolbarButton icon={Image} label="Insert Image" onClick={insertImage} />
          <ToolbarButton icon={Eraser} label="Clear Formatting" onClick={clearFormatting} />
        </div>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <div className="flex items-center">
          <ToolbarButton icon={Undo} label="Undo" onClick={handleUndo} shortcut="Ctrl+Z" />
          <ToolbarButton icon={Redo} label="Redo" onClick={handleRedo} shortcut="Ctrl+Y" />
        </div>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          "min-h-[100px] w-full rounded-b-md border border-input border-t-0 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "prose prose-sm max-w-none overflow-auto direction-ltr", // Enforce left-to-right
          isFocused && "ring-2 ring-primary/50",
          isTyping && "ring-2 ring-orange-500/70",
          !value && "before:text-muted-foreground before:content-[attr(data-placeholder)]"
        )}
        style={{ 
          minHeight,
          direction: 'ltr', // Force left-to-right text direction
          unicodeBidi: 'embed'
        }}
        data-placeholder={placeholder}
        onInput={handleContentChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        aria-multiline="true"
        aria-label="Content editor"
      />
      
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <div>
          <span className="text-xs">{charCount} characters</span>
        </div>
        {onSubmit && (
          <div>Press Ctrl+Enter to submit</div>
        )}
      </div>
    </div>
  );
};

export default EnhancedRichTextEditor;