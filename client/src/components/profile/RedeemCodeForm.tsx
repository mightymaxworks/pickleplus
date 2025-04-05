import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Gift, Loader2 } from "lucide-react";

const formSchema = z.object({
  code: z.string().min(1, "Redemption code is required")
});

interface RedeemCodeFormProps {
  title?: string;
  description?: string;
  endpoint?: string;
  buttonText?: string;
  onSuccess?: () => void;
}

export function RedeemCodeForm({
  title = "Redeem Code",
  description = "Enter your redemption code to claim rewards",
  endpoint = "/api/redeem-code",
  buttonText = "Redeem Code",
  onSuccess
}: RedeemCodeFormProps) {
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: ""
    }
  });
  
  const redeemMutation = useMutation({
    mutationFn: async (code: string) => {
      try {
        const res = await apiRequest("POST", endpoint, { code });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to redeem code");
        }
        
        return await res.json();
      } catch (err) {
        if (err instanceof Error) {
          throw new Error(err.message);
        }
        throw new Error("An unexpected error occurred");
      }
    },
    onSuccess: (data) => {
      setServerError(null);
      toast({
        title: "Success!",
        description: data.message || "Code redeemed successfully",
        variant: "default"
      });
      
      if (data.xpEarned) {
        toast({
          title: "XP Earned!",
          description: `You earned ${data.xpEarned} XP from this code`,
          variant: "default"
        });
      }
      
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      let errorMessage = error.message;
      
      // Check for specific error messages that indicate the feature is not ready
      if (errorMessage.includes("not available") || 
          errorMessage.includes("database_setup_incomplete")) {
        errorMessage = "This feature is not available yet. Please try again later.";
      }
      
      setServerError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    setServerError(null);
    redeemMutation.mutate(values.code);
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" /> 
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
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
                      placeholder="Enter code" 
                      {...field} 
                      className="uppercase"
                      autoComplete="off"
                      onChange={(e) => {
                        // Convert input to uppercase
                        field.onChange(e.target.value.toUpperCase());
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {serverError && (
              <div className="text-sm text-destructive">{serverError}</div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={redeemMutation.isPending}
            >
              {redeemMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}