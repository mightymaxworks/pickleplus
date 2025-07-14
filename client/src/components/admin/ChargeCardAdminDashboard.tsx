/**
 * PKL-278651-CHARGE-CARD-ADMIN - Charge Card Admin Dashboard
 * 
 * Complete admin interface for managing charge card system:
 * - View pending offline payments
 * - Process and verify payments
 * - Manually allocate credits to users
 * - View all balances and transaction history
 * - Group buying credit distribution
 * 
 * @version 1.0.0
 * @framework Framework5.3
 * @lastModified 2025-07-14
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Plus,
  Minus,
  Send,
  History,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChargeCardPurchase {
  id: number;
  organizer_id: number;
  purchase_type: string;
  payment_details: string;
  is_group_purchase: boolean;
  status: string;
  total_amount: number | null;
  processed_by: number | null;
  processed_at: string | null;
  created_at: string;
  organizer_username: string;
  first_name: string;
  last_name: string;
}

interface ChargeCardBalance {
  id: number;
  user_id: number;
  current_balance: number;
  total_credits: number;
  total_spent: number;
  last_updated: string;
  username: string;
  first_name: string;
  last_name: string;
}

interface ChargeCardTransaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  description: string;
  reference_id: number | null;
  reference_type: string | null;
  created_at: string;
  username: string;
  first_name: string;
  last_name: string;
}

const ChargeCardAdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPurchase, setSelectedPurchase] = useState<ChargeCardPurchase | null>(null);
  const [allocateCreditsDialog, setAllocateCreditsDialog] = useState(false);
  const [manualCreditDialog, setManualCreditDialog] = useState(false);
  const [allocateUserId, setAllocateUserId] = useState('');
  const [allocateAmount, setAllocateAmount] = useState('');
  const [allocateDescription, setAllocateDescription] = useState('');

  // Fetch pending purchases
  const { data: pendingPurchases = [], isLoading: loadingPending } = useQuery({
    queryKey: ['/api/admin/charge-cards/pending'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/charge-cards/pending');
      const data = await response.json();
      return data.purchases || [];
    }
  });

  // Fetch all balances
  const { data: allBalances = [], isLoading: loadingBalances } = useQuery({
    queryKey: ['/api/admin/charge-cards/balances'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/charge-cards/balances');
      const data = await response.json();
      return data.balances || [];
    }
  });

  // Fetch all transactions
  const { data: allTransactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['/api/admin/charge-cards/transactions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/charge-cards/transactions');
      const data = await response.json();
      return data.transactions || [];
    }
  });

  // Process purchase mutation
  const processPurchaseMutation = useMutation({
    mutationFn: async ({ purchaseId, allocation }: { purchaseId: number; allocation: any }) => {
      const response = await apiRequest('POST', `/api/charge-cards/purchases/${purchaseId}/process`, {
        allocation
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Processed",
        description: "Payment has been successfully processed and credits allocated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/charge-cards/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/charge-cards/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/charge-cards/transactions'] });
      setSelectedPurchase(null);
      setAllocateCreditsDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  // Manual credit allocation mutation
  const allocateCreditsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: number; amount: number; description: string }) => {
      const response = await apiRequest('POST', '/api/charge-cards/add-credits', {
        userId,
        amount,
        description
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Credits Added",
        description: "Manual credits have been successfully allocated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/charge-cards/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/charge-cards/transactions'] });
      setManualCreditDialog(false);
      setAllocateUserId('');
      setAllocateAmount('');
      setAllocateDescription('');
    },
    onError: (error: any) => {
      toast({
        title: "Credit Allocation Failed",
        description: error.message || "Failed to allocate credits",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Processed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleProcessPurchase = (purchase: ChargeCardPurchase) => {
    setSelectedPurchase(purchase);
    setAllocateCreditsDialog(true);
  };

  const submitProcessing = () => {
    if (!selectedPurchase) return;

    const paymentDetails = JSON.parse(selectedPurchase.payment_details);
    const allocation = {
      organizerId: selectedPurchase.organizer_id,
      amount: paymentDetails.amount * 100, // Convert to cents
      isGroupPurchase: selectedPurchase.is_group_purchase,
      participants: paymentDetails.participants || []
    };

    processPurchaseMutation.mutate({
      purchaseId: selectedPurchase.id,
      allocation
    });
  };

  const handleManualCreditAllocation = () => {
    const userId = parseInt(allocateUserId);
    const amount = parseInt(allocateAmount) * 100; // Convert to cents

    if (isNaN(userId) || isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid user ID and amount",
        variant: "destructive",
      });
      return;
    }

    allocateCreditsMutation.mutate({
      userId,
      amount,
      description: allocateDescription || 'Manual credit allocation'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Charge Card Management</h1>
          <p className="text-muted-foreground">
            Manage offline payments, credit allocation, and user balances
          </p>
        </div>
        <Button onClick={() => setManualCreditDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Manual Credits
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPurchases.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allBalances.length}</div>
            <p className="text-xs text-muted-foreground">
              With charge card balances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(allBalances.reduce((sum, balance) => sum + balance.current_balance, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              In user accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
          <TabsTrigger value="create-group">Create Group Card</TabsTrigger>
          <TabsTrigger value="balances">User Balances</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        {/* Pending Payments Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Offline Payments</CardTitle>
              <CardDescription>
                Review and process offline payments submitted by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPending ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pendingPurchases.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No pending payments</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All payments have been processed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPurchases.map((purchase) => {
                    const paymentDetails = JSON.parse(purchase.payment_details);
                    return (
                      <div key={purchase.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {purchase.first_name} {purchase.last_name} (@{purchase.organizer_username})
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {purchase.purchase_type.replace('_', ' ')} • {formatDate(purchase.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(purchase.status)}
                            <Button 
                              size="sm" 
                              onClick={() => handleProcessPurchase(purchase)}
                              disabled={processPurchaseMutation.isPending}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Process
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Amount:</span> {formatCurrency(paymentDetails.amount * 100)}
                          </div>
                          <div>
                            <span className="font-medium">Payment Method:</span> {paymentDetails.paymentMethod}
                          </div>
                          <div>
                            <span className="font-medium">Transaction ID:</span> {paymentDetails.transactionId}
                          </div>
                          <div>
                            <span className="font-medium">Group Purchase:</span> {purchase.is_group_purchase ? 'Yes' : 'No'}
                          </div>
                        </div>

                        {purchase.is_group_purchase && paymentDetails.participants && (
                          <div>
                            <span className="font-medium text-sm">Participants:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {paymentDetails.participants.map((participant: string, index: number) => (
                                <Badge key={index} variant="secondary">{participant}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Group Card Tab */}
        <TabsContent value="create-group" className="space-y-4">
          <GroupCardCreationInterface />
        </TabsContent>

        {/* User Balances Tab */}
        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Charge Card Balances</CardTitle>
              <CardDescription>
                View all user charge card balances and credit history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBalances ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : allBalances.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No user balances</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No users have charge card balances yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allBalances.map((balance) => (
                    <div key={balance.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {balance.first_name} {balance.last_name} (@{balance.username})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Last updated: {formatDate(balance.last_updated)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(balance.current_balance)}</p>
                          <p className="text-sm text-muted-foreground">Current Balance</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <span className="font-medium">Total Credits:</span> {formatCurrency(balance.total_credits)}
                        </div>
                        <div>
                          <span className="font-medium">Total Spent:</span> {formatCurrency(balance.total_spent)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Complete history of all charge card transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : allTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No transactions</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No charge card transactions yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allTransactions.map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {transaction.type === 'credit' ? (
                            <Plus className="w-5 h-5 text-green-600" />
                          ) : (
                            <Minus className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">
                              {transaction.first_name} {transaction.last_name} (@{transaction.username})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Process Purchase Dialog */}
      <Dialog open={allocateCreditsDialog} onOpenChange={setAllocateCreditsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Verify and process this offline payment to allocate credits.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Organizer:</span>
                  <p>{selectedPurchase.first_name} {selectedPurchase.last_name}</p>
                </div>
                <div>
                  <span className="font-medium">Amount:</span>
                  <p>{formatCurrency(JSON.parse(selectedPurchase.payment_details).amount * 100)}</p>
                </div>
                <div>
                  <span className="font-medium">Payment Method:</span>
                  <p>{JSON.parse(selectedPurchase.payment_details).paymentMethod}</p>
                </div>
                <div>
                  <span className="font-medium">Transaction ID:</span>
                  <p>{JSON.parse(selectedPurchase.payment_details).transactionId}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={submitProcessing}
                  disabled={processPurchaseMutation.isPending}
                  className="flex-1"
                >
                  {processPurchaseMutation.isPending ? 'Processing...' : 'Process & Allocate Credits'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAllocateCreditsDialog(false)}
                  disabled={processPurchaseMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Credit Allocation Dialog */}
      <Dialog open={manualCreditDialog} onOpenChange={setManualCreditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Manual Credits</DialogTitle>
            <DialogDescription>
              Manually allocate credits to a user account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={allocateUserId}
                onChange={(e) => setAllocateUserId(e.target.value)}
                placeholder="Enter user ID"
                type="number"
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                value={allocateAmount}
                onChange={(e) => setAllocateAmount(e.target.value)}
                placeholder="Enter amount in dollars"
                type="number"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={allocateDescription}
                onChange={(e) => setAllocateDescription(e.target.value)}
                placeholder="Description for this credit allocation"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleManualCreditAllocation}
                disabled={allocateCreditsMutation.isPending}
                className="flex-1"
              >
                {allocateCreditsMutation.isPending ? 'Allocating...' : 'Add Credits'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setManualCreditDialog(false)}
                disabled={allocateCreditsMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Group Card Creation Interface Component
const GroupCardCreationInterface: React.FC = () => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [userAmounts, setUserAmounts] = useState<{[key: number]: string}>({});
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for user search
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['admin-users-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const response = await apiRequest('GET', `/api/admin/users/search?q=${encodeURIComponent(searchTerm)}`);
      return response.json();
    },
    enabled: searchTerm.length >= 2
  });

  const handleUserSelect = (user: any) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setUserAmounts({...userAmounts, [user.id]: '0'});
    }
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    const newAmounts = {...userAmounts};
    delete newAmounts[userId];
    setUserAmounts(newAmounts);
  };

  const handleAmountChange = (userId: number, amount: string) => {
    setUserAmounts({...userAmounts, [userId]: amount});
  };

  const handleCreateGroupCard = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive"
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        title: "Error", 
        description: "Please add at least one user to the group",
        variant: "destructive"
      });
      return;
    }

    // Validate all amounts
    const invalidAmounts = selectedUsers.filter(user => 
      !userAmounts[user.id] || parseFloat(userAmounts[user.id]) <= 0
    );
    
    if (invalidAmounts.length > 0) {
      toast({
        title: "Error",
        description: "Please enter valid amounts for all users",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const groupData = {
        groupName,
        users: selectedUsers.map(user => ({
          userId: user.id,
          amount: parseFloat(userAmounts[user.id]) * 100, // Convert to cents
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName
        }))
      };

      const response = await apiRequest('POST', '/api/admin/charge-cards/create-group', groupData);
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: `Group card "${groupName}" created successfully with ${selectedUsers.length} users`,
        });
        
        // Reset form
        setGroupName('');
        setSelectedUsers([]);
        setUserAmounts({});
        setSearchTerm('');
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['admin-charge-cards'] });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create group card",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group card",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const totalAmount = selectedUsers.reduce((sum, user) => {
    const amount = parseFloat(userAmounts[user.id] || '0');
    return sum + amount;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Group Charge Card</CardTitle>
        <CardDescription>
          Create a group charge card and allocate credits to multiple users at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Group Name */}
        <div>
          <Label htmlFor="groupName">Group Name</Label>
          <Input
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name (e.g., 'Weekly Training Group')"
          />
        </div>

        {/* User Search */}
        <div>
          <Label htmlFor="userSearch">Search Users</Label>
          <Input
            id="userSearch"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or username..."
          />
          
          {searchLoading && (
            <div className="mt-2 text-sm text-muted-foreground">Searching...</div>
          )}
          
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
              {searchResults.map((user: any) => (
                <div
                  key={user.id}
                  className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                  onClick={() => handleUserSelect(user)}
                >
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div>
            <Label>Selected Users ({selectedUsers.length})</Label>
            <div className="space-y-3 mt-2">
              {selectedUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`amount-${user.id}`} className="text-sm">$</Label>
                    <Input
                      id={`amount-${user.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={userAmounts[user.id] || ''}
                      onChange={(e) => handleAmountChange(user.id, e.target.value)}
                      placeholder="0.00"
                      className="w-24"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total Amount */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-lg font-bold">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Create Button */}
        <Button
          onClick={handleCreateGroupCard}
          disabled={isCreating || selectedUsers.length === 0 || !groupName.trim()}
          className="w-full"
        >
          {isCreating ? 'Creating Group Card...' : `Create Group Card (${selectedUsers.length} users)`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChargeCardAdminDashboard;