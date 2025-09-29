import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function GamifiedMatchRecording() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-white mb-4">Gamified Match Recording</h1>
        <p className="text-gray-300 mb-6">Debug: Component is now rendering successfully!</p>
        <Button className="bg-orange-500 hover:bg-orange-600">
          Start Match Recording
        </Button>
      </Card>
    </div>
  );
}