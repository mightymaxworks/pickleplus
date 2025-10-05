import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  success: boolean;
  analysisMode: boolean;
  fileName: string;
  summary: {
    totalTabs: number;
    totalMatches: number;
    singlesMatches: number;
    doublesMatches: number;
    uniquePlayers: number;
    matchedPlayers: number;
    unmatchedPlayers: number;
    totalRankingPointsToAward: number;
    totalPicklePointsToAward: number;
  };
  tabBreakdown: Array<{
    tabName: string;
    matchCount: number;
    singlesCount: number;
    doublesCount: number;
  }>;
  playerMatching: {
    matched: Array<{
      passportCode: string;
      displayName: string;
      currentPoints: number;
      gender: string;
    }>;
    unmatched: string[];
    unmatchedCount: number;
  };
  matches: Array<any>;
  warnings: string[];
  readyToImport: boolean;
}

export default function ExcelAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please select an Excel file first', variant: 'destructive' });
      return;
    }

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await fetch('/api/admin/udf-bulk/analyze-excel', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        toast({ 
          title: 'Analysis Complete', 
          description: `Found ${data.summary.totalMatches} matches across ${data.summary.totalTabs} tabs` 
        });
      } else {
        toast({ 
          title: 'Analysis Failed', 
          description: data.error || 'Failed to analyze file', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to analyze Excel file', 
        variant: 'destructive' 
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl" data-testid="excel-analyzer-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Excel Tournament Analyzer</h1>
        <p className="text-muted-foreground">
          Upload your Excel file to analyze matches, validate passport codes, and calculate points before importing
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Select a multi-tab Excel file containing match data. Each tab will be treated as a tournament.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
                data-testid="input-excel-file"
              />
              <label htmlFor="excel-file-input">
                <Button variant="outline" asChild data-testid="button-select-file">
                  <span className="cursor-pointer">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Select Excel File
                  </span>
                </Button>
              </label>
              {file && (
                <span className="text-sm text-muted-foreground" data-testid="text-selected-file">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={!file || analyzing}
              className="w-full sm:w-auto"
              data-testid="button-analyze"
            >
              <Upload className="mr-2 h-4 w-4" />
              {analyzing ? 'Analyzing...' : 'Analyze File'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-matches">{result.summary.totalMatches}</div>
                <p className="text-xs text-muted-foreground">
                  {result.summary.singlesMatches} singles, {result.summary.doublesMatches} doubles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tabs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-tabs">{result.summary.totalTabs}</div>
                <p className="text-xs text-muted-foreground">Tournament categories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ranking Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-ranking-points">
                  {result.summary.totalRankingPointsToAward.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">To be distributed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pickle Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-pickle-points">
                  {result.summary.totalPicklePointsToAward}
                </div>
                <p className="text-xs text-muted-foreground">Ranking pts × 1.5</p>
              </CardContent>
            </Card>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {result.warnings.map((warning, i) => (
                    <div key={i}>{warning}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {result.readyToImport && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                ✅ All passport codes matched! File is ready to import.
              </AlertDescription>
            </Alert>
          )}

          {/* Tab Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Tournament Breakdown by Tab</CardTitle>
              <CardDescription>Each tab represents a tournament category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.tabBreakdown.map((tab, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`tab-${i}`}>
                    <div>
                      <div className="font-medium">{tab.tabName}</div>
                      <div className="text-sm text-muted-foreground">
                        {tab.singlesCount} singles, {tab.doublesCount} doubles
                      </div>
                    </div>
                    <Badge variant="secondary">{tab.matchCount} matches</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Player Matching */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Matched Players ({result.playerMatching.matched.length})
                </CardTitle>
                <CardDescription>Passport codes found in database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {result.playerMatching.matched.map((player, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded" data-testid={`matched-player-${i}`}>
                      <div>
                        <div className="font-medium">{player.passportCode}</div>
                        <div className="text-sm text-muted-foreground">{player.displayName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{player.currentPoints} pts</div>
                        <div className="text-xs text-muted-foreground">{player.gender || 'unknown'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {result.playerMatching.unmatchedCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    Unmatched Players ({result.playerMatching.unmatchedCount})
                  </CardTitle>
                  <CardDescription>Passport codes NOT found in database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {result.playerMatching.unmatched.map((code, i) => (
                      <div key={i} className="p-2 border border-red-200 rounded bg-red-50" data-testid={`unmatched-player-${i}`}>
                        <div className="font-medium text-red-900">{code}</div>
                        <div className="text-sm text-red-600">Player not registered</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Match Details */}
          <Card>
            <CardHeader>
              <CardTitle>All Matches ({result.matches.length})</CardTitle>
              <CardDescription>Detailed match list with point calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto">
                <div className="space-y-3">
                  {result.matches.map((match, i) => (
                    <div key={i} className="p-4 border rounded-lg" data-testid={`match-${i}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant="outline" className="mb-1">{match.tabName}</Badge>
                          <div className="text-sm text-muted-foreground">Row {match.rowNumber}</div>
                        </div>
                        <Badge variant={match.matchType === 'Singles' ? 'default' : 'secondary'}>
                          {match.matchType}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm font-medium">Team 1</div>
                          <div className="text-sm">{match.player1}</div>
                          {match.player3 && <div className="text-sm">{match.player3}</div>}
                          <div className="text-lg font-bold mt-1">{match.team1Score}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Team 2</div>
                          <div className="text-sm">{match.player2}</div>
                          {match.player4 && <div className="text-sm">{match.player4}</div>}
                          <div className="text-lg font-bold mt-1">{match.team2Score}</div>
                        </div>
                      </div>

                      {match.pointsCalculation.canCalculate && (
                        <div className="bg-muted p-3 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm font-medium">Points Calculation</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Total Ranking Points: <span className="font-bold">{match.pointsCalculation.totalPoints}</span></div>
                            <div>Pickle Points: <span className="font-bold">{match.pointsCalculation.picklePointsAwarded}</span></div>
                          </div>
                          {match.pointsCalculation.crossGenderBonus && (
                            <div className="text-xs text-green-600 mt-1">✓ Cross-gender bonus applied</div>
                          )}
                        </div>
                      )}

                      {!match.pointsCalculation.canCalculate && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertDescription className="text-sm">
                            Cannot calculate points - missing player data
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
