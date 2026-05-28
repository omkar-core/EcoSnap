import rateLimit from 'express-rate-limit';

// Global rate limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Specific AI endpoint rate limiter (more restrictive due to cost)
export const aiEndpointLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 image analyses per minute
  message: { error: 'Rate limit exceeded for AI analysis. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Chat endpoint rate limiter
export const chatEndpointLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 chat messages per minute
  message: { error: 'Rate limit exceeded for chat. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});
