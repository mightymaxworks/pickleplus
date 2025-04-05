import { useState, useEffect } from "react";
import { z } from "zod";
import { useDebounce } from "../../hooks/useDebounce";

// Add this for TypeScript
declare global {
  interface Window {
    apiRequest?: (method: string, url: string, data?: any) => Promise<Response>;
  }
}

// Define the schema for the connection request form
const connectionFormSchema = z.object({
  recipientId: z.number({
    required_error: "Please select a player",
  }),
  // Type is now hardcoded to "friend" and no longer needed in the form
  notes: z.string().optional(),
});

// Type for the form values
type ConnectionFormValues = z.infer<typeof connectionFormSchema>;

// Type for the users returned from search
interface User {
  id: number;
  username: string;
  displayName: string;
  avatarInitials: string;
}

export function ConnectionRequestForm() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Effect for debounced search to find users with API
  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedSearchQuery)}`);
          
          if (response.ok) {
            const users = await response.json();
            setSearchResults(users);
          } else {
            console.error("Error searching users:", await response.text());
            setSearchResults([]);
          }
        } catch (error) {
          console.error("Failed to search users:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };
    
    searchUsers();
  }, [debouncedSearchQuery]);

  // Handle selecting a user from the search results
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Handle reset
  const handleReset = () => {
    setOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
  };

  // Handle form submission - make it async
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    const formData = {
      recipientId: selectedUser.id,
      // Always use "friend" as the connection type
      type: "friend",
      notes: (e.target as HTMLFormElement).querySelector('textarea')?.value || ""
    };
    
    console.log("Sending connection request to", selectedUser, "with data:", formData);
    
    // Make the API call to create the connection
    try {
      // Make a simple fetch request
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send connection request");
      }
      
      // Show success message
      alert("Connection request sent!");
      handleReset();
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Failed to send connection request"}`);
    }
  };

  return (
    <div>
      <button 
        onClick={() => setOpen(true)}
        className="bg-[#FF5722] text-white px-4 py-2 rounded-full text-sm font-medium"
      >
        Add Friend
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-4">
            <h2 className="text-xl font-bold mb-4">Connect with a Player</h2>
            
            <form onSubmit={onSubmit} className="space-y-4">
              {/* User selection section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Search for Player</label>
                <div className="relative">
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={!!selectedUser}
                  />
                  {isSearching && (
                    <div className="absolute right-2 top-2">
                      <div className="animate-spin h-4 w-4 border-2 border-[#FF5722] border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {/* Search results */}
                {searchResults.length > 0 && !selectedUser && (
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    <ul className="py-1">
                      {searchResults.map((user) => (
                        <li
                          key={user.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                          onClick={() => handleSelectUser(user)}
                        >
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                            {user.avatarInitials}
                          </div>
                          <div>
                            <div className="font-medium">{user.displayName}</div>
                            <div className="text-xs text-gray-500">@{user.username}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Selected user */}
                {selectedUser && (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                        {selectedUser.avatarInitials}
                      </div>
                      <div>
                        <div className="font-medium">{selectedUser.displayName}</div>
                        <div className="text-xs text-gray-500">@{selectedUser.username}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-gray-500"
                      onClick={() => setSelectedUser(null)}
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Connection type is now hardcoded to "friend" */}

              {/* Notes field */}
              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Add a personal note to your connection request..."
                  rows={3}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#FF5722] text-white py-2 rounded-md font-medium"
                  disabled={!selectedUser}
                >
                  Send Request
                </button>
                <button
                  type="button"
                  className="flex-1 border border-gray-300 py-2 rounded-md font-medium"
                  onClick={handleReset}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}