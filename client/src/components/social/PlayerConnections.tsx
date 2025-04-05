import { useState } from "react";

// Type definition for a connection
interface Connection {
  id: number;
  requester: {
    id: number;
    username: string;
    displayName: string;
    avatarInitials: string;
  };
  recipient: {
    id: number;
    username: string;
    displayName: string;
    avatarInitials: string;
  };
  type: string;
  status: string;
  startDate: string | null;
  notes: string | null;
}

// Sample connection data
const mockReceived: Connection[] = [
  {
    id: 1,
    requester: {
      id: 3,
      username: "slicequeen",
      displayName: "Slice Queen",
      avatarInitials: "SQ"
    },
    recipient: {
      id: 5,
      username: "currentuser",
      displayName: "Current User",
      avatarInitials: "CU"
    },
    type: "partner",
    status: "pending",
    startDate: null,
    notes: "I saw your matches at the Downtown tournament. Would love to practice together!"
  }
];

const mockSent: Connection[] = [
  {
    id: 2,
    requester: {
      id: 5,
      username: "currentuser",
      displayName: "Current User",
      avatarInitials: "CU"
    },
    recipient: {
      id: 4,
      username: "topspinner",
      displayName: "Top Spinner",
      avatarInitials: "TS"
    },
    type: "friend",
    status: "pending",
    startDate: null,
    notes: null
  }
];

// Component to display the connections
export function PlayerConnections() {
  const [activeTab, setActiveTab] = useState("received");
  
  // Get connections based on active tab
  const connections = activeTab === "received" ? mockReceived : mockSent;
  
  // Function to get type data (label and color class)
  const getTypeData = (type: string) => {
    switch (type) {
      case "partner":
        return { label: "Playing Partner", color: "bg-blue-100 text-blue-800" };
      case "friend":
        return { label: "Friend", color: "bg-green-100 text-green-800" };
      case "coach":
        return { label: "Coach", color: "bg-purple-100 text-purple-800" };
      case "teammate":
        return { label: "Teammate", color: "bg-yellow-100 text-yellow-800" };
      default:
        return { label: type, color: "bg-gray-100 text-gray-800" };
    }
  };
  
  // Handle accept connection
  const handleAccept = (connectionId: number) => {
    console.log(`Accepting connection ${connectionId}`);
    // Here we would make an API call to update the connection status
    alert(`Connection ${connectionId} accepted!`);
  };
  
  // Handle decline connection
  const handleDecline = (connectionId: number) => {
    console.log(`Declining connection ${connectionId}`);
    // Here we would make an API call to update the connection status
    alert(`Connection ${connectionId} declined!`);
  };
  
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "received"
              ? "border-b-2 border-[#FF5722] text-[#FF5722]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("received")}
        >
          Received Requests
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "sent"
              ? "border-b-2 border-[#FF5722] text-[#FF5722]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("sent")}
        >
          Sent Requests
        </button>
      </div>

      {/* Connection cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {connections.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {activeTab === "received"
                ? "No connection requests received yet."
                : "You haven't sent any connection requests."}
            </p>
          </div>
        ) : (
          connections.map((connection) => {
            const typeData = getTypeData(connection.type);
            const otherUser = activeTab === "received" ? connection.requester : connection.recipient;
            
            return (
              <div key={connection.id} className="border rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                        {otherUser.avatarInitials}
                      </div>
                      <div>
                        <h3 className="font-medium">{otherUser.displayName}</h3>
                        <p className="text-sm text-gray-500">@{otherUser.username}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${typeData.color}`}>
                      {typeData.label}
                    </span>
                  </div>
                  
                  {connection.notes && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-md text-sm italic">
                      "{connection.notes}"
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500 mb-3">
                    Status: {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                  </div>
                  
                  {activeTab === "received" && connection.status === "pending" && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAccept(connection.id)}
                        className="flex-1 bg-[#FF5722] text-white py-1.5 rounded text-sm font-medium"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleDecline(connection.id)}
                        className="flex-1 border border-gray-300 py-1.5 rounded text-sm font-medium"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}