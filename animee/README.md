# Anirealm Frontend

This is the frontend application for the Anirealm platform, built with **Next.js 16**, **React 19**, **Chakra UI**, and **Tailwind CSS**.

## Prerequisites

-   Node.js (v18+)
-   Running Backend Service (See `../README.md`)
-   Running Suwayomi Server (For manga features)

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Create a `.env.local` file in the root of `animee/`:
    ```env
    # The frontend uses same-origin /api/* routes in development and production.
    NEXT_PUBLIC_API_URL=
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Key Features

-   **Next.js App Router**: Utilizing Server Components and Server Actions.
-   **Chakra UI + Tailwind**: Hybrid styling for components and layout.
-   **Three.js**: Immersive 3D elements ("Studio Mode").
-   **Proxy Configuration**: Direct connection to Suwayomi and Backend via `next.config.ts`.

