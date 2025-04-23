# Framework 5.4: Code Examples

These examples demonstrate the practical application of Framework 5.4 principles in common development scenarios.

## Table of Contents
1. [Image Upload & Preview](#image-upload--preview)
2. [Data Fetching & Caching](#data-fetching--caching)
3. [Form Handling](#form-handling)
4. [Modal Dialogs](#modal-dialogs)
5. [Error Handling](#error-handling)
6. [User Preferences](#user-preferences)
7. [Performance Optimization](#performance-optimization)

## Image Upload & Preview

### Simple Image Upload with Preview

```jsx
import { useState, useRef } from 'react';

function ImageUploader({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Set selected file
    setSelectedFile(file);
    
    // Create preview with FileReader (standard browser API)
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      onUpload(data.imageUrl);
      
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="image-uploader">
      <div className="preview-area">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="preview-image" />
        ) : (
          <div className="placeholder">Select an image</div>
        )}
      </div>
      
      <div className="buttons">
        <button onClick={handleFileSelect} disabled={isUploading}>
          Select Image
        </button>
        
        {selectedFile && (
          <button 
            onClick={handleUpload} 
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden-input"
        style={{ display: 'none' }}
      />
    </div>
  );
}
```

## Data Fetching & Caching

### Simple Data Fetching with Local Storage Caching

```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      // Reset states
      setIsLoading(true);
      setError(null);

      try {
        // Try to get from localStorage first
        const cachedData = localStorage.getItem(`user_${userId}`);
        
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;
          
          // Use cache if less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            setUserData(data);
            setIsLoading(false);
            return;
          }
        }
        
        // Fetch fresh data
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        
        // Update state
        setUserData(data);
        
        // Cache the result
        localStorage.setItem(
          `user_${userId}`, 
          JSON.stringify({ 
            data, 
            timestamp: Date.now() 
          })
        );
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [userId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userData) return <div>No user data found</div>;

  return (
    <div className="user-profile">
      <h2>{userData.name}</h2>
      <p>Email: {userData.email}</p>
      {/* Display other user properties */}
    </div>
  );
}
```

## Form Handling

### Simple Form with Validation

```jsx
import { useState } from 'react';

function ProfileForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    email: '',
    bio: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Simple validation rules
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {errors.name && <div className="error">{errors.name}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {errors.email && <div className="error">{errors.email}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          disabled={isSubmitting}
          rows={4}
        />
        {errors.bio && <div className="error">{errors.bio}</div>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
```

## Modal Dialogs

### Simple Modal Component

```jsx
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  
  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    // Close on escape key
    function handleEscKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      
      // Prevent scrolling of the body when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="modal-content">
          {children}
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Usage:
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Open Modal</button>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
      >
        <p>This is the content of the modal.</p>
      </Modal>
    </div>
  );
}
```

## Error Handling

### Simple Error Boundary

```jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Optional: log to error reporting service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unknown error occurred'}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage:
function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## User Preferences

### Simple Preferences Manager with localStorage

```jsx
import { useState, useEffect, createContext, useContext } from 'react';

// Create context
const PreferencesContext = createContext(null);

// Provider component
function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    fontSize: 'medium',
    notifications: true
  });
  
  // Load preferences from localStorage on initial render
  useEffect(() => {
    const storedPreferences = localStorage.getItem('user_preferences');
    
    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences));
      } catch (error) {
        console.error('Failed to parse preferences:', error);
      }
    }
  }, []);
  
  // Update a single preference
  const updatePreference = (key, value) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, [key]: value };
      
      // Save to localStorage
      localStorage.setItem('user_preferences', JSON.stringify(newPreferences));
      
      return newPreferences;
    });
  };
  
  // Reset preferences to default
  const resetPreferences = () => {
    const defaultPreferences = {
      theme: 'light',
      fontSize: 'medium',
      notifications: true
    };
    
    setPreferences(defaultPreferences);
    localStorage.setItem('user_preferences', JSON.stringify(defaultPreferences));
  };
  
  return (
    <PreferencesContext.Provider value={{ 
      preferences, 
      updatePreference,
      resetPreferences 
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

// Custom hook for using preferences
function usePreferences() {
  const context = useContext(PreferencesContext);
  
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  
  return context;
}

// Usage:
function App() {
  return (
    <PreferencesProvider>
      <SettingsPage />
    </PreferencesProvider>
  );
}

function SettingsPage() {
  const { preferences, updatePreference, resetPreferences } = usePreferences();
  
  return (
    <div className="settings-page">
      <h1>Settings</h1>
      
      <div className="setting-item">
        <label>
          Theme:
          <select 
            value={preferences.theme}
            onChange={(e) => updatePreference('theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </label>
      </div>
      
      <div className="setting-item">
        <label>
          Font Size:
          <select 
            value={preferences.fontSize}
            onChange={(e) => updatePreference('fontSize', e.target.value)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
      </div>
      
      <div className="setting-item">
        <label>
          <input 
            type="checkbox"
            checked={preferences.notifications}
            onChange={(e) => updatePreference('notifications', e.target.checked)}
          />
          Enable Notifications
        </label>
      </div>
      
      <button onClick={resetPreferences}>
        Reset to Defaults
      </button>
    </div>
  );
}
```

## Performance Optimization

### Simple Memoization Techniques

```jsx
import { useState, useCallback, useMemo } from 'react';

function ExpensiveCalculationComponent({ data, multiplier }) {
  // Memoize expensive calculation
  const processedData = useMemo(() => {
    console.log('Calculating processed data...');
    
    // Simulate expensive calculation
    return data.map(item => ({
      ...item,
      value: item.value * multiplier
    }));
  }, [data, multiplier]); // Only recalculate when data or multiplier changes
  
  // Memoize event handler
  const handleItemClick = useCallback((id) => {
    console.log(`Item clicked: ${id}`);
    // Handle the click
  }, []); // No dependencies, so function reference stays stable
  
  return (
    <div>
      <h2>Processed Data</h2>
      <ul>
        {processedData.map(item => (
          <li 
            key={item.id}
            onClick={() => handleItemClick(item.id)}
          >
            {item.name}: {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Parent component with correct React patterns
function DataContainer() {
  const [data, setData] = useState([
    { id: 1, name: 'Item 1', value: 10 },
    { id: 2, name: 'Item 2', value: 20 },
    { id: 3, name: 'Item 3', value: 30 }
  ]);
  
  const [multiplier, setMultiplier] = useState(1);
  
  // Simple form for updating multiplier
  return (
    <div>
      <div>
        <label>
          Multiplier:
          <input 
            type="number"
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value) || 1)}
            min="1"
          />
        </label>
      </div>
      
      <ExpensiveCalculationComponent 
        data={data}
        multiplier={multiplier}
      />
    </div>
  );
}
```

These examples follow Framework 5.4 principles by:

1. Using **standard browser APIs** (FileReader, localStorage)
2. Implementing **direct solutions** to common problems
3. Maintaining **simple state management** with minimal state variables
4. Using **proper React patterns** like useCallback and useMemo where appropriate
5. Keeping **error handling** straightforward
6. Focusing on **functional simplicity** throughout the codebase