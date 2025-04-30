/**
 * PKL-278651-OAUTH-0005 - OAuth Developer Dashboard
 * 
 * This component provides a dashboard for developers to manage their OAuth client applications,
 * view usage statistics, regenerate secrets, etc.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Trash2, Plus, RefreshCcw, ExternalLink, Copy, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Form schema for client application
const clientFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }).max(50),
  description: z.string().max(500).optional(),
  website: z.string().url({ message: 'Must be a valid URL' }),
  redirectUris: z.string().refine(value => {
    const uris = value.split(',').map(uri => uri.trim());
    return uris.every(uri => {
      try {
        new URL(uri);
        return true;
      } catch {
        return false;
      }
    });
  }, { message: 'Must be valid, comma-separated URLs' }),
  logoUrl: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
  termsUrl: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
  privacyUrl: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

const OAuthDeveloperDashboard: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [isRegeneratingSecret, setIsRegeneratingSecret] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState(false);
  const [copiedClientSecret, setCopiedClientSecret] = useState(false);

  // Form setup for creating/editing clients
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      description: '',
      website: '',
      redirectUris: '',
      logoUrl: '',
      termsUrl: '',
      privacyUrl: '',
    },
  });

  // Fetch client applications
  const { data: clientsData, isLoading: isLoadingClients, error: clientsError } = useQuery({
    queryKey: ['/api/oauth/developer/clients'],
    queryFn: getQueryFn(),
  });

  // Fetch selected client details
  const { data: selectedClient, isLoading: isLoadingSelectedClient } = useQuery({
    queryKey: ['/api/oauth/developer/clients', selectedClientId],
    queryFn: getQueryFn(),
    enabled: !!selectedClientId,
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      // Convert comma-separated redirectUris to array
      const redirectUris = data.redirectUris.split(',').map(uri => uri.trim());
      const response = await apiRequest('POST', '/api/oauth/developer/clients', {
        ...data,
        redirectUris,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth/developer/clients'] });
      toast({
        title: 'Client Created',
        description: 'Your OAuth client application has been created successfully.',
      });
      setIsCreatingClient(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error Creating Client',
        description: error.message || 'Failed to create OAuth client application.',
        variant: 'destructive',
      });
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async (data: ClientFormData & { clientId: string }) => {
      const { clientId, ...clientData } = data;
      // Convert comma-separated redirectUris to array
      const redirectUris = clientData.redirectUris.split(',').map(uri => uri.trim());
      const response = await apiRequest('PATCH', `/api/oauth/developer/clients/${clientId}`, {
        ...clientData,
        redirectUris,
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth/developer/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/oauth/developer/clients', variables.clientId] });
      toast({
        title: 'Client Updated',
        description: 'Your OAuth client application has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Updating Client',
        description: error.message || 'Failed to update OAuth client application.',
        variant: 'destructive',
      });
    },
  });

  // Revoke client mutation
  const revokeClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const response = await apiRequest('POST', `/api/oauth/developer/clients/${clientId}/revoke`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth/developer/clients'] });
      toast({
        title: 'Client Revoked',
        description: 'Your OAuth client application has been revoked successfully.',
      });
      setSelectedClientId(null);
    },
    onError: (error) => {
      toast({
        title: 'Error Revoking Client',
        description: error.message || 'Failed to revoke OAuth client application.',
        variant: 'destructive',
      });
    },
  });

  // Regenerate client secret mutation
  const regenerateSecretMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const response = await apiRequest('POST', `/api/oauth/developer/clients/${clientId}/regenerate-secret`, {});
      return response.json();
    },
    onSuccess: (data) => {
      setNewSecret(data.clientSecret);
      setIsRegeneratingSecret(false);
      toast({
        title: 'Secret Regenerated',
        description: 'Your client secret has been regenerated successfully.',
      });
    },
    onError: (error) => {
      setIsRegeneratingSecret(false);
      toast({
        title: 'Error Regenerating Secret',
        description: error.message || 'Failed to regenerate client secret.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission for creating a new client
  const onSubmitCreate = (data: ClientFormData) => {
    createClientMutation.mutate(data);
  };

  // Handle form submission for updating a client
  const onSubmitUpdate = (data: ClientFormData) => {
    if (!selectedClientId) return;
    updateClientMutation.mutate({ ...data, clientId: selectedClientId });
  };

  // Handle client selection
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    // Reset form and get client details
    if (selectedClient) {
      form.reset({
        name: selectedClient.name,
        description: selectedClient.description || '',
        website: selectedClient.website,
        redirectUris: selectedClient.redirectUris.join(', '),
        logoUrl: selectedClient.logoUrl || '',
        termsUrl: selectedClient.termsUrl || '',
        privacyUrl: selectedClient.privacyUrl || '',
      });
    }
  };

  // Handle creating a new client
  const handleCreateClient = () => {
    setSelectedClientId(null);
    setIsCreatingClient(true);
    form.reset({
      name: '',
      description: '',
      website: '',
      redirectUris: '',
      logoUrl: '',
      termsUrl: '',
      privacyUrl: '',
    });
  };

  // Handle revoking a client
  const handleRevokeClient = () => {
    if (!selectedClientId) return;
    
    if (confirm('Are you sure you want to revoke this client? This will invalidate all tokens and users will need to reauthorize your application.')) {
      revokeClientMutation.mutate(selectedClientId);
    }
  };

  // Handle regenerating a client secret
  const handleRegenerateSecret = () => {
    if (!selectedClientId) return;
    
    if (confirm('Are you sure you want to regenerate this client secret? This will require updating your application with the new secret.')) {
      setIsRegeneratingSecret(true);
      regenerateSecretMutation.mutate(selectedClientId);
    }
  };

  // Helper to render client status badge
  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      active: { color: 'bg-green-500', label: 'Active' },
      pending: { color: 'bg-yellow-500', label: 'Pending' },
      revoked: { color: 'bg-red-500', label: 'Revoked' },
      suspended: { color: 'bg-orange-500', label: 'Suspended' },
      rejected: { color: 'bg-gray-500', label: 'Rejected' },
    };

    const { color, label } = statusMap[status] || { color: 'bg-gray-500', label: status };

    return (
      <Badge className={color}>{label}</Badge>
    );
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string, type: 'clientId' | 'clientSecret') => {
    navigator.clipboard.writeText(text)
      .then(() => {
        if (type === 'clientId') {
          setCopiedClientId(true);
          setTimeout(() => setCopiedClientId(false), 3000);
        } else {
          setCopiedClientSecret(true);
          setTimeout(() => setCopiedClientSecret(false), 3000);
        }
        
        toast({
          title: 'Copied to Clipboard',
          description: `${type === 'clientId' ? 'Client ID' : 'Client Secret'} copied to clipboard.`,
        });
      })
      .catch(() => {
        toast({
          title: 'Copy Failed',
          description: 'Failed to copy to clipboard.',
          variant: 'destructive',
        });
      });
  };

  if (isLoadingClients) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading OAuth client applications...</p>
      </div>
    );
  }

  if (clientsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
        <p className="text-lg mb-2">Error loading OAuth client applications</p>
        <p className="text-sm text-gray-600">Please try again later or contact support</p>
      </div>
    );
  }

  const clients = clientsData?.clients || [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">OAuth Developer Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your OAuth client applications and integrate with Pickle+</p>
        </div>
        <Button onClick={handleCreateClient} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Create New Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
              <CardDescription>Manage your OAuth client applications</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full pr-4">
                {clients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <HelpCircle className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-600">You don't have any client applications yet.</p>
                    <Button onClick={handleCreateClient} variant="outline" className="mt-4">
                      Create Your First Application
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clients.map((client: any) => (
                      <div 
                        key={client.clientId}
                        className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${selectedClientId === client.clientId ? 'bg-gray-100 border-l-4 border-primary' : ''}`}
                        onClick={() => handleSelectClient(client.clientId)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium">{client.name}</h3>
                            <p className="text-sm text-gray-600 truncate">{client.description || 'No description'}</p>
                          </div>
                          <div>
                            {renderStatusBadge(client.status)}
                            {client.isVerified && (
                              <Badge variant="outline" className="ml-2 bg-blue-100">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <span>Created: {new Date(client.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">
                Need help? Check out our <a href="#" className="text-primary underline">OAuth documentation</a>
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Client Details */}
        <div className="md:col-span-2">
          {isCreatingClient ? (
            <Card>
              <CardHeader>
                <CardTitle>Create New Client Application</CardTitle>
                <CardDescription>Register your application to use Pickle+ OAuth</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Name</FormLabel>
                          <FormControl>
                            <Input placeholder="My Pickleball App" {...field} />
                          </FormControl>
                          <FormDescription>The name users will see when authorizing your app</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="A helpful app for pickleball players" {...field} />
                          </FormControl>
                          <FormDescription>Brief description of what your app does</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://myapp.com" {...field} />
                          </FormControl>
                          <FormDescription>Your application's homepage</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="redirectUris"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Redirect URIs</FormLabel>
                          <FormControl>
                            <Input placeholder="https://myapp.com/callback, https://myapp.com/oauth/callback" {...field} />
                          </FormControl>
                          <FormDescription>Comma-separated list of authorized redirect URIs</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://myapp.com/logo.png" {...field} />
                          </FormControl>
                          <FormDescription>URL to your application's logo (square, 512x512 recommended)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="termsUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terms of Service URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://myapp.com/terms" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="privacyUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Privacy Policy URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://myapp.com/privacy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreatingClient(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createClientMutation.isPending}
                      >
                        {createClientMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Application
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : selectedClientId && selectedClient ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedClient.name}</CardTitle>
                    <CardDescription>{selectedClient.description || 'No description'}</CardDescription>
                    <div className="flex mt-2 gap-2">
                      {renderStatusBadge(selectedClient.status)}
                      {selectedClient.isVerified && (
                        <Badge variant="outline" className="bg-blue-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={handleRevokeClient} disabled={selectedClient.status === 'revoked'}>
                      <Trash2 className="h-4 w-4 mr-1" /> Revoke
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="credentials">Credentials</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  {/* Details Tab */}
                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">Application Information</h3>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500">Website</label>
                            <div className="flex items-center mt-1">
                              <a href={selectedClient.website} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center">
                                {selectedClient.website}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Created At</label>
                            <p>{new Date(selectedClient.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">Redirect URIs</h3>
                        <div className="mt-2">
                          <ul className="list-disc list-inside">
                            {selectedClient.redirectUris.map((uri: string, index: number) => (
                              <li key={index} className="text-sm text-gray-700">{uri}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {(selectedClient.termsUrl || selectedClient.privacyUrl) && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="text-sm font-medium text-gray-600">Legal Information</h3>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedClient.termsUrl && (
                                <div>
                                  <label className="text-xs text-gray-500">Terms of Service</label>
                                  <div className="flex items-center mt-1">
                                    <a href={selectedClient.termsUrl} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center">
                                      View Terms
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </div>
                                </div>
                              )}
                              {selectedClient.privacyUrl && (
                                <div>
                                  <label className="text-xs text-gray-500">Privacy Policy</label>
                                  <div className="flex items-center mt-1">
                                    <a href={selectedClient.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center">
                                      View Privacy Policy
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Credentials Tab */}
                  <TabsContent value="credentials">
                    <div className="space-y-6">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Security Notice</AlertTitle>
                        <AlertDescription>
                          Keep your client secret confidential. Never expose it in client-side code or public repositories.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Client ID</label>
                          <div className="mt-1 flex">
                            <Input 
                              value={selectedClient.clientId} 
                              readOnly 
                              className="font-mono text-sm"
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="ml-2" 
                              onClick={() => copyToClipboard(selectedClient.clientId, 'clientId')}
                            >
                              {copiedClientId ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Use this ID to identify your application</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-600">Client Secret</label>
                          <div className="mt-1 flex">
                            <Input 
                              type={showSecret ? "text" : "password"} 
                              value={newSecret || selectedClient.clientSecret} 
                              readOnly 
                              className="font-mono text-sm"
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="ml-2" 
                              onClick={() => setShowSecret(!showSecret)}
                            >
                              {showSecret ? <CheckCircle className="h-4 w-4 text-green-500" /> : <HelpCircle className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="ml-2" 
                              onClick={() => copyToClipboard(newSecret || selectedClient.clientSecret, 'clientSecret')}
                            >
                              {copiedClientSecret ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Keep this secret secure and never share it publicly</p>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            onClick={handleRegenerateSecret}
                            disabled={isRegeneratingSecret}
                          >
                            {isRegeneratingSecret && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <RefreshCcw className="mr-2 h-4 w-4" /> Regenerate Secret
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Settings Tab */}
                  <TabsContent value="settings">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Application Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website URL</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="redirectUris"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Redirect URIs</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>Comma-separated list of authorized redirect URIs</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo URL (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="termsUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Terms of Service URL (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="privacyUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Privacy Policy URL (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end pt-4">
                          <Button 
                            type="submit" 
                            disabled={updateClientMutation.isPending}
                          >
                            {updateClientMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-[500px] text-center">
                <HelpCircle className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">Select an application</h3>
                <p className="text-gray-600 mb-6">Select an application from the list or create a new one to get started</p>
                <Button onClick={handleCreateClient}>
                  <Plus className="mr-2 h-4 w-4" /> Create New Application
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthDeveloperDashboard;