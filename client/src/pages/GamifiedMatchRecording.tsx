import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';

export default function GamifiedMatchRecording() {
  console.log('=== GamifiedMatchRecording component LOADED ===');
  
  try {
    const [, setLocation] = useLocation();
    
    // Detect current phase based on URL
    const [isCreate] = useRoute('/match/create');
    const [isRecord, recordParams] = useRoute('/match/record/:matchId');
    const [isResult, resultParams] = useRoute('/match/result/:matchId');
    const [isLegacy] = useRoute('/gamified-match-recording');
    
    // Determine current phase
    const phase = isRecord ? 'record' : isResult ? 'result' : 'create';
    const matchId = recordParams?.matchId || resultParams?.matchId;
    
    console.log('Route detection:', { isCreate, isRecord, isResult, phase, matchId });
    
    // Simple debug render to test if component works
    if (phase === 'record') {
      console.log('Rendering recording phase...');
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          color: 'black',
          minHeight: '100vh'
        }}>
          <h1>Recording Phase - Match ID: {matchId}</h1>
          <p>This is the recording phase!</p>
          <button onClick={() => setLocation('/match/create')}>
            Back to Create
          </button>
        </div>
      );
    }
    
    if (phase === 'result') {
      console.log('Rendering result phase...');
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          color: 'black',
          minHeight: '100vh'
        }}>
          <h1>Result Phase - Match ID: {matchId}</h1>
          <p>This is the result phase!</p>
          <button onClick={() => setLocation('/match/create')}>
            Back to Create
          </button>
        </div>
      );
    }
    
    // Create phase - simple test button
    console.log('Rendering create phase...');
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'white', 
        color: 'black',
        minHeight: '100vh'
      }}>
        <h1>Create Phase</h1>
        <p>This is the create phase!</p>
        <button 
          onClick={() => {
            const matchId = 'TEST123';
            console.log('Starting match with ID:', matchId);
            setLocation(`/match/record/${matchId}`);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Start Match
        </button>
      </div>
    );
    
  } catch (error) {
    console.error('Error in GamifiedMatchRecording:', error);
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'red', 
        color: 'white',
        minHeight: '100vh'
      }}>
        <h1>Error occurred!</h1>
        <p>Component crashed: {String(error)}</p>
      </div>
    );
  }
}