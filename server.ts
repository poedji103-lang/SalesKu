import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";
import midtransClient from "midtrans-client";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp() {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Initialize Midtrans Snap client
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'YOUR_SERVER_KEY';
  const clientKey = process.env.MIDTRANS_CLIENT_KEY || 'YOUR_CLIENT_KEY';

  console.log(`[SalesKu] Initializing Midtrans. Production: ${isProduction}`);
  
  let snap: any;
  try {
    snap = new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey
    });
  } catch (err) {
    console.error("[SalesKu] Failed to initialize Midtrans client:", err);
  }

  // Persistent storage for API keys (Note: Write access to local disk is limited on Vercel functions, better to use DB)
  const CONFIG_PATH = path.join(process.cwd(), 'dynamic_config.json');
  let dynamicApiKeys: Record<string, { clientId: string, clientSecret: string }> = {};

  // Load existing config if available
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      dynamicApiKeys = JSON.parse(data);
    } catch (err) {
      console.error("[SalesKu] Failed to load dynamic config:", err);
    }
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Global Error Handler for API routes
  app.use("/api", (err: any, req: any, res: any, next: any) => {
    console.error("[SalesKu API Error]:", err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined 
    });
  });

  // Get Configuration Status
  app.get("/api/auth/status", (req, res) => {
    const platforms = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'];
    const status: Record<string, boolean> = {};
    
    console.log("--- Social Auth Status Check ---");
    console.log("Available Env Vars (Keys only):", Object.keys(process.env).filter(k => k.includes('_ID') || k.includes('_SECRET')));

    platforms.forEach(p => {
      const prefix = p === 'instagram' ? 'IG' : 
                    p === 'facebook' ? 'FB' :
                    p === 'twitter' ? 'TW' :
                    p === 'linkedin' ? 'LI' :
                    p === 'tiktok' ? 'TT' : p.toUpperCase();
      
      const hasDynamic = !!dynamicApiKeys[p]?.clientId;
      const hasEnv = !!process.env[`${prefix}_ID`];
      
      status[p] = hasDynamic || hasEnv;
      console.log(`Platform ${p}: dynamic=${hasDynamic}, env=${hasEnv} (Key: ${prefix}_ID)`);
    });
    
    res.json(status);
  });

  // Save API Configuration
  app.post("/api/auth/config", (req, res) => {
    const { platform, clientId, clientSecret } = req.body;
    if (!platform || !clientId || !clientSecret) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    dynamicApiKeys[platform] = { clientId, clientSecret };
    
    // Persist to disk
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(dynamicApiKeys, null, 2));
      console.log(`[SalesKu] Configured and saved API for ${platform}`);
    } catch (err) {
      console.error(`[SalesKu] Failed to save config for ${platform}:`, err);
    }
    
    res.json({ success: true });
  });

  // OAuth URL Generation
  app.get("/api/auth/:platform/url", (req, res) => {
    const { platform } = req.params;
    
    // Detect base URL dynamically if not provided in env
    let baseUrl = process.env.APP_URL;
    if (!baseUrl) {
      const host = req.get('host');
      baseUrl = `https://${host}`;
    }
    
    // Clean up URL: remove trailing slash and ensure https
    baseUrl = baseUrl.replace(/\/$/, "");
    if (!baseUrl.startsWith('https://')) {
      baseUrl = baseUrl.replace(/^http:\/\//, 'https://');
    }

    const redirectUri = `${baseUrl}/auth/${platform}/callback`;
    
    console.log(`Generating OAuth URL for ${platform}. Redirect URI: ${redirectUri}`);
    
    let authUrl = "";
    
    // Use dynamic keys if available, otherwise fallback to env
    const platformPrefix = platform === 'instagram' ? 'IG' : 
                          platform === 'facebook' ? 'FB' :
                          platform === 'twitter' ? 'TW' :
                          platform === 'linkedin' ? 'LI' :
                          platform === 'tiktok' ? 'TT' : platform.toUpperCase();

    const config = dynamicApiKeys[platform] || {
      clientId: process.env[`${platformPrefix}_ID`] || "",
      clientSecret: process.env[`${platformPrefix}_SECRET`] || ""
    };

    const { clientId } = config;
    
    console.log(`[OAuth Debug] Platform: ${platform}, ClientID: ${clientId ? 'SET' : 'EMPTY'}, ConfigID: ${process.env.FB_CONFIG_ID ? 'SET' : 'EMPTY'}`);

    if (!clientId) {
      return res.status(400).json({ error: `API Key for ${platform} not configured` });
    }

    switch (platform) {
      case "instagram":
        // Using Facebook Login for Instagram Graph API
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=instagram_basic,instagram_content_publish,pages_read_engagement,pages_show_list,business_management,public_profile&response_type=code`;
        if (process.env.FB_CONFIG_ID) {
          authUrl += `&config_id=${process.env.FB_CONFIG_ID}`;
        }
        break;
      case "facebook":
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_manage_posts,pages_read_engagement,pages_show_list,business_management,public_profile&response_type=code`;
        if (process.env.FB_CONFIG_ID) {
          authUrl += `&config_id=${process.env.FB_CONFIG_ID}`;
        }
        break;
      case "twitter":
        authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=tweet.read%20tweet.write%20users.read&response_type=code&code_challenge=challenge&code_challenge_method=plain`;
        break;
      case "linkedin":
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?client_id=${clientId}&redirect_uri=${redirectUri}&scope=w_member_social&response_type=code`;
        break;
      case "tiktok":
        authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientId}&scope=user.info.basic,video.upload,video.publish&response_type=code&redirect_uri=${redirectUri}`;
        break;
      default:
        return res.status(400).json({ error: "Invalid platform" });
    }

    res.json({ url: authUrl });
  });

  // OAuth Callback Handler
  app.get("/auth/:platform/callback", (req, res) => {
    const { platform } = req.params;
    const { code } = req.query;

    // In a real app, you would exchange the code for tokens here
    // and store them in a database or session.
    console.log(`Received ${platform} auth code:`, code);

    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h2 style="color: #0f172a;">Authentication Successful!</h2>
            <p style="color: #64748b;">Connecting your ${platform} account...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: '${platform}' }, '*');
                setTimeout(() => window.close(), 1000);
              } else {
                window.location.href = '/';
              }
            </script>
          </div>
        </body>
      </html>
    `);
  });

  // Social Posting API
  app.post("/api/social/post", (req, res) => {
    const { platform, content, mediaUrl } = req.body;
    
    // In a real app, you would use the stored tokens to call the platform's API
    console.log(`Posting to ${platform}:`, content);

    // Simulate API call
    setTimeout(() => {
      res.json({ success: true, message: `Successfully posted to ${platform}` });
    }, 1500);
  });

  // --- MIDTRANS PAYMENT API ---

  // Create Transaction (Snap Token)
  app.post("/api/payment/create-transaction", async (req, res) => {
    const { planId, amount, userEmail, userName } = req.body;

    if (!planId || !amount) {
      return res.status(400).json({ error: "Missing plan or amount" });
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const parameter = {
      "transaction_details": {
        "order_id": orderId,
        "gross_amount": amount
      },
      "credit_card": {
        "secure": true
      },
      "customer_details": {
        "first_name": userName || "Customer",
        "email": userEmail || "customer@example.com"
      },
      "item_details": [{
        "id": planId,
        "price": amount,
        "quantity": 1,
        "name": `SalesKu ${planId} Plan`
      }]
    };

    try {
      if (!snap) {
        return res.status(500).json({ error: "Midtrans client tidak terinisialisasi. Periksa kuncinya di Vercel." });
      }

      if (!process.env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY === 'YOUR_SERVER_KEY') {
        console.warn("[Payment] Warning: MIDTRANS_SERVER_KEY is not set or using placeholder.");
        return res.status(400).json({ error: "MIDTRANS_SERVER_KEY belum dikonfigurasi di Vercel Settings > Environment Variables" });
      }
      
      const transaction = await snap.createTransaction(parameter);
      console.log(`[Payment] Created transaction ${orderId} for ${userEmail}`);
      res.json({
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        order_id: orderId
      });
    } catch (e: any) {
      console.error("[Payment] Midtrans Error Details:", e);
      // Midtrans error object structure check
      const errorMessage = e.ApiResponse?.error_messages?.[0] || e.message || "Failed to create payment transaction";
      res.status(500).json({ 
        error: `Midtrans Error: ${errorMessage}`,
        details: process.env.NODE_ENV !== 'production' ? e.ApiResponse : undefined
      });
    }
  });

  // Midtrans Notification Webhook
  app.post("/api/payment/webhook", async (req, res) => {
    const notification = req.body;

    try {
      const statusResponse = await snap.transaction.notification(notification);
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      console.log(`[Webhook] Payment Notification received for ${orderId}: status=${transactionStatus}, fraud=${fraudStatus}`);

      if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge') {
          // TODO: handle fraud challenge
        } else if (fraudStatus == 'accept') {
          // TODO: Update user's plan in Firestore to 'paid'
          console.log(`[Webhook] Success! Order ${orderId} is paid.`);
        }
      } else if (transactionStatus == 'settlement') {
        // TODO: Update user's plan in Firestore to 'paid'
        console.log(`[Webhook] Success! Order ${orderId} is settled.`);
      } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        // TODO: Handle failure
        console.log(`[Webhook] Payment failed or expired for ${orderId}`);
      } else if (transactionStatus == 'pending') {
        // TODO: Handle pending
      }

      res.status(200).send('OK');
    } catch (e: any) {
      console.error("[Webhook] Error processing Midtrans notification:", e.message);
      res.status(500).send('Error');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = parseInt(process.env.PORT || "3000");

  return app;
}

// Only run port listening if name is main (not imported)
if (process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'))) {
  createApp().then(app => {
    const PORT = parseInt(process.env.PORT || "3000");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
