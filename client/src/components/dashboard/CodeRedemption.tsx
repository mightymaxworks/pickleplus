import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const CodeRedemption = () => {
  const [code, setCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { toast } = useToast();

  const handleRedeemCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid code.",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);
    
    try {
      const result = await apiRequest("POST", "/api/xp-codes/redeem", { code });
      
      toast({
        title: "Success!",
        description: `You've redeemed ${result.xpValue} XP!`,
        variant: "default",
      });
      
      // Reset the input field
      setCode("");
      
      // Refresh the user data to update XP
      queryClient.invalidateQueries({ queryKey: ['/api/users/current'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="font-bold text-gray-900 mb-1">Redeem XP Bonus Code</h3>
          <p className="text-sm text-gray-500">Enter special codes from tournaments or challenges</p>
        </div>
        
        <div className="flex w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Enter code" 
            className="border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:border-secondary w-full md:w-auto" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isRedeeming}
          />
          <button 
            className="bg-primary text-white font-medium px-4 py-2 rounded-r-md"
            onClick={handleRedeemCode}
            disabled={isRedeeming}
          >
            {isRedeeming ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redeeming
              </span>
            ) : (
              "Redeem"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeRedemption;
