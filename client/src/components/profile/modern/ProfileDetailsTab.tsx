/**
 * PKL-278651-PROF-0011-COMP - Profile Details Tab
 * 
 * Detail tab for the modern profile page, displaying and editing personal information.
 * Enhanced with mobile-friendly inline editing capabilities.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @lastUpdated 2025-04-27
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";
import EditableProfileField from "./EditableProfileField";
import { EnhancedUser } from "@/types/enhanced-user";

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
                  onUpdate={onFieldUpdate}
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
                    onUpdate={onFieldUpdate}
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
                    onUpdate={onFieldUpdate}
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
                  onUpdate={onFieldUpdate}
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
                      onFieldUpdate(field, yearNum);
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
                  onUpdate={onFieldUpdate}
                  editable={isCurrentUser}
                  placeholder="Tell others about yourself"
                  className="min-h-[100px]"
                  render={(value, editing, onChange) => (
                    editing ? (
                      <textarea
                        className="w-full px-2 py-1 bg-muted rounded border border-input min-h-[100px] text-sm"
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
                      onUpdate={onFieldUpdate}
                      editable={isCurrentUser}
                      placeholder="Brand"
                      render={(value, editing, onChange) => {
                        // Define our brand options once
                        const brandOptions = [
                          { value: "Selkirk", label: "Selkirk" },
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
                      onUpdate={onFieldUpdate}
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
                      onUpdate={onFieldUpdate}
                      editable={isCurrentUser}
                      placeholder="Brand"
                      render={(value, editing, onChange) => {
                        // Define our brand options once
                        const brandOptions = [
                          { value: "Selkirk", label: "Selkirk" },
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
                      onUpdate={onFieldUpdate}
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
                    value={user.shoeBrand || ""}
                    field="shoeBrand"
                    onUpdate={onFieldUpdate}
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
                    value={user.apparel || ""}
                    field="apparel"
                    onUpdate={onFieldUpdate}
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
      

    </motion.div>
  );
}