import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Trophy, Activity, ArrowRight, Play, Star } from 'lucide-react';

export default function DesignTestPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - PlayByPoint Inspired but Better */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-7xl font-black leading-tight mb-8">
              THE AI-POWERED
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                PICKLEBALL
              </span>
              <br />
              DATA PLATFORM
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-12 max-w-2xl">
              Transform every match into intelligent insights. The platform that turns pickleball data into competitive advantage.
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
      <section className="bg-white py-16">
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
              Built for Champions.
              <br />
              <span className="text-slate-600">Designed for Growth.</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              The comprehensive platform that elevates your game through intelligent data analysis and seamless player experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Smart Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Advanced algorithms analyze every match to provide accurate, dynamic player rankings that evolve with performance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Deep insights into your game patterns, strengths, and areas for improvement powered by machine learning.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Community Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Connect with players, find matches, join tournaments, and build lasting relationships in the pickleball community.
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
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Elevate Your Game?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of players who trust Pickle+ to track, analyze, and improve their pickleball performance.
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-medium">
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
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