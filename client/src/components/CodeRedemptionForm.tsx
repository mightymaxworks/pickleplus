import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { codeApi } from "@/lib/apiClient";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

// Create schema for the code redemption
const codeSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

type CodeFormData = z.infer<typeof codeSchema>;

export function CodeRedemptionForm() {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [lastRedeemed, setLastRedeemed] = useState<{code: string, xp: number} | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleSubmit = async (data: CodeFormData) => {
    setIsRedeeming(true);
    
    try {
      const response = await codeApi.redeemCode(data);
      
      // Show success toast
      toast({
        title: "Code redeemed successfully!",
        description: `You earned ${response.xpEarned} XP points.`,
      });
      
      // Store the last redeemed code for display
      setLastRedeemed({
        code: data.code,
        xp: response.xpEarned
      });
      
      // Reset the form
      form.reset();
      
      // Invalidate user data, activities, and XP tier queries to refresh
      queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/xp-tier"] });
      
    } catch (error) {
      toast({
        title: "Failed to redeem code",
        description: "This code may be invalid, expired, or already redeemed.",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <>
      <h3 className="font-bold mb-3 font-product-sans">Redeem Code</h3>
      <p className="text-sm text-gray-500 mb-4">
        Enter a special code to earn XP bonuses and unlock achievements
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="flex">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input
                      className="rounded-r-none bg-[#F5F5F5] border-0"
                      placeholder="Enter code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="bg-[#FF5722] hover:bg-[#E64A19] rounded-l-none"
              disabled={isRedeeming}
            >
              {isRedeeming ? "Redeeming..." : "Redeem"}
            </Button>
          </div>
        </form>
      </Form>
      
      {lastRedeemed && (
        <div className="mt-4 p-3 bg-[#4CAF50] bg-opacity-10 rounded-lg text-sm">
          <div className="flex items-center">
            <span className="material-icons text-[#4CAF50] mr-2">check_circle</span>
            <div>
              <p className="font-medium">Code <span className="font-bold">{lastRedeemed.code}</span> redeemed!</p>
              <p className="text-gray-500">You earned {lastRedeemed.xp} XP points</p>
            </div>
          </div>
        </div>
      )}
      
      {user && user.level >= 10 && (
        <div className="mt-4 p-3 bg-[#2196F3] bg-opacity-10 rounded-lg text-sm">
          <div className="flex items-center">
            <span className="material-icons text-[#2196F3] mr-2">tips_and_updates</span>
            <div>
              <p className="font-medium">Tip: Level 10+ players can find special codes at tournaments!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
