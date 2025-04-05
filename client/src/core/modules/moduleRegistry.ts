/**
 * Module Registry System
 * 
 * This system allows for:
 * - Central registration of module interfaces
 * - Loose coupling between modules
 * - Easy access to module APIs
 */

// Module interface for type checking
export interface Module {
  name: string;
  version: string;
  exports: Record<string, any>;
}

class ModuleRegistry {
  private modules: Map<string, Module> = new Map();

  /**
   * Register a module
   * @param module The module to register
   */
  registerModule(module: Module): void {
    if (this.modules.has(module.name)) {
      console.warn(`Module ${module.name} already registered. Overwriting.`);
    }
    this.modules.set(module.name, module);
  }

  /**
   * Get a module by name
   * @param name The name of the module to get
   * @returns The module instance
   * @throws Error if module is not registered
   */
  getModule<T extends Module>(name: string): T {
    if (!this.modules.has(name)) {
      throw new Error(`Module ${name} not registered`);
    }
    return this.modules.get(name) as T;
  }

  /**
   * Check if a module is registered
   * @param name The name of the module to check
   * @returns Whether the module is registered
   */
  hasModule(name: string): boolean {
    return this.modules.has(name);
  }

  /**
   * Get all registered modules
   * @returns All registered modules
   */
  getAllModules(): Module[] {
    return Array.from(this.modules.values());
  }
}

// Create and export a singleton instance
export const moduleRegistry = new ModuleRegistry();