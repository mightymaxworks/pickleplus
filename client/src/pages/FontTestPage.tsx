/**
 * Font Test Page
 * Showcases different modern fonts for the website design
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/layout/AppHeader';
import { Trophy, Users, Star, BarChart3, Calendar, MapPin } from 'lucide-react';

const fonts = [
  {
    name: 'Inter',
    family: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    className: 'font-inter',
    googleFont: 'Inter:wght@300;400;500;600;700',
    description: 'Clean, highly legible sans-serif perfect for modern web apps',
    category: 'Sans-serif',
    bestFor: 'Body text, UI elements'
  },
  {
    name: 'Poppins',
    family: '"Poppins", system-ui, sans-serif',
    className: 'font-poppins',
    googleFont: 'Poppins:wght@300;400;500;600;700',
    description: 'Rounded, friendly geometric sans-serif',
    category: 'Sans-serif',
    bestFor: 'Headings, modern feel'
  },
  {
    name: 'Space Grotesk',
    family: '"Space Grotesk", "Helvetica Neue", sans-serif',
    className: 'font-space-grotesk',
    googleFont: 'Space+Grotesk:wght@300;400;500;600;700',
    description: 'Contemporary with subtle character for headings',
    category: 'Sans-serif',
    bestFor: 'Headlines, tech brands'
  },
  {
    name: 'Monospace Demo',
    family: '"Courier New", Courier, monospace',
    className: 'font-mono',
    googleFont: '',
    description: 'Fixed-width font for code and technical content',
    category: 'Monospace',
    bestFor: 'Code, technical text'
  },
  {
    name: 'Serif Demo',
    family: '"Times New Roman", Times, serif',
    className: 'font-serif',
    googleFont: '',
    description: 'Classic serif font for traditional documents',
    category: 'Serif',
    bestFor: 'Documents, formal text'
  },
  {
    name: 'Fantasy Demo',
    family: 'Impact, "Arial Black", sans-serif',
    className: 'font-fantasy',
    googleFont: '',
    description: 'Bold display font for headlines and emphasis',
    category: 'Display',
    bestFor: 'Headlines, impact text'
  }
];

const FontTestPage: React.FC = () => {
  const [selectedFont, setSelectedFont] = useState(fonts[0]);

  // Load Google Fonts for the first 3 options only
  React.useEffect(() => {
    const googleFonts = fonts.filter(font => font.googleFont);
    if (googleFonts.length > 0) {
      const fontUrl = 'https://fonts.googleapis.com/css2?' + 
        googleFonts.map(font => `family=${font.googleFont}`).join('&') + 
        '&display=swap';

      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      document.head.appendChild(link);

      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, []);

  const sampleContent = {
    hero: "Your Pickleball Digital Passport",
    subtitle: "Track your journey across all divisions with multi-dimensional rankings, QR verification, and real-time performance analytics",
    cardTitle: "PCP Official Rankings",
    cardDescription: "See how your CourtIQ™ rating compares to players worldwide",
    buttonText: "View Detailed Stats",
    bodyText: "The Pickleball Competitive Partnership (PCP) is the official governing body for competitive pickleball worldwide. Our advanced ranking system tracks performance across multiple dimensions including format, age division, and skill level progression.",
    smallText: "Last updated: 2 hours ago"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Font Comparison Test</h1>
          <p className="text-gray-600 mb-6">
            Test different modern fonts to see how they look with your content. 
            Click on a font below to see it applied to sample content.
          </p>
          
          {/* Font Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {fonts.map((font) => (
              <Card 
                key={font.name}
                className={`cursor-pointer transition-all ${
                  selectedFont.name === font.name 
                    ? 'ring-2 ring-orange-500 bg-orange-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedFont(font)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 
                      className="font-semibold text-lg"
                      style={{ fontFamily: font.family }}
                    >
                      {font.name}
                    </h3>
                    <Badge variant="outline">{font.category}</Badge>
                  </div>
                  <div 
                    className="text-base mb-2"
                    style={{ fontFamily: font.family }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{font.description}</p>
                  <div className="text-xs text-gray-500">Best for: {font.bestFor}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sample Content with Selected Font */}
        <div className="space-y-8" style={{ fontFamily: selectedFont.family }}>
          <div className="text-center mb-8">
            <Badge className="mb-4">Currently previewing: {selectedFont.name}</Badge>
          </div>

          {/* Hero Section */}
          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white">
            <CardContent className="p-8 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {sampleContent.hero}
              </h1>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                {sampleContent.subtitle}
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{sampleContent.cardTitle}</CardTitle>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="text-sm text-gray-600">{sampleContent.cardDescription}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <div className="font-medium">Alex Rodriguez</div>
                        <div className="text-sm text-gray-500">@alextennis</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold">4.8</div>
                  </div>
                  <Button variant="outline" className="w-full">
                    {sampleContent.buttonText}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <div className="font-medium">Weekend Tournament</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      March 15, 2025
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Downtown Courts
                    </div>
                  </div>
                  <Button size="sm" className="w-full">Join Event</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Matches Won</span>
                    <span className="font-medium">24/30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current Streak</span>
                    <span className="font-medium">5 wins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">CourtIQ Rating</span>
                    <span className="font-medium flex items-center gap-1">
                      4.2 <Star className="h-3 w-3 text-yellow-500" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Body Text Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">About PCP Global Ranking System</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {sampleContent.bodyText}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{sampleContent.smallText}</p>
                <Button variant="outline">Read More</Button>
              </div>
            </CardContent>
          </Card>

          {/* Typography Scale Examples */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Typography Scale Preview</h2>
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Heading 1 - Main Title</h1>
                  <p className="text-sm text-gray-500">text-4xl font-bold</p>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Heading 2 - Section Title</h2>
                  <p className="text-sm text-gray-500">text-3xl font-bold</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Heading 3 - Subsection</h3>
                  <p className="text-sm text-gray-500">text-2xl font-semibold</p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">Heading 4 - Card Title</h4>
                  <p className="text-sm text-gray-500">text-xl font-semibold</p>
                </div>
                <div>
                  <p className="text-base text-gray-700">Body text - Regular paragraph content that would appear throughout the application.</p>
                  <p className="text-sm text-gray-500">text-base</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Small text - Secondary information and captions.</p>
                  <p className="text-xs text-gray-500">text-sm</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Extra small text - Timestamps and metadata.</p>
                  <p className="text-xs text-gray-400">text-xs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FontTestPage;