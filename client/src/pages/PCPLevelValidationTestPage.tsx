/**
 * PCP Level Validation Test Page
 * PKL-278651-PCP-BASIC-TIER - Sequential Level Progression Testing
 * 
 * Allows testing of the PCP level validation system
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PCPLevelValidation } from '@/components/coach/PCPLevelValidation';

const PCPLevelValidationTestPage: React.FC = () => {
  const [userId, setUserId] = useState<number>(1);
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>();
  const [testResults, setTestResults] = useState<string>('');

  const handleLevelSelect = (level: number) => {
    setSelectedLevel(level);
    setTestResults(`Selected Level ${level} for validation`);
  };

  const testValidationAPI = async () => {
    try {
      const response = await fetch(`/api/pcp-cert/status/${userId}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      setTestResults(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResults(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testProgressionValidation = async () => {
    if (!selectedLevel) {
      setTestResults('Please select a level first');
      return;
    }

    try {
      const response = await fetch('/api/pcp-cert/validate-progression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          targetLevel: selectedLevel
        })
      });

      const data = await response.json();
      setTestResults(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResults(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PCP Level Validation Test</CardTitle>
          <CardDescription>
            Test the sequential PCP level progression system to ensure coaches cannot skip levels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userId">User ID for Testing</Label>
              <Input
                id="userId"
                type="number"
                value={userId}
                onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
                placeholder="Enter user ID"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={testValidationAPI} variant="outline">
                Test Status API
              </Button>
              <Button onClick={testProgressionValidation} variant="outline">
                Test Progression
              </Button>
            </div>
          </div>

          {testResults && (
            <Alert>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-xs">
                  {testResults}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <PCPLevelValidation
        userId={userId}
        onLevelSelect={handleLevelSelect}
        selectedLevel={selectedLevel}
      />

      <Card>
        <CardHeader>
          <CardTitle>Sequential Progression Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>✅ Valid Progressions:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>New coach → Level 1 (Entry Coach)</li>
              <li>Level 1 → Level 2 (Certified Coach)</li>
              <li>Level 2 → Level 3 (Advanced Coach)</li>
              <li>Level 3 → Level 4 (Master Coach)</li>
              <li>Level 4 → Level 5 (Grand Master)</li>
            </ul>
            
            <p className="mt-4"><strong>❌ Invalid Progressions (Should be blocked):</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>New coach → Level 2, 3, 4, or 5</li>
              <li>Level 1 → Level 3, 4, or 5</li>
              <li>Level 2 → Level 4 or 5</li>
              <li>Level 3 → Level 5</li>
              <li>Any level skipping</li>
            </ul>

            <p className="mt-4"><strong>Commission Structure:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Level 1: 15% commission ($80.75 per $95 session)</li>
              <li>Level 2: 13% commission ($82.65 per $95 session)</li>
              <li>Level 3: 12% commission ($83.60 per $95 session)</li>
              <li>Level 4: 10% commission ($85.50 per $95 session)</li>
              <li>Level 5: 8% commission ($87.40 per $95 session)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PCPLevelValidationTestPage;