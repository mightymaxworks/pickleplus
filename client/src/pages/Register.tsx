import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { PicklePlusTextLogo } from "@/components/icons/PicklePlusTextLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Create a schema for the registration form
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      displayName: "",
      location: "",
      playingSince: "",
      skillLevel: "",
      avatarInitials: "",
      level: 1,
      xp: 0,
      totalMatches: 0,
      matchesWon: 0,
      totalTournaments: 0,
    },
  });

  const handleSubmit = async (data: RegisterFormData) => {
    setIsRegistering(true);
    try {
      // Generate initials if not provided
      if (!data.avatarInitials) {
        const nameParts = data.displayName.split(" ");
        data.avatarInitials = nameParts.length > 1
          ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
          : data.displayName.substring(0, 2).toUpperCase();
      }
      
      await register(data);
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md w-full mx-auto">
      <div className="mb-6 flex flex-col items-center">
        <PicklePlusTextLogo className="h-24 w-auto" />
      </div>

      <Card className="w-full shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>
            Join PICKLE+ to track your pickleball journey
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-3 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="playingSince"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Playing Since</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2021" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Skill Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2.0 Beginner">2.0 Beginner</SelectItem>
                          <SelectItem value="2.5 Beginner+">2.5 Beginner+</SelectItem>
                          <SelectItem value="3.0 Intermediate">3.0 Intermediate</SelectItem>
                          <SelectItem value="3.5 Intermediate+">3.5 Intermediate+</SelectItem>
                          <SelectItem value="4.0 Advanced">4.0 Advanced</SelectItem>
                          <SelectItem value="4.5 Advanced+">4.5 Advanced+</SelectItem>
                          <SelectItem value="5.0 Pro">5.0 Pro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="avatarInitials"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Avatar Initials</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. JS" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
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
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col pt-0">
              <Button 
                type="submit" 
                className="w-full bg-[#FF5722] hover:bg-[#E64A19]"
                disabled={isRegistering}
              >
                {isRegistering ? "Creating account..." : "Create Account"}
              </Button>
              <p className="mt-3 text-sm text-center text-gray-500">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-[#2196F3] hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                >
                  Login
                </a>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
