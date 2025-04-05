import { PlayerConnections } from "../components/social/PlayerConnections";
import { ConnectionRequestForm } from "../components/social/ConnectionRequestForm";

export default function ConnectionsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Connections</h1>
        <ConnectionRequestForm />
      </div>
      <p className="text-muted-foreground mb-8">
        Connect with other Pickle+ players to build your pickleball network.
      </p>
      <PlayerConnections />
    </div>
  );
}