import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function TestRoutingPage() {
  const [location, navigate] = useLocation();
  const [clickCount, setClickCount] = useState(0);
  
  // Debug logging
  useEffect(() => {
    console.log("TestRoutingPage - Current location:", location);
    console.log("TestRoutingPage - Click count:", clickCount);
  }, [location, clickCount]);
  
  // Test direct navigation with Link
  const handleTestLinkClick = () => {
    console.log("Link clicked");
    setClickCount(prev => prev + 1);
  };
  
  // Test programmatic navigation
  const handleNavigateClick = () => {
    console.log("Before navigate() call");
    navigate("/auth");
    console.log("After navigate() call");
    setClickCount(prev => prev + 1);
  };
  
  // Test with plain anchor
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    console.log("Anchor clicked");
    window.location.href = "/auth";
    setClickCount(prev => prev + 1);
  };
  
  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Routing Test Page</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Test 1: Link Component</h2>
          <p className="text-gray-600 mb-4">Using Wouter's Link component</p>
          <Link href="/auth" onClick={handleTestLinkClick}>
            <Button className="w-full">Go to Auth (Link)</Button>
          </Link>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Test 2: Navigate Function</h2>
          <p className="text-gray-600 mb-4">Using programmatic navigation</p>
          <Button className="w-full" onClick={handleNavigateClick}>
            Go to Auth (navigate)</Button>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Test 3: window.location</h2>
          <p className="text-gray-600 mb-4">Using window.location directly</p>
          <a href="/auth" className="block" onClick={handleAnchorClick}>
            <Button className="w-full">Go to Auth (window.location)</Button>
          </a>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Click count: {clickCount} | Current path: {location}
          </p>
        </div>
      </div>
    </div>
  );
}