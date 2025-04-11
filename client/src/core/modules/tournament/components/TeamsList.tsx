/**
 * PKL-278651-TOURN-0001-BRCKT
 * Teams List Component
 * 
 * Displays a list of teams registered for a tournament
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Team = {
  id: number;
  teamName: string;
  playerOne: {
    id: number;
    displayName: string;
    avatarUrl?: string;
    avatarInitials?: string;
  };
  playerTwo: {
    id: number;
    displayName: string;
    avatarUrl?: string;
    avatarInitials?: string;
  };
  seedNumber?: number;
  registrationDate: string | Date;
  status: string;
};

type TeamsListProps = {
  teams: Team[];
  tournamentId: number;
};

export function TeamsList({ teams, tournamentId }: TeamsListProps) {
  // Sort teams by seed number if available, or by name
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.seedNumber && b.seedNumber) {
      return a.seedNumber - b.seedNumber;
    } else if (a.seedNumber) {
      return -1;
    } else if (b.seedNumber) {
      return 1;
    }
    return a.teamName.localeCompare(b.teamName);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'withdrawn':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Registered Teams</CardTitle>
        <CardDescription>
          {teams.length} {teams.length === 1 ? 'team' : 'teams'} registered for this tournament
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Seed</TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTeams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium text-center">
                  {team.seedNumber || '-'}
                </TableCell>
                <TableCell>{team.teamName}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={team.playerOne.avatarUrl} />
                        <AvatarFallback>{team.playerOne.avatarInitials || team.playerOne.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{team.playerOne.displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={team.playerTwo.avatarUrl} />
                        <AvatarFallback>{team.playerTwo.avatarInitials || team.playerTwo.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{team.playerTwo.displayName}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(team.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Remove</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}