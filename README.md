# Smart Brain Back-End

This is the back-end API for the Smart Brain facial recognition application. It handles user authentication, database operations, and external API integrations.

## Tech Stack
- **Node.js** & **Express.js**: For building the RESTful API server
- **PostgreSQL**: Relational database for storing user data
- **Knex.js**: SQL query builder for PostgreSQL
- **Bcrypt-nodejs**: Password hashing for secure authentication
- **Clarifai API**: For facial recognition processing
- **Cors**: Cross-Origin Resource Sharing middleware
- **Body-parser**: To parse incoming request bodies

## Endpoints

### User Authentication & Management
- `POST /signin`: Authenticates a user and starts a session
- `POST /register`: Registers a new user and hashes their password
- `GET /profile/:id`: Retrieves a user's profile information
- `PUT /image`: Increments the user's entry count when an image is submitted

### Clarifai API Integration
- `POST /imageurl`: Securely calls the Clarifai API to perform facial recognition without exposing API keys on the front-end

## Configuration

The application uses environment variables for database connection:
- `DATABASE_URL`
- `DATABASE_HOST`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_DB`

## Setup and Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up your PostgreSQL database
4. Start the server using `npm start` (runs with nodemon for development)

## Environment and reliability

Use Node.js 20+ (native `fetch` is required). Copy `.env.example` into your local environment configuration and set your own credentials. Environment values must be loaded by the process or hosting platform; this app does **not** automatically read the `.env` file. Never commit the real `.env` file.

- `npm start` — run the production process (`PORT` defaults to 3000)
- `npm run dev` — local auto-reload
- `npm test` — run built-in Node.js regression tests
- `GET /health` — lightweight liveness response; does not validate database availability

The face-detection endpoint requires `CLARIFAI_PAT`. Without it, the endpoint returns HTTP 503 rather than attempting a request with a placeholder credential. Existing login records continue to use the legacy bcrypt library; a separate, tested password-hash migration is recommended. The current `/image` and `/profile/:id` endpoints also need authenticated access controls before the application can be considered production-secure.

### Manual checks before deployment

1. Run `npm install && npm test`.
2. Verify database connectivity using your deployment environment variables.
3. Set `CLARIFAI_PAT` in your host's secret manager and test detection with a safe public image URL.
4. Verify login, registration, profile loading, and entry increments on a staging deployment.
5. Review permitted frontend origins; CORS currently allows any origin and is **not** authorization.

## Authentication update (draft PR)

**Breaking integration change:** Configure a strong, stable `AUTH_TOKEN_SECRET` (32+ characters) before deploying this branch. Sign-in and registration return a short-lived bearer token. Send `Authorization: Bearer <token>` for `/profile/:id`, `/image`, and `/imageurl`. User-specific endpoints require the token identity to match the requested user ID. Tokens expire after eight hours; signing out on the frontend discards the token in memory. Previously issued tokens cannot be revoked individually; rotating the secret invalidates all tokens.

Do not merge or deploy the backend without the matching frontend changes and end-to-end staging verification. Further measures for production include login rate limiting, password hashing migration, and more restrictive CORS.
