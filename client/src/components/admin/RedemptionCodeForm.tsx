import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { codeApi } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { RedemptionCode } from "@/types";
import { format } from "date-fns";

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
  DialogClose
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";

const formSchema = z.object({
  code: z.string().min(3, { message: "Code must be at least 3 characters" }),
  description: z.string().nullable().optional(),
  xpReward: z.number().min(1, { message: "XP reward must be at least 1" }),
  isActive: z.boolean().default(true),
  codeType: z.string().default("xp"),
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
    maxRedemptions: code?.maxRedemptions || null,
    isFoundingMemberCode: code?.isFoundingMemberCode ?? false,
    isCoachAccessCode: code?.isCoachAccessCode ?? false,
    expiresAt: code?.expiresAt ? new Date(code.expiresAt) : null,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Redemption Code" : "Create New Redemption Code"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="WELCOME50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="xpReward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>XP Reward</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="50" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <SelectItem value="xp">XP Bonus</SelectItem>
                        <SelectItem value="founding">Founding Member</SelectItem>
                        <SelectItem value="coach">Coach Access</SelectItem>
                        <SelectItem value="special">Special Event</SelectItem>
                      </SelectContent>
                    </Select>
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
                      Leave empty for unlimited redemptions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration Date</FormLabel>
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
                      Set a date when this code will expire
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription className="text-xs">
                          Code can be redeemed
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isFoundingMemberCode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Founding Member</FormLabel>
                        <FormDescription className="text-xs">
                          Grants founding status
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isCoachAccessCode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Coach Access</FormLabel>
                        <FormDescription className="text-xs">
                          Grants coaching access
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}