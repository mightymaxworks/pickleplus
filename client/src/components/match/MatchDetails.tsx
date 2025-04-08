import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RecordedMatch } from '@/lib/sdk/matchSDK';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Award, 
  Users, 
  CheckCircle, 
  XCircle,
  Trophy,
  Zap,
  Star,
  MessageSquare
} from 'lucide-react';

interface MatchDetailsProps {
  match: RecordedMatch;
  onClose: () => void;
}

export function MatchDetails({ match, onClose }: MatchDetailsProps) {
  const { 
    id, 
    date, 
    players, 
    formatType, 
    scoringSystem,
    pointsToWin,
    gameScores = [],
    location
  } = match;
  
  const matchDate = new Date(date);
  const formattedDate = format(matchDate, 'MMMM d, yyyy');
  const formattedTime = format(matchDate, 'h:mm a');
  
  // Find winner and loser
  const winner = players.find(p => p.isWinner);
  const loser = players.find(p => !p.isWinner);
  
  const isDoublesMatch = formatType === 'doubles';
  
  // Format the Players display
  const formatPlayerDisplay = (player: any, isWinner: boolean) => {
    const playerName = player.displayName || player.username || 'Unknown Player';
    const partnerId = isDoublesMatch ? (isWinner ? winner?.partnerId : loser?.partnerId) : null;
    const partnerData = null; // In a real implementation, this would be fetched
    const partnerName = partnerData ? (partnerData.displayName || partnerData.username) : 'Unknown Partner';
    
    return (
      <div className="flex items-center">
        <div className="flex flex-col">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              {player.avatarUrl ? (
                <AvatarImage src={player.avatarUrl} alt={playerName} />
              ) : (
                <AvatarFallback>{player.avatarInitials || playerName.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <span className="font-medium">{playerName}</span>
            {player.isFoundingMember && (
              <Badge variant="outline" className="ml-2 border-amber-500 text-amber-500">
                Founder
              </Badge>
            )}
          </div>
          
          {isDoublesMatch && partnerId && (
            <div className="flex items-center mt-1 ml-8">
              <Avatar className="h-5 w-5 mr-1">
                {partnerData?.avatarUrl ? (
                  <AvatarImage src={partnerData.avatarUrl} alt={partnerName} />
                ) : (
                  <AvatarFallback>{partnerData?.avatarInitials || partnerName.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm text-muted-foreground">{partnerName}</span>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Match Details
            <Badge className="ml-2" variant={winner?.userId === players[0]?.userId ? "success" : "destructive"}>
              {winner?.userId === players[0]?.userId ? "Won" : "Lost"}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Match metadata */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDate}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {formattedTime}
            </div>
            {location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {location}
              </div>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              {formatType.charAt(0).toUpperCase() + formatType.slice(1)}
            </div>
          </div>
          
          <Separator />
          
          {/* Score summary */}
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Player 1 */}
            <div className="text-left">
              {formatPlayerDisplay(players[0], players[0].isWinner)}
            </div>
            
            {/* Score */}
            <div className="text-center">
              <div className="text-2xl font-bold">
                {players[0].score} - {players[1].score}
              </div>
              <div className="text-xs text-muted-foreground">
                {scoringSystem}, {pointsToWin} pts
              </div>
            </div>
            
            {/* Player 2 */}
            <div className="text-right">
              {formatPlayerDisplay(players[1], players[1].isWinner)}
            </div>
          </div>
          
          {/* Game scores if multi-game match */}
          {gameScores.length > 0 && (
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm">Game Scores</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game</TableHead>
                      <TableHead className="text-center">{players[0].displayName || 'Player 1'}</TableHead>
                      <TableHead className="text-center">{players[1].displayName || 'Player 2'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gameScores.map((game: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="text-center font-medium">
                          {game.playerOneScore}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {game.playerTwoScore}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          
          {/* Validation status */}
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm">Validation Status</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Validated by You</span>
              </div>
              <div className="flex items-center mt-2">
                <XCircle className="h-5 w-5 text-amber-500 mr-2" />
                <span>Pending validation from opponent</span>
              </div>
            </CardContent>
          </Card>
          
          {/* XP and rating information */}
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm">Rewards</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-amber-500 mr-2" />
                  <div>
                    <div className="font-medium">XP Earned</div>
                    <div className="text-sm text-muted-foreground">+25 XP</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <div className="font-medium">Rating Change</div>
                    <div className="text-sm text-muted-foreground">+2 points</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Feedback */}
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm">Match Feedback</CardTitle>
            </CardHeader>
            <CardContent className="py-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enjoyment</span>
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? 'text-amber-500' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Skill Match</span>
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-4 w-4 ${i < 3 ? 'text-amber-500' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-start mt-2">
                <MessageSquare className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  "Great match! Really enjoyed the rallies. Let's play again soon."
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MatchDetails;