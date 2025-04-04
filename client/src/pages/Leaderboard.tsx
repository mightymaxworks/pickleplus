import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const Leaderboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch current user data
  const { data: currentUser, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  // Fetch leaderboard data
  const { data: users, isLoading: leaderboardLoading } = useQuery<User[]>({
    queryKey: ['/api/leaderboard'],
    queryFn: async () => {
      const response = await fetch('/api/leaderboard?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      return response.json();
    }
  });

  const filteredUsers = users?.filter(user => 
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userLoading || leaderboardLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Leaderboard</h1>
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="fas fa-search"></i>
          </div>
        </div>
      </div>

      <Card className="bg-white shadow-sm">
        <Tabs defaultValue="rating">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rating">Rating</TabsTrigger>
            <TabsTrigger value="xp">XP</TabsTrigger>
            <TabsTrigger value="wins">Wins</TabsTrigger>
          </TabsList>
          <TabsContent value="rating">
            <CardContent className="p-0">
              <LeaderboardTable 
                users={filteredUsers || []} 
                currentUser={currentUser} 
                sortBy="rating"
              />
            </CardContent>
          </TabsContent>
          <TabsContent value="xp">
            <CardContent className="p-0">
              <LeaderboardTable 
                users={filteredUsers || []} 
                currentUser={currentUser} 
                sortBy="xp"
              />
            </CardContent>
          </TabsContent>
          <TabsContent value="wins">
            <CardContent className="p-0">
              <LeaderboardTable 
                users={filteredUsers || []} 
                currentUser={currentUser} 
                sortBy="wins"
              />
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Leaderboard;
