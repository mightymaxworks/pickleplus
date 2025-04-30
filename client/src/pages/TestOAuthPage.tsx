/**
 * PKL-278651-OAUTH-0005 - OAuth Developer Dashboard Test Page
 *
 * A simple test page for the OAuth functionality without relying on lazy loading
 *
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function TestOAuthPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    redirectUris: '',
    logoUrl: '',
    termsUrl: '',
    privacyUrl: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    // Fetch clients
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/oauth/developer/clients');
        const data = await response.json();
        
        if (data.success) {
          setClients(data.clients || []);
        } else {
          setError(data.error || 'Failed to fetch clients');
          toast({
            title: 'Error',
            description: data.error || 'Failed to fetch clients',
            variant: 'destructive',
          });
        }
      } catch (err) {
        setError('An error occurred while fetching clients');
        toast({
          title: 'Error',
          description: 'Failed to connect to the server',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Format redirectUris as an array
      const formattedData = {
        ...formData,
        redirectUris: formData.redirectUris.split(',').map(uri => uri.trim()),
      };
      
      const response = await apiRequest('POST', '/api/oauth/developer/clients', formattedData);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'OAuth client created successfully',
        });
        
        // Reset form and refresh clients
        setFormData({
          name: '',
          description: '',
          website: '',
          redirectUris: '',
          logoUrl: '',
          termsUrl: '',
          privacyUrl: '',
        });
        
        // Add the new client to the list
        setClients([...clients, data.client]);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create client',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An error occurred while creating the client',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">OAuth Developer Dashboard</h1>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Your OAuth Clients</h2>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          ) : clients.length === 0 ? (
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50 text-center">
              You haven't created any OAuth clients yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {clients.map((client) => (
                <Card key={client.clientId}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{client.name}</CardTitle>
                        <CardDescription>{client.website}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          client.status === 'active' ? 'bg-green-100 text-green-800' :
                          client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          client.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          client.status === 'revoked' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                        {client.isVerified && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {client.description && (
                      <p className="text-sm text-gray-600 mb-4">{client.description}</p>
                    )}
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Client ID:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded">{client.clientId}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Created:</span>
                        <span>{formatDate(client.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Redirect URIs:</span>
                        <div className="text-right">
                          {client.redirectUris.map((uri, index) => (
                            <div key={index} className="text-sm">{uri}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="secondary" size="sm">
                      Regenerate Secret
                    </Button>
                    <Button variant="destructive" size="sm">
                      Revoke
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create New Client</CardTitle>
              <CardDescription>
                Register a new application to use Pickle+ OAuth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Application Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="My Pickleball App"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your application"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">
                    Website URL *
                  </label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    required
                    placeholder="https://myapp.example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="redirectUris" className="text-sm font-medium">
                    Redirect URIs *
                  </label>
                  <Textarea
                    id="redirectUris"
                    name="redirectUris"
                    value={formData.redirectUris}
                    onChange={handleChange}
                    required
                    placeholder="https://myapp.example.com/callback"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500">
                    Comma-separated list of authorized redirect URIs
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="logoUrl" className="text-sm font-medium">
                    Logo URL
                  </label>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    type="url"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    placeholder="https://myapp.example.com/logo.png"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="termsUrl" className="text-sm font-medium">
                    Terms of Service URL
                  </label>
                  <Input
                    id="termsUrl"
                    name="termsUrl"
                    type="url"
                    value={formData.termsUrl}
                    onChange={handleChange}
                    placeholder="https://myapp.example.com/terms"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="privacyUrl" className="text-sm font-medium">
                    Privacy Policy URL
                  </label>
                  <Input
                    id="privacyUrl"
                    name="privacyUrl"
                    type="url"
                    value={formData.privacyUrl}
                    onChange={handleChange}
                    placeholder="https://myapp.example.com/privacy"
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Create Client
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}