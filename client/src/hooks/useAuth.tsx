import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthUser, User, RegisterFormData, LoginFormData } from "@/types";
import { authApi } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

// Create auth context
const AuthContext = createContext<AuthUser>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        // Not authenticated, clear any stored data
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (identifier: string, password: string) => {
    try {
      const userData = await authApi.login({ identifier, password });
      setUser(userData);
      return userData;
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username/email or password",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterFormData) => {
    try {
      const newUser = await authApi.register(userData);
      setUser(newUser);
      return newUser;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Username may already be taken",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      // Clear all queries from cache on logout
      queryClient.clear();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
