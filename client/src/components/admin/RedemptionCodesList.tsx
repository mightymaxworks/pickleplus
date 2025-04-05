import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { codeApi } from "@/lib/apiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { format } from "date-fns";
import { RedemptionCode } from "@/types";

const formatDateTime = (date: Date | string | null) => {
  if (!date) return "Never";
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, "MMM d, yyyy h:mm a");
  } catch (error) {
    return "Invalid date";
  }
};

const RedemptionCodesList = () => {
  const { data: codes, isLoading, error } = useQuery({
    queryKey: ["/api/redemption-codes"],
    queryFn: codeApi.getAllRedemptionCodes
  });

  const getCodeTypeColor = (codeType: string) => {
    switch (codeType) {
      case "founding":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "coach":
        return "bg-blue-500 hover:bg-blue-600";
      case "xp":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-slate-500 hover:bg-slate-600";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Redemption Codes</CardTitle>
          <CardDescription>Loading available codes...</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Redemption Codes</CardTitle>
          <CardDescription>Failed to load codes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading redemption codes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Tag className="mr-2" />
          Redemption Codes
        </CardTitle>
        <CardDescription>Manage your platform's redemption codes</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of all redemption codes in the system</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>XP Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Redemptions</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes && codes.length > 0 ? (
              codes.map((code: RedemptionCode) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-medium">{code.code}</TableCell>
                  <TableCell>
                    <Badge className={getCodeTypeColor(code.codeType || "xp")}>
                      {code.codeType || "xp"}
                    </Badge>
                  </TableCell>
                  <TableCell>{code.description || "No description"}</TableCell>
                  <TableCell>{code.xpReward}</TableCell>
                  <TableCell>
                    {code.isActive ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {code.currentRedemptions || 0}
                    {code.maxRedemptions ? ` / ${code.maxRedemptions}` : ""}
                  </TableCell>
                  <TableCell>{formatDateTime(code.expiresAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No redemption codes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RedemptionCodesList;