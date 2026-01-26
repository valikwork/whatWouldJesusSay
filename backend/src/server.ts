import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { corsMiddleware } from "./middleware/cors";
import { rateLimiter } from "./middleware/rateLimit";
import analyzeRoutes from "./routes/analyze";

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS middleware
app.use(corsMiddleware);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
app.use("/api/", rateLimiter);

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api", analyzeRoutes);

// Privacy policy route
app.get("/privacy-policy", (_, res: Response) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Privacy Policy - Christian Perspective Assistant</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                line-height: 1.6;
                color: #333;
            }
            h1 { color: #2C3E50; }
            h2 { color: #34495E; margin-top: 30px; }
            ul { margin-left: 20px; }
            a { color: #3498db; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <h1>Privacy Policy</h1>
        <p><strong>Last updated: January 26, 2026</strong></p>
        
        <h2>Introduction</h2>
        <p>Christian Perspective Assistant ("we", "our", or "the extension") is committed to protecting your privacy. This policy explains how we handle your data.</p>
        
        <h2>Data Collection</h2>
        <p>Our extension only processes data when you explicitly click the "Analyze" button. We collect:</p>
        <ul>
            <li>Current page URL</li>
            <li>Page title and meta descriptions</li>
            <li>Main text content (limited to first 5,000 characters)</li>
            <li>Page headings (H1, H2, H3)</li>
            <li>Image alt text (up to 5 images)</li>
        </ul>
        
        <h2>How We Use Your Data</h2>
        <p>The collected data is:</p>
        <ul>
            <li>Sent to our secure backend API</li>
            <li>Processed using OpenAI's API to generate Christian perspective analysis</li>
            <li>Returned to you in the extension popup</li>
            <li><strong>Not stored permanently</strong> - we do not maintain a database of analyzed pages</li>
        </ul>
        
        <h2>Data Storage and Retention</h2>
        <ul>
            <li>We do not store your browsing history</li>
            <li>We do not store analyzed page content</li>
            <li>API requests are processed in real-time only</li>
            <li>No personal information is collected or retained</li>
        </ul>
        
        <h2>Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
            <li><strong>OpenAI API</strong> - For AI-powered content analysis. Review <a href="https://openai.com/privacy" target="_blank">OpenAI's Privacy Policy</a></li>
            <li><strong>Railway</strong> - For backend hosting. Review <a href="https://railway.app/legal/privacy" target="_blank">Railway's Privacy Policy</a></li>
        </ul>
        
        <h2>Data Security</h2>
        <p>We implement security measures including:</p>
        <ul>
            <li>HTTPS encryption for all data transmission</li>
            <li>Rate limiting to prevent abuse</li>
            <li>Secure API key management</li>
        </ul>
        
        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
            <li>Know what data is being processed (outlined above)</li>
            <li>Stop using the extension at any time</li>
            <li>Uninstall the extension, which removes all associated data</li>
        </ul>
        
        <h2>Children's Privacy</h2>
        <p>Our extension is not directed at children under 13. We do not knowingly collect data from children.</p>
        
        <h2>Data Sharing</h2>
        <p>We do not:</p>
        <ul>
            <li>Sell your data to third parties</li>
            <li>Share your data for advertising purposes</li>
            <li>Use your data for purposes unrelated to the extension's functionality</li>
        </ul>
        <p>Your data is only shared with OpenAI for the purpose of generating analysis results.</p>
        
        <h2>Changes to This Policy</h2>
        <p>We may update this policy periodically. The "Last updated" date will reflect any changes. Continued use of the extension after changes constitutes acceptance of the updated policy.</p>
        
        <h2>Contact</h2>
        <p>For questions about this privacy policy or our data practices, contact us at:</p>
        <p><strong>Email:</strong> osiptsev.valik@gmail.com</p>
        
        <h2>Consent</h2>
        <p>By using Christian Perspective Assistant, you consent to this privacy policy.</p>
        
        <h2>Compliance</h2>
        <p>This extension complies with:</p>
        <ul>
            <li>Chrome Web Store Developer Program Policies</li>
            <li>Google API Services User Data Policy</li>
            <li>General Data Protection Regulation (GDPR) principles</li>
        </ul>
    </body>
  </html>
  `);
});

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "What Would Jesus Say API",
    version: "1.0.0",
    endpoints: {
      analyze: "POST /api/analyze",
      health: "GET /api/health",
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🤖 OpenAI Model: ${process.env.OPENAI_MODEL || "gpt-4o-mini"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  process.exit(0);
});
