/**
 * PKL-278651-OAUTH-0005 - Landing Page
 * 
 * Simple landing page to fix the lazy loading issue
 */

import React from 'react';
import { Link } from 'wouter';

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to Pickle+</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">OAuth System</h2>
          <p className="mb-4">Test our new OAuth implementation with these test pages:</p>
          <div className="space-y-2">
            <Link href="/test-oauth">
              <a className="block text-blue-600 hover:underline">OAuth Dashboard Test</a>
            </Link>
            <Link href="/oauth/developer">
              <a className="block text-blue-600 hover:underline">OAuth Developer Dashboard (admin only)</a>
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Auth and Login</h2>
          <p className="mb-4">Access the authentication pages:</p>
          <div className="space-y-2">
            <Link href="/login">
              <a className="block text-blue-600 hover:underline">Login</a>
            </Link>
            <Link href="/register">
              <a className="block text-blue-600 hover:underline">Register</a>
            </Link>
            <Link href="/auth">
              <a className="block text-blue-600 hover:underline">Authentication</a>
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Pages</h2>
          <p className="mb-4">Various test pages for development:</p>
          <div className="space-y-2">
            <Link href="/test-login">
              <a className="block text-blue-600 hover:underline">Test Login</a>
            </Link>
            <Link href="/sage-demo">
              <a className="block text-blue-600 hover:underline">SAGE Demo</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}