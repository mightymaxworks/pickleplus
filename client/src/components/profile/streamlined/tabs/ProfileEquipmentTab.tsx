/**
 * PKL-278651-SPUI-0001: Profile Equipment Tab
 * Shows player's equipment with contextual editing
 */
import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Shield, Plus, Edit2, Feather } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProfileEquipmentTabProps {
  user: any;
}

// Define paddle brand options for the dropdown
const paddleBrands = [
  { value: 'JOOLA', label: 'JOOLA' },
  { value: 'Selkirk', label: 'Selkirk' },
  { value: 'Paddletek', label: 'Paddletek' },
  { value: 'ProKennex', label: 'ProKennex' },
  { value: 'Engage', label: 'Engage' },
  { value: 'Electrum', label: 'Electrum' },
  { value: 'Gamma', label: 'Gamma' },
  { value: 'Head', label: 'Head' },
  { value: 'Gearbox', label: 'Gearbox' },
  { value: 'CRBN', label: 'CRBN' },
  { value: 'Franklin', label: 'Franklin' },
  { value: 'Vulcan', label: 'Vulcan' },
  { value: 'Diadem', label: 'Diadem' },
  { value: 'ONIX', label: 'ONIX' },
  { value: 'Adidas', label: 'Adidas' },
  { value: 'SHOT3', label: 'SHOT3' },
  { value: 'Other', label: 'Other' },
];

const ProfileEquipmentTab: FC<ProfileEquipmentTabProps> = ({ user }) => {
  // Equipment editing states
  const [isPrimaryPaddleDialogOpen, setPrimaryPaddleDialogOpen] = useState(false);
  const [isBackupPaddleDialogOpen, setBackupPaddleDialogOpen] = useState(false);
  const [isOtherEquipmentDialogOpen, setOtherEquipmentDialogOpen] = useState(false);
  
  // Form values
  const [primaryPaddle, setPrimaryPaddle] = useState({
    brand: user.paddleBrand || '',
    model: user.paddleModel || ''
  });
  
  const [backupPaddle, setBackupPaddle] = useState({
    brand: user.backupPaddleBrand || '',
    model: user.backupPaddleModel || ''
  });
  
  const [otherEquipment, setOtherEquipment] = useState(user.otherEquipment || '');

  // Handle saving primary paddle
  const handleSavePrimaryPaddle = async () => {
    try {
      await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          paddleBrand: primaryPaddle.brand,
          paddleModel: primaryPaddle.model
        })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      setPrimaryPaddleDialogOpen(false);
      
      toast({
        title: 'Equipment updated',
        description: 'Your primary paddle has been updated.',
      });
    } catch (err) {
      console.error('Error updating equipment:', err);
      toast({
        title: 'Update failed',
        description: 'Failed to update your equipment.',
        variant: 'destructive',
      });
    }
  };

  // Handle saving backup paddle
  const handleSaveBackupPaddle = async () => {
    try {
      await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          backupPaddleBrand: backupPaddle.brand,
          backupPaddleModel: backupPaddle.model
        })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      setBackupPaddleDialogOpen(false);
      
      toast({
        title: 'Equipment updated',
        description: 'Your backup paddle has been updated.',
      });
    } catch (err) {
      console.error('Error updating equipment:', err);
      toast({
        title: 'Update failed',
        description: 'Failed to update your equipment.',
        variant: 'destructive',
      });
    }
  };

  // Handle saving other equipment
  const handleSaveOtherEquipment = async () => {
    try {
      await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          otherEquipment: otherEquipment
        })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      setOtherEquipmentDialogOpen(false);
      
      toast({
        title: 'Equipment updated',
        description: 'Your other equipment details have been updated.',
      });
    } catch (err) {
      console.error('Error updating equipment:', err);
      toast({
        title: 'Update failed',
        description: 'Failed to update your equipment.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Paddle Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Feather className="h-5 w-5 text-primary" />
            Primary Paddle
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.paddleBrand || user.paddleModel ? (
            <div className="relative group">
              <div className="space-y-4">
                {user.paddleBrand && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Brand</h4>
                    <p className="font-medium">{user.paddleBrand}</p>
                  </div>
                )}
                
                {user.paddleModel && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Model</h4>
                    <p className="font-medium">{user.paddleModel}</p>
                  </div>
                )}
              </div>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100"
                onClick={() => setPrimaryPaddleDialogOpen(true)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Feather className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">No Primary Paddle Added</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add details about your main paddle to help others know your equipment preferences.
              </p>
              <Badge variant="outline" className="mb-2">+15 XP</Badge>
              <Button 
                variant="outline"
                onClick={() => setPrimaryPaddleDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Primary Paddle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Backup Paddle Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Backup Paddle
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.backupPaddleBrand || user.backupPaddleModel ? (
            <div className="relative group">
              <div className="space-y-4">
                {user.backupPaddleBrand && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Brand</h4>
                    <p className="font-medium">{user.backupPaddleBrand}</p>
                  </div>
                )}
                
                {user.backupPaddleModel && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Model</h4>
                    <p className="font-medium">{user.backupPaddleModel}</p>
                  </div>
                )}
              </div>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100"
                onClick={() => setBackupPaddleDialogOpen(true)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Shield className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">No Backup Paddle Added</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your backup paddle details for when your primary paddle isn't available.
              </p>
              <Badge variant="outline" className="mb-2">+10 XP</Badge>
              <Button 
                variant="outline"
                onClick={() => setBackupPaddleDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Backup Paddle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Other Equipment Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Other Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          {user.otherEquipment ? (
            <div className="relative group">
              <p className="whitespace-pre-line">{user.otherEquipment}</p>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100"
                onClick={() => setOtherEquipmentDialogOpen(true)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <h3 className="text-lg font-medium mb-1">No Other Equipment Added</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add details about other equipment you use such as shoes, apparel, or accessories.
              </p>
              <Badge variant="outline" className="mb-2">+5 XP</Badge>
              <Button 
                variant="outline"
                onClick={() => setOtherEquipmentDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment Details
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Primary Paddle Dialog */}
      <Dialog open={isPrimaryPaddleDialogOpen} onOpenChange={setPrimaryPaddleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Primary Paddle Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="primaryBrand">Paddle Brand</Label>
              <select
                id="primaryBrand"
                value={primaryPaddle.brand}
                onChange={(e) => setPrimaryPaddle({...primaryPaddle, brand: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a brand</option>
                {paddleBrands.map(brand => (
                  <option key={brand.value} value={brand.value}>{brand.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryModel">Paddle Model</Label>
              <Input
                id="primaryModel"
                value={primaryPaddle.model}
                onChange={(e) => setPrimaryPaddle({...primaryPaddle, model: e.target.value})}
                placeholder="e.g. Pro Signature, Elite Pro, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrimaryPaddleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePrimaryPaddle}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Backup Paddle Dialog */}
      <Dialog open={isBackupPaddleDialogOpen} onOpenChange={setBackupPaddleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Backup Paddle Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="backupBrand">Paddle Brand</Label>
              <select
                id="backupBrand"
                value={backupPaddle.brand}
                onChange={(e) => setBackupPaddle({...backupPaddle, brand: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a brand</option>
                {paddleBrands.map(brand => (
                  <option key={brand.value} value={brand.value}>{brand.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupModel">Paddle Model</Label>
              <Input
                id="backupModel"
                value={backupPaddle.model}
                onChange={(e) => setBackupPaddle({...backupPaddle, model: e.target.value})}
                placeholder="e.g. Pro Signature, Elite Pro, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackupPaddleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBackupPaddle}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Other Equipment Dialog */}
      <Dialog open={isOtherEquipmentDialogOpen} onOpenChange={setOtherEquipmentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Other Equipment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otherEquipment">Other Equipment</Label>
              <Textarea
                id="otherEquipment"
                value={otherEquipment}
                onChange={(e) => setOtherEquipment(e.target.value)}
                placeholder="Describe other equipment you use (shoes, clothing, accessories, etc.)"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOtherEquipmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOtherEquipment}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileEquipmentTab;