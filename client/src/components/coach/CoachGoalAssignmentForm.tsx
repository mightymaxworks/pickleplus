/**
 * PKL-278651-COACH-GOAL-ASSIGNMENT-FORM - Coach Goal Assignment Form Component
 * 
 * Modal form for coaches to assign goals to players with milestone creation.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-02
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CoachGoalAssignmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface Milestone {
  title: string;
  description: string;
  orderIndex: number;
  dueDate: string;
  requiresCoachValidation: boolean;
}

export default function CoachGoalAssignmentForm({ onSuccess, onCancel }: CoachGoalAssignmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    playerId: '',
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    targetDate: '',
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      title: '',
      description: '',
      orderIndex: 1,
      dueDate: '',
      requiresCoachValidation: true,
    }
  ]);

  const assignGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/coach/goals/assign', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Goal Assigned Successfully",
        description: "The goal has been assigned to the player with all milestones.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/goals/my-players'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign goal to player.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.playerId || !formData.title || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const validMilestones = milestones.filter(m => m.title.trim() !== '');
    
    assignGoalMutation.mutate({
      ...formData,
      playerId: parseInt(formData.playerId),
      milestones: validMilestones.map((milestone, index) => ({
        ...milestone,
        orderIndex: index + 1,
        dueDate: milestone.dueDate || null,
      })),
    });
  };

  const addMilestone = () => {
    setMilestones([...milestones, {
      title: '',
      description: '',
      orderIndex: milestones.length + 1,
      dueDate: '',
      requiresCoachValidation: true,
    }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assign Goal to Player</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Goal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Player ID *</label>
                <Input
                  type="number"
                  value={formData.playerId}
                  onChange={(e) => setFormData({...formData, playerId: e.target.value})}
                  placeholder="Enter player ID"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="competitive">Competitive</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="mental">Mental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Goal Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter goal title"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the goal and its objectives"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({...formData, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Target Date</label>
                <Input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                />
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Milestones</h3>
                <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </div>

              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">Milestone {index + 1}</Badge>
                      {milestones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <Input
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        placeholder="Milestone title"
                      />
                      
                      <Textarea
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="Milestone description"
                        rows={2}
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="date"
                          value={milestone.dueDate}
                          onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                          placeholder="Due date"
                        />
                        
                        <Select
                          value={milestone.requiresCoachValidation.toString()}
                          onValueChange={(value) => updateMilestone(index, 'requiresCoachValidation', value === 'true')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Requires Coach Approval</SelectItem>
                            <SelectItem value="false">Self-Validated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={assignGoalMutation.isPending}
                className="flex-1"
              >
                {assignGoalMutation.isPending ? "Assigning..." : "Assign Goal"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}