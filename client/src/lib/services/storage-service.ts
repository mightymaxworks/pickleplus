/**
 * Framework 5.3 Local Storage Service
 * 
 * This service provides a consistent interface for storing and retrieving data
 * that works whether we're using local storage or an API.
 */

import { nanoid } from 'nanoid';

// Define a base entity type that all stored items should extend
export interface BaseEntity {
  id: number | string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Core storage service interface that all data services implement
 */
export interface IStorageService<T extends BaseEntity> {
  getAll(): Promise<T[]>;
  getById(id: string | number): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string | number, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T>;
  delete(id: string | number): Promise<boolean>;
  query(filter: (item: T) => boolean): Promise<T[]>;
}

/**
 * Local storage implementation that persists data to the browser's localStorage
 */
export class LocalStorageService<T extends BaseEntity> implements IStorageService<T> {
  private storageKey: string;

  constructor(entityName: string) {
    this.storageKey = `pickle_plus_${entityName}`;
  }

  /**
   * Get all items from storage
   */
  async getAll(): Promise<T[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      return JSON.parse(data) as T[];
    } catch (error) {
      console.error(`Error getting all ${this.storageKey} from localStorage:`, error);
      return [];
    }
  }

  /**
   * Get an item by ID
   */
  async getById(id: string | number): Promise<T | null> {
    try {
      const items = await this.getAll();
      const item = items.find(i => i.id === id);
      return item || null;
    } catch (error) {
      console.error(`Error getting ${this.storageKey} by ID:`, error);
      return null;
    }
  }

  /**
   * Create a new item
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const items = await this.getAll();
      const now = new Date().toISOString();
      
      // Create a new item with an ID and timestamps
      const newItem = {
        ...data,
        id: typeof items[0]?.id === 'number' ? Math.max(0, ...items.map(i => Number(i.id))) + 1 : nanoid(),
        createdAt: now,
        updatedAt: now
      } as T;
      
      // Save the updated list
      localStorage.setItem(this.storageKey, JSON.stringify([...items, newItem]));
      
      return newItem;
    } catch (error) {
      console.error(`Error creating ${this.storageKey}:`, error);
      throw new Error(`Failed to create ${this.storageKey}`);
    }
  }

  /**
   * Update an existing item
   */
  async update(id: string | number, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
    try {
      const items = await this.getAll();
      const index = items.findIndex(i => i.id === id);
      
      if (index === -1) {
        throw new Error(`${this.storageKey} with ID ${id} not found`);
      }
      
      // Update the item with new data and updated timestamp
      const updatedItem = {
        ...items[index],
        ...data,
        updatedAt: new Date().toISOString()
      } as T;
      
      // Replace the item in the array
      items[index] = updatedItem;
      
      // Save the updated list
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      
      return updatedItem;
    } catch (error) {
      console.error(`Error updating ${this.storageKey}:`, error);
      throw new Error(`Failed to update ${this.storageKey}`);
    }
  }

  /**
   * Delete an item
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      const items = await this.getAll();
      const filteredItems = items.filter(i => i.id !== id);
      
      if (filteredItems.length === items.length) {
        // No item was removed
        return false;
      }
      
      // Save the updated list
      localStorage.setItem(this.storageKey, JSON.stringify(filteredItems));
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.storageKey}:`, error);
      return false;
    }
  }

  /**
   * Query items using a filter function
   */
  async query(filter: (item: T) => boolean): Promise<T[]> {
    try {
      const items = await this.getAll();
      return items.filter(filter);
    } catch (error) {
      console.error(`Error querying ${this.storageKey}:`, error);
      return [];
    }
  }

  /**
   * Clear all items of this type from storage
   */
  async clear(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * API implementation that calls the backend
 */
export class ApiStorageService<T extends BaseEntity> implements IStorageService<T> {
  private endpoint: string;
  
  constructor(endpoint: string) {
    this.endpoint = endpoint.startsWith('/api/') ? endpoint : `/api/${endpoint}`;
  }
  
  // We'll implement these methods with actual API calls later
  // For now, they'll call the local storage service as a fallback
  async getAll(): Promise<T[]> {
    // TODO: Implement API calls
    const fallbackService = new LocalStorageService<T>(this.endpoint.replace('/api/', ''));
    return fallbackService.getAll();
  }
  
  async getById(id: string | number): Promise<T | null> {
    // TODO: Implement API calls
    const fallbackService = new LocalStorageService<T>(this.endpoint.replace('/api/', ''));
    return fallbackService.getById(id);
  }
  
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    // TODO: Implement API calls
    const fallbackService = new LocalStorageService<T>(this.endpoint.replace('/api/', ''));
    return fallbackService.create(data);
  }
  
  async update(id: string | number, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
    // TODO: Implement API calls
    const fallbackService = new LocalStorageService<T>(this.endpoint.replace('/api/', ''));
    return fallbackService.update(id, data);
  }
  
  async delete(id: string | number): Promise<boolean> {
    // TODO: Implement API calls
    const fallbackService = new LocalStorageService<T>(this.endpoint.replace('/api/', ''));
    return fallbackService.delete(id);
  }
  
  async query(filter: (item: T) => boolean): Promise<T[]> {
    // TODO: Implement API calls
    const fallbackService = new LocalStorageService<T>(this.endpoint.replace('/api/', ''));
    return fallbackService.query(filter);
  }
}

/**
 * Feature flag configuration
 */
export const FeatureFlags = {
  // When true, use API services; when false, use local storage
  useApiServices: false
};

/**
 * Factory function to get the appropriate storage service
 */
export function getStorageService<T extends BaseEntity>(entityName: string): IStorageService<T> {
  // For now, we're always using local storage, but we'll add API implementation later
  return FeatureFlags.useApiServices
    ? new ApiStorageService<T>(entityName)
    : new LocalStorageService<T>(entityName);
}