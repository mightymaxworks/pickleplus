import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useMultiDimensionalRankingData } from "@/hooks/use-multi-dimensional-rankings";
import { PlayFormat, AgeDivision, LeaderboardEntry } from "../../../shared/multi-dimensional-rankings";
import { motion, AnimatePresence } from "framer-motion";
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
    // Junior divisions
    { value: "U12", label: "Junior U12" },
    { value: "U14", label: "Junior U14" },
    { value: "U16", label: "Junior U16" },
    { value: "U19", label: "Junior U19" },
    // Adult divisions
    { value: "19plus", label: "Open (19+)" },
    { value: "35plus", label: "35+" },
    { value: "50plus", label: "50+" },
    // Senior divisions
    { value: "60plus", label: "60+" },
    { value: "70plus", label: "70+" },
  ];

  // For history chart
  const chartData = history.map((entry, index) => ({
    date: new Date(entry.createdAt || "").toLocaleDateString(),
    points: entry.newRanking,
    change: entry.newRanking - entry.oldRanking,
    previousPoints: entry.oldRanking,
    tooltipContent: `${entry.reason} (${entry.newRanking - entry.oldRanking >= 0 ? '+' : ''}${entry.newRanking - entry.oldRanking} pts)`
  }));

  // User's current rank display
  const rankDisplay = position ? (
    <motion.div 
      className="flex flex-col items-center justify-center p-6 rounded-lg border shadow-sm"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <div className="relative mb-2">
        <motion.div 
          className="text-5xl font-bold text-primary" 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          #{position.rank}
        </motion.div>
        {position.rank <= 3 && (
          <motion.div 
            className="absolute -top-6 -right-6"
            initial={{ rotate: -30, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
          >
            {position.rank === 1 ? '🏆' : position.rank === 2 ? '🥈' : '🥉'}
          </motion.div>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        of {position.totalPlayers} players
      </div>
      <motion.div 
        className="mt-4 px-3 py-1 bg-muted rounded-full"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <span className="font-bold text-lg">{position.rankingPoints}</span> points
      </motion.div>
    </motion.div>
  ) : (
    <div className="flex items-center justify-center p-6 text-muted-foreground">
      No ranking data available yet
    </div>
  );

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
                  <AnimatePresence>
                    {leaderboard.map((player) => (
                      <motion.tr
                        key={player.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={player.userId === user?.id ? "bg-muted/50" : ""}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {player.rank <= 3 && (
                              <span className="mr-2">
                                {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                              </span>
                            )}
                            {player.rank}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border-2" style={{ borderColor: player.userId === user?.id ? 'var(--primary)' : 'transparent' }}>
                              <AvatarFallback>
                                {player.avatarInitials || player.displayName?.substring(0, 2) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {player.displayName || player.username}
                                {player.userId === user?.id && (
                                  <Badge variant="outline" className="ml-2">
                                    You
                                  </Badge>
                                )}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant="secondary" 
                            className="font-semibold px-2 py-1"
                          >
                            {player.rankingPoints} pts
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
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
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-md border bg-background p-2 shadow-md">
                                <p className="font-semibold">{data.date}</p>
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Points: </span>
                                  <span className="font-semibold">{data.points}</span>
                                </p>
                                {data.change !== 0 && (
                                  <p className={`text-sm ${data.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {data.change > 0 ? '+' : ''}{data.change} points
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {data.tooltipContent}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="points"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                        activeDot={{ r: 8, fill: 'var(--primary)' }}
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