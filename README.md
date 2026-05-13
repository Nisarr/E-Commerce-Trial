# Baby Pen House

Baby Pen House is a modern e-commerce platform designed for a frictionless shopping experience.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Zustand, React Router
- **Backend:** Cloudflare Workers, Hono, Drizzle ORM
- **Database:** Turso (libSQL) / SQLite
- **Deployment:** Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Run both frontend and backend development servers concurrently:

```bash
npm run dev:full
```

Alternatively, run them separately:
- Frontend: `npm run dev:frontend`
- Backend: `npm run dev:backend`

### Database Management

- Generate migrations: `npm run db:generate`
- Apply migrations: `npm run db:migrate`
- Open Drizzle Studio: `npm run db:studio`

## Deployment

Deploy the project to Cloudflare Pages:

```bash
npm run deploy
```

## License

This project is licensed under the terms found in the [LICENSE.md](./LICENSE.md) file.
