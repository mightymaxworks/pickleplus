import { useMemo } from "react";
import { useLocation } from "wouter";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ConnectionStats {
  total: number;
  byType: {
    partner: number;
    friend: number;
    coach: number;
    teammate: number;
  };
}

interface ConnectionStatsWidgetProps {
  stats?: ConnectionStats;
  isLoading?: boolean;
}

export function ConnectionStatsWidget({ stats, isLoading = false }: ConnectionStatsWidgetProps) {
  const [, setLocation] = useLocation();
  
  // Calculate percentage for each connection type
  const typePercentages = useMemo(() => {
    if (!stats || stats.total === 0) return {
      partner: 0,
      friend: 0,
      coach: 0,
      teammate: 0
    };
    
    return {
      partner: Math.round((stats.byType.partner / stats.total) * 100),
      friend: Math.round((stats.byType.friend / stats.total) * 100),
      coach: Math.round((stats.byType.coach / stats.total) * 100),
      teammate: Math.round((stats.byType.teammate / stats.total) * 100)
    };
  }, [stats]);
  
  // Get type label and color
  const getTypeInfo = (type: string) => {
    switch (type) {
      case "partner":
        return { 
          label: "Playing Partners", 
          color: "bg-blue-600", 
          lightColor: "bg-blue-100",
          textColor: "text-blue-600" 
        };
      case "friend":
        return { 
          label: "Friends", 
          color: "bg-green-600", 
          lightColor: "bg-green-100",
          textColor: "text-green-600" 
        };
      case "coach":
        return { 
          label: "Coaches", 
          color: "bg-purple-600", 
          lightColor: "bg-purple-100",
          textColor: "text-purple-600" 
        };
      case "teammate":
        return { 
          label: "Teammates", 
          color: "bg-yellow-600", 
          lightColor: "bg-yellow-100",
          textColor: "text-yellow-600" 
        };
      default:
        return { 
          label: type, 
          color: "bg-gray-600", 
          lightColor: "bg-gray-100",
          textColor: "text-gray-600"
        };
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 mb-6 pickle-shadow">
        <div className="flex justify-between items-center mb-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex items-center mb-4">
          <Skeleton className="h-14 w-14 rounded-full mr-3" />
          <div className="flex-grow">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
        <Skeleton className="h-6 w-full mb-2" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg p-4 mb-6 pickle-shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold font-product-sans">Your Network</h3>
        <Button variant="outline" size="sm" onClick={() => setLocation("/connections")}>
          <UserPlus className="h-4 w-4 mr-2" />
          Manage Connections
        </Button>
      </div>
      
      {!stats || stats.total === 0 ? (
        <div className="p-6 text-center">
          <div className="bg-gray-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="font-medium mb-2">No connections yet</h4>
          <p className="text-gray-500 text-sm mb-4">
            Build your pickleball network to keep track of partners, coaches, and teammates.
          </p>
          <Button onClick={() => setLocation("/connections")}>Connect with Players</Button>
        </div>
      ) : (
        <>
          {/* Total connections with visual representation */}
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-full bg-[#FF5722] text-white flex items-center justify-center font-bold text-xl mr-3">
              {stats.total}
            </div>
            <div>
              <p className="font-medium">{stats.total} Active Connections</p>
              <p className="text-sm text-gray-500">Build your pickleball network</p>
            </div>
          </div>
          
          {/* Connection type breakdown */}
          <h4 className="text-sm font-medium mb-2">Connection Breakdown</h4>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(stats.byType).map(([type, count]) => {
              const typeInfo = getTypeInfo(type);
              const percentage = typePercentages[type as keyof typeof typePercentages];
              
              return (
                <div key={type} className={`${typeInfo.lightColor} p-2 rounded`}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium">{typeInfo.label}</span>
                    <span className={`text-xs ${typeInfo.textColor} font-bold`}>{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${typeInfo.color}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}