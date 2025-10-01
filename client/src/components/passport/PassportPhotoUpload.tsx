/**
 * PKL-278651-PHOTO-0001 - Passport Photo Upload Component
 * 
 * Custom photo upload with cropping, filters, and ranking-based borders
 * Integrates with Progressive Passport Hub for personalized passport display
 * 
 * @implementation Phase 1 completion
 * @lastModified 2025-09-27
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  RotateCw, 
  Crop, 
  Save,
  X,
  Target,
  Shield,
  Award,
  Crown,
  Sparkles,
  ImageIcon,
  Palette,
  Sliders,
  Move3D,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

// Official 4-tier player classification system
type PlayerTier = 'recreational' | 'competitive' | 'elite' | 'professional';

interface TierConfig {
  name: string;
  gradient: string;
  icon: React.ElementType;
  color: string;
  description: string;
  requirement: string;
}

// Aligned with official tier system from PassportHero
const tierConfigs: Record<PlayerTier, TierConfig> = {
  recreational: {
    name: 'Recreational',
    gradient: 'from-slate-600 via-slate-700 to-slate-800',
    icon: Shield,
    color: 'text-slate-300',
    description: 'Building your foundation',
    requirement: '0-299 ranking points'
  },
  competitive: {
    name: 'Competitive',
    gradient: 'from-blue-600 via-blue-700 to-blue-800',
    icon: Target,
    color: 'text-blue-300',
    description: 'Rising through the ranks',
    requirement: '300-999 ranking points'
  },
  elite: {
    name: 'Elite',
    gradient: 'from-purple-600 via-purple-700 to-indigo-800',
    icon: Award,
    color: 'text-purple-300',
    description: 'Mastering the game',
    requirement: '1000-1799 ranking points'
  },
  professional: {
    name: 'Professional',
    gradient: 'from-orange-500 via-orange-600 to-red-700',
    icon: Crown,
    color: 'text-orange-300',
    description: 'Elite professional status',
    requirement: '1800+ ranking points'
  }
};

interface PassportPhotoUploadProps {
  currentPhoto?: string;
  playerName: string;
  rankingPoints: number;
  tier: PlayerTier;
  onPhotoSave: (photoData: string) => void;
  onClose: () => void;
}

export default function PassportPhotoUpload({
  currentPhoto,
  playerName,
  rankingPoints,
  tier,
  onPhotoSave,
  onClose
}: PassportPhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentPhoto || '');
  const [cropMode, setCropMode] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use tier directly (passed from parent)
  const tierConfig = tierConfigs[tier];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const applyFilters = () => {
    if (!canvasRef.current || !previewUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      
      ctx!.save();
      ctx!.translate(150, 150);
      ctx!.rotate((rotation * Math.PI) / 180);
      ctx!.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx!.drawImage(img, -150, -150, 300, 300);
      ctx!.restore();
    };
    
    img.src = previewUrl;
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
    onPhotoSave(dataUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Customize Your Passport</h2>
              <p className="text-slate-400">Upload and style your action photo</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tier Achievement Display */}
          <div className="mt-4 p-4 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${tierConfig.gradient} rounded-full flex items-center justify-center`}>
                <tierConfig.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className={`font-semibold ${tierConfig.color}`}>{tierConfig.name}</div>
                <div className="text-slate-400 text-sm">{tierConfig.description}</div>
                <div className="text-xs text-slate-500">{tierConfig.requirement}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Area */}
          {!previewUrl && (
            <Card className="border-dashed border-2 border-slate-600 bg-slate-800/50">
              <div
                className="p-8 text-center cursor-pointer hover:bg-slate-700/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-medium">Upload your action photo</div>
                    <div className="text-slate-400 text-sm">Drag & drop or click to browse</div>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Preview and Editing */}
          {previewUrl && (
            <div className="space-y-4">
              {/* Photo Preview with Tier Border */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className={`w-80 h-80 bg-gradient-to-r ${tierConfig.gradient} p-1 rounded-2xl`}>
                    <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Passport preview"
                        className="w-full h-full object-cover"
                        style={{
                          filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                          transform: `rotate(${rotation}deg)`
                        }}
                      />
                      {/* Border Effect Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Tier Badge */}
                  <div className="absolute -top-2 -right-2">
                    <Badge className={`${tierConfig.color} bg-slate-900/90 border-current`}>
                      <tierConfig.icon className="h-3 w-3 mr-1" />
                      {tierConfig.name}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Editing Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filters */}
                <Card className="p-4 bg-slate-800 border-slate-700">
                  <h3 className="text-white font-medium mb-3">Filters</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">Brightness</label>
                      <Slider
                        value={[brightness]}
                        onValueChange={([value]) => setBrightness(value)}
                        min={50}
                        max={150}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Contrast</label>
                      <Slider
                        value={[contrast]}
                        onValueChange={([value]) => setContrast(value)}
                        min={50}
                        max={150}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Saturation</label>
                      <Slider
                        value={[saturation]}
                        onValueChange={([value]) => setSaturation(value)}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </Card>

                {/* Tools */}
                <Card className="p-4 bg-slate-800 border-slate-700">
                  <h3 className="text-white font-medium mb-3">Tools</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">Rotation</label>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRotation(prev => prev - 90)}
                        >
                          <RotateCw className="h-4 w-4 rotate-180" />
                        </Button>
                        <Slider
                          value={[rotation]}
                          onValueChange={([value]) => setRotation(value)}
                          min={-180}
                          max={180}
                          step={15}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRotation(prev => prev + 90)}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setCropMode(!cropMode)}
                    >
                      <Crop className="h-4 w-4 mr-2" />
                      {cropMode ? 'Exit Crop' : 'Crop Photo'}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Different Photo
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Passport Photo
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas for Processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </motion.div>
    </motion.div>
  );
}