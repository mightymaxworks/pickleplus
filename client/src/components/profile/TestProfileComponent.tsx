import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TestProfileComponent({ user }: { user: any }) {
  console.log("TestProfileComponent rendering with user:", user);
  
  return (
    <Card className="bg-blue-100 border-blue-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-blue-700">Test Profile Component</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-800">This is a test component working properly!</p>
        <p className="text-blue-800">Profile Completion: {user?.profileCompletionPct || 0}%</p>
      </CardContent>
    </Card>
  );
}