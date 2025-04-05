import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Connection, User } from "@shared/schema";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { getModuleAPI } from "@/modules/moduleRegistration";
import { SocialModuleAPI } from "@/modules/types";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronsUpDown, Loader2, Search, User2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";

// Form schema for connection request
const connectionRequestSchema = z.object({
  recipientId: z.number({
    required_error: "Please select a player",
  }),
  type: z.string({
    required_error: "Please select a connection type",
  }),
  message: z.string().optional(),
});

type ConnectionRequestFormValues = z.infer<typeof connectionRequestSchema>;

interface ConnectionRequestFormProps {
  currentUserId: number;
  onConnectionRequested: (connection: Connection) => void;
}

export function ConnectionRequestForm({ 
  currentUserId, 
  onConnectionRequested 
}: ConnectionRequestFormProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<User[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const socialAPI = getModuleAPI<SocialModuleAPI>("social");

  // Initialize form
  const form = useForm<ConnectionRequestFormValues>({
    resolver: zodResolver(connectionRequestSchema),
    defaultValues: {
      type: "friend",
      message: "",
    },
  });

  // Search for players when query changes
  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setPlayers([]);
      return;
    }

    try {
      setIsLoading(true);
      const results = await socialAPI.searchPlayers(query);
      // Filter out current user
      setPlayers(results.filter(player => player.id !== currentUserId));
    } catch (error) {
      console.error("Error searching players:", error);
      toast({
        title: "Search failed",
        description: "Could not search for players",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      handleSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  // Handle player selection
  const handlePlayerSelect = (player: User) => {
    setSelectedPlayer(player);
    form.setValue("recipientId", player.id);
  };

  // Handle form submission
  const onSubmit = async (data: ConnectionRequestFormValues) => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please log in to connect with players",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const connection = await socialAPI.requestConnection(
        currentUserId,
        data.recipientId
      );
      
      onConnectionRequested(connection);
    } catch (error: any) {
      console.error("Error sending connection request:", error);
      toast({
        title: "Request failed",
        description: error.message || "Could not send connection request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Player Search */}
        <FormField
          control={form.control}
          name="recipientId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Player</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {selectedPlayer ? (
                        <div className="flex items-center gap-2">
                          <User2 className="h-4 w-4" />
                          {selectedPlayer.displayName}
                        </div>
                      ) : (
                        "Search for a player"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search players..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      className="h-9"
                    />
                    {isLoading && (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {!isLoading && (
                      <CommandList>
                        {searchQuery.length < 2 ? (
                          <CommandEmpty className="py-6 text-center text-sm">
                            Type at least 2 characters to search
                          </CommandEmpty>
                        ) : players.length === 0 ? (
                          <CommandEmpty className="py-6 text-center text-sm">
                            No players found
                          </CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {players.map((player) => (
                              <CommandItem
                                key={player.id}
                                value={player.id.toString()}
                                onSelect={() => handlePlayerSelect(player)}
                              >
                                <div className="flex items-center">
                                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full border">
                                    {player.avatarInitials ? player.avatarInitials.substring(0, 2) : "P+"}
                                  </div>
                                  <span>{player.displayName}</span>
                                </div>
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    selectedPlayer?.id === player.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Connection Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select connection type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="partner">Playing Partner</SelectItem>
                  <SelectItem value="teammate">Teammate</SelectItem>
                  <SelectItem value="coach">Coach Connection</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Message */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a brief message..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Request
        </Button>
      </form>
    </Form>
  );
}