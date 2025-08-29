/**
 * Admin Feature Development Template
 * 
 * PKL-278651-ADMIN-DEV-001
 * Standardized template for creating new admin features
 * UDF Rule 18 & 21 Compliance - Admin parity and UI standards
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../core/AdminLayout';
import { AdminDataTable } from '../core/AdminDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * STEP 1: Define your data types
 */
interface ExampleEntity {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

/**
 * STEP 2: Define table columns
 * Follow UDF Rule 21 - Interactive data tables with actions
 */
const createColumns = (
  onView: (item: ExampleEntity) => void,
  onEdit: (item: ExampleEntity) => void,
  onDelete: (item: ExampleEntity) => void
): ColumnDef<ExampleEntity>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }: { row: any }) => (
      <span className="font-mono text-sm">{row.getValue('id')}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: { row: any }) => (
      <span className="font-medium">{row.getValue('name')}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: any }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge 
          variant={
            status === 'active' ? 'default' : 
            status === 'pending' ? 'secondary' : 'destructive'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }: { row: any }) => {
      const date = new Date(row.getValue('createdAt'));
      return <span className="text-sm text-gray-600">{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: { row: any }) => {
      const item = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onView(item)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

/**
 * STEP 3: Main Admin Feature Component
 * Template follows UDF Rule 21 - Modern admin UI standards
 */
export const AdminFeatureTemplate: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<ExampleEntity[]>([]);

  /**
   * STEP 4: Data fetching with React Query
   * Replace endpoint and data structure as needed
   */
  const { 
    data: items = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['/api/admin/v1/example-entities'],
    queryFn: async () => {
      // Replace with your actual API endpoint
      const response = await apiRequest('GET', '/api/admin/v1/example-entities');
      return response.json();
    },
  });

  /**
   * STEP 5: Mutations for CRUD operations
   * Each operation includes audit logging via API
   */
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/v1/example-entities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/v1/example-entities'] });
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    },
  });

  /**
   * STEP 6: Action handlers
   * Implement your specific business logic here
   */
  const handleView = (item: ExampleEntity) => {
    console.log('View item:', item);
    // Navigate to detail view or open modal
  };

  const handleEdit = (item: ExampleEntity) => {
    console.log('Edit item:', item);
    // Navigate to edit form or open modal
  };

  const handleDelete = (item: ExampleEntity) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleCreate = () => {
    console.log('Create new item');
    // Navigate to create form or open modal
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log('Export to:', format);
    // Implement export functionality
    toast({
      title: 'Export Started',
      description: `Exporting data to ${format.toUpperCase()}...`,
    });
  };

  /**
   * STEP 7: Define table columns with handlers
   */
  const columns = createColumns(handleView, handleEdit, handleDelete);

  /**
   * STEP 8: Render with AdminLayout and AdminDataTable
   * This ensures consistency across all admin features
   */
  const pageActions = (
    <div className="flex items-center space-x-2">
      <Button onClick={handleCreate}>
        <Plus className="h-4 w-4 mr-2" />
        Create New
      </Button>
    </div>
  );

  return (
    <AdminLayout title="Feature Management" actions={pageActions}>
      <div className="space-y-6">
        {/* Feature-specific content can go here */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">🚀 Development Template</h3>
          <p className="text-blue-800 text-sm">
            This is a template for creating new admin features. Follow the steps in the code 
            to customize it for your specific use case. All UDF compliance is built-in.
          </p>
        </div>

        {/* Main Data Table */}
        <AdminDataTable
          columns={columns}
          data={items}
          loading={isLoading}
          error={error?.message}
          searchPlaceholder="Search items..."
          onRefresh={() => refetch()}
          onExport={handleExport}
          pageSize={10}
          emptyMessage="No items found. Create your first item to get started."
        />
      </div>
    </AdminLayout>
  );
};

/**
 * STEP 9: Export your component
 * Make sure to register it in your admin routing system
 */
export default AdminFeatureTemplate;

/**
 * 📋 CUSTOMIZATION CHECKLIST
 * 
 * To adapt this template for your feature:
 * 
 * □ Update interface types (ExampleEntity → YourEntity)
 * □ Modify table columns to match your data
 * □ Replace API endpoints with your routes
 * □ Implement create/edit/delete logic
 * □ Add feature-specific filters
 * □ Customize actions and permissions
 * □ Update page title and descriptions
 * □ Add feature-specific UI elements
 * □ Implement proper error handling
 * □ Add loading states and optimistic updates
 * 
 * 🔒 SECURITY CHECKLIST
 * 
 * □ API endpoints use admin role middleware
 * □ Actions are properly audited
 * □ Sensitive data is protected
 * □ User permissions are checked
 * □ Input validation is implemented
 * 
 * 🎨 UX CHECKLIST
 * 
 * □ Consistent with admin layout
 * □ Loading states are shown
 * □ Error messages are user-friendly
 * □ Actions have confirmation dialogs
 * □ Success feedback is provided
 * □ Mobile responsiveness is maintained
 */