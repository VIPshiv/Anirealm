# Anirealm Backend

This is the backend structure for the Anirealm platform. It is designed to handle user authentication, anime data management, and manual tracking of anime progress.

## Structure

- **models/**: Database schemas (MongoDB/Mongoose).
  - `User.js`: User profile and authentication data.
  - `Entry.js`: User's tracking entry (status, episode, rating).
- **routes/**: API endpoints.
  - `auth.js`: Login/Register.
  - `entries.js`: CRUD operations for journal entries.
  - `profiles.js`: Manage user profiles.
  - `proxy.js`: Proxy for external API requests.
- **middleware/**: Auth verification, error handling.

## Setup

1. `npm install`
2. Configure `.env` with `MONGO_URI` and `JWT_SECRET`.
3. `npm start` (Runs on port 5000)

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/entries`: Get user's list.
- `POST /api/entries`: Add new entry.
- `PUT /api/entries/:id`: Update entry.
- `DELETE /api/entries/:id`: Remove entry.
- `GET /api/profiles`: Get user profiles.
- `POST /api/profiles`: Create new profile.

