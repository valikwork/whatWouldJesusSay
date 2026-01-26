import cors from "cors";

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["*"];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow all origins in development or if * is specified
    if (
      allowedOrigins.includes("*") ||
      process.env.NODE_ENV === "development"
    ) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check if it's a Chrome extension
    if (origin.startsWith("chrome-extension://")) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
