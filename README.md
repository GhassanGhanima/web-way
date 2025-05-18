<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Accessibility Tool API

A comprehensive web accessibility tool that helps make websites accessible to all users, with subscription-based access, analytics, and powerful customization options.

## Features

- **Accessibility Tool**: JavaScript-based tool that enhances website accessibility
- **API Versioning**: Support for multiple API versions to ensure backward compatibility
- **Authentication**: JWT-based authentication with Google OAuth integration
- **User Management**: Complete user management with roles and permissions
- **Subscription System**: Tiered subscription plans with various features
- **Payment Processing**: Secure payment processing with Stripe integration
- **CDN**: Secure content delivery network for JavaScript assets
- **Analytics**: Comprehensive usage tracking and reporting
- **Internationalization**: Multi-language support
- **Admin Dashboard**: Full administrative controls
- **Comprehensive Documentation**: Swagger API documentation

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT, Passport
- **Documentation**: Swagger/OpenAPI
- **Caching**: Redis
- **Email**: Nodemailer
- **Testing**: Jest
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Redis (for production)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/accessibility-tool-api.git
   cd accessibility-tool-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations:
   ```bash
   npm run migration:run
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

### Docker Setup

You can also run the application using Docker:

```bash
# Build and start the containers
docker-compose up -d

# Run migrations
docker-compose exec app npm run migration:run
```

## Project Structure

```
accessibility-tool-api/
├── src/
│   ├── common/              # Shared utilities and modules
│   │   ├── cache/           # Caching functionality
│   │   ├── decorators/      # Custom decorators
│   │   ├── email/           # Email service
│   │   ├── filters/         # Global exception filters
│   │   ├── health/          # Health checks
│   │   ├── i18n/            # Internationalization
│   │   ├── interceptors/    # HTTP interceptors
│   │   ├── logging/         # Logging configuration
│   │   ├── pipes/           # Custom validation pipes
│   │   └── tasks/           # Background task processing
│   ├── config/              # Configuration modules
│   ├── database/            # Database migrations and seeds
│   ├── i18n/                # Translation files
│   ├── modules/             # Feature modules
│   │   ├── admin/           # Admin functionality
│   │   ├── analytics/       # Usage analytics
│   │   ├── auth/            # Authentication
│   │   ├── cdn/             # Content delivery
│   │   ├── integrations/    # Website integrations
│   │   ├── payments/        # Payment processing
│   │   ├── plans/           # Subscription plans
│   │   ├── reporting/       # Reporting functionality
│   │   ├── subscriptions/   # User subscriptions
│   │   └── users/           # User management
│   ├── templates/           # Email templates
│   ├── app.controller.ts    # Main controller
│   ├── app.module.ts        # Main module
│   ├── app.service.ts       # Main service
│   └── main.ts              # Application entry point
├── test/                    # Test files
├── .env.example             # Example environment variables
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
├── docker-compose.yml       # Docker configuration
├── Dockerfile               # Docker build file
├── nest-cli.json            # NestJS CLI configuration
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## API Documentation

The API documentation is available at `/api/docs` when the server is running. It provides comprehensive information about all endpoints, including request and response formats, authentication requirements, and available operations.

## Authentication

The API supports two authentication methods:

1. **JWT Authentication**: For programmatic access using access and refresh tokens
2. **Google OAuth**: For user-friendly login via Google accounts

### JWT Authentication

To authenticate with JWT:

1. Obtain a token by logging in via `/api/v1/auth/login`
2. Include the token in the Authorization header: `Authorization: Bearer <token>`
3. Refresh expired tokens using `/api/v1/auth/refresh`

### Google OAuth

To authenticate with Google:

1. Redirect users to `/api/v1/auth/google`
2. Users will be redirected back to your application after authentication
3. The redirect will include a JWT token for subsequent API calls

## Development

### Code Style

We use ESLint and Prettier to maintain code quality:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

### Database Migrations

```bash
# Generate a new migration
npm run migration:generate -- -n MigrationName

# Run pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert
```

## Deployment

### Production Setup

For production deployment, ensure these environment variables are properly configured:

- Database connection details
- JWT secrets
- Email configuration
- Redis cache settings
- Stripe API keys
- Google OAuth credentials

### Deployment Options

1. **Docker Deployment**:
   ```bash
   docker build -t accessibility-tool-api .
   docker run -p 3000:3000 --env-file .env.production accessibility-tool-api
   ```

2. **Cloud Providers**:
   - AWS Elastic Beanstalk
   - Google Cloud Run
   - Heroku
   - Azure App Service

3. **Manual Deployment**:
   ```bash
   npm run build
   npm run start:prod
   ```

## Performance Optimization

For optimal performance:

1. Enable Redis caching in production
2. Configure proper database indexes
3. Set up a CDN for static assets
4. Use horizontal scaling for high traffic

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, contact our team at support@example.com or open an issue on GitHub.

# Web-Way Accessibility Application

## Database Setup

This project uses TypeORM for database migrations. There are two ways to run migrations:

### Method 1: Custom Migration Runner (Recommended)

This method runs migrations in a specific order to ensure tables are created before data is inserted:

```bash
npm run migration:custom
```

### Method 2: Standard TypeORM Migration Runner

Only use this if you're familiar with TypeORM's migration system:

```bash
npm run migration:typeorm
```

### Setting up a fresh database

To drop the database, recreate it, and run all migrations and seeds:

```bash
npm run db:fresh
```

### Seeding data

To seed the database with initial data:

```bash
npm run seed
```

## Development

To start the development server:

```bash
npm run start:dev
```

## Common issues

### "relation does not exist" errors

If you encounter "relation does not exist" errors, it means migrations are running in the wrong order. Use the custom migration runner instead:

```bash
npm run migration:custom
```

## License

This project is licensed under the [LICENSE NAME] - see the LICENSE file for details.
