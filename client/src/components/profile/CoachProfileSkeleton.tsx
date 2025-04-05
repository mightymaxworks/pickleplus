import { Skeleton } from "@/components/ui/skeleton";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export function CoachProfileSkeleton() {
  return (
    <div className="container max-w-5xl py-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/profile">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </Link>
      </Button>
      
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and Key Info */}
          <div className="flex flex-col items-center text-center md:text-left md:items-start">
            <Skeleton className="h-24 w-24 rounded-full mb-3" />
            <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-3 text-sm mb-3 justify-center md:justify-start">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          
          {/* Name, Bio, CTAs */}
          <div className="flex flex-col flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-6 w-64 mb-3" />
            <Skeleton className="h-20 w-full mb-4" />
            <div className="flex flex-wrap gap-3 mt-auto">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs Skeleton */}
      <div className="mb-4">
        <div className="border-b flex overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-28 mx-1" />
          ))}
        </div>
      </div>
      
      {/* Content Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48 mb-1" />
          <Skeleton className="h-5 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-md p-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}