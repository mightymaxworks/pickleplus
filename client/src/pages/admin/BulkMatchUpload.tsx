import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface UploadResults {
  successful: number;
  failed: number;
  errors: string[];
}

export default function BulkMatchUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setUploadResults(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/bulk-upload/template', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pickle-plus-bulk-match-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Template Downloaded",
        description: "Excel template has been downloaded successfully",
      });

    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await fetch('/api/admin/bulk-upload/matches', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadResults(result.results);

      if (result.results.successful > 0) {
        toast({
          title: "Upload Completed",
          description: `Successfully processed ${result.results.successful} matches`,
        });
      }

      if (result.results.failed > 0) {
        toast({
          title: "Some Matches Failed",
          description: `${result.results.failed} matches could not be processed. Check the details below.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(0);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file. Please try again.';
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResults(null);
    setUploadProgress(0);
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Match Upload</h1>
        <p className="text-gray-600">Upload multiple match records using an Excel file</p>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Instructions</span>
          </CardTitle>
          <CardDescription>
            Follow these steps to bulk upload match records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Download Template</h3>
                <p className="text-sm text-gray-600">Get the Excel template with proper format and example data</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fill Data</h3>
                <p className="text-sm text-gray-600">Use passport codes to identify players. Include gender/date of birth to override existing data, or leave blank to preserve current user data</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Upload File</h3>
                <p className="text-sm text-gray-600">Upload the completed Excel file to process all matches</p>
              </div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Use the exact passport codes (like CBSPZV, HVGN0BW0) to identify players. 
              <br /><br />
              <strong>Date of Birth Format:</strong> Use YYYY-MM-DD format (e.g., 1990-05-15).
              <br /><br />
              <strong>Conditional Updates:</strong> If you provide gender or date of birth in Excel, it will override existing user data. Leave these fields blank to keep existing user data unchanged.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleDownloadTemplate}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Excel Template
          </Button>
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-green-600" />
            <span>Upload Match Data</span>
          </CardTitle>
          <CardDescription>
            Select your completed Excel file to upload match records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fileInput">Excel File</Label>
            <Input
              id="fileInput"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isUploading}
              className="mt-1"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Processing...' : 'Upload Matches'}
            </Button>

            {(file || uploadResults) && (
              <Button
                onClick={resetUpload}
                variant="outline"
                disabled={isUploading}
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {uploadResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Upload Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Successful</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{uploadResults.successful}</p>
                <p className="text-sm text-green-700">matches processed</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">Failed</span>
                </div>
                <p className="text-2xl font-bold text-red-900">{uploadResults.failed}</p>
                <p className="text-sm text-red-700">matches failed</p>
              </div>
            </div>

            {uploadResults.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Error Details</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {uploadResults.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-800 mb-1">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}