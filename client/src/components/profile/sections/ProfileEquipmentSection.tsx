/**
 * PKL-278651-PROF-0009.2-SECT - Profile Equipment Section
 * 
 * This component displays user equipment preferences and gear information.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Racquet, ShoppingBag } from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";
import { Separator } from "@/components/ui/separator";

interface ProfileEquipmentSectionProps {
  user: EnhancedUser;
}

export function ProfileEquipmentSection({ user }: ProfileEquipmentSectionProps) {
  const hasEquipment = !!(
    user.paddleBrand || 
    user.paddleModel || 
    user.backupPaddleBrand || 
    user.backupPaddleModel || 
    user.otherEquipment
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment</CardTitle>
        <CardDescription>Your gear and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasEquipment ? (
          <div className="text-sm text-muted-foreground">
            No equipment information added yet
          </div>
        ) : (
          <div className="space-y-4">
            {(user.paddleBrand || user.paddleModel) && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Racquet className="h-4 w-4" />
                  <span>Primary Paddle</span>
                </div>
                <div className="text-sm">
                  {user.paddleBrand && <span className="font-medium">{user.paddleBrand} </span>}
                  {user.paddleModel && <span>{user.paddleModel}</span>}
                </div>
              </div>
            )}
            
            {(user.backupPaddleBrand || user.backupPaddleModel) && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Racquet className="h-4 w-4" />
                  <span>Backup Paddle</span>
                </div>
                <div className="text-sm">
                  {user.backupPaddleBrand && <span className="font-medium">{user.backupPaddleBrand} </span>}
                  {user.backupPaddleModel && <span>{user.backupPaddleModel}</span>}
                </div>
              </div>
            )}
            
            {user.otherEquipment && (
              <>
                <Separator className="my-2" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Other Equipment</span>
                  </div>
                  <div className="text-sm">{user.otherEquipment}</div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}