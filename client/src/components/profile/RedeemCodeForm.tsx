import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TicketIcon, LockIcon, KeyIcon, ShieldCheckIcon } from "lucide-react";

const formSchema = z.object({
  code: z.string().min(6, {
    message: "Redemption code must be at least 6 characters",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface RedeemCodeFormProps {
  codeType?: string;
  onSuccess?: (data: { message: string; xpEarned: number }) => void;
  buttonText?: string;
}

export function RedeemCodeForm({ codeType = "coach", onSuccess, buttonText = "Unlock Coaching Access" }: RedeemCodeFormProps) {
  const [isRedeemed, setIsRedeemed] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/coach/redeem-code", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to redeem code");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message,
        variant: "success",
      });
      setIsRedeemed(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });
      
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    redeemMutation.mutate(data);
  };

  if (isRedeemed) {
    return (
      <Card className="shadow-md">
        <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b">
          <CardTitle className="flex items-center">
            <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Code Redeemed Successfully!
          </CardTitle>
          <CardDescription>
            Your coaching access has been activated
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-6 inline-flex mx-auto mb-4">
              <ShieldCheckIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">All Set!</h3>
            <p className="text-muted-foreground mb-4">
              Your coach profile is now accessible. Start building your coach profile to attract students.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-orange-50 dark:bg-orange-900/20 border-b">
        <CardTitle className="flex items-center">
          <KeyIcon className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
          Redeem Coaching Access Code
        </CardTitle>
        <CardDescription>
          Enter your code to unlock coaching features
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Redemption Code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <TicketIcon className="h-5 w-5" />
                      </span>
                      <Input 
                        placeholder="Enter your code" 
                        className="pl-10" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter the coaching access code you received
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full"
              size="lg"
              disabled={redeemMutation.isPending}
            >
              {redeemMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Redeeming...
                </div>
              ) : (
                <div className="flex items-center">
                  <LockIcon className="mr-2 h-4 w-4" />
                  {buttonText}
                </div>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="bg-muted/50 border-t flex justify-center text-sm text-muted-foreground">
        <p>Need a code? Contact support for assistance</p>
      </CardFooter>
    </Card>
  );
}