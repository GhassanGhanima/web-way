/**
 * Security headers configuration for the Next.js frontend
 * This can be used in next.config.js
 */
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: `default-src 'self'; 
      script-src 'self' 'unsafe-inline' https://js.stripe.com https://cdn.accessibility-tool.example.com https://api.accessibility-tool.example.com; 
      style-src 'self' 'unsafe-inline'; 
      img-src 'self' data: https:; 
      connect-src 'self' https://api.accessibility-tool.example.com https://*.stripe.com; 
      frame-src https://*.stripe.com; 
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      font-src 'self' data:;
      upgrade-insecure-requests;`
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  }
];

module.exports = { securityHeaders };
