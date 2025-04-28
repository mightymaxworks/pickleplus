# PKL-278651-JOUR-002: PickleJourney™ Dashboard Evolution
## Implementation Strategy

This document outlines the technical implementation approach for the PickleJourney™ multi-role dashboard enhancement, providing a roadmap for developers to follow during the sprint.

## Architecture Principles

1. **Parallel Path Development**
   - Maintain separate routes for the existing dashboard (`/dashboard`) and the PickleJourney™ dashboard (`/journey`)
   - Ensure zero impact on existing functionality
   - Create clear navigation paths between experiences

2. **Progressive Enhancement**
   - Start with core role management functionality
   - Add features incrementally in working condition
   - Validate each component before moving to the next

3. **Frontend-First Development**
   - Build client-side functionality first for rapid iteration
   - Use local storage for early prototyping where appropriate
   - Add server persistence once interfaces are stable

4. **Modular Component Design**
   - Create decoupled, reusable components
   - Establish consistent patterns for role-aware components
   - Document component APIs thoroughly

## Technical Implementation Plan

### 1. Core Infrastructure (Days 1-2)

1. **Role Context Provider**
   - Create `JourneyRoleContext.tsx` to manage role state
   - Implement hooks for accessing and updating role context
   - Build local storage persistence layer
   
   ```typescript
   // Example JourneyRoleContext.tsx structure
   export interface JourneyRoleContextType {
     roles: UserRole[];
     primaryRole: UserRole;
     setPrimaryRole: (role: UserRole) => void;
     addRole: (role: UserRole) => void;
     removeRole: (role: UserRole) => void;
     setRolePriority: (roles: UserRole[]) => void;
     getRoleMetadata: (role: UserRole) => RoleMetadata | undefined;
     updateRoleMetadata: (role: UserRole, metadata: Partial<RoleMetadata>) => void;
   }
   ```

2. **Journey Role Hook**
   - Develop `useJourneyRoles.ts` hook for components to access role data
   - Include helper functions for role operations
   - Build role validation and safety checks
   
   ```typescript
   // Example useJourneyRoles.ts structure
   export function useJourneyRoles() {
     const context = useContext(JourneyRoleContext);
     if (!context) {
       throw new Error('useJourneyRoles must be used within a JourneyRoleProvider');
     }
     
     return {
       ...context,
       hasRole: (role: UserRole) => context.roles.includes(role),
       isPrimaryRole: (role: UserRole) => context.primaryRole === role,
       getRoleLabel: (role: UserRole) => getRoleLabel(role),
       // Additional helper functions
     };
   }
   ```

3. **Journey Data Types**
   - Extend `types.ts` with role-specific interfaces
   - Create data structures for role metadata
   - Define journey milestone types
   
   ```typescript
   // Example types.ts additions
   export interface RoleMetadata {
     why: string;
     goals: JourneyGoal[];
     experience: ExperienceLevel;
     startDate: Date;
     achievements: RoleAchievement[];
   }
   
   export interface JourneyGoal {
     id: string;
     description: string;
     role: UserRole;
     completed: boolean;
     targetDate?: Date;
     relatedRoles?: UserRole[];
   }
   
   export enum ExperienceLevel {
     BEGINNER = "BEGINNER",
     INTERMEDIATE = "INTERMEDIATE",
     ADVANCED = "ADVANCED",
     EXPERT = "EXPERT"
   }
   ```

### 2. Role Discovery Wizard (Days 3-4)

1. **Role Selection Component**
   - Build `RoleSelectionPanel.tsx` with visual role selection
   - Implement role toggle functionality
   - Include role descriptions and visual indicators
   
   ```typescript
   // Example RoleSelectionPanel.tsx structure
   export function RoleSelectionPanel() {
     const { roles, addRole, removeRole } = useJourneyRoles();
     const [available, setAvailable] = useState<{role: UserRole, label: string, icon: ReactNode}[]>([]);
     
     // Implementation details...
     
     return (
       <div className="role-selection-panel">
         <h3>What are your roles in pickleball?</h3>
         <p>Select all that apply to you</p>
         
         <div className="role-grid">
           {available.map(roleItem => (
             <RoleCard 
               key={roleItem.role}
               role={roleItem.role}
               label={roleItem.label}
               icon={roleItem.icon}
               selected={roles.includes(roleItem.role)}
               onToggle={() => toggleRole(roleItem.role)}
             />
           ))}
         </div>
       </div>
     );
   }
   ```

2. **Role Prioritization Component**
   - Create `RolePrioritization.tsx` with drag-and-drop ordering
   - Build role cards with visual indicators
   - Implement priority change handlers
   
   ```typescript
   // Example RolePrioritization.tsx structure
   export function RolePrioritization() {
     const { roles, primaryRole, setRolePriority } = useJourneyRoles();
     
     const handleReorder = (reorderedRoles: UserRole[]) => {
       setRolePriority(reorderedRoles);
     };
     
     return (
       <div className="role-prioritization">
         <h3>Prioritize Your Roles</h3>
         <p>Drag to arrange your roles in order of importance to you</p>
         
         <DragDropContext onDragEnd={handleDragEnd}>
           <Droppable droppableId="roles-list">
             {(provided) => (
               <div 
                 {...provided.droppableProps}
                 ref={provided.innerRef}
                 className="priority-list"
               >
                 {roles.map((role, index) => (
                   <RolePriorityCard 
                     key={role}
                     role={role}
                     index={index}
                     isPrimary={role === primaryRole}
                   />
                 ))}
                 {provided.placeholder}
               </div>
             )}
           </Droppable>
         </DragDropContext>
       </div>
     );
   }
   ```

3. **"Your Why" Component**
   - Develop `WhyExploration.tsx` for role motivation capture
   - Build adaptive prompts based on role selection
   - Create connection between roles in prompting
   
   ```typescript
   // Example WhyExploration.tsx structure
   export function WhyExploration({ role }: { role: UserRole }) {
     const { getRoleMetadata, updateRoleMetadata } = useJourneyRoles();
     const metadata = getRoleMetadata(role) || { why: '' };
     
     const prompts = useMemo(() => {
       return getRoleSpecificPrompts(role);
     }, [role]);
     
     const handleWhyChange = (value: string) => {
       updateRoleMetadata(role, { why: value });
     };
     
     return (
       <div className="why-exploration">
         <h3>Your {getRoleLabel(role)} Journey</h3>
         <p>Tell us why this role is important to you</p>
         
         <div className="prompts">
           {prompts.map((prompt, index) => (
             <div key={index} className="prompt">{prompt}</div>
           ))}
         </div>
         
         <Textarea
           value={metadata.why}
           onChange={(e) => handleWhyChange(e.target.value)}
           placeholder="Share your journey, motivation, and goals..."
           className="why-textarea"
         />
       </div>
     );
   }
   ```

4. **Main Wizard Component**
   - Create `RoleDiscoveryWizard.tsx` to orchestrate the flow
   - Build step navigation and validation
   - Implement completion and storage of responses
   
   ```typescript
   // Example RoleDiscoveryWizard.tsx structure
   export function RoleDiscoveryWizard() {
     const [step, setStep] = useState(0);
     const { roles, primaryRole } = useJourneyRoles();
     
     const steps = [
       { id: 'selection', label: 'Select Roles', component: <RoleSelectionPanel /> },
       { id: 'prioritization', label: 'Prioritize Roles', component: <RolePrioritization /> },
       ...roles.map(role => ({
         id: `why-${role}`,
         label: `${getRoleLabel(role)} Journey`,
         component: <WhyExploration role={role} />
       })),
       { id: 'goals', label: 'Set Goals', component: <GoalSetting /> },
       { id: 'complete', label: 'Complete', component: <WizardComplete /> }
     ];
     
     // Implementation details...
     
     return (
       <div className="role-discovery-wizard">
         <WizardStepIndicator 
           steps={steps} 
           currentStep={step} 
           onStepClick={handleStepClick} 
         />
         
         <div className="wizard-content">
           {steps[step].component}
         </div>
         
         <div className="wizard-navigation">
           <Button 
             onClick={handleBack} 
             disabled={step === 0}
             variant="outline"
           >
             Back
           </Button>
           
           <Button onClick={handleNext}>
             {step === steps.length - 1 ? 'Complete' : 'Continue'}
           </Button>
         </div>
       </div>
     );
   }
   ```

### 3. Role Switching Interface (Day 5)

1. **Role Badge Component**
   - Build `RoleBadge.tsx` for consistent role visual identity
   - Create styles for active/inactive states
   - Implement role icon display
   
   ```typescript
   // Example RoleBadge.tsx structure
   export function RoleBadge({ 
     role, 
     active = false, 
     onClick 
   }: { 
     role: UserRole; 
     active?: boolean; 
     onClick?: () => void 
   }) {
     const icon = getRoleIcon(role);
     const label = getRoleLabel(role);
     
     return (
       <div 
         className={`role-badge ${active ? 'active' : ''} ${onClick ? 'clickable' : ''}`}
         onClick={onClick}
       >
         <div className="icon">{icon}</div>
         <span className="label">{label}</span>
       </div>
     );
   }
   ```

2. **Role Switcher Component**
   - Create `RoleSwitcher.tsx` for toggling between roles
   - Implement smooth transitions and visual feedback
   - Build role selection dropdown with context
   
   ```typescript
   // Example RoleSwitcher.tsx structure
   export function RoleSwitcher() {
     const { roles, primaryRole, setPrimaryRole } = useJourneyRoles();
     
     if (roles.length <= 1) return null;
     
     return (
       <div className="role-switcher">
         <h3>Viewing As:</h3>
         
         <div className="role-switcher-content">
           <Select
             value={primaryRole}
             onValueChange={(value) => setPrimaryRole(value as UserRole)}
           >
             <SelectTrigger className="role-select-trigger">
               <RoleBadge role={primaryRole} active />
             </SelectTrigger>
             <SelectContent>
               {roles.map(role => (
                 <SelectItem key={role} value={role}>
                   <RoleBadge role={role} active={role === primaryRole} />
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
         </div>
       </div>
     );
   }
   ```

3. **Role-Context-Aware Styling**
   - Create `useRoleTheme.ts` hook for role-based theming
   - Implement CSS variable injection for dynamic styling
   - Build theme provider wrapper
   
   ```typescript
   // Example useRoleTheme.ts structure
   export function useRoleTheme() {
     const { primaryRole } = useJourneyRoles();
     
     useEffect(() => {
       const colors = getRoleColors(primaryRole);
       
       document.documentElement.style.setProperty('--role-primary', colors.primary);
       document.documentElement.style.setProperty('--role-secondary', colors.secondary);
       document.documentElement.style.setProperty('--role-accent', colors.accent);
       document.documentElement.style.setProperty('--role-muted', colors.muted);
     }, [primaryRole]);
     
     return {
       colors: getRoleColors(primaryRole),
       className: `theme-role-${primaryRole.toLowerCase()}`
     };
   }
   ```

### 4. Journey Dashboard Container (Days 6-7)

1. **Journey Dashboard Component**
   - Create main `JourneyDashboard.tsx` component
   - Implement layout with role-based sections
   - Build navigation and context switching UI
   
   ```typescript
   // Example JourneyDashboard.tsx structure
   export default function JourneyDashboard() {
     const { roles, primaryRole } = useJourneyRoles();
     const { isFirstVisit } = useJourneyProgress();
     
     if (isFirstVisit || roles.length === 0) {
       return <RoleDiscoveryWizard />;
     }
     
     return (
       <div className="journey-dashboard">
         <header className="journey-header">
           <h1>Your Pickleball Journey</h1>
           <RoleSwitcher />
         </header>
         
         <main className="journey-content">
           <div className="journey-sidebar">
             <JourneySummary />
             <RoleGoalsList />
           </div>
           
           <div className="journey-main">
             <DailyPrompt />
             <JourneyMap />
             <RecentActivity />
           </div>
         </main>
       </div>
     );
   }
   ```

2. **Homepage Integration**
   - Update App.tsx to add the new route
   - Create navigation links to journey dashboard
   - Implement cohesive navigation experience
   
   ```typescript
   // Example App.tsx updates
   function App() {
     return (
       <Router>
         <Switch>
           // Existing routes
           <Route path="/dashboard">
             <Dashboard />
           </Route>
           
           // New Journey route
           <Route path="/journey">
             <JourneyRoleProvider>
               <JourneyDashboard />
             </JourneyRoleProvider>
           </Route>
           
           // Other routes
         </Switch>
       </Router>
     );
   }
   ```

3. **Dashboard Sections**
   - Implement placeholder components for each dashboard section
   - Create skeleton layouts for future implementation
   - Build navigation between sections
   
   ```typescript
   // Example section components
   export function JourneySummary() {
     // Implementation coming in PKL-278651-JOUR-002.2
     return (
       <div className="journey-summary">
         <h2>Journey Summary</h2>
         <div className="summary-content">
           {/* Placeholder content */}
           <Skeleton className="h-[100px] w-full" />
         </div>
       </div>
     );
   }
   
   export function JourneyMap() {
     // Implementation coming in PKL-278651-JOUR-002.2
     return (
       <div className="journey-map">
         <h2>Your Journey Map</h2>
         <div className="map-content">
           {/* Placeholder content */}
           <Skeleton className="h-[200px] w-full" />
         </div>
       </div>
     );
   }
   ```

## Testing Strategy

1. **Component Testing**
   - Test each component in isolation
   - Verify role-switching works correctly
   - Ensure data is persisted properly

2. **Integration Testing**
   - Test the complete journey flow
   - Verify role context is maintained throughout the application
   - Test navigation between regular and journey dashboards

3. **User Testing**
   - Get feedback on the role selection experience
   - Verify clarity of role prioritization UI
   - Test the emotional response to the journey dashboard

## API Interface

```typescript
// Role Context API
interface JourneyRoleContext {
  roles: UserRole[];
  primaryRole: UserRole;
  setPrimaryRole: (role: UserRole) => void;
  addRole: (role: UserRole) => void;
  removeRole: (role: UserRole) => void;
  setRolePriority: (roles: UserRole[]) => void;
  getRoleMetadata: (role: UserRole) => RoleMetadata;
  updateRoleMetadata: (role: UserRole, metadata: Partial<RoleMetadata>) => void;
}

// Journey Progress API
interface JourneyProgress {
  isFirstVisit: boolean;
  completedSteps: string[];
  markStepComplete: (stepId: string) => void;
  resetProgress: () => void;
  journeyStartDate: Date;
  daysSinceStart: number;
}

// Journal Entry with Role Context
interface RoleJournalEntry extends JournalEntry {
  roles: UserRole[];
  primaryRole: UserRole;
}
```

## Next Steps After Phase 1

Once the core role management system and discovery wizard are complete, we will proceed to:

1. **Implement Journey Map Visualization**
   - Design and build interactive timeline
   - Create role color-coding system
   - Integrate with existing journaling system

2. **Build Contextual Prompts System**
   - Create role-specific prompt database
   - Implement prompt generation engine
   - Build UI for prompt interactions

3. **Enhance Emotion-Aware Components**
   - Update existing emotion detection
   - Add role context to emotional data
   - Create adaptive UI based on emotions