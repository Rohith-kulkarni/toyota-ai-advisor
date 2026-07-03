# Toyota AI Advisor

Toyota dealership AI advisor MVP with a Node.js + Express + TypeScript backend and a React + TypeScript + Vite frontend.

The product currently includes:

- Customer chat UI
- Admin login and lead dashboard
- PostgreSQL + Prisma database
- Swagger docs
- Rule-based Toyota knowledge search
- Gemini-backed chat replies with fallback
- Lead capture and lead insights

## Tech Stack

- Backend: Node.js, Express, TypeScript, PostgreSQL, Prisma, Swagger
- Frontend: React, TypeScript, Vite

## Current Status

- Backend foundation is complete
- Database foundation is complete
- Admin auth is working
- Chat, leads, and lead insights are working
- Frontend customer chat and admin dashboard are working
- Deployment cleanup is in progress

## Local Setup

### Backend

1. Open the backend folder:

   ```powershell
   cd backend
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Copy the example environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Start PostgreSQL:

   ```powershell
   docker compose up -d
   ```

5. Generate the Prisma client:

   ```powershell
   npm run prisma:generate
   ```

6. Run the first migration:

   ```powershell
   npm run prisma:migrate -- --name init
   ```

7. Seed the admin user:

   ```powershell
   npm run prisma:seed
   ```

8. Start the backend:

   ```powershell
   npm run dev
   ```

### Frontend

1. Open the frontend folder:

   ```powershell
   cd frontend
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Copy the example environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Start the frontend:

   ```powershell
   npm run dev
   ```

## API Links

- Health: http://localhost:4000/api/health
- Database health: http://localhost:4000/api/health/db
- Swagger UI: http://localhost:4000/api/docs
- OpenAPI JSON: http://localhost:4000/api/docs.json

## Useful Commands

### Backend

```powershell
npm run dev
npm run build
npm start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed
npm run prisma:studio
```

### Frontend

```powershell
npm run dev
npm run build
npm run preview
```

## Deployment Notes

### Backend production setup

1. Set production environment variables.
2. Install dependencies:

   ```powershell
   npm install
   ```

3. Build the backend:

   ```powershell
   npm run build
   ```

4. Apply migrations:

   ```powershell
   npm run prisma:deploy
   ```

5. Start the server:

   ```powershell
   npm start
   ```

### Backend deployment checklist

- `DATABASE_URL` is set
- `JWT_ACCESS_SECRET` is changed from the placeholder
- `CORS_ORIGIN` points to the frontend domain
- `GEMINI_API_KEY` is set only on the backend when AI is enabled
- `AI_ENABLED` can stay `false` if Gemini is not available
- Admin seed password is changed from the placeholder
- `.env` is not committed

### Frontend production setup

1. Set the frontend API URL in `.env`:

   ```powershell
   VITE_API_BASE_URL=https://your-backend-domain.com/api
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Build the frontend:

   ```powershell
   npm run build
   ```

### Frontend deployment checklist

- `VITE_API_BASE_URL` points to the backend API URL
- `.env` is not committed
- Build passes before deployment

## Notes

- `.env` files should not be committed
- `node_modules` should not be committed
- Prisma migrations should be committed
- Gemini API keys stay backend-only
- The frontend should use cookie-based auth with credentials enabled
