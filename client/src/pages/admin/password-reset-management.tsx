import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Key, UserCheck, Clock, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface PasswordResetRequest {
  id: number;
  userId: number;
  email: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
  user: User;
}

export default function PasswordResetManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search users
  const { data: searchResults, isLoading: isSearching } = useQuery<User[]>({
    queryKey: ['/api/admin/users/search', searchTerm],
    enabled: searchTerm.length >= 2,
  });

  // Get password reset requests
  const { data: resetRequests, isLoading: isLoadingRequests } = useQuery<PasswordResetRequest[]>({
    queryKey: ['/api/admin/password-reset-requests'],
  });

  // Generate temporary password mutation
  const generateTempPasswordMutation = useMutation({
    mutationFn: async ({ userId, tempPassword }: { userId: number; tempPassword: string }) => {
      const response = await apiRequest('POST', '/api/admin/generate-temp-password', {
        userId,
        tempPassword,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Temporary Password Generated",
        description: `Temporary password set for user. They can now log in and change their password.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/password-reset-requests'] });
      setSelectedUser(null);
      setTempPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle password reset request
  const handleResetRequestMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: number; action: 'approve' | 'deny' }) => {
      const response = await apiRequest('POST', `/api/admin/password-reset-requests/${requestId}`, {
        action,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Processed",
        description: "Password reset request has been processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/password-reset-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(result);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-orange-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Password Reset Management</h1>
          <p className="text-gray-600">Manage password reset requests and generate temporary passwords</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Search & Manual Reset */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Manual Password Reset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search">Search User by Username or Email</Label>
              <Input
                id="search"
                placeholder="Enter username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            {isSearching && (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            )}

            {searchResults && searchResults.length > 0 && (
              <div className="space-y-2">
                <Label>Search Results</Label>
                {searchResults.map((user: User) => (
                  <div
                    key={user.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id 
                        ? 'border-orange-600 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">{user.firstName} {user.lastName}</p>
                      </div>
                      {selectedUser?.id === user.id && (
                        <Badge variant="secondary">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Selected User: {selectedUser.username}</span>
                </div>

                <div>
                  <Label htmlFor="tempPassword">Temporary Password</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="tempPassword"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      placeholder="Enter temporary password or generate one"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={generateRandomPassword}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => generateTempPasswordMutation.mutate({
                    userId: selectedUser.id,
                    tempPassword,
                  })}
                  disabled={!tempPassword || generateTempPasswordMutation.isPending}
                  className="w-full"
                >
                  {generateTempPasswordMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Setting Password...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Set Temporary Password
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Reset Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Reset Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRequests ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading requests...</p>
              </div>
            ) : resetRequests && resetRequests.length > 0 ? (
              <div className="space-y-4">
                {resetRequests.map((request: PasswordResetRequest) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium">{request.user.username}</p>
                        <p className="text-sm text-gray-600">{request.email}</p>
                        <p className="text-xs text-gray-500">
                          Requested: {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={request.status === 'pending' ? 'default' : 
                                request.status === 'approved' ? 'secondary' : 'destructive'}
                      >
                        {request.status}
                      </Badge>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleResetRequestMutation.mutate({
                            requestId: request.id,
                            action: 'approve'
                          })}
                          disabled={handleResetRequestMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetRequestMutation.mutate({
                            requestId: request.id,
                            action: 'deny'
                          })}
                          disabled={handleResetRequestMutation.isPending}
                        >
                          Deny
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No pending password reset requests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}