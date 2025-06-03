import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Crop as CropIcon, Check, X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (avatarUrl: string) => void;
  currentAvatar?: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function PhotoUploadModal({ 
  isOpen, 
  onClose, 
  onUploadSuccess,
  currentAvatar 
}: PhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState<'select' | 'crop' | 'uploading'>('select');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageSrc(e.target.result as string);
          setStep('crop');
        }
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    maxFiles: 1
  });

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 3 / 4)); // 3:4 aspect ratio for passport photo
  };

  const getCroppedImg = useCallback((
    image: HTMLImageElement,
    crop: PixelCrop,
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.95);
    });
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !completedCrop || !imgRef.current) {
      return;
    }

    setIsUploading(true);
    setStep('uploading');
    setUploadProgress(0);

    try {
      // Get cropped image
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      // Create form data
      const formData = new FormData();
      formData.append('avatar', croppedBlob, `avatar-${Date.now()}.jpg`);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload to server
      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      toast({
        title: "Photo updated successfully",
        description: "Your profile photo has been updated"
      });

      onUploadSuccess(result.avatarUrl);
      onClose();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImageSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setStep('select');
    setUploadProgress(0);
  };

  const handleClose = () => {
    if (!isUploading) {
      resetModal();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-orange-600" />
            Update Profile Photo
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-300 hover:border-orange-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop your photo here' : 'Choose a profile photo'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select • JPG, PNG, or WebP • Max 5MB
              </p>
            </div>

            {currentAvatar && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Current photo:</p>
                <img 
                  src={currentAvatar} 
                  alt="Current avatar" 
                  className="w-20 h-24 object-cover rounded-lg mx-auto border-2 border-gray-200"
                  style={{ aspectRatio: '3/4' }}
                />
              </div>
            )}
          </div>
        )}

        {step === 'crop' && imageSrc && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Adjust the crop area for your passport photo (3:4 ratio)
              </p>
            </div>
            
            <div className="max-h-96 overflow-auto">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={3 / 4}
                minWidth={100}
                minHeight={133}
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imageSrc}
                  style={{ maxHeight: '400px', width: 'auto' }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep('select')}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!completedCrop}>
                <CropIcon className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </div>
        )}

        {step === 'uploading' && (
          <div className="space-y-4 text-center py-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Uploading your photo...
              </p>
              <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}