/**
 * PKL-278651-TOURN-0001-BRCKT
 * Brackets List Component
 * 
 * Displays a list of brackets for a tournament
 */

import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Users, 
  Calendar, 
  ChevronRight, 
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRightLeft,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Bracket = {
  id: number;
  name: string;
  bracketType: string;
  teamsCount: number;
  roundsCount: number;
  status: string;
  startDate?: string | Date;
  endDate?: string | Date;
};

type BracketsListProps = {
  brackets: Bracket[];
  tournamentId: number;
};

export function BracketsList({ brackets, tournamentId }: BracketsListProps) {
  const getBracketTypeName = (type: string) => {
    switch (type) {
      case 'single_elimination':
        return 'Single Elimination';
      case 'double_elimination':
        return 'Double Elimination';
      case 'round_robin':
        return 'Round Robin';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {brackets.map((bracket) => (
        <Card key={bracket.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{bracket.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>{getBracketTypeName(bracket.bracketType)}</span>
                </CardDescription>
              </div>
              {getStatusBadge(bracket.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users size={16} />
                <span>{bracket.teamsCount} teams</span>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <ArrowRightLeft size={16} />
                <span>{bracket.roundsCount} rounds</span>
              </div>
              
              {bracket.startDate && bracket.endDate && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar size={16} />
                  <span>
                    {new Date(bracket.startDate).toLocaleDateString() === new Date(bracket.endDate).toLocaleDateString()
                      ? format(new Date(bracket.startDate), 'MMM d, yyyy')
                      : `${format(new Date(bracket.startDate), 'MMM d')} - ${format(new Date(bracket.endDate), 'MMM d, yyyy')}`
                    }
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-1" />
                  <span>Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* PKL-278651-TOURN-0011-ROUT: Updated bracket view link path to align with App.tsx route definition */}
            <Link to={`/admin/brackets/${bracket.id}`}>
              <Button variant="outline" className="gap-1">
                <span>View Bracket</span>
                <ChevronRight size={16} />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}