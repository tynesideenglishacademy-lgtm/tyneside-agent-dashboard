import rateLimit from 'express-rate-limit';

/**
 * Global API Rate Limiter
 * Restricts requests per IP address to prevent DDoS and API quota exhaustion.
 */
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
    status: 429
  }
});

/**
 * Stricter Rate Limiter for sensitive endpoints (e.g., auth, bulk invoice triggers)
 */
export const sensitiveActionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // Limit each IP to 15 requests per 5 minutes
  message: {
    error: 'Rate limit exceeded for sensitive action. Please wait a few minutes.',
    status: 429
  }
});
