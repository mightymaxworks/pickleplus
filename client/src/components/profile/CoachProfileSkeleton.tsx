import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function CoachProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header Section */}
      <div className="mb-8">
        <Skeleton className="h-8 w-60 mb-2" />
        <Skeleton className="h-4 w-96 mb-6" />
      </div>
      
      {/* Profile Header Card */}
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72 mb-2" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </CardHeader>
        <CardFooter className="border-t pt-4">
          <div className="grid grid-cols-3 gap-4 w-full">
            <div>
              <Skeleton className="h-5 w-16 mb-1" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div>
              <Skeleton className="h-5 w-16 mb-1" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div>
              <Skeleton className="h-5 w-16 mb-1" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* About Section */}
      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      
      {/* Teaching Philosophy */}
      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      
      {/* Skills and Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-48 mt-4 mb-2" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
            
            <div className="mt-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-14 w-full rounded-md" />
                <Skeleton className="h-14 w-full rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Availability and Booking */}
      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array(7).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-16 mx-auto" />
                <Skeleton className="h-20 w-full rounded-md" />
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex gap-4 items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}