/**
 * PKL-278651-ADMIN-0016-SYS-TOOLS - System Tools Initialization
 * 
 * This file initializes the system tools when the admin module loads.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 * @lastModified 2025-04-21
 */

import { initSystemTools } from './index';

// Automatically initialize system tools when this module is imported
initSystemTools();

console.log('[Admin] System tools initialization module loaded');