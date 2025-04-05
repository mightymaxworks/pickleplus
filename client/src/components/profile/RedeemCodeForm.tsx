import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema for redeeming a code
const redeemCodeSchema = z.object({
  code: z.string().min(1, "Please enter a redemption code"),
});

type RedeemCodeFormData = z.infer<typeof redeemCodeSchema>;

interface RedeemCodeFormProps {
  codeType?: "coach" | "founding" | "any";
  buttonText?: string;
  onSuccess?: (data?: any) => void;
}

export function RedeemCodeForm({ 
  codeType = "any", 
  buttonText = "Redeem Code",
  onSuccess 
}: RedeemCodeFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form
  const form = useForm<RedeemCodeFormData>({
    resolver: zodResolver(redeemCodeSchema),
    defaultValues: {
      code: "",
    }
  });
  
  const onSubmit = async (data: RedeemCodeFormData) => {
    setIsSubmitting(true);
    
    try {
      // Determine which API endpoint to call based on code type
      const endpoint = codeType === "coach" 
        ? "/api/coach/redeem-code" 
        : "/api/redeem-code";
      
      const response = await apiRequest("POST", endpoint, data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to redeem code");
      }
      
      const responseData = await response.json();
      
      toast({
        title: "Code Redeemed",
        description: `${responseData.message || "Code successfully redeemed"} ${responseData.xpEarned ? `(+${responseData.xpEarned} XP)` : ""}`,
      });
      
      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });
      
      // Reset form
      form.reset();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(responseData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Redemption Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your code here" 
                  {...field} 
                  autoComplete="off"
                />
              </FormControl>
              <FormDescription>
                {codeType === "coach" 
                  ? "Enter a coach access code to unlock coaching features"
                  : codeType === "founding"
                  ? "Enter a founding member code to unlock benefits"
                  : "Enter a redemption code to receive XP and benefits"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Redeeming..." : buttonText}
        </Button>
      </form>
    </Form>
  );
}