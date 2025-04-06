import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PicklePlusTextLogo } from "@/components/icons/PicklePlusTextLogo";

const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { loginMutation } = useAuth();
  const [, navigate] = useLocation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    try {
      // Log attempt for debugging
      console.log("Attempting login with username:", data.username);
      
      if (!data.username || !data.password) {
        console.error("Login error: Missing username or password");
        return;
      }
      
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password
      });
      
      console.log("Login successful, redirecting to dashboard");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md w-full mx-auto">
      <div className="mb-6 flex flex-col items-center relative w-full">
        <Button 
          variant="ghost" 
          className="absolute left-0 top-0" 
          onClick={() => navigate("/welcome")}
        >
          ← Back to Home
        </Button>
        <PicklePlusTextLogo className="h-24 w-auto" />
      </div>

      <Card className="w-full shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-3 pb-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Username or Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username or email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col pt-0">
              <Button 
                type="submit" 
                className="w-full bg-[#FF5722] hover:bg-[#E64A19]"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
              <p className="mt-3 text-sm text-center text-gray-500">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-[#2196F3] hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/register");
                  }}
                >
                  Sign up
                </a>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
