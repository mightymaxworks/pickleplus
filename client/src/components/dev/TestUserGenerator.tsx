import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function TestUserGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [count, setCount] = useState("5");
  const [generatedUsers, setGeneratedUsers] = useState<any[]>([]);

  const generateTestUsers = async () => {
    setIsGenerating(true);
    try {
      const res = await apiRequest("POST", "/api/dev/create-test-users", {
        count: parseInt(count)
      });
      
      if (res.ok) {
        const data = await res.json();
        setGeneratedUsers(data.users);
        toast({
          title: "Success",
          description: `Created ${data.users.length} test users successfully.`,
        });
      } else {
        const error = await res.text();
        toast({
          title: "Error generating test users",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating test users:", error);
      toast({
        title: "Error",
        description: "Failed to generate test users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Test User Generator</CardTitle>
        <CardDescription>
          Create test users to help with developing and testing the app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1/3">
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger>
                  <SelectValue placeholder="Number of users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 User</SelectItem>
                  <SelectItem value="3">3 Users</SelectItem>
                  <SelectItem value="5">5 Users</SelectItem>
                  <SelectItem value="10">10 Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={generateTestUsers} 
              disabled={isGenerating}
              className="flex gap-2 items-center"
            >
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate Users
            </Button>
          </div>
          
          {generatedUsers.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Generated Test Users:</h3>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                <ul className="space-y-1">
                  {generatedUsers.map((user) => (
                    <li key={user.id} className="text-sm flex items-center gap-2">
                      <span className="font-semibold">{user.displayName}</span>
                      <span className="text-muted-foreground">({user.username})</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Password for all test users: password123
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}