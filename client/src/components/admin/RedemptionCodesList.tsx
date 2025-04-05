import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { codeApi } from "@/lib/apiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Tag, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  Zap, 
  PlusCircle,
  Pencil,
  Trash,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { RedemptionCode } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import RedemptionCodeForm from "./RedemptionCodeFormNew";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formatDateTime = (date: Date | string | null) => {
  if (!date) return "Never";
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, "MMM d, yyyy h:mm a");
  } catch (error) {
    return "Invalid date";
  }
};

const CodeTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "founding":
      return <Award className="h-4 w-4 mr-1" />;
    case "coach":
      return <CheckCircle className="h-4 w-4 mr-1" />;
    case "xp":
      return <Zap className="h-4 w-4 mr-1" />;
    default:
      return <Tag className="h-4 w-4 mr-1" />;
  }
};

const RedemptionCodesList = () => {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<RedemptionCode | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<RedemptionCode | null>(null);

  const { data: codes, isLoading, error } = useQuery({
    queryKey: ["/api/redemption-codes"],
    queryFn: codeApi.getAllRedemptionCodes
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => codeApi.deleteRedemptionCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/redemption-codes"] });
      toast({
        title: "Code deleted",
        description: "The redemption code has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete the redemption code.",
        variant: "destructive"
      });
    }
  });

  const handleCreateCode = () => {
    setSelectedCode(undefined);
    setFormOpen(true);
  };

  const handleEditCode = (code: RedemptionCode) => {
    setSelectedCode(code);
    setFormOpen(true);
  };

  const handleDeleteCode = (code: RedemptionCode) => {
    setCodeToDelete(code);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (codeToDelete) {
      deleteMutation.mutate(codeToDelete.id);
      setDeleteDialogOpen(false);
      setCodeToDelete(null);
    }
  };

  const getCodeTypeColor = (codeType: string) => {
    switch (codeType) {
      case "founding":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "coach":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "xp":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
    }
  };

  if (isLoading) {
    return (
      <Card className="pickle-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Redemption Codes</CardTitle>
          <CardDescription>Loading available codes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="pickle-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Redemption Codes</CardTitle>
          <CardDescription>Failed to load codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            <p>Error loading redemption codes. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="pickle-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Tag className="mr-2 text-[#FF5722]" />
                Redemption Codes
              </CardTitle>
              <CardDescription>Manage your platform's redemption codes</CardDescription>
            </div>
            <Button onClick={handleCreateCode} className="bg-[#FF5722] hover:bg-[#E64A19]">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>A list of all redemption codes in the system</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">XP Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Redemptions</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes && codes.length > 0 ? (
                  codes.map((code: RedemptionCode) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">{code.code}</TableCell>
                      <TableCell>
                        <Badge className={`flex items-center ${getCodeTypeColor(code.codeType || "xp")}`}>
                          <CodeTypeIcon type={code.codeType || "xp"} />
                          {code.codeType || "xp"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{code.description || "No description"}</TableCell>
                      <TableCell className="text-right font-medium">+{code.xpReward}XP</TableCell>
                      <TableCell>
                        {code.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span>{code.currentRedemptions || 0}</span>
                          {code.maxRedemptions ? (
                            <span className="text-gray-500 ml-1">/ {code.maxRedemptions}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {code.expiresAt ? <Clock className="h-3 w-3 mr-1 opacity-70" /> : null}
                          {formatDateTime(code.expiresAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleEditCode(code)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDeleteCode(code)}
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No redemption codes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Redemption Code Form Dialog */}
      {formOpen && (
        <RedemptionCodeForm
          code={selectedCode}
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the code <span className="font-mono font-semibold">{codeToDelete?.code}</span>?
              This action cannot be undone and any existing redemption references will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RedemptionCodesList;