import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, TrendingUp, User, Star, Award } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// DUPR Integration Page - Convert DUPR ratings to Pickle+ with coach feedback enhancement
export default function DuprIntegrationPage() {
  const [duprId, setDuprId] = useState('');
  const [duprRating, setDuprRating] = useState('');
  const [notes, setNotes] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'user_provided' | 'screenshot' | 'manual_verification'>('user_provided');
  const [previewRating, setPreviewRating] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for conversion preview
  const { data: conversionPreview, isLoading: previewLoading } = useQuery({
    queryKey: ['/api/dupr/conversion-preview', duprRating],
    queryFn: ({ queryKey }) => {
      const rating = queryKey[1] as string;
      if (!rating || parseFloat(rating) < 2.0 || parseFloat(rating) > 8.0) return null;
      return fetch(`/api/dupr/conversion-preview?rating=${rating}`, { credentials: 'include' })
        .then(res => res.json());
    },
    enabled: !!duprRating && parseFloat(duprRating) >= 2.0 && parseFloat(duprRating) <= 8.0
  });

  // Import DUPR rating mutation
  const importMutation = useMutation({
    mutationFn: async (data: { duprId: string; duprRating: number; verificationMethod: string; notes?: string }) => {
      const res = await apiRequest('POST', '/api/dupr/import', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "DUPR Rating Imported Successfully!",
        description: `Your DUPR ${data.duprRating} converts to Pickle+ ${data.picklePlusRating}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dupr/rating-history'] });
      // Reset form
      setDuprId('');
      setDuprRating('');
      setNotes('');
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import DUPR rating",
        variant: "destructive",
      });
    }
  });

  const handleImport = () => {
    if (!duprId.trim() || !duprRating || parseFloat(duprRating) < 2.0 || parseFloat(duprRating) > 8.0) {
      toast({
        title: "Invalid Input",
        description: "Please provide a valid DUPR ID and rating (2.0-8.0)",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate({
      duprId: duprId.trim(),
      duprRating: parseFloat(duprRating),
      verificationMethod,
      notes: notes.trim() || undefined
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            DUPR Integration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Import your DUPR rating and convert it to the Pickle+ rating system. 
            Enhanced by coach feedback for continuous improvement.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Import Form */}
          <Card className="backdrop-blur-sm bg-white/80 border border-orange-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Import Your DUPR Rating
              </CardTitle>
              <CardDescription>
                Convert your Dynamic Universal Pickleball Rating to the Pickle+ system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* DUPR ID Input */}
              <div className="space-y-2">
                <Label htmlFor="duprId">DUPR ID</Label>
                <Input
                  id="duprId"
                  placeholder="Enter your DUPR player ID"
                  value={duprId}
                  onChange={(e) => setDuprId(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Find your DUPR ID on your DUPR profile page
                </p>
              </div>

              {/* DUPR Rating Input */}
              <div className="space-y-2">
                <Label htmlFor="duprRating">Current DUPR Rating</Label>
                <Input
                  id="duprRating"
                  type="number"
                  min="2.0"
                  max="8.0"
                  step="0.01"
                  placeholder="e.g., 4.5"
                  value={duprRating}
                  onChange={(e) => setDuprRating(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Enter your current DUPR rating (2.0 - 8.0)
                </p>
              </div>

              {/* Verification Method */}
              <div className="space-y-2">
                <Label>Verification Method</Label>
                <div className="flex gap-2">
                  <Button
                    variant={verificationMethod === 'user_provided' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVerificationMethod('user_provided')}
                  >
                    Self-Reported
                  </Button>
                  <Button
                    variant={verificationMethod === 'screenshot' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVerificationMethod('screenshot')}
                  >
                    Screenshot
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional context about your rating..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Conversion Preview */}
              {conversionPreview && (
                <Card className="bg-gradient-to-r from-orange-50 to-cyan-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Conversion Preview</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="bg-orange-100 text-orange-700">
                            DUPR {duprRating}
                          </Badge>
                          <span className="text-gray-400">→</span>
                          <Badge variant="outline" className="bg-cyan-100 text-cyan-700">
                            Pickle+ {conversionPreview.picklePlusRating}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="secondary">{conversionPreview.skillLevel}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleImport} 
                disabled={importMutation.isPending || !duprId || !duprRating}
                className="w-full bg-gradient-to-r from-orange-600 to-cyan-600 hover:from-orange-700 hover:to-cyan-700"
              >
                {importMutation.isPending ? 'Importing...' : 'Import DUPR Rating'}
              </Button>
            </CardFooter>
          </Card>

          {/* Benefits & Features */}
          <div className="space-y-6">
            
            {/* How It Works */}
            <Card className="backdrop-blur-sm bg-white/80 border border-cyan-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-cyan-600" />
                  How DUPR Integration Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <p className="font-medium">Import Your DUPR Rating</p>
                      <p className="text-sm text-gray-600">Securely import your current DUPR rating (2.0-8.0 scale)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <p className="font-medium">Automatic Conversion</p>
                      <p className="text-sm text-gray-600">Convert to Pickle+ rating (1.0-10.0 scale) using exponential curve</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <p className="font-medium">Coach Enhancement</p>
                      <p className="text-sm text-gray-600">Coaches can provide feedback to refine your rating over time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coach Feedback Benefits */}
            <Card className="backdrop-blur-sm bg-white/80 border border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Coach Feedback Enhancement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Technical Skills</p>
                    <p className="text-xs text-gray-600">±2.0 impact</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg">
                    <Award className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Tactical Awareness</p>
                    <p className="text-xs text-gray-600">±2.0 impact</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Physical Fitness</p>
                    <p className="text-xs text-gray-600">±1.0 impact</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Mental Game</p>
                    <p className="text-xs text-gray-600">±1.0 impact</p>
                  </div>
                </div>
                <Separator />
                <div className="text-center text-sm text-gray-600">
                  <p><strong>Higher certified coaches (L3-L5)</strong> have greater rating impact</p>
                  <p>Multiple coaching sessions create stronger rating confidence</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* FAQ Section */}
        <Card className="backdrop-blur-sm bg-white/80 border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Why can't I connect directly to DUPR?</h4>
                <p className="text-sm text-gray-600">
                  DUPR only provides API access to official partners. Manual import ensures 
                  accurate rating transfer while maintaining your privacy.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">How accurate is the conversion?</h4>
                <p className="text-sm text-gray-600">
                  Our exponential curve algorithm accounts for skill gap compression, 
                  providing a more accurate representation than linear conversion.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Can I update my DUPR rating?</h4>
                <p className="text-sm text-gray-600">
                  Once imported, contact support for updates. Coach feedback provides 
                  ongoing rating refinement without manual updates.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">What happens to my existing rating?</h4>
                <p className="text-sm text-gray-600">
                  Your DUPR rating becomes your baseline. Coach feedback and match 
                  results will adjust your Pickle+ rating from this foundation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}