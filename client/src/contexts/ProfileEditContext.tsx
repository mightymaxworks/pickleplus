/**
 * PKL-278651-CPEM-0001: Contextual Profile Editing Mode
 * 
 * This context provides a centralized way to manage editing state across
 * the entire profile interface, enabling components to seamlessly transition
 * between view and edit modes.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileEditContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  enableEditMode: () => void;
  disableEditMode: () => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
}

const ProfileEditContext = createContext<ProfileEditContextType | undefined>(undefined);

interface ProfileEditProviderProps {
  children: ReactNode;
}

export const ProfileEditProvider: React.FC<ProfileEditProviderProps> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const toggleEditMode = () => setIsEditMode(prev => !prev);
  const enableEditMode = () => setIsEditMode(true);
  const disableEditMode = () => setIsEditMode(false);

  const value = {
    isEditMode,
    toggleEditMode,
    enableEditMode,
    disableEditMode,
    hasUnsavedChanges,
    setHasUnsavedChanges
  };

  return (
    <ProfileEditContext.Provider value={value}>
      {children}
    </ProfileEditContext.Provider>
  );
};

export const useProfileEdit = (): ProfileEditContextType => {
  const context = useContext(ProfileEditContext);
  if (context === undefined) {
    throw new Error('useProfileEdit must be used within a ProfileEditProvider');
  }
  return context;
};