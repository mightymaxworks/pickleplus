/**
 * PKL-278651-OAUTH-0005 - Simple OAuth Test Page
 *
 * A minimal test page for the OAuth API routes
 */

import React, { useState } from 'react';

export default function SimpleOAuthTestPage() {
  const [apiResponse, setApiResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testOAuthEndpoint = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/oauth/developer/clients');
      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Simple OAuth Test Page</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.5rem' }}>
          This page tests the OAuth API endpoints directly without any UI components.
        </p>
        
        <button 
          onClick={testOAuthEndpoint}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Test OAuth API'}
        </button>
      </div>
      
      {apiResponse && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>API Response:</h2>
          <pre style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '1rem', 
            borderRadius: '0.25rem',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {apiResponse}
          </pre>
        </div>
      )}
    </div>
  );
}