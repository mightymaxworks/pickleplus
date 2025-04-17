/**
 * @component IconShowcase
 * @layer UI
 * @version 1.0.0
 * @description Component to showcase the custom Pickle+ icons
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

// Import our custom icons
import {
  PickleballIcon,
  PaddleIcon,
  TournamentBracketIcon,
  PlayerRatingIcon,
  CourtIcon
} from './index';

const IconShowcase: React.FC = () => {
  const [size, setSize] = React.useState<number>(48);
  const [color, setColor] = React.useState<string>("#FF6600"); // Pickle+ orange
  const [filled, setFilled] = React.useState<boolean>(false);
  const [rating, setRating] = React.useState<number>(3.5);
  const [ratingEnabled, setRatingEnabled] = React.useState<boolean>(true);
  const [bracketsHighlight, setBracketsHighlight] = React.useState<'none' | 'quarterfinal' | 'semifinal' | 'final'>('none');
  const [courtPlayers, setCourtPlayers] = React.useState<boolean>(true);
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Pickle+ Custom Icons</CardTitle>
        <CardDescription>
          Custom SVG icons created specifically for the Pickle+ platform
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="showcase" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="showcase">Icon Showcase</TabsTrigger>
            <TabsTrigger value="controls">Customize</TabsTrigger>
          </TabsList>
          
          <TabsContent value="showcase" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Pickleball Icon */}
              <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl">
                <PickleballIcon 
                  size={size} 
                  color={color} 
                  fill={filled} 
                  highlightColor={color}
                  className="mb-4"
                />
                <h3 className="text-base font-medium">Pickleball</h3>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Detailed pickleball icon with hole pattern
                </p>
              </div>
              
              {/* Paddle Icon */}
              <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl">
                <PaddleIcon 
                  size={size} 
                  color={color} 
                  fill={filled} 
                  accentColor={color}
                  className="mb-4"
                />
                <h3 className="text-base font-medium">Paddle</h3>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Paddle with grip and face texture
                </p>
              </div>
              
              {/* Tournament Bracket Icon */}
              <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl">
                <TournamentBracketIcon 
                  size={size} 
                  color={color} 
                  fill={filled} 
                  highlightColor={color}
                  highlightPosition={bracketsHighlight}
                  className="mb-4"
                />
                <h3 className="text-base font-medium">Tournament Bracket</h3>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Tournament structure visualization
                </p>
              </div>
              
              {/* Player Rating Icon */}
              <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl">
                <PlayerRatingIcon 
                  size={size} 
                  color={color} 
                  rating={rating}
                  showValue={ratingEnabled}
                  fillColor={color}
                  className="mb-4"
                />
                <h3 className="text-base font-medium">Player Rating</h3>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Dynamic skill level visualization
                </p>
              </div>
              
              {/* Court Layout Icon */}
              <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl">
                <CourtIcon
                  size={size * 1.2} 
                  color={color} 
                  lineColor={color}
                  showPlayers={courtPlayers}
                  playerColor={color}
                  className="mb-4"
                />
                <h3 className="text-base font-medium">Court Layout</h3>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Pickleball court with kitchen zones
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="controls" className="space-y-6">
            <div className="space-y-6 mt-4">
              {/* Size Control */}
              <div className="space-y-2">
                <Label htmlFor="size-slider">Icon Size: {size}px</Label>
                <Slider
                  id="size-slider"
                  min={24}
                  max={96}
                  step={4}
                  value={[size]}
                  onValueChange={(value) => setSize(value[0])}
                  className="w-full"
                />
              </div>
              
              {/* Color Control */}
              <div className="space-y-2">
                <Label htmlFor="color-picker">Icon Color</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="color-picker"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-24 h-8"
                  />
                  <div className="text-sm">{color}</div>
                </div>
              </div>
              
              {/* Fill Mode */}
              <div className="space-y-2">
                <Label>Fill Mode</Label>
                <div className="flex gap-4">
                  <Button 
                    variant={filled ? "outline" : "default"} 
                    onClick={() => setFilled(false)}
                    size="sm"
                  >
                    Outline
                  </Button>
                  <Button 
                    variant={filled ? "default" : "outline"} 
                    onClick={() => setFilled(true)}
                    size="sm"
                  >
                    Filled
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              {/* Icon-specific Controls */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Icon-Specific Settings</h3>
                
                {/* Rating Value */}
                <div className="space-y-2">
                  <Label htmlFor="rating-slider">Player Rating: {rating.toFixed(1)}</Label>
                  <Slider
                    id="rating-slider"
                    min={1.0}
                    max={5.0}
                    step={0.1}
                    value={[rating]}
                    onValueChange={(value) => setRating(value[0])}
                    className="w-full"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id="show-rating"
                      type="checkbox"
                      checked={ratingEnabled}
                      onChange={(e) => setRatingEnabled(e.target.checked)}
                    />
                    <Label htmlFor="show-rating" className="text-sm">Show Rating Value</Label>
                  </div>
                </div>
                
                {/* Bracket Highlight */}
                <div className="space-y-2">
                  <Label>Tournament Progress Highlight</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={bracketsHighlight === 'none' ? "default" : "outline"} 
                      onClick={() => setBracketsHighlight('none')}
                      size="sm"
                    >
                      None
                    </Button>
                    <Button 
                      variant={bracketsHighlight === 'quarterfinal' ? "default" : "outline"} 
                      onClick={() => setBracketsHighlight('quarterfinal')}
                      size="sm"
                    >
                      Quarterfinals
                    </Button>
                    <Button 
                      variant={bracketsHighlight === 'semifinal' ? "default" : "outline"} 
                      onClick={() => setBracketsHighlight('semifinal')}
                      size="sm"
                    >
                      Semifinals
                    </Button>
                    <Button 
                      variant={bracketsHighlight === 'final' ? "default" : "outline"} 
                      onClick={() => setBracketsHighlight('final')}
                      size="sm"
                    >
                      Finals
                    </Button>
                  </div>
                </div>
                
                {/* Court Players */}
                <div className="flex items-center gap-2">
                  <input
                    id="show-players"
                    type="checkbox"
                    checked={courtPlayers}
                    onChange={(e) => setCourtPlayers(e.target.checked)}
                  />
                  <Label htmlFor="show-players">Show Players on Court</Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Framework 5.1 Component with Semantic Identifiers
        </p>
        <Button variant="outline" size="sm">
          View Implementation
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IconShowcase;