import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Trophy, Activity, ArrowRight, Play, Star } from 'lucide-react';

export default function DesignTestPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - PlayByPoint Inspired but Better */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
        {/* PHOTO NEEDED: Hero background - Professional pickleball action shot */}
        <div className="absolute inset-0 bg-slate-900/60 z-0"></div>
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-7xl font-black leading-tight mb-8">
              YOUR PICKLEBALL
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                PASSPORT
              </span>
              <br />
              STARTS HERE
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-12 max-w-2xl">
              Every player deserves a verified identity. Track your journey, connect with others, and prove your skills with the universal pickleball passport system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-medium">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white py-16 relative">
        {/* PHOTO NEEDED: Subtle background - Tournament/community photos collage */}
        <div className="container mx-auto px-6">
          <p className="text-center text-slate-600 text-sm font-medium uppercase tracking-wide mb-8">
            Trusted by Players Worldwide
          </p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-2xl font-bold text-slate-700">15,000+ Players</div>
            <div className="text-2xl font-bold text-slate-700">50+ Tournaments</div>
            <div className="text-2xl font-bold text-slate-700">25 Countries</div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean Typography */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              One Passport.
              <br />
              <span className="text-slate-600">Every Court.</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              The universal player identity system that connects courts, tournaments, and communities worldwide through verified pickleball passports.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Verified Identity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Your unique passport code connects your identity across all courts and tournaments with tamper-proof verification.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Match History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Complete record of every match linked to your passport, creating an unbreakable chain of your pickleball journey.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Universal Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  One passport opens doors everywhere - courts recognize you instantly, tournaments accept your credentials automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section - Data Focused */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-black text-slate-900 mb-2">15,000+</div>
              <div className="text-slate-600 font-medium">Active Players</div>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-orange-400 fill-current" />
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-slate-900 mb-2">4.9</div>
              <div className="text-slate-600 font-medium">App Store Rating</div>
              <Badge className="mt-2 bg-green-100 text-green-800">Top Rated</Badge>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-slate-900 mb-2">25</div>
              <div className="text-slate-600 font-medium">Countries</div>
              <div className="text-sm text-orange-600 font-medium mt-2">Global Reach</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-slate-900 mb-2">500+</div>
              <div className="text-slate-600 font-medium">Tournaments</div>
              <div className="text-sm text-blue-600 font-medium mt-2">Monthly</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Professional */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-20 relative">
        {/* PHOTO NEEDED: Background - Wide court view showing multiple courts and active players */}
        <div className="absolute inset-0 bg-orange-500/90 z-0"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Claim Your Passport Today
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join the universal pickleball community. Get your verified passport and connect with players worldwide.
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-medium">
            Get My Passport
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Photo Requirements Guide */}
      <section className="bg-slate-100 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Photo Requirements for Professional Look</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 bg-red-50 border-red-200">
              <h3 className="font-bold text-red-900 mb-3">🎯 HERO BACKGROUND (Critical)</h3>
              <p className="text-sm text-red-700 mb-2">Professional pickleball action shot</p>
              <ul className="text-xs text-red-600 space-y-1">
                <li>• 1920x1080+ resolution</li>
                <li>• Dynamic movement, multiple players</li>
                <li>• High contrast for text overlay</li>
                <li>• Outdoor court preferred</li>
              </ul>
            </Card>
            
            <Card className="p-6 bg-orange-50 border-orange-200">
              <h3 className="font-bold text-orange-900 mb-3">📱 LIFESTYLE SHOTS</h3>
              <p className="text-sm text-orange-700 mb-2">Players using app/scanning QR codes</p>
              <ul className="text-xs text-orange-600 space-y-1">
                <li>• Real players (not stock)</li>
                <li>• Phone/technology integration</li>
                <li>• Consistent professional lighting</li>
                <li>• Various court settings</li>
              </ul>
            </Card>
            
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">🏆 COMMUNITY PHOTOS</h3>
              <p className="text-sm text-blue-700 mb-2">Tournament & celebration shots</p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Diverse player demographics</li>
                <li>• Awards ceremonies</li>
                <li>• Group celebrations</li>
                <li>• Professional events</li>
              </ul>
            </Card>
            
            <Card className="p-6 bg-green-50 border-green-200">
              <h3 className="font-bold text-green-900 mb-3">👥 TESTIMONIAL PORTRAITS</h3>
              <p className="text-sm text-green-700 mb-2">Player headshots for social proof</p>
              <ul className="text-xs text-green-600 space-y-1">
                <li>• Professional portrait style</li>
                <li>• Various ages/backgrounds</li>
                <li>• Authentic expressions</li>
                <li>• Consistent lighting/quality</li>
              </ul>
            </Card>
            
            <Card className="p-6 bg-purple-50 border-purple-200">
              <h3 className="font-bold text-purple-900 mb-3">🎾 CTA BACKGROUND</h3>
              <p className="text-sm text-purple-700 mb-2">Wide court view for call-to-action</p>
              <ul className="text-xs text-purple-600 space-y-1">
                <li>• Multiple courts visible</li>
                <li>• Active players/busy courts</li>
                <li>• High resolution</li>
                <li>• Suitable for orange overlay</li>
              </ul>
            </Card>
            
            <Card className="p-6 bg-slate-50 border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3">📋 GENERAL SPECS</h3>
              <p className="text-sm text-slate-700 mb-2">All photos should meet:</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Minimum 1920px width</li>
                <li>• Professional quality</li>
                <li>• Consistent brand feel</li>
                <li>• Web-optimized formats</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Typography Showcase */}
      <section className="bg-slate-100 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Typography System</h3>
            <div className="space-y-6 bg-white p-8 rounded-lg">
              <div>
                <h1 className="text-6xl font-black text-slate-900 mb-2">Heading 1</h1>
                <p className="text-slate-600">Inter Black, 56px - For hero headlines</p>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-2">Heading 2</h2>
                <p className="text-slate-600">Inter Bold, 40px - For section headers</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">Heading 3</h3>
                <p className="text-slate-600">Inter Semibold, 30px - For subsections</p>
              </div>
              <div>
                <p className="text-lg text-slate-700 mb-2">Body Large Text</p>
                <p className="text-slate-600">Inter Regular, 18px - For important body text</p>
              </div>
              <div>
                <p className="text-base text-slate-700 mb-2">Regular Body Text</p>
                <p className="text-slate-600">Inter Regular, 16px - For standard body text</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}