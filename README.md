# Anirealm Web

A comprehensive anime and manga platform featuring tracking, streaming, and social features.

## Features

- **Anime Tracking**: Track your watching progress.
- **Manga Library**: Integration with **Suwayomi Server** for self-hosted manga reading.
- **Streaming**: Watch anime directly in the browser (powered by Consumet & Jikan).
- **Cross-Platform**: Responsive design for desktop and mobile.
- **Modern Stack**: Built with Next.js 14, Chakra UI, and Three.js.

## Project Structure

This project is organized as a monorepo:

- **`animee/`**: The Frontend application (Next.js 14, Chakra UI).
- **`backend/`**: The Backend API (Node.js, Express, MongoDB).

## Prerequisites

Before running the project, ensure you have the following installed:

1.  **Node.js** (v18 or higher)
2.  **MongoDB** (Local or Atlas)
3.  **Suwayomi Server** (For Manga Library features)
    -   Download and install the latest `Suwayomi-Server` (MSI provided in root or from [official repo](https://github.com/Suwayomi/Suwayomi-Server)).
    -   Ensure it is running on the default port **4567**.

## Getting Started

For Vercel deployment, the repository root contains a multi-service `vercel.json` that exposes the Next.js app publicly and routes `/api/*` to the Express backend. Configure `MONGO_URI`, `JWT_SECRET`, and `SUWAYOMI_URL` as Vercel environment variables. `SUWAYOMI_URL` must point to a publicly reachable Suwayomi instance; the localhost value below is for local development only.

To run the full application, you need to start the backend, the frontend, and the Suwayomi server.

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in `backend/` with your secrets:
    ```env
    MONGO_URI=mongodb://localhost:27017/anirealm   # Or your Atlas URI
    JWT_SECRET=your_super_secret_jwt_key
    PORT=5000
    ```
4.  Start the backend server:
    ```bash
    npm start
    ```
    The backend will run on `http://localhost:5000`.

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd animee
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file in `animee/` with the API URL:
    ```env
    # The frontend uses same-origin /api/* routes in development and production.
    NEXT_PUBLIC_API_URL=
    ```
4.  The app is configured to proxy API requests:
    -   Backend API: `http://localhost:5000` (Default)
    -   Suwayomi Server: `http://127.0.0.1:4567` (Configured in `next.config.ts`)
5.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000`.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

