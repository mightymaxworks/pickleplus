import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkUploadResult {
  success: boolean;
  processed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

export default function BulkMatchUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.type === 'application/vnd.ms-excel' ||
          selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setUploadResult(null);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/match-management/bulk-upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult(result);
        toast({
          title: "Upload Complete",
          description: `Successfully processed ${result.processed} matches`,
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create and download Excel template
    window.open('/api/admin/match-management/download-template', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-500" />
            Download Excel Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Download the Excel template with the correct format for bulk match uploads.
          </p>
          <Button onClick={downloadTemplate} variant="outline" className="w-full sm:w-auto">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-500" />
            Upload Match Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select Excel File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {file && (
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertDescription>
                Selected file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Matches
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertDescription>
                <strong>Processed:</strong> {uploadResult.processed} matches
                {uploadResult.errors.length > 0 && (
                  <>
                    <br />
                    <strong>Errors:</strong> {uploadResult.errors.length} rows had issues
                  </>
                )}
              </AlertDescription>
            </Alert>

            {uploadResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Error Details:</h4>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {uploadResult.errors.map((error, index) => (
                    <div key={index} className="text-sm p-2 bg-red-50 rounded border border-red-200">
                      <strong>Row {error.row}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Excel Format Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Required Columns:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Player1_Username</strong> - Username or passport ID of player 1</li>
                <li>• <strong>Player2_Username</strong> - Username or passport ID of player 2</li>
                <li>• <strong>Format</strong> - "singles" or "doubles"</li>
                <li>• <strong>Match_Date</strong> - Date in YYYY-MM-DD format</li>
                <li>• <strong>Game1_P1_Score</strong> - Player 1 score for game 1</li>
                <li>• <strong>Game1_P2_Score</strong> - Player 2 score for game 1</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Optional Columns:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Player1_Partner_Username</strong> - For doubles matches</li>
                <li>• <strong>Player2_Partner_Username</strong> - For doubles matches</li>
                <li>• <strong>Tournament_Name</strong> - Tournament/competition name</li>
                <li>• <strong>Game2_P1_Score, Game2_P2_Score</strong> - Additional games</li>
                <li>• <strong>Game3_P1_Score, Game3_P2_Score</strong> - Up to 5 games supported</li>
                <li>• <strong>Notes</strong> - Match notes</li>
              </ul>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Players will be matched by username or passport ID. If a player doesn't exist, 
                the match will be skipped and reported in the error log.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}