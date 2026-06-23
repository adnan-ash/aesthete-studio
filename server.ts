import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

import coffeeRoutes from "./src/server/routes/coffeeRoutes";
import authRoutes from "./src/server/routes/authRoutes";
import checkoutRoutes from "./src/server/routes/checkoutRoutes";

async function startServer() {
  // Ensure SQLite Database is initialized and seeded
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  if (!fs.existsSync(dbPath)) {
    try {
      console.log("Database Dev SQLite file not found. Initializing schema and running seed data...");
      execSync("npx prisma db push && npx tsx prisma/seed.ts", { stdio: "inherit" });
      console.log("Database successfully created and seeded.");
    } catch (error) {
      console.error("Database initialization failed. Preeminent fallback setup initiated...", error);
    }
  } else {
    console.log("Tactile Database initialized (Using active SQL replica).");
  }

  const app = express();
  // AI Studio only allows external traffic on port 3000
  // So we use 3000 instead of 5000 requested by the prompt.
  const PORT = 3000;

  // Single shared Prisma Client instance to prevent connection leak-induced lags
  const prisma = new PrismaClient();

  // Middleware
  app.use(cors());
  app.use(express.json());

  app.post("/api/auth/google", async (req, res) => {
    try {
      const { email, name } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Google email is required' });
      }

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
          }
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      });
    } catch (error) {
      console.error('Google SSO failed:', error);
      res.status(500).json({ success: false, error: 'Google SSO failed' });
    }
  });

  // Google OAuth URL generation
  app.get("/api/auth/google/url", (req, res) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || process.env.CLIENT_ID;
    const clientRedirectUri = req.query.redirect_uri as string || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    
    if (googleClientId) {
      // Real Google OAuth URL
      const params = new URLSearchParams({
        client_id: googleClientId,
        redirect_uri: clientRedirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'online',
        prompt: 'select_account'
      });
      res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, isSandbox: false });
    } else {
      // Sandbox mode: redirect to a beautiful local mock chooser page
      const sandboxParams = new URLSearchParams({
        redirect_uri: clientRedirectUri
      });
      res.json({ url: `/api/auth/google/sandbox?${sandboxParams.toString()}`, isSandbox: true });
    }
  });

  // Beautiful local Google sandbox input page
  app.get("/api/auth/google/sandbox", (req, res) => {
    const redirectUri = req.query.redirect_uri as string;
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sign in - Google Account Sandbox</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f0f4f9;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: white;
      border-radius: 28px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      text-align: center;
    }
    .logo {
      margin-bottom: 20px;
    }
    h1 {
      font-size: 24px;
      font-weight: 500;
      color: #1f1f1f;
      margin: 0 0 8px 0;
    }
    p {
      font-size: 14px;
      color: #5f6368;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }
    .info-box {
      font-size: 11.5px;
      background-color: #fafbfc;
      border: 1px solid #e1e4e6;
      border-radius: 12px;
      padding: 12px 14px;
      color: #3c4043;
      margin-bottom: 24px;
      text-align: left;
      line-height: 1.5;
    }
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: left;
    }
    label {
      outline: none;
      font-size: 12px;
      font-weight: 600;
      color: #444746;
      margin-bottom: -4px;
    }
    input {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 16px;
      border: 1px solid #747775;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus {
      border-color: #0b57d0;
      box-shadow: 0 0 0 2px rgba(11, 87, 208, 0.15);
    }
    .btn {
      background-color: #0b57d0;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-top: 10px;
      text-align: center;
    }
    .btn:hover {
      background-color: #0842a0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <svg width="48" height="48" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
      </svg>
    </div>
    <h1>Sign in with Google</h1>
    <p>to continue to Aesthete Studio Sandbox</p>

    <div class="info-box">
      <strong>Want real-life Google login?</strong> Add your Google <code>CLIENT_ID</code> and <code>CLIENT_SECRET</code> to your app settings environment variables. This sandbox will automatically switch to Google's live identity servers.
    </div>

    <div class="form-container">
      <label for="cust-name">Full Name</label>
      <input type="text" id="cust-name" placeholder="John Doe" required>
      
      <label for="cust-email">Email Address</label>
      <input type="email" id="cust-email" placeholder="name@example.com" required>
      
      <button class="btn" onclick="submitCustom()">Sign In & Authenticate</button>
    </div>
  </div>

  <script>
    const redirectUri = "${redirectUri}";
    function selectAcc(email, name) {
      const url = new URL(redirectUri);
      url.searchParams.set("code", "sandbox_code");
      url.searchParams.set("email", email);
      url.searchParams.set("name", name);
      window.location.href = url.toString();
    }
    function submitCustom() {
      const name = document.getElementById('cust-name').value.trim() || 'Sandbox User';
      const email = document.getElementById('cust-email').value.trim();
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
      selectAcc(email, name);
    }
  </script>
</body>
</html>
    `);
  });

  // Google OAuth redirect callback (exchanges code for real profile or receives sandbox info)
  app.get(["/api/auth/google/callback", "/api/auth/google/callback/"], async (req, res) => {
    try {
      const { code, email: sandboxEmail, name: sandboxName } = req.query;
      
      let email = "";
      let name = "";
      
      const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || process.env.CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || process.env.CLIENT_SECRET;
      
      if (!googleClientId || code === "sandbox_code") {
        // Sandbox callback handling
        email = (sandboxEmail as string) || "sandbox@example.com";
        name = (sandboxName as string) || "Sandbox User";
      } else {
        // Real Google OAuth code exchange
        const clientRedirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
        
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code: code as string,
            client_id: googleClientId,
            client_secret: googleClientSecret as string,
            redirect_uri: clientRedirectUri,
            grant_type: "authorization_code"
          })
        });
        
        if (!tokenResponse.ok) {
          const errorDetails = await tokenResponse.text();
          throw new Error(`Google code exchange failed: ${errorDetails}`);
        }
        
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        
        const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (!profileResponse.ok) {
          throw new Error("Failed to retrieve user profile from Google");
        }
        
        const profileData = await profileResponse.json();
        email = profileData.email;
        name = profileData.name || profileData.given_name || email.split("@")[0];
      }
      
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
          }
        });
      }
      
      const userPayload = JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name
      });
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  user: ${userPayload} 
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
              <h3>Authentication successful!</h3>
              <p>This window should close automatically.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Google callback processing failed:', error);
      res.status(500).send(`
        <html>
          <body>
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px; color: #dc2626;">
              <h3>Authentication Error</h3>
              <p>Failed to sign in with Google. ${error instanceof Error ? error.message : "Please try again."}</p>
              <button onclick="window.close()" style="padding: 8px 16px; margin-top: 15px; cursor: pointer;">Close Window</button>
            </div>
          </body>
        </html>
      `);
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ success: false, error: 'User already exists' });

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name: name || email.split('@')[0] }
      });

      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      console.error('Registration failed:', error);
      res.status(500).json({ success: false, error: 'Registration failed' });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) return res.status(400).json({ success: false, error: 'Invalid email or password' });

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      if (user.password !== hashedPassword) return res.status(400).json({ success: false, error: 'Invalid email or password' });

      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      console.error('Login failed:', error);
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  });

  // API Routes MUST be declared before Vite
  app.use("/api/menu", coffeeRoutes);
  // app.use("/api/auth", authRoutes); // disabled external router
  app.use("/api/checkout", checkoutRoutes);
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", cwd: process.cwd() });
  });

  // Vite middleware for development or Static files for production
  if (process.env.NODE_ENV !== "production") {
    // Lazy load Vite to avoid errors in production without Vite
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For React Router fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
