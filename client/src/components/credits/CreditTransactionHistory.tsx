/**
 * CREDIT TRANSACTION HISTORY COMPONENT
 * 
 * Displays paginated transaction history with filtering, sorting, and detailed
 * transaction information for individual credit management.
 * 
 * Version: 1.0.0 - Sprint 1: Individual Credit System
 * Last Updated: September 17, 2025
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowUpCircle, 
  ArrowDownCircle,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  History
} from 'lucide-react';

interface CreditTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  wiseTransferState?: string;
  picklePointsAwarded: number;
  createdAt: string;
}

interface CreditTransactionHistoryProps {
  transactions?: CreditTransaction[];
  loading?: boolean;
}

export default function CreditTransactionHistory({ 
  transactions = [], 
  loading = false 
}: CreditTransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Format currency
  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  // Get transaction status icon and color
  const getTransactionStatus = (transaction: CreditTransaction) => {
    if (transaction.wiseTransferState === 'completed') {
      return { icon: CheckCircle, color: 'text-green-600', label: 'Completed' };
    }
    if (transaction.wiseTransferState === 'pending') {
      return { icon: Clock, color: 'text-yellow-600', label: 'Pending' };
    }
    if (transaction.wiseTransferState === 'failed') {
      return { icon: XCircle, color: 'text-red-600', label: 'Failed' };
    }
    return { icon: CheckCircle, color: 'text-green-600', label: 'Completed' };
  };

  // Get transaction type icon and color
  const getTransactionType = (type: string) => {
    switch (type) {
      case 'top_up':
        return { icon: ArrowUpCircle, color: 'text-green-600', label: 'Top Up' };
      case 'spending':
      case 'purchase':
        return { icon: ArrowDownCircle, color: 'text-orange-600', label: 'Purchase' };
      case 'bonus':
        return { icon: ArrowUpCircle, color: 'text-blue-600', label: 'Bonus' };
      default:
        return { icon: ArrowUpCircle, color: 'text-gray-600', label: type };
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || transaction.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription>
          View all your credit transactions and payment history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-transactions"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-type">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="top_up">Top Ups</SelectItem>
              <SelectItem value="spending">Purchases</SelectItem>
              <SelectItem value="bonus">Bonuses</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="w-full sm:w-auto"
            data-testid="button-sort-toggle"
          >
            <Filter className="h-4 w-4 mr-2" />
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </Button>
        </div>

        {/* Transaction Table */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Your transaction history will appear here once you make your first credit purchase.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile View */}
            <div className="sm:hidden space-y-4">
              {filteredTransactions.map((transaction) => {
                const TypeIcon = getTransactionType(transaction.type).icon;
                const StatusIcon = getTransactionStatus(transaction).icon;
                
                return (
                  <Card key={transaction.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <StatusIcon className={`h-3 w-3 ${getTransactionStatus(transaction).color}`} />
                          <span className={`text-xs ${getTransactionStatus(transaction).color}`}>
                            {getTransactionStatus(transaction).label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground border-t pt-3">
                      <span>Balance: {formatCurrency(transaction.balanceAfter)}</span>
                      {transaction.picklePointsAwarded > 0 && (
                        <span>+{transaction.picklePointsAwarded} Pickle Points</span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance After</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pickle Points</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const TypeIcon = getTransactionType(transaction.type).icon;
                    const StatusIcon = getTransactionStatus(transaction).icon;
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                            }`}>
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <span>{transaction.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getTransactionType(transaction.type).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(transaction.balanceAfter)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4 ${getTransactionStatus(transaction).color}`} />
                            <span className={`text-sm ${getTransactionStatus(transaction).color}`}>
                              {getTransactionStatus(transaction).label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.picklePointsAwarded > 0 ? (
                            <Badge variant="secondary">
                              +{transaction.picklePointsAwarded}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}