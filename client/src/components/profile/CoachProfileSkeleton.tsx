import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export function CoachProfileSkeleton() {
  return (
    <div className="container max-w-4xl py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/profile">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </Link>
      </Button>
      
      {/* Hero section skeleton */}
      <div className="relative rounded-xl p-6 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile image skeleton */}
          <Skeleton className="h-24 w-24 rounded-full" />
          
          <div className="flex-1 text-center md:text-left">
            {/* Name skeleton */}
            <Skeleton className="h-8 w-48 mb-2 mx-auto md:mx-0" />
            
            {/* Title/headline skeleton */}
            <Skeleton className="h-5 w-72 mb-4 mx-auto md:mx-0" />
            
            {/* Stats skeletons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs skeleton */}
      <Tabs defaultValue="about">
        <TabsList className="w-full mb-4 grid grid-cols-3">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="expertise">Expertise</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about">
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expertise">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-32 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="services">
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-10 w-full rounded-md mt-4" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}