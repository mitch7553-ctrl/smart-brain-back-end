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
