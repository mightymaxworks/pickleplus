import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PassportCodeProps {
  code: string;
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * Component for displaying a user's passport code
 * Part of PKL-278651-USER-0004-ID sprint
 */
const PassportCode: React.FC<PassportCodeProps> = ({ 
  code, 
  className = '',
  variant = 'default'
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // If no code provided, don't render anything
  if (!code) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    
    toast({
      title: 'Passport code copied!',
      description: 'The passport code has been copied to your clipboard.',
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  // Compact version for dashboard
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm font-semibold text-muted-foreground">Passport:</span>
        <code className="bg-muted px-2 py-1 rounded-md font-mono text-sm">{code}</code>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={handleCopy}
          title="Copy passport code"
        >
          {copied ? <CheckIcon className="h-3 w-3 text-green-500" /> : <CopyIcon className="h-3 w-3" />}
        </Button>
      </div>
    );
  }

  // Default full card display for profile
  return (
    <Card className={className}>
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-medium">Player Passport</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <code className="bg-muted px-3 py-2 rounded-md font-mono text-lg tracking-wider">{code}</code>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This is your unique Pickle+ passport code. Other players can use this code to find you.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PassportCode;