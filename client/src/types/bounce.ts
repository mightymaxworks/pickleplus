/**
 * PKL-278651-BOUNCE-0008-ASSIST - Bounce Assistance Request Enhancement
 * 
 * Bounce Types - Type definitions for the Bounce testing system.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

/**
 * Verification methods available for task steps
 */
export type VerificationMethod = 
  | 'manual_confirmation'  // User manually confirms step completion
  | 'text_input'           // User enters text which is verified
  | 'textarea_input'       // User enters longer text
  | 'multiple_choice'      // User selects from options
  | 'screenshot_upload';   // User uploads a screenshot

/**
 * A step in a guided task
 */
export interface GuidedTaskStepType {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  optional?: boolean;
  verificationMethod: VerificationMethod;
  verificationPrompt?: string;
  verificationPlaceholder?: string;
  verificationOptions?: string[]; // For multiple choice verification
  expectedResponse?: string;      // For text verification
}

/**
 * A guided task with steps
 */
export interface GuidedTask {
  id: string;
  title: string;
  description: string;
  totalXpReward: number;
  steps: GuidedTaskStepType[];
  currentStepIndex?: number;
  completedSteps?: string[];
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Data collected during verification
 */
export interface VerificationData {
  method: VerificationMethod;
  timestamp: Date;
  data: Record<string, any>;
}

/**
 * Data sent when a task is completed
 */
export interface TaskCompletionData {
  completedAt: Date;
  verificationData: VerificationData;
  duration?: number; // Time taken to complete the task in ms
}

/**
 * Task update message structure
 */
export interface TaskUpdateMessage {
  taskId: string;
  stepIndex: number;
  status: 'started' | 'completed' | 'skipped' | 'failed';
  verificationData: VerificationData | null;
}

/**
 * Context type for GuidedTaskContext
 */
export interface GuidedTaskContextType {
  tasks: GuidedTask[];
  activeTaskId: string | null;
  isTestingModeActive: boolean;
  isFloatingWidgetVisible: boolean;
  setActiveTask: (taskId: string | null) => void;
  setTasks: (tasks: GuidedTask[]) => void;
  addTask: (task: GuidedTask) => void;
  completeTask: (taskId: string, completionData: TaskCompletionData) => void;
  setTestingMode: (isActive: boolean) => void;
  setFloatingWidgetVisibility: (isVisible: boolean) => void;
  getStepProgress: (taskId: string) => number;
}