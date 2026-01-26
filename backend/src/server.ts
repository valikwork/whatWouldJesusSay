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
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api", analyzeRoutes);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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
