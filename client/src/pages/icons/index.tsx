/**
 * PKL-278651-COMM-0007-ICONS
 * Custom Pickleball Icons Showcase Page
 * 
 * This file implements a dedicated test page for showcasing and customizing 
 * the custom SVG icons created for the Pickle+ platform.
 */

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon, Download, Copy, Twitter, Instagram, Facebook, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Import our custom icons
import { 
  PickleballIcon, 
  PaddleIcon, 
  CourtIcon, 
  TournamentBracketIcon, 
  PlayerRatingIcon 
} from '@/assets/icons';

const IconsPage: React.FC = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Icon customization state
  const [size, setSize] = useState(64);
  const [color, setColor] = useState('#FF5722');
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [fill, setFill] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<'pickle' | 'paddle' | 'court' | 'tournament' | 'rating'>('pickle');

  // Copy SVG to clipboard function
  const copySvgToClipboard = (iconName: string) => {
    // In a real implementation, this would get the SVG content
    toast({
      title: 'SVG Copied!',
      description: `${iconName} SVG code copied to clipboard`,
    });
  };

  return (
    <DashboardLayout title="Custom Pickleball Icons">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            className="mr-2" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pickleball Custom Icons
          </h1>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          A showcase of custom SVG icons designed specifically for the Pickle+ platform.
          These icons can be customized with different sizes, colors and styles.
        </p>
        
        <Tabs defaultValue="showcase" className="w-full mb-8">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="showcase">Icon Showcase</TabsTrigger>
            <TabsTrigger value="customize">Customize Icons</TabsTrigger>
            <TabsTrigger value="integration">Integration Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="showcase" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Icon Library</CardTitle>
                <CardDescription>
                  Browse all available custom pickleball icons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white dark:bg-gray-800">
                      <div className="w-16 h-16 flex items-center justify-center text-[#FF5722]">
                        <PickleballIcon size={48} color="#FF5722" />
                      </div>
                      <span className="mt-2 text-sm font-medium">PickleballIcon</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white dark:bg-gray-800">
                      <div className="w-16 h-16 flex items-center justify-center text-[#FF5722]">
                        <PaddleIcon size={48} color="#FF5722" />
                      </div>
                      <span className="mt-2 text-sm font-medium">PaddleIcon</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white dark:bg-gray-800">
                      <div className="w-16 h-16 flex items-center justify-center text-[#FF5722]">
                        <TournamentBracketIcon size={48} color="#FF5722" />
                      </div>
                      <span className="mt-2 text-sm font-medium">TournamentBracketIcon</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white dark:bg-gray-800">
                      <div className="w-16 h-16 flex items-center justify-center text-[#FF5722]">
                        <PlayerRatingIcon size={48} color="#FF5722" />
                      </div>
                      <span className="mt-2 text-sm font-medium">PlayerRatingIcon</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white dark:bg-gray-800">
                      <div className="w-16 h-16 flex items-center justify-center text-[#FF5722]">
                        <CourtIcon size={48} color="#FF5722" />
                      </div>
                      <span className="mt-2 text-sm font-medium">CourtIcon</span>
                    </div>
                    
                    {/* Placeholder for future icons */}
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white dark:bg-gray-800 border-dashed">
                      <div className="w-16 h-16 flex items-center justify-center text-gray-400">
                        <span className="text-5xl">+</span>
                      </div>
                      <span className="mt-2 text-sm font-medium text-gray-500">Coming Soon</span>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Icons created by the Pickle+ Design Team
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="secondary">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="customize" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Icon Customization</CardTitle>
                <CardDescription>
                  Adjust parameters to customize the appearance of the icons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="size">Size: {size}px</Label>
                      <Slider
                        id="size" 
                        min={16} 
                        max={256} 
                        step={4} 
                        value={[size]} 
                        onValueChange={(value) => setSize(value[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="strokeWidth">Stroke Width: {strokeWidth}</Label>
                      <Slider
                        id="strokeWidth" 
                        min={0.5} 
                        max={4} 
                        step={0.1} 
                        value={[strokeWidth]} 
                        onValueChange={(value) => setStrokeWidth(value[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="color"
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="flex-1"
                          placeholder="#FF5722"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="fill"
                        checked={fill}
                        onCheckedChange={setFill}
                      />
                      <Label htmlFor="fill">Fill Shape</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="iconType">Icon Type</Label>
                      <Select
                        value={selectedIcon}
                        onValueChange={(value: any) => setSelectedIcon(value)}
                      >
                        <SelectTrigger id="iconType">
                          <SelectValue placeholder="Select Icon Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickle">Pickleball</SelectItem>
                          <SelectItem value="paddle">Paddle</SelectItem>
                          <SelectItem value="court">Court</SelectItem>
                          <SelectItem value="tournament">Tournament Bracket</SelectItem>
                          <SelectItem value="rating">Player Rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="pt-4">
                      <Button className="mr-2">
                        Apply to All
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setSize(64);
                        setColor('#FF5722');
                        setStrokeWidth(1.5);
                        setFill(false);
                      }}>
                        Reset
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div 
                      className="p-8 flex items-center justify-center" 
                      style={{ minHeight: '256px' }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        {selectedIcon === 'pickle' && (
                          <PickleballIcon 
                            size={size} 
                            color={color} 
                            strokeWidth={strokeWidth} 
                            fill={fill} 
                          />
                        )}
                        {selectedIcon === 'paddle' && (
                          <PaddleIcon 
                            size={size} 
                            color={color} 
                            strokeWidth={strokeWidth} 
                            fill={fill} 
                          />
                        )}
                        {selectedIcon === 'court' && (
                          <CourtIcon 
                            size={size} 
                            color={color} 
                            strokeWidth={strokeWidth} 
                            fill={fill} 
                          />
                        )}
                        {selectedIcon === 'tournament' && (
                          <TournamentBracketIcon 
                            size={size} 
                            color={color} 
                            strokeWidth={strokeWidth} 
                            fill={fill} 
                          />
                        )}
                        {selectedIcon === 'rating' && (
                          <PlayerRatingIcon 
                            size={size} 
                            color={color} 
                            strokeWidth={strokeWidth} 
                            fill={fill} 
                          />
                        )}
                      </div>
                    </div>
                    <div className="w-full mt-4 grid grid-cols-5 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 h-auto"
                        title="Copy SVG"
                        onClick={() => {
                          let iconName = 'PickleballIcon';
                          if (selectedIcon === 'pickle') iconName = 'PickleballIcon';
                          if (selectedIcon === 'paddle') iconName = 'PaddleIcon';
                          if (selectedIcon === 'court') iconName = 'CourtIcon';
                          if (selectedIcon === 'tournament') iconName = 'TournamentBracketIcon';
                          if (selectedIcon === 'rating') iconName = 'PlayerRatingIcon';
                          copySvgToClipboard(iconName);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 h-auto"
                        title="Share on Twitter"
                      >
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 h-auto"
                        title="Share on Instagram"
                      >
                        <Instagram className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 h-auto"
                        title="Share on Facebook"
                      >
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 h-auto"
                        title="Download SVG"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integration Guide</CardTitle>
                <CardDescription>
                  Learn how to integrate these custom icons into your components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Basic Import</h3>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                      <pre>{`import { PickleballIcon } from '@/assets/icons';

function MyComponent() {
  return (
    <div>
      <PickleballIcon />
    </div>
  );
}`}</pre>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Customizing Props</h3>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                      <pre>{`import { PaddleIcon } from '@/assets/icons';

function MyComponent() {
  return (
    <div>
      <PaddleIcon 
        size={32} 
        color="#FF5722" 
        strokeWidth={2} 
        fill={true} 
        className="my-custom-class" 
      />
    </div>
  );
}`}</pre>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Available Icons</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">PickleballIcon</code> - A pickleball with details</li>
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">PaddleIcon</code> - A pickleball paddle</li>
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">TournamentBracketIcon</code> - Tournament bracket visualization</li>
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">PlayerRatingIcon</code> - Player skill rating indicator</li>
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">CourtIcon</code> - Pickleball court layout</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Integration with Existing Frameworks</h3>
                    <p className="mb-4">These icons follow the Framework 5.1 standards with semantic identifiers:</p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                      <pre>{`<PickleballIcon 
  data-testid="pickle-icon-primary" 
  data-component="PickleballIcon"
  aria-hidden="true"
/>`}</pre>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View Full Documentation
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default IconsPage;