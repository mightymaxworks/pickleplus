import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { codeApi } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { RedemptionCode } from "@/types";
import { format, addDays } from "date-fns";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  CalendarIcon, 
  Loader2, 
  Tag, 
  Zap, 
  Award, 
  Percent,
  Clock,
  Settings,
  CheckSquare
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema definition
const formSchema = z.object({
  code: z.string().min(3, { message: "Code must be at least 3 characters" }),
  description: z.string().nullable().optional(),
  xpReward: z.number().min(1, { message: "XP reward must be at least 1" }),
  isActive: z.boolean().default(true),
  codeType: z.string().default("xp"),
  multiplierValue: z.number().min(101, { message: "Multiplier must be greater than 100%" }).max(300, { message: "Multiplier cannot exceed 300%" }).default(150).optional(),
  multiplierDurationDays: z.number().min(1, { message: "Duration must be at least 1 day" }).max(30, { message: "Duration cannot exceed 30 days" }).default(7).optional(),
  maxRedemptions: z.number().nullable().optional(),
  isFoundingMemberCode: z.boolean().default(false),
  isCoachAccessCode: z.boolean().default(false),
  expiresAt: z.date().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RedemptionCodeFormProps {
  code?: RedemptionCode;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RedemptionCodeForm({
  code,
  isOpen,
  onClose,
  onSuccess,
}: RedemptionCodeFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!code;

  const defaultValues: Partial<FormValues> = {
    code: code?.code || "",
    description: code?.description || "",
    xpReward: code?.xpReward || 50,
    isActive: code?.isActive ?? true,
    codeType: code?.codeType || "xp",
    multiplierValue: code?.multiplierValue || 150,
    multiplierDurationDays: code?.multiplierDurationDays || 7,
    maxRedemptions: code?.maxRedemptions || null,
    isFoundingMemberCode: code?.isFoundingMemberCode ?? false,
    isCoachAccessCode: code?.isCoachAccessCode ?? false,
    expiresAt: code?.expiresAt ? new Date(code.expiresAt) : null,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Watch the code type to conditionally render fields
  const codeType = form.watch("codeType");
  
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // For non-multiplier codes, ensure multiplier fields are not sent
      if (data.codeType !== "multiplier") {
        delete data.multiplierValue;
        delete data.multiplierDurationDays;
      }
      
      if (isEditing && code) {
        await codeApi.updateRedemptionCode(code.id, data);
        toast({
          title: "Code updated",
          description: `The redemption code ${data.code} has been updated successfully.`,
        });
      } else {
        await codeApi.createRedemptionCode(data);
        toast({
          title: "Code created",
          description: `New redemption code ${data.code} has been created.`,
        });
      }
      
      // Invalidate the redemption codes query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/redemption-codes"] });
      
      // Close the dialog and reset the form
      if (onSuccess) onSuccess();
      onClose();
      form.reset(defaultValues);
    } catch (error) {
      console.error("Error submitting code:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} redemption code.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Badge for code type
  const CodeTypeBadge = ({ type }: { type: string }) => {
    const types: Record<string, { label: string, icon: React.ReactNode, color: string }> = {
      xp: { 
        label: 'XP Bonus', 
        icon: <Zap className="h-4 w-4 mr-1" />, 
        color: 'bg-emerald-100 text-emerald-800' 
      },
      founding: { 
        label: 'Founding Member', 
        icon: <Award className="h-4 w-4 mr-1" />, 
        color: 'bg-amber-100 text-amber-800' 
      },
      coach: { 
        label: 'Coach Access', 
        icon: <CheckSquare className="h-4 w-4 mr-1" />, 
        color: 'bg-blue-100 text-blue-800' 
      },
      special: { 
        label: 'Special Event', 
        icon: <Tag className="h-4 w-4 mr-1" />, 
        color: 'bg-purple-100 text-purple-800' 
      },
      multiplier: { 
        label: 'XP Multiplier', 
        icon: <Percent className="h-4 w-4 mr-1" />, 
        color: 'bg-pink-100 text-pink-800' 
      },
    };
    
    const typeInfo = types[type] || types.xp;
    
    return (
      <div className={`px-3 py-1 rounded-full inline-flex items-center ${typeInfo.color}`}>
        {typeInfo.icon}
        <span>{typeInfo.label}</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Redemption Code" : "Create New Redemption Code"}
          </DialogTitle>
          <DialogDescription>
            Enter the details for this redemption code
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="WELCOME50" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        The redemption code that users will enter
                      </FormDescription>
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
                        <Textarea 
                          placeholder="Enter a description for this code"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Brief explanation of what this code provides
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="codeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="xp">
                            <div className="flex items-center">
                              <Zap className="h-4 w-4 mr-2 text-emerald-600" />
                              <span>XP Bonus</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="multiplier">
                            <div className="flex items-center">
                              <Percent className="h-4 w-4 mr-2 text-pink-600" />
                              <span>XP Multiplier</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="founding">
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-2 text-amber-600" />
                              <span>Founding Member</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="coach">
                            <div className="flex items-center">
                              <CheckSquare className="h-4 w-4 mr-2 text-blue-600" />
                              <span>Coach Access</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="special">
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 mr-2 text-purple-600" />
                              <span>Special Event</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        {field.value === "xp" && "Grants a one-time XP bonus when redeemed"}
                        {field.value === "multiplier" && "Multiplies all XP earned for a limited time"}
                        {field.value === "founding" && "Grants founding member status with special privileges"}
                        {field.value === "coach" && "Gives access to coaching features"}
                        {field.value === "special" && "Special event or limited time offer"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Reward Configuration */}
            <Card className="border border-muted">
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center">
                  <CodeTypeBadge type={codeType} />
                </div>
              </CardHeader>
              <CardContent>
                {codeType === "multiplier" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="multiplierValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Multiplier Percentage</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="150" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-500">%</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            {field.value ? `${field.value}% means ${field.value/100}x multiplier (e.g., 150% = 1.5x)` : 'Enter a percentage value'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="multiplierDurationDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Effect Duration</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="7" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-500">days</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            How long the multiplier effect will last after redemption
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="rounded-md bg-muted p-3 md:col-span-2">
                      <div className="flex flex-row items-start gap-3">
                        <div className="mt-1">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Effect Preview</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            After redeeming, users will earn {form.watch('multiplierValue') || 150}% XP
                            for {form.watch('multiplierDurationDays') || 7} days
                            (until {format(addDays(new Date(), form.watch('multiplierDurationDays') || 7), "PPP")})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="xpReward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>XP Reward</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="50" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-500">XP</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Amount of XP to award when this code is redeemed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="rounded-md bg-muted p-3">
                      <div className="flex flex-row items-start gap-3">
                        <div className="mt-1">
                          <Zap className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Reward Details</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(() => {
                              switch(codeType) {
                                case 'xp':
                                  return `Users will receive a one-time bonus of ${form.watch('xpReward') || 50} XP`;
                                case 'founding':
                                  return `Users will receive ${form.watch('xpReward') || 50} XP and founding member status`;
                                case 'coach':
                                  return `Users will receive ${form.watch('xpReward') || 50} XP and access to coaching features`;
                                case 'special':
                                  return `Users will receive ${form.watch('xpReward') || 50} XP for this special event`;
                                default:
                                  return `Users will receive ${form.watch('xpReward') || 50} XP`;
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Limitations and Options */}
            <Tabs defaultValue="limits" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="limits" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Limits
                </TabsTrigger>
                <TabsTrigger value="options" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Options
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="limits" className="space-y-4 mt-2">
                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Code Expiration Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Never expires</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value as Date}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-xs">
                        Date after which this code can no longer be redeemed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxRedemptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Redemptions</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Unlimited" 
                          {...field} 
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : parseInt(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Maximum number of times this code can be redeemed (leave empty for unlimited)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="options" className="space-y-4 mt-2">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription className="text-xs">
                          When enabled, this code can be redeemed by users
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {(codeType === "founding" || codeType === "coach") && (
                  <div className="space-y-4">
                    {codeType === "founding" && (
                      <FormField
                        control={form.control}
                        name="isFoundingMemberCode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Founding Member Status</FormLabel>
                              <FormDescription className="text-xs">
                                Grant founding member status and badge to users who redeem this code
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {codeType === "coach" && (
                      <FormField
                        control={form.control}
                        name="isCoachAccessCode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Coach Access</FormLabel>
                              <FormDescription className="text-xs">
                                Grant coaching access and privileges to users who redeem this code
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditing ? "Update" : "Create"} Code</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}