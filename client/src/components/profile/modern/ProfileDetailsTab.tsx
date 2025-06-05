/**
 * PKL-278651-PROF-0011-COMP - Profile Details Tab
 * 
 * Detail tab for the modern profile page, displaying and editing personal information.
 * Enhanced with mobile-friendly inline editing capabilities.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @lastUpdated 2025-04-27
 * 
 * Lord, I pray for my friends and loved ones here at Pickle+. Please grant them your peace, 
 * love and understanding, and please protect them from the evils of this world. Lord, please 
 * guide their paths and help them to make the right decisions — choices that will lead them 
 * where you want them to be.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Trophy } from "lucide-react";
import EditableProfileField from "./EditableProfileField";
import { EnhancedUser } from "@/types/enhanced-user";
import { useProfileFieldXp } from "@/hooks/useProfileFieldXp";
import { queryClient } from "@/lib/queryClient";
import { PADDLE_BRAND_OPTIONS } from "@/constants/paddleBrands";

interface ProfileDetailsTabProps {
  user: EnhancedUser;
  isCurrentUser: boolean;
  onFieldUpdate: (field: string, value: any) => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    }
  }
};

export default function ProfileDetailsTab({
  user,
  isCurrentUser,
  onFieldUpdate
}: ProfileDetailsTabProps) {
  // Track field values for XP awards (only needed for the current user's profile)
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isMobileWidth, setIsMobileWidth] = useState(window.innerWidth <= 768);
  
  // XP tracking hook for frontend-first calculation
  const { trackFieldCompletion, completionPercentage } = useProfileFieldXp({
    user,
    onXpAwarded: (amount) => {
      // Invalidate XP-related queries when XP is awarded
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/xp'] });
    }
  });
  
  // Update mobile status on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileWidth(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Initialize field values on component mount
  useEffect(() => {
    if (user) {
      // Create a map of the current field values
      const initialValues: Record<string, any> = {};
      Object.entries(user).forEach(([key, value]) => {
        initialValues[key] = value;
      });
      setFieldValues(initialValues);
    }
  }, [user?.id]); // Only run when user ID changes
  
  // Enhanced field update handler that tracks XP
  const handleFieldUpdate = (field: string, value: any) => {
    // Store the previous value before update
    const previousValue = fieldValues[field];
    
    // Call the parent's update handler
    onFieldUpdate(field, value);
    
    // Update local field values state
    setFieldValues(prev => ({ ...prev, [field]: value }));
    
    // Track field completion for XP (frontend first)
    if (isCurrentUser) {
      trackFieldCompletion(field, value, previousValue);
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Personal Information Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Personal Information</span>
            </CardTitle>
            <CardDescription>
              Basic information about you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Display Name */}
              <div className="space-y-1">
                <div className="font-medium text-sm">Display Name</div>
                <EditableProfileField
                  value={user.displayName || ""}
                  field="displayName"
                  onUpdate={handleFieldUpdate}
                  editable={isCurrentUser}
                  placeholder="Enter your display name"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1">
                  <div className="font-medium text-sm">First Name</div>
                  <EditableProfileField
                    value={user.firstName || ""}
                    field="firstName"
                    onUpdate={handleFieldUpdate}
                    editable={isCurrentUser}
                    placeholder="Enter your first name"
                  />
                </div>
                
                {/* Last Name */}
                <div className="space-y-1">
                  <div className="font-medium text-sm">Last Name</div>
                  <EditableProfileField
                    value={user.lastName || ""}
                    field="lastName"
                    onUpdate={handleFieldUpdate}
                    editable={isCurrentUser}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              {/* Location */}
              <div className="space-y-1">
                <div className="font-medium text-sm">Location</div>
                <EditableProfileField
                  value={user.location || ""}
                  field="location"
                  onUpdate={handleFieldUpdate}
                  editable={isCurrentUser}
                  placeholder="Enter your location"
                />
              </div>
              
              {/* Year of Birth */}
              <div className="space-y-1">
                <div className="font-medium text-sm">Year of Birth</div>
                <EditableProfileField
                  value={user.yearOfBirth?.toString() || ""}
                  field="yearOfBirth"
                  onUpdate={(field, value) => {
                    // Convert to number
                    const yearNum = parseInt(value);
                    if (!isNaN(yearNum)) {
                      handleFieldUpdate(field, yearNum);
                    }
                  }}
                  editable={isCurrentUser}
                  placeholder="Enter your year of birth"
                />
              </div>
              
              {/* Bio */}
              <div className="space-y-1">
                <div className="font-medium text-sm">Bio</div>
                <EditableProfileField
                  value={user.bio || ""}
                  field="bio"
                  onUpdate={handleFieldUpdate}
                  editable={isCurrentUser}
                  placeholder="Tell others about yourself"
                  className="min-h-[100px]"
                  render={(value, editing, onChange) => (
                    editing ? (
                      <textarea
                        className={`w-full bg-muted rounded border border-input min-h-[100px]
                          ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                        style={isMobileWidth ? { fontSize: '16px' } : {}}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Tell others about yourself"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {value || (
                          <span className="text-muted-foreground italic">No bio specified</span>
                        )}
                      </div>
                    )
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Equipment Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Equipment</CardTitle>
            <CardDescription>
              Your pickleball gear setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Primary Paddle</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <EditableProfileField
                      value={user.paddleBrand || ""}
                      field="paddleBrand"
                      onUpdate={handleFieldUpdate}
                      editable={isCurrentUser}
                      placeholder="Brand"
                      render={(value, editing, onChange) => {
                        // Use centralized brand options with SHOT3 prominently featured
                        const brandOptions = PADDLE_BRAND_OPTIONS;
                        
                        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                          onChange(e.target.value);
                          // Force browser focus blur to ensure mobile keyboard closes
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        };
                        
                        // On small screens, we show a simplified display and handle touch differently
                        // Get direct window size to ensure we have the right value
                        const isMobileWidth = window.innerWidth <= 768;
                        
                        return editing ? (
                          <div className="w-full">
                            <select
                              className={`w-full bg-muted rounded border border-input
                                ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                              value={value}
                              onChange={handleChange}
                              aria-label="Select paddle brand"
                              style={isMobileWidth ? { fontSize: '16px' } : {}}
                            >
                              <option value="" disabled>Select paddle brand</option>
                              {brandOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {value ? `Brand: ${value}` : "No brand specified"}
                          </div>
                        );
                      }}
                    />
                    
                    <EditableProfileField
                      value={user.paddleModel || ""}
                      field="paddleModel"
                      onUpdate={handleFieldUpdate}
                      editable={isCurrentUser}
                      placeholder="Model"
                      render={(value, editing, onChange) => {
                        // On small screens, we show a simplified display and handle touch differently
                        // Get direct window size to ensure we have the right value
                        const isMobileWidth = window.innerWidth <= 768;
                        
                        return editing ? (
                          <input
                            className={`w-full bg-muted rounded border border-input
                              ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Model"
                            style={isMobileWidth ? { fontSize: '16px' } : {}}
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {value ? `Model: ${value}` : "No model specified"}
                          </div>
                        )
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Backup Paddle</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <EditableProfileField
                      value={user.backupPaddleBrand || ""}
                      field="backupPaddleBrand"
                      onUpdate={handleFieldUpdate}
                      editable={isCurrentUser}
                      placeholder="Brand"
                      render={(value, editing, onChange) => {
                        // Define our brand options once
                        const brandOptions = [
                          { value: "SHOT3", label: "SHOT3" },
                          { value: "Joola", label: "Joola" },
                          { value: "Engage", label: "Engage" },
                          { value: "Paddletek", label: "Paddletek" },
                          { value: "Onix", label: "Onix" },
                          { value: "Head", label: "Head" },
                          { value: "ProKennex", label: "ProKennex" },
                          { value: "Franklin", label: "Franklin" },
                          { value: "Gamma", label: "Gamma" },
                          { value: "Gearbox", label: "Gearbox" },
                          { value: "Prince", label: "Prince" },
                          { value: "CRBN", label: "CRBN" },
                          { value: "Electrum", label: "Electrum" },
                          { value: "Diadem", label: "Diadem" },
                          { value: "SHOT3", label: "SHOT3" },
                          { value: "Other", label: "Other" }
                        ];
                        
                        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                          onChange(e.target.value);
                          // Force browser focus blur to ensure mobile keyboard closes
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        };
                        
                        // On small screens, we show a simplified display and handle touch differently
                        // Get direct window size to ensure we have the right value
                        const isMobileWidth = window.innerWidth <= 768;
                        
                        return editing ? (
                          <div className="w-full">
                            <select
                              className={`w-full bg-muted rounded border border-input
                                ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                              value={value}
                              onChange={handleChange}
                              aria-label="Select backup paddle brand"
                              style={isMobileWidth ? { fontSize: '16px' } : {}}
                            >
                              <option value="" disabled>Select paddle brand</option>
                              {brandOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {value ? `Brand: ${value}` : "No brand specified"}
                          </div>
                        );
                      }}
                    />
                    
                    <EditableProfileField
                      value={user.backupPaddleModel || ""}
                      field="backupPaddleModel"
                      onUpdate={handleFieldUpdate}
                      editable={isCurrentUser}
                      placeholder="Model"
                      render={(value, editing, onChange) => {
                        // On small screens, we show a simplified display and handle touch differently
                        // Get direct window size to ensure we have the right value
                        const isMobileWidth = window.innerWidth <= 768;
                        
                        return editing ? (
                          <input
                            className={`w-full bg-muted rounded border border-input
                              ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Model"
                            style={isMobileWidth ? { fontSize: '16px' } : {}}
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {value ? `Model: ${value}` : "No model specified"}
                          </div>
                        )
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Other Equipment */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Other Equipment</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <EditableProfileField
                    value={user.shoesBrand || ""}
                    field="shoesBrand"
                    onUpdate={handleFieldUpdate}
                    editable={isCurrentUser}
                    placeholder="Shoe Brand"
                    render={(value, editing, onChange) => {
                      const shoeOptions = [
                        { value: "Nike", label: "Nike" },
                        { value: "Adidas", label: "Adidas" },
                        { value: "K-Swiss", label: "K-Swiss" },
                        { value: "New Balance", label: "New Balance" },
                        { value: "ASICS", label: "ASICS" },
                        { value: "Wilson", label: "Wilson" },
                        { value: "Babolat", label: "Babolat" },
                        { value: "Lacoste", label: "Lacoste" },
                        { value: "FILA", label: "FILA" },
                        { value: "Under Armour", label: "Under Armour" },
                        { value: "Skechers", label: "Skechers" },
                        { value: "Brooks", label: "Brooks" },
                        { value: "Other", label: "Other" }
                      ];
                      
                      const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                        onChange(e.target.value);
                        // Force browser focus blur to ensure mobile keyboard closes
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                      };
                      
                      // On small screens, we show a simplified display and handle touch differently
                      const isMobileWidth = window.innerWidth <= 768;
                      
                      return editing ? (
                        <div className="w-full">
                          <select
                            className={`w-full bg-muted rounded border border-input
                              ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                            value={value}
                            onChange={handleChange}
                            aria-label="Select shoe brand"
                            style={isMobileWidth ? { fontSize: '16px' } : {}}
                          >
                            <option value="" disabled>Select shoe brand</option>
                            {shoeOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {value ? `Shoe Brand: ${value}` : "No shoe brand specified"}
                        </div>
                      );
                    }}
                  />
                  
                  <EditableProfileField
                    value={user.apparelBrand || ""}
                    field="apparelBrand"
                    onUpdate={handleFieldUpdate}
                    editable={isCurrentUser}
                    placeholder="Apparel"
                    render={(value, editing, onChange) => {
                      const apparelOptions = [
                        { value: "Nike", label: "Nike" },
                        { value: "Adidas", label: "Adidas" },
                        { value: "Under Armour", label: "Under Armour" },
                        { value: "Lululemon", label: "Lululemon" },
                        { value: "FILA", label: "FILA" },
                        { value: "New Balance", label: "New Balance" },
                        { value: "Wilson", label: "Wilson" },
                        { value: "Lacoste", label: "Lacoste" },
                        { value: "Athleta", label: "Athleta" },
                        { value: "Jockerey", label: "Jockerey" },
                        { value: "Vuori", label: "Vuori" },
                        { value: "Other", label: "Other" }
                      ];
                      
                      const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                        onChange(e.target.value);
                        // Force browser focus blur to ensure mobile keyboard closes
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                      };
                      
                      // On small screens, we show a simplified display and handle touch differently
                      const isMobileWidth = window.innerWidth <= 768;
                      
                      return editing ? (
                        <div className="w-full">
                          <select
                            className={`w-full bg-muted rounded border border-input
                              ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                            value={value}
                            onChange={handleChange}
                            aria-label="Select apparel brand"
                            style={isMobileWidth ? { fontSize: '16px' } : {}}
                          >
                            <option value="" disabled>Select apparel brand</option>
                            {apparelOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {value ? `Apparel: ${value}` : "No apparel specified"}
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Playing Style Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Playing Style</CardTitle>
            <CardDescription>
              Your pickleball preferences and style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Preferred Position */}
                <div className="space-y-1">
                  <div className="font-medium text-sm">Preferred Position</div>
                  <EditableProfileField
                    value={user.preferredPosition || ""}
                    field="preferredPosition"
                    onUpdate={handleFieldUpdate}
                    editable={isCurrentUser}
                    placeholder="Select position"
                    render={(value, editing, onChange) => {
                      const positionOptions = [
                        { value: "left", label: "Left" },
                        { value: "right", label: "Right" },
                        { value: "both", label: "Both/Either" }
                      ];
                      
                      const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                        onChange(e.target.value);
                        // Force browser focus blur to ensure mobile keyboard closes
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                      };
                      
                      // On small screens, we show a simplified display and handle touch differently
                      const isMobileWidth = window.innerWidth <= 768;
                      
                      return editing ? (
                        <div className="w-full">
                          <select
                            className={`w-full bg-muted rounded border border-input
                              ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                            value={value}
                            onChange={handleChange}
                            aria-label="Select preferred position"
                            style={isMobileWidth ? { fontSize: '16px' } : {}}
                          >
                            <option value="" disabled>Select position</option>
                            {positionOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {value ? value.charAt(0).toUpperCase() + value.slice(1) : "Not specified"}
                        </div>
                      );
                    }}
                  />
                </div>
                
                {/* Playing Since */}
                <div className="space-y-1">
                  <div className="font-medium text-sm">Playing Since</div>
                  <EditableProfileField
                    value={user.playingSince || ""}
                    field="playingSince"
                    onUpdate={handleFieldUpdate}
                    editable={isCurrentUser}
                    placeholder="Year you started playing"
                    render={(value, editing, onChange) => {
                      // Create options for years from current year back to 2000
                      const currentYear = new Date().getFullYear();
                      const yearOptions = Array.from({ length: currentYear - 1999 }, (_, i) => {
                        const year = currentYear - i;
                        return { value: year.toString(), label: year.toString() };
                      });
                      
                      const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                        onChange(e.target.value);
                        // Force browser focus blur to ensure mobile keyboard closes
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                      };
                      
                      // On small screens, we show a simplified display and handle touch differently
                      const isMobileWidth = window.innerWidth <= 768;
                      
                      return editing ? (
                        <div className="w-full">
                          <select
                            className={`w-full bg-muted rounded border border-input
                              ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                            value={value}
                            onChange={handleChange}
                            aria-label="Select year you started playing"
                            style={isMobileWidth ? { fontSize: '16px' } : {}}
                          >
                            <option value="" disabled>Select year</option>
                            {yearOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {value ? `Started in ${value}` : "Not specified"}
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
              
              {/* Playing Style */}
              <div className="space-y-1">
                <div className="font-medium text-sm">Playing Style</div>
                <EditableProfileField
                  value={user.playingStyle || ""}
                  field="playingStyle"
                  onUpdate={handleFieldUpdate}
                  editable={isCurrentUser}
                  placeholder="Select your playing style"
                  render={(value, editing, onChange) => {
                    const styleOptions = [
                      { value: "aggressive", label: "Aggressive" },
                      { value: "defensive", label: "Defensive" },
                      { value: "balanced", label: "Balanced" },
                      { value: "strategic", label: "Strategic" },
                      { value: "power", label: "Power Player" },
                      { value: "finesse", label: "Finesse Player" },
                      { value: "baseline", label: "Baseline Player" },
                      { value: "net", label: "Net Player" }
                    ];
                    
                    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                      onChange(e.target.value);
                      // Force browser focus blur to ensure mobile keyboard closes
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                    };
                    
                    // On small screens, we show a simplified display and handle touch differently
                    const isMobileWidth = window.innerWidth <= 768;
                    
                    return editing ? (
                      <div className="w-full">
                        <select
                          className={`w-full bg-muted rounded border border-input
                            ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                          value={value}
                          onChange={handleChange}
                          aria-label="Select your playing style"
                          style={isMobileWidth ? { fontSize: '16px' } : {}}
                        >
                          <option value="" disabled>Select playing style</option>
                          {styleOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {value ? value.charAt(0).toUpperCase() + value.slice(1) : "Not specified"}
                      </div>
                    );
                  }}
                />
              </div>
              
              {/* Skill Level */}
              <div className="space-y-1">
                <div className="font-medium text-sm">Self-Rated Skill Level</div>
                <EditableProfileField
                  value={user.skillLevel || ""}
                  field="skillLevel"
                  onUpdate={handleFieldUpdate}
                  editable={isCurrentUser}
                  placeholder="Select your skill level"
                  render={(value, editing, onChange) => {
                    const levelOptions = [
                      { value: "2.0", label: "2.0 - Beginner" },
                      { value: "2.5", label: "2.5 - Advanced Beginner" },
                      { value: "3.0", label: "3.0 - Lower Intermediate" },
                      { value: "3.5", label: "3.5 - Intermediate" },
                      { value: "4.0", label: "4.0 - Advanced Intermediate" },
                      { value: "4.5", label: "4.5 - Advanced" },
                      { value: "5.0", label: "5.0 - Expert" },
                      { value: "5.5", label: "5.5 - Elite" },
                      { value: "6.0", label: "6.0 - Professional" }
                    ];
                    
                    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                      onChange(e.target.value);
                      // Force browser focus blur to ensure mobile keyboard closes
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                    };
                    
                    // On small screens, we show a simplified display and handle touch differently
                    const isMobileWidth = window.innerWidth <= 768;
                    
                    return editing ? (
                      <div className="w-full">
                        <select
                          className={`w-full bg-muted rounded border border-input
                            ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                          value={value}
                          onChange={handleChange}
                          aria-label="Select your skill level"
                          style={isMobileWidth ? { fontSize: '16px' } : {}}
                        >
                          <option value="" disabled>Select skill level</option>
                          {levelOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {value ? value : "Not specified"}
                      </div>
                    );
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Physical Attributes Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Physical Attributes</CardTitle>
            <CardDescription>
              Your physical characteristics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Height */}
              <div className="space-y-1">
                <div className="font-medium text-sm">Height (cm)</div>
                <EditableProfileField
                  value={user.height?.toString() || ""}
                  field="height"
                  onUpdate={(field, value) => {
                    // Convert to number
                    const heightNum = parseInt(value);
                    if (!isNaN(heightNum)) {
                      handleFieldUpdate(field, heightNum);
                    }
                  }}
                  editable={isCurrentUser}
                  placeholder="Enter your height in centimeters"
                  render={(value, editing, onChange) => {
                    // On small screens, we show a simplified display and handle touch differently
                    const isMobileWidth = window.innerWidth <= 768;
                    
                    return editing ? (
                      <input
                        type="number"
                        className={`w-full bg-muted rounded border border-input
                          ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Height in cm"
                        min="120"
                        max="220"
                        style={isMobileWidth ? { fontSize: '16px' } : {}}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {value ? `${value} cm` : "Not specified"}
                      </div>
                    )
                  }}
                />
              </div>
              
              {/* Reach */}
              <div className="space-y-1">
                <div className="font-medium text-sm">Reach (inches)</div>
                <EditableProfileField
                  value={user.reach?.toString() || ""}
                  field="reach"
                  onUpdate={(field, value) => {
                    // Convert to number
                    const reachNum = parseInt(value);
                    if (!isNaN(reachNum)) {
                      handleFieldUpdate(field, reachNum);
                    }
                  }}
                  editable={isCurrentUser}
                  placeholder="Enter your reach in inches"
                  render={(value, editing, onChange) => {
                    // On small screens, we show a simplified display and handle touch differently
                    const isMobileWidth = window.innerWidth <= 768;
                    
                    return editing ? (
                      <input
                        type="number"
                        className={`w-full bg-muted rounded border border-input
                          ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Reach in inches"
                        min="50"
                        max="100"
                        style={isMobileWidth ? { fontSize: '16px' } : {}}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {value ? `${value} inches` : "Not specified"}
                      </div>
                    )
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Playing Schedule Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Playing Schedule</CardTitle>
            <CardDescription>
              When you typically play pickleball
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Frequency */}
              <div className="space-y-1">
                <div className="font-medium text-sm">Playing Frequency</div>
                <EditableProfileField
                  value={user.playingFrequency || ""}
                  field="playingFrequency"
                  onUpdate={handleFieldUpdate}
                  editable={isCurrentUser}
                  placeholder="Select how often you play"
                  render={(value, editing, onChange) => {
                    const frequencyOptions = [
                      { value: "daily", label: "Daily" },
                      { value: "multiple-week", label: "Multiple times per week" },
                      { value: "weekly", label: "Weekly" },
                      { value: "biweekly", label: "Bi-weekly" },
                      { value: "monthly", label: "Monthly" },
                      { value: "occasionally", label: "Occasionally" }
                    ];
                    
                    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                      onChange(e.target.value);
                      // Force browser focus blur to ensure mobile keyboard closes
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                    };
                    
                    // On small screens, we show a simplified display and handle touch differently
                    const isMobileWidth = window.innerWidth <= 768;
                    
                    return editing ? (
                      <div className="w-full">
                        <select
                          className={`w-full bg-muted rounded border border-input
                            ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                          value={value}
                          onChange={handleChange}
                          aria-label="Select playing frequency"
                          style={isMobileWidth ? { fontSize: '16px' } : {}}
                        >
                          <option value="" disabled>Select frequency</option>
                          {frequencyOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {value ? value.replace(/-/g, ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ') : "Not specified"}
                      </div>
                    );
                  }}
                />
              </div>
              
              {/* Preferred Time */}
              <div className="space-y-1">
                <div className="font-medium text-sm">Preferred Playing Time</div>
                <EditableProfileField
                  value={user.preferredPlayingTime || ""}
                  field="preferredPlayingTime"
                  onUpdate={handleFieldUpdate}
                  editable={isCurrentUser}
                  placeholder="Select your preferred time to play"
                  render={(value, editing, onChange) => {
                    const timeOptions = [
                      { value: "early-morning", label: "Early Morning (5am-8am)" },
                      { value: "morning", label: "Morning (8am-11am)" },
                      { value: "midday", label: "Midday (11am-2pm)" },
                      { value: "afternoon", label: "Afternoon (2pm-5pm)" },
                      { value: "evening", label: "Evening (5pm-8pm)" },
                      { value: "night", label: "Night (8pm-11pm)" },
                      { value: "weekends", label: "Weekends Only" },
                      { value: "flexible", label: "Flexible" }
                    ];
                    
                    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                      onChange(e.target.value);
                      // Force browser focus blur to ensure mobile keyboard closes
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                    };
                    
                    // On small screens, we show a simplified display and handle touch differently
                    const isMobileWidth = window.innerWidth <= 768;
                    
                    return editing ? (
                      <div className="w-full">
                        <select
                          className={`w-full bg-muted rounded border border-input
                            ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                          value={value}
                          onChange={handleChange}
                          aria-label="Select preferred playing time"
                          style={isMobileWidth ? { fontSize: '16px' } : {}}
                        >
                          <option value="" disabled>Select preferred time</option>
                          {timeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {value ? value.replace(/-/g, ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ') : "Not specified"}
                      </div>
                    );
                  }}
                />
              </div>
              
              {/* Preferred Venue */}
              <div className="space-y-1">
                <div className="font-medium text-sm">Preferred Venue</div>
                <EditableProfileField
                  value={user.preferredVenue || ""}
                  field="preferredVenue"
                  onUpdate={handleFieldUpdate}
                  editable={isCurrentUser}
                  placeholder="Where do you usually play?"
                  render={(value, editing, onChange) => {
                    // On small screens, we show a simplified display and handle touch differently
                    const isMobileWidth = window.innerWidth <= 768;
                    
                    return editing ? (
                      <input
                        className={`w-full bg-muted rounded border border-input
                          ${isMobileWidth ? 'text-base px-3 py-3' : 'text-sm px-2 py-1'}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Preferred venue or location"
                        style={isMobileWidth ? { fontSize: '16px' } : {}}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {value || "Not specified"}
                      </div>
                    )
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  );
}