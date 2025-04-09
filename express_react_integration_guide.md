# Express + React Integration Quick Reference Guide

## Correct Setup Order

```javascript
// 1. Core Express Setup
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 2. CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie']
}));

// 3. Session Setup (Must come before Auth)
app.use(session({...}));

// 4. Authentication Setup
setupAuth(app);  // CRITICAL: Sets up Passport and auth routes

// 5. API Routes
app.use('/api/resource1', resource1Routes);
app.use('/api/resource2', resource2Routes);

// 6. API Error Handling
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// 7. Vite Middleware (Must be LAST)
setupVite(app);
```

## Common Mistakes to Avoid

❌ **WRONG**: Custom catch-all route before Vite middleware
```javascript
// This will break the React app routing
app.get('*', (req, res) => { ... });
// Vite middleware never gets a chance to run
setupVite(app);
```

✅ **RIGHT**: Let Vite handle non-API routes
```javascript
// Only handle API 404s
app.use('/api/*', (req, res) => { ... });
// Let Vite handle everything else
setupVite(app);
```

❌ **WRONG**: Forgot to call setupAuth
```javascript
// Sessions are set up
app.use(session({...}));

// But auth routes are never registered!
// setupAuth(app);  <-- Missing!

// API routes that depend on auth will fail
app.use('/api/protected', protectedRoutes);
```

✅ **RIGHT**: Always set up auth
```javascript
// Sessions are set up
app.use(session({...}));

// Auth routes and passport setup
setupAuth(app);

// Now auth works for protected routes
app.use('/api/protected', protectedRoutes);
```

## Session Configuration for Development

```javascript
const sessionSettings = {
  secret: process.env.SESSION_SECRET || "dev-secret-key",
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: false, // IMPORTANT: false for development
    sameSite: "lax"
  }
};

// Trust the first proxy for Replit
app.set('trust proxy', 1);

app.use(session(sessionSettings));
```

## Troubleshooting Auth Issues

1. **Check server logs** for 404 errors on auth endpoints
2. **Verify cookie settings** - especially `secure` and `sameSite`
3. **Examine network requests** in browser for auth API calls
4. **Test auth endpoints** directly with curl or Postman
5. **Add verbose logging** to auth flow for debugging

## React Router Integration

- Use `wouter` for routing in the React app
- Never create Express routes that conflict with React routes
- Let Vite's catch-all handler serve the React app for all non-API routes

## Development Tips

- After modifying the auth system, always test login/logout flows
- Use the browser's dev tools to inspect cookies and requests
- Clear cookies and sessions when testing auth changes
- Remember: cookie-based auth requires proper CORS settings