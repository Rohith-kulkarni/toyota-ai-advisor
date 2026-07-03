# Toyota AI Advisor

Backend MVP for a Toyota dealership AI advisor that will eventually support AI chat, lead capture, admin dashboard, RAG, and WhatsApp/n8n automation.

## Current Status

- Backend foundation complete
- Database foundation complete
- Auth, chat, AI, and frontend not added yet

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma
- Swagger

## Local Setup

1. Open the backend folder:

   ```powershell
   cd backend
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Copy the example environment file to `.env`:

   ```powershell
   Copy-Item .env.example .env
   ```

   Fill in any local values if needed.

4. Start PostgreSQL with Docker:

   ```powershell
   docker compose up -d
   ```

5. Generate the Prisma client:

   ```powershell
   npm run prisma:generate
   ```

6. Run the first database migration:

   ```powershell
   npm run prisma:migrate -- --name init
   ```

7. Start the backend:

   ```powershell
   npm run dev
   ```

## API Links

- Health check: http://localhost:4000/api/health
- Database health check: http://localhost:4000/api/health/db
- Swagger UI: http://localhost:4000/api/docs
- OpenAPI JSON: http://localhost:4000/api/docs.json

## Useful Commands

```powershell
npm run dev
npm run build
npm start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

## Notes

- `.env` should not be committed
- `node_modules` should not be committed
- Prisma migrations should be committed
