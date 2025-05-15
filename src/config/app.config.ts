export default () => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || 'api',
    defaultVersion: process.env.API_DEFAULT_VERSION || '1',
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== 'false',
    title: process.env.SWAGGER_TITLE || 'Accessibility Tool API',
    description: process.env.SWAGGER_DESCRIPTION || 'API documentation for the Web Accessibility Tool',
    version: process.env.SWAGGER_VERSION || '1.0',
    path: process.env.SWAGGER_PATH || 'api/docs',
  },
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
    },
    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
  },
});
