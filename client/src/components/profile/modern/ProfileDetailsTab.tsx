/**
 * PKL-278651-PROF-0011-COMP - Profile Details Tab
 * 
 * Detail tab for the modern profile page, displaying and editing personal information.
 * Enhanced with mobile-friendly inline editing capabilities.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @lastUpdated 2025-04-26
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedUser } from "@/types/enhanced-user";
import EditableProfileField from "./EditableProfileField";
import { Mail, Calendar, User, MapPin, Info, Award, Smartphone, Edit, Check } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function ProfileDetailsTab({
  user,
  isCurrentUser,
  onFieldUpdate
}: ProfileDetailsTabProps) {
  // Detect if on mobile
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Personal Information */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">
                    {user.email || "No email added"}
                  </div>
                </div>
              </div>
              
              {/* Name (First/Last) */}
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Full Name</div>
                  <div className="text-sm">
                    <EditableProfileField
                      value={user.firstName || ""}
                      field="firstName"
                      onUpdate={onFieldUpdate}
                      editable={isCurrentUser}
                      placeholder="First name"
                      render={(value, editing, onChange) => (
                        editing ? (
                          <div className="flex gap-2">
                            <input
                              className="px-2 py-1 bg-muted rounded border border-input text-sm"
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              placeholder="First name"
                              autoFocus
                            />
                            <input
                              className="px-2 py-1 bg-muted rounded border border-input text-sm"
                              value={user.lastName || ""}
                              onChange={(e) => onFieldUpdate("lastName", e.target.value)}
                              placeholder="Last name"
                            />
                          </div>
                        ) : (
                          <span className="text-sm cursor-pointer">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.firstName || user.lastName || 
                                (isCurrentUser ? "Add your name" : "No name set")}
                          </span>
                        )
                      )}
                    />
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Location</div>
                  <div className="text-sm">
                    <EditableProfileField
                      value={user.location || ""}
                      field="location"
                      onUpdate={onFieldUpdate}
                      editable={isCurrentUser}
                      placeholder="Add your location"
                      render={(value, editing, onChange) => (
                        editing ? (
                          <input
                            className="w-full max-w-xs px-2 py-1 bg-muted rounded border border-input text-sm"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Add your location"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {value || (isCurrentUser ? "Add your location" : "No location set")}
                          </span>
                        )
                      )}
                    />
                  </div>
                </div>
              </div>
              
              {/* Year of Birth */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Year of Birth</div>
                  <div className="text-sm">
                    <EditableProfileField
                      value={user.yearOfBirth ? user.yearOfBirth.toString() : ""}
                      field="yearOfBirth"
                      onUpdate={(field, value) => {
                        // Validate and convert to number
                        const numValue = parseInt(value);
                        if (!isNaN(numValue) && numValue > 1900 && numValue <= new Date().getFullYear()) {
                          onFieldUpdate(field, numValue);
                        }
                      }}
                      editable={isCurrentUser}
                      placeholder="Add year of birth"
                      render={(value, editing, onChange) => (
                        editing ? (
                          <input
                            className="w-32 px-2 py-1 bg-muted rounded border border-input text-sm"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="YYYY"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {value || (isCurrentUser ? "Add year of birth" : "Not specified")}
                          </span>
                        )
                      )}
                    />
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">About</div>
                  <div className="text-sm">
                    <EditableProfileField
                      value={user.bio || ""}
                      field="bio"
                      onUpdate={onFieldUpdate}
                      editable={isCurrentUser}
                      placeholder="Tell others about yourself"
                      render={(value, editing, onChange) => (
                        editing ? (
                          <textarea
                            className="w-full min-h-[100px] px-2 py-1 bg-muted rounded border border-input text-sm"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Tell others about yourself"
                            autoFocus
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {value || (isCurrentUser ? "Add your bio" : "No bio provided")}
                          </div>
                        )
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Equipment */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Equipment Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Paddle Information */}
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
                      render={(value, editing, onChange) => (
                        editing ? (
                          <Select 
                            value={value} 
                            onValueChange={onChange}
                          >
                            <SelectTrigger className="w-full bg-muted border border-input text-sm">
                              <SelectValue placeholder="Select paddle brand" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Selkirk">Selkirk</SelectItem>
                              <SelectItem value="Joola">Joola</SelectItem>
                              <SelectItem value="Engage">Engage</SelectItem>
                              <SelectItem value="Paddletek">Paddletek</SelectItem>
                              <SelectItem value="Onix">Onix</SelectItem>
                              <SelectItem value="Head">Head</SelectItem>
                              <SelectItem value="ProKennex">ProKennex</SelectItem>
                              <SelectItem value="Franklin">Franklin</SelectItem>
                              <SelectItem value="Gamma">Gamma</SelectItem>
                              <SelectItem value="Gearbox">Gearbox</SelectItem>
                              <SelectItem value="Prince">Prince</SelectItem>
                              <SelectItem value="CRBN">CRBN</SelectItem>
                              <SelectItem value="Electrum">Electrum</SelectItem>
                              <SelectItem value="Diadem">Diadem</SelectItem>
                              <SelectItem value="SHOT3">SHOT3</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {value ? `Brand: ${value}` : "No brand specified"}
                          </div>
                        )
                      )}
                    />
                    
                    <EditableProfileField
                      value={user.paddleModel || ""}
                      field="paddleModel"
                      onUpdate={onFieldUpdate}
                      editable={isCurrentUser}
                      placeholder="Model"
                      render={(value, editing, onChange) => (
                        editing ? (
                          <input
                            className="w-full px-2 py-1 bg-muted rounded border border-input text-sm"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Model"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {value ? `Model: ${value}` : "No model specified"}
                          </div>
                        )
                      )}
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
                      render={(value, editing, onChange) => (
                        editing ? (
                          <Select 
                            value={value} 
                            onValueChange={onChange}
                          >
                            <SelectTrigger className="w-full bg-muted border border-input text-sm">
                              <SelectValue placeholder="Select paddle brand" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Selkirk">Selkirk</SelectItem>
                              <SelectItem value="Joola">Joola</SelectItem>
                              <SelectItem value="Engage">Engage</SelectItem>
                              <SelectItem value="Paddletek">Paddletek</SelectItem>
                              <SelectItem value="Onix">Onix</SelectItem>
                              <SelectItem value="Head">Head</SelectItem>
                              <SelectItem value="ProKennex">ProKennex</SelectItem>
                              <SelectItem value="Franklin">Franklin</SelectItem>
                              <SelectItem value="Gamma">Gamma</SelectItem>
                              <SelectItem value="Gearbox">Gearbox</SelectItem>
                              <SelectItem value="Prince">Prince</SelectItem>
                              <SelectItem value="CRBN">CRBN</SelectItem>
                              <SelectItem value="Electrum">Electrum</SelectItem>
                              <SelectItem value="Diadem">Diadem</SelectItem>
                              <SelectItem value="SHOT3">SHOT3</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {value ? `Brand: ${value}` : "No brand specified"}
                          </div>
                        )
                      )}
                    />
                    
                    <EditableProfileField
                      value={user.backupPaddleModel || ""}
                      field="backupPaddleModel"
                      onUpdate={onFieldUpdate}
                      editable={isCurrentUser}
                      placeholder="Model"
                      render={(value, editing, onChange) => (
                        editing ? (
                          <input
                            className="w-full px-2 py-1 bg-muted rounded border border-input text-sm"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Model"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {value ? `Model: ${value}` : "No model specified"}
                          </div>
                        )
                      )}
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
                    render={(value, editing, onChange) => (
                      editing ? (
                        <Select 
                          value={value} 
                          onValueChange={onChange}
                        >
                          <SelectTrigger className="w-full bg-muted border border-input text-sm">
                            <SelectValue placeholder="Select shoe brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nike">Nike</SelectItem>
                            <SelectItem value="Adidas">Adidas</SelectItem>
                            <SelectItem value="K-Swiss">K-Swiss</SelectItem>
                            <SelectItem value="New Balance">New Balance</SelectItem>
                            <SelectItem value="ASICS">ASICS</SelectItem>
                            <SelectItem value="Wilson">Wilson</SelectItem>
                            <SelectItem value="Babolat">Babolat</SelectItem>
                            <SelectItem value="Lacoste">Lacoste</SelectItem>
                            <SelectItem value="FILA">FILA</SelectItem>
                            <SelectItem value="Under Armour">Under Armour</SelectItem>
                            <SelectItem value="Skechers">Skechers</SelectItem>
                            <SelectItem value="Brooks">Brooks</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {value ? `Shoe Brand: ${value}` : "No shoe brand specified"}
                        </div>
                      )
                    )}
                  />
                  
                  <EditableProfileField
                    value={user.apparel || ""}
                    field="apparel"
                    onUpdate={onFieldUpdate}
                    editable={isCurrentUser}
                    placeholder="Apparel"
                    render={(value, editing, onChange) => (
                      editing ? (
                        <Select 
                          value={value} 
                          onValueChange={onChange}
                        >
                          <SelectTrigger className="w-full bg-muted border border-input text-sm">
                            <SelectValue placeholder="Select apparel brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nike">Nike</SelectItem>
                            <SelectItem value="Adidas">Adidas</SelectItem>
                            <SelectItem value="Under Armour">Under Armour</SelectItem>
                            <SelectItem value="Lululemon">Lululemon</SelectItem>
                            <SelectItem value="FILA">FILA</SelectItem>
                            <SelectItem value="New Balance">New Balance</SelectItem>
                            <SelectItem value="Wilson">Wilson</SelectItem>
                            <SelectItem value="Lacoste">Lacoste</SelectItem>
                            <SelectItem value="Athleta">Athleta</SelectItem>
                            <SelectItem value="Jockerey">Jockerey</SelectItem>
                            <SelectItem value="Vuori">Vuori</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {value ? `Apparel: ${value}` : "No apparel specified"}
                        </div>
                      )
                    )}
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