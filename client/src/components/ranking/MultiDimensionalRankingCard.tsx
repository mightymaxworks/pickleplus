import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useMultiDimensionalRankingData } from "@/hooks/use-multi-dimensional-rankings";
import { PlayFormat, AgeDivision } from "../../../shared/multi-dimensional-rankings";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDistanceToNow } from "date-fns";

export function MultiDimensionalRankingCard() {
  const { user } = useAuth();
  const [format, setFormat] = useState<PlayFormat>("singles");
  const [ageDivision, setAgeDivision] = useState<AgeDivision>("19plus");
  const [activeTab, setActiveTab] = useState("leaderboard");

  const {
    leaderboard,
    position,
    history,
    tiers,
    isLoading,
    isError,
    error,
  } = useMultiDimensionalRankingData(user?.id, format, ageDivision);

  // Format options for dropdown
  const formatOptions = [
    { value: "singles", label: "Singles" },
    { value: "doubles", label: "Doubles" },
    { value: "mixed", label: "Mixed Doubles" },
  ];

  // Age division options for dropdown
  const divisionOptions = [
    { value: "19plus", label: "Open (19+)" },
    { value: "35plus", label: "35+" },
    { value: "50plus", label: "50+" },
  ];

  // For history chart
  const chartData = history.map((entry) => ({
    date: new Date(entry.createdAt || "").toLocaleDateString(),
    points: entry.newRanking,
  }));

  // User's current rank display
  const rankDisplay = position ? (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="text-4xl font-bold">#{position.rank}</div>
      <div className="text-sm text-muted-foreground">
        of {position.totalPlayers} players
      </div>
      <div className="mt-2 text-lg">
        <span className="font-bold">{position.rankingPoints}</span> points
      </div>
    </div>
  ) : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Dimensional Rankings</CardTitle>
          <CardDescription>
            Track your performance across different formats and age divisions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Dimensional Rankings</CardTitle>
          <CardDescription>An error occurred loading your rankings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-destructive">
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Dimensional Rankings</CardTitle>
        <CardDescription>
          Track your performance across different formats and age divisions
        </CardDescription>
        <div className="flex gap-2 pt-2">
          <Select value={format} onValueChange={(v) => setFormat(v as PlayFormat)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ageDivision} onValueChange={(v) => setAgeDivision(v as AgeDivision)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Age Division" />
            </SelectTrigger>
            <SelectContent>
              {divisionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="leaderboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="rank">Your Rank</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="min-h-[300px]">
            <div className="rounded-md border">
              <Table>
                <TableCaption>
                  {formatOptions.find((f) => f.value === format)?.label} -{" "}
                  {divisionOptions.find((d) => d.value === ageDivision)?.label} Rankings
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((player) => (
                    <TableRow
                      key={player.id}
                      className={player.userId === user?.id ? "bg-muted/50" : ""}
                    >
                      <TableCell className="font-medium">{player.rank}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {player.avatarInitials || player.displayName?.substring(0, 2) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {player.displayName || player.username}
                            {player.userId === user?.id && (
                              <Badge variant="outline" className="ml-2">
                                You
                              </Badge>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {player.rankingPoints}
                      </TableCell>
                    </TableRow>
                  ))}
                  {leaderboard.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No rankings available for this category yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="history" className="min-h-[300px]">
            {history.length > 0 ? (
              <div className="space-y-4">
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      width={500}
                      height={300}
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="points"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableCaption>Ranking Point History</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((entry) => {
                        const change = entry.newRanking - entry.oldRanking;
                        const isPositive = change > 0;
                        return (
                          <TableRow key={entry.id}>
                            <TableCell>
                              {entry.createdAt
                                ? formatDistanceToNow(new Date(entry.createdAt), {
                                    addSuffix: true,
                                  })
                                : "Unknown"}
                            </TableCell>
                            <TableCell>
                              <div
                                className={`flex items-center ${
                                  isPositive ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {isPositive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                {isPositive ? "+" : ""}
                                {change}
                              </div>
                            </TableCell>
                            <TableCell>{entry.reason}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="flex h-60 items-center justify-center">
                <p className="text-center text-muted-foreground">
                  No ranking history available yet
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rank" className="min-h-[300px]">
            <div className="flex flex-col items-center justify-center gap-4">
              {rankDisplay}

              <div className="mt-4 w-full max-w-md">
                <h3 className="mb-2 font-semibold">Your Stats</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Format</TableCell>
                        <TableCell>
                          {formatOptions.find((f) => f.value === format)?.label}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Age Division</TableCell>
                        <TableCell>
                          {divisionOptions.find((d) => d.value === ageDivision)?.label}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Ranking Points</TableCell>
                        <TableCell>{position?.rankingPoints || 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Rank</TableCell>
                        <TableCell>
                          #{position?.rank || "N/A"} of {position?.totalPlayers || 0}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}