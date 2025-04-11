/**
 * PKL-278651-ADMIN-0013-SEC
 * Express Session Type Extensions
 * 
 * This file extends the Express Session type to include our custom properties
 */

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
  }
}