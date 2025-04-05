import { useState, useEffect } from "react";
import { z } from "zod";
import { useDebounce } from "../../hooks/useDebounce";

// Define the schema for the connection request form
const connectionFormSchema = z.object({
  recipientId: z.number({
    required_error: "Please select a player",
  }),
  type: z.string({
    required_error: "Please select a connection type",
  }),
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

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
      // Mock search results for now
      setIsSearching(true);
      setTimeout(() => {
        setSearchResults([
          {
            id: 1,
            username: "picklemaster",
            displayName: "Pickle Master",
            avatarInitials: "PM"
          },
          {
            id: 2,
            username: "dinkstar",
            displayName: "Dink Star",
            avatarInitials: "DS"
          }
        ]);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
    }
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

  // Handle form submission
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending connection request to", selectedUser);
    // Show success message
    alert("Connection request sent!");
    handleReset();
  };

  return (
    <div>
      <button 
        onClick={() => setOpen(true)}
        className="bg-[#FF5722] text-white px-4 py-2 rounded-full text-sm font-medium"
      >
        Connect with Player
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-4">
            <h2 className="text-xl font-bold mb-4">Send Connection Request</h2>
            
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

              {/* Connection type selection */}
              <div>
                <label className="block text-sm font-medium mb-1">Connection Type</label>
                <select 
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select connection type</option>
                  <option value="partner">Playing Partner</option>
                  <option value="friend">Friend</option>
                  <option value="coach">Coach</option>
                  <option value="teammate">Teammate</option>
                </select>
              </div>

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