/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Form Component
 * 
 * This form allows users to submit detailed bug reports with optional screenshots.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Camera, 
  Loader2,
  X,
  CheckCircle
} from 'lucide-react';

/**
 * Props for the BugReportForm component
 */
interface BugReportFormProps {
  onSuccess?: () => void;
}

/**
 * Form for reporting bugs with screenshot capability
 */
export const BugReportForm: React.FC<BugReportFormProps> = ({ onSuccess }) => {
  const [location] = useLocation();
  const { toast } = useToast();
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    currentPage: location,
    includeUserInfo: true,
    isReproducible: false,
    stepsToReproduce: '',
    screenshot: null as File | null
  });

  /**
   * Handle form input changes
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Capture a screenshot of the current view
   */
  const captureScreenshot = async () => {
    try {
      toast({
        title: "Note on Screenshots",
        description: "Due to browser security limitations, we can't automatically capture your screen. Please manually take a screenshot and upload it.",
      });
      
      // In a real implementation, we might use html2canvas or a similar library
      // For now, we'll just provide a file upload option
    } catch (error) {
      console.error('Error with screenshot:', error);
      toast({
        title: 'Screenshot Failed',
        description: 'Unable to capture screenshot. Please describe the issue in detail instead.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle screenshot file upload
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file (PNG, JPG, etc.)',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshot(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setFormData(prev => ({ ...prev, screenshot: file }));
  };

  /**
   * Submit bug report to API
   */
  const { mutate: submitReport, isPending } = useMutation({
    mutationFn: async (data: typeof formData) => {
      const formPayload = new FormData();
      formPayload.append('title', data.title);
      formPayload.append('description', data.description);
      formPayload.append('severity', data.severity);
      formPayload.append('currentPage', data.currentPage);
      formPayload.append('includeUserInfo', String(data.includeUserInfo));
      formPayload.append('isReproducible', String(data.isReproducible));
      
      if (data.stepsToReproduce) {
        formPayload.append('stepsToReproduce', data.stepsToReproduce);
      }
      
      if (data.screenshot) {
        formPayload.append('screenshot', data.screenshot);
      }
      
      // Include screen size
      const screenSize = `${window.innerWidth}x${window.innerHeight}`;
      formPayload.append('screenSize', screenSize);
      
      return apiRequest('/api/feedback/bug-report', {
        method: 'POST',
        data: formPayload,
        isFormData: true
      });
    },
    onSuccess: () => {
      toast({
        title: 'Bug Report Submitted',
        description: 'Thank you for helping improve Pickle+! We\'ll look into this issue.',
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
        currentPage: location,
        includeUserInfo: true,
        isReproducible: false,
        stepsToReproduce: '',
        screenshot: null
      });
      setScreenshot(null);
      
      // Call success callback
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Bug report submission error:', error);
      toast({
        title: 'Submission Failed',
        description: 'Could not submit your bug report. Please try again.',
        variant: 'destructive',
      });
    }
  });

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title || !formData.description) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a title and description of the issue.',
        variant: 'destructive',
      });
      return;
    }
    
    submitReport(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <Label htmlFor="title">What went wrong?</Label>
        <Input
          id="title"
          name="title"
          placeholder="Brief description of the issue"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Details</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Please describe what happened and what you expected to happen..."
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="severity">How serious is this issue?</Label>
        <Select 
          value={formData.severity} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low - Minor issue or cosmetic problem</SelectItem>
            <SelectItem value="medium">Medium - Affects functionality but has workaround</SelectItem>
            <SelectItem value="high">High - Feature is broken or unusable</SelectItem>
            <SelectItem value="critical">Critical - System crash or data loss</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isReproducible"
            checked={formData.isReproducible}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, isReproducible: checked as boolean }))
            }
          />
          <Label htmlFor="isReproducible">I can reproduce this issue</Label>
        </div>
        
        {formData.isReproducible && (
          <div>
            <Label htmlFor="stepsToReproduce">Steps to reproduce</Label>
            <Textarea
              id="stepsToReproduce"
              name="stepsToReproduce"
              placeholder="1. Go to...\n2. Click on...\n3. Observe that..."
              rows={3}
              value={formData.stepsToReproduce}
              onChange={handleInputChange}
            />
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Screenshot</Label>
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={captureScreenshot}
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture Screen
            </Button>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                id="screenshot-upload"
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
                onChange={handleFileUpload}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
              >
                Upload Image
              </Button>
            </div>
          </div>
        </div>
        
        {screenshot && (
          <div className="relative mt-2 border rounded-md overflow-hidden">
            <img 
              src={screenshot} 
              alt="Bug screenshot" 
              className="w-full h-auto"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 rounded-full"
              onClick={() => {
                setScreenshot(null);
                setFormData(prev => ({ ...prev, screenshot: null }));
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {!screenshot && (
          <p className="text-sm text-gray-500">
            Upload a screenshot to help us understand the issue better, or describe it in detail above.
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="includeUserInfo"
          checked={formData.includeUserInfo}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, includeUserInfo: checked as boolean }))
          }
        />
        <Label htmlFor="includeUserInfo" className="text-sm text-gray-600">
          Include my user information to help troubleshooting (recommended)
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Bug Report'
        )}
      </Button>
      
      <p className="text-xs text-center text-gray-500 mt-2">
        Your feedback helps us improve Pickle+ for everyone. Thank you!
      </p>
    </form>
  );
};

export default BugReportForm;