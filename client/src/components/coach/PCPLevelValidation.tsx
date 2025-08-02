/**
 * PCP Level Validation Component
 * PKL-278651-PCP-BASIC-TIER - Sequential Level Progression Enforcement
 * 
 * Validates that coaches complete PCP levels sequentially and cannot skip levels
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, ArrowRight, Lock } from 'lucide-react';

interface PCPLevel {
  level: number;
  name: string;
  badge: string;
  commission: number;
  cost: number;
  prerequisite: number | null;
}

interface CompletedLevel {
  level: number;
  certificationNumber: string;
  completedAt: Date;
  expiresAt?: Date;
}

interface PCPValidationStatus {
  currentLevel: number;
  completedLevels: CompletedLevel[];
  availableNextLevel: number | null;
  canProgress: boolean;
  nextLevelInfo?: PCPLevel;
  allLevels: Record<string, PCPLevel>;
}

interface PCPLevelValidationProps {
  userId: number;
  onLevelSelect?: (level: number) => void;
  selectedLevel?: number;
  showValidationOnly?: boolean;
}

const PCP_LEVEL_CONFIG: Record<number, PCPLevel> = {
  1: { level: 1, name: 'Entry Coach', badge: '🥉', commission: 15, cost: 699, prerequisite: null },
  2: { level: 2, name: 'Certified Coach', badge: '🥈', commission: 13, cost: 1299, prerequisite: 1 },
  3: { level: 3, name: 'Advanced Coach', badge: '🥇', commission: 12, cost: 2499, prerequisite: 2 },
  4: { level: 4, name: 'Master Coach', badge: '💎', commission: 10, cost: 4999, prerequisite: 3 },
  5: { level: 5, name: 'Grand Master', badge: '👑', commission: 8, cost: 7999, prerequisite: 4 }
};

export const PCPLevelValidation: React.FC<PCPLevelValidationProps> = ({
  userId,
  onLevelSelect,
  selectedLevel,
  showValidationOnly = false
}) => {
  const [validationStatus, setValidationStatus] = useState<PCPValidationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchValidationStatus();
  }, [userId]);

  const fetchValidationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pcp-cert/status/${userId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PCP validation status');
      }

      const data = await response.json();
      setValidationStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const validateLevelProgression = async (targetLevel: number) => {
    try {
      const response = await fetch('/api/pcp-cert/validate-progression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          targetLevel
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Validation failed');
        return false;
      }

      return data.canProgress;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation error occurred');
      return false;
    }
  };

  const handleLevelSelect = async (level: number) => {
    if (await validateLevelProgression(level)) {
      onLevelSelect?.(level);
      setError(null);
    }
  };

  const getLevelStatus = (level: number): 'completed' | 'available' | 'locked' => {
    if (!validationStatus) return 'locked';
    
    const isCompleted = validationStatus.completedLevels.some(cl => cl.level === level);
    if (isCompleted) return 'completed';
    
    if (level === validationStatus.availableNextLevel) return 'available';
    
    return 'locked';
  };

  const getStatusIcon = (status: 'completed' | 'available' | 'locked') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'available':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: 'completed' | 'available' | 'locked') => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'available':
        return 'bg-blue-50 border-blue-200';
      case 'locked':
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading PCP status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchValidationStatus}
          className="mt-2"
        >
          Retry
        </Button>
      </Alert>
    );
  }

  if (!validationStatus) {
    return (
      <Alert>
        <AlertDescription>Unable to load PCP certification status.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            PCP Certification Progress
            {validationStatus.currentLevel > 0 && (
              <Badge variant="secondary">
                {PCP_LEVEL_CONFIG[validationStatus.currentLevel]?.badge} Level {validationStatus.currentLevel}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {validationStatus.currentLevel === 0 
              ? 'Ready to begin PCP certification journey'
              : `Currently certified at Level ${validationStatus.currentLevel}. ${validationStatus.canProgress ? `Level ${validationStatus.availableNextLevel} available.` : 'Maximum level achieved!'}`
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Level Progression Path */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Certification Levels</h3>
        <div className="grid gap-4">
          {Object.values(PCP_LEVEL_CONFIG).map((levelConfig, index) => {
            const status = getLevelStatus(levelConfig.level);
            const isSelected = selectedLevel === levelConfig.level;
            const completedLevel = validationStatus.completedLevels.find(cl => cl.level === levelConfig.level);
            
            return (
              <Card 
                key={levelConfig.level} 
                className={`transition-all duration-200 ${getStatusColor(status)} ${
                  isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                } ${status === 'available' && !showValidationOnly ? 'cursor-pointer hover:shadow-md' : ''}`}
                onClick={() => status === 'available' && !showValidationOnly ? handleLevelSelect(levelConfig.level) : undefined}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{levelConfig.badge}</span>
                        <div>
                          <div className="font-semibold">
                            Level {levelConfig.level}: {levelConfig.name}
                          </div>
                          {completedLevel && (
                            <div className="text-sm text-gray-600">
                              Completed: {new Date(completedLevel.completedAt).toLocaleDateString()}
                              {completedLevel.certificationNumber && (
                                <span className="ml-2 font-mono text-xs">
                                  {completedLevel.certificationNumber}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        ${levelConfig.cost.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">
                        {levelConfig.commission}% commission
                      </div>
                      {status === 'locked' && levelConfig.prerequisite && (
                        <div className="text-xs text-red-500 mt-1">
                          Requires Level {levelConfig.prerequisite}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index < Object.values(PCP_LEVEL_CONFIG).length - 1 && status !== 'locked' && (
                    <div className="flex justify-center mt-4">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sequential Progression Information */}
      <Alert>
        <AlertDescription>
          <strong>Sequential Progression Required:</strong> PCP levels must be completed in order. 
          You cannot skip levels or access higher certifications without completing all prerequisite levels first.
        </AlertDescription>
      </Alert>

      {/* Next Steps */}
      {validationStatus.canProgress && validationStatus.nextLevelInfo && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Next Level Available</CardTitle>
            <CardDescription className="text-blue-600">
              Ready to advance to Level {validationStatus.nextLevelInfo.level}: {validationStatus.nextLevelInfo.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {validationStatus.nextLevelInfo.badge} {validationStatus.nextLevelInfo.name}
                </div>
                <div className="text-sm text-gray-600">
                  Investment: ${validationStatus.nextLevelInfo.cost.toLocaleString()} • 
                  Commission: {validationStatus.nextLevelInfo.commission}%
                </div>
              </div>
              {!showValidationOnly && (
                <Button onClick={() => handleLevelSelect(validationStatus.nextLevelInfo!.level)}>
                  Select Level {validationStatus.nextLevelInfo.level}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PCPLevelValidation;