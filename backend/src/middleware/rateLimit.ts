import rateLimit from "express-rate-limit";

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"); // 15 minutes
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "10");

export const rateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: {
    error: `Too many requests from this IP, please try again in ${Math.ceil(windowMs / 1000 / 60)} minutes.`,
    retryAfter: Math.ceil(windowMs / 1000 / 60) + " minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for certain IPs (optional)
  skip: (req) => {
    const skipIPs = process.env.SKIP_RATE_LIMIT_IPS?.split(",") || [];
    return skipIPs.includes(req.ip || "");
  },
});
