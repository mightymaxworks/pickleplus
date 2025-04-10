/**
 * PKL-278651-GAME-0005-GOLD-ENH
 * File Upload Field
 * 
 * A reusable file upload component for the Golden Ticket system.
 */

import React, { useRef, useState } from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadIcon, XIcon } from 'lucide-react';
import { validateFile, FileUploadError, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../../services/fileUploadService';
import { UseFormReturn } from 'react-hook-form';

interface FileUploadFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  form,
  name,
  label,
  description,
  accept = 'image/*',
  multiple = false,
  maxSize = MAX_FILE_SIZE,
  allowedTypes = ALLOWED_IMAGE_TYPES
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  // When file is selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Log file details for debugging
    console.log('FileUploadField - File selected:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });
    
    // Validate the file
    const error = validateFile(file, allowedTypes, maxSize);
    
    if (error) {
      console.error('FileUploadField - Validation error:', error);
      form.setError(name, {
        type: 'manual',
        message: error.message
      });
      return;
    }
    
    // Set the file in form
    form.setValue(name, file, { shouldValidate: true });
    
    // Generate preview if it's an image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        console.log('FileUploadField - Preview generated');
        setPreview(dataUrl);
        
        // Set a temporary URL for the image in the form so the preview can show it
        // This will be replaced with the real URL after upload
        form.setValue(`${name.replace('File', 'Url')}`, dataUrl, { shouldValidate: false });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Clear the field
  const handleClear = () => {
    form.setValue(name, null, { shouldValidate: true });
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      console.log('FileUploadField - File dropped:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });
      
      const error = validateFile(file, allowedTypes, maxSize);
      
      if (error) {
        console.error('FileUploadField - Drag validation error:', error);
        form.setError(name, {
          type: 'manual',
          message: error.message
        });
        return;
      }
      
      form.setValue(name, file, { shouldValidate: true });
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          console.log('FileUploadField - Drag preview generated');
          setPreview(dataUrl);
          
          // Set a temporary URL for the image in the form so the preview can show it
          // This will be replaced with the real URL after upload
          form.setValue(`${name.replace('File', 'Url')}`, dataUrl, { shouldValidate: false });
        };
        reader.readAsDataURL(file);
      }
    }
  };
  
  const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div 
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-700 hover:border-primary cursor-pointer transition-colors"
              onDragEnter={preventDefaults}
              onDragOver={preventDefaults}
              onDragLeave={preventDefaults}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
              />
              
              {preview ? (
                <div className="relative w-full">
                  <img 
                    src={preview} 
                    alt="File preview" 
                    className="max-h-48 max-w-full mx-auto object-contain rounded"
                  />
                  <Button 
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-center">
                  <UploadIcon className="h-8 w-8 text-gray-400" />
                  <div className="font-medium text-sm">
                    Drag & drop a file or click to browse
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Max size: {maxSize / (1024 * 1024)}MB
                  </div>
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FileUploadField;