# Admin Dashboard Setup

This project now includes an Admin area at /admin with Basic Auth.

- Username: admin
- Password: set env var ADMIN_PASSWORD

## Database (PostgreSQL)

1. Create a PostgreSQL database and get the connection string:
   postgresql://USER:PASSWORD@HOST:5432/DBNAME
2. On the VPS, set environment variables before running the app:
   - DATABASE_URL
   - ADMIN_PASSWORD
3. Apply schema and generate Prisma client:

```
npm run prisma:generate
npm run prisma:push
```

## Start / Deploy

Ensure env vars are set for PM2 process (edit ecosystem or export before start):

```
PORT=3001 HOST=0.0.0.0 ADMIN_PASSWORD=changeme DATABASE_URL=postgresql://... pm2 restart jibreel-app --update-env
pm2 save
```

Then open /admin to access dashboard.
