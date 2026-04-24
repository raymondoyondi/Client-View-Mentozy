# Mentozy – Digital Learning Platform

## Overview
React + Vite single-page application for a mentorship marketplace. Uses Supabase for auth/database and an optional Express backend (`index.js`) for Razorpay marketplace payments.

## Tech Stack
- React 18 + TypeScript
- Vite 6 (dev server + build)
- Tailwind CSS 4
- Supabase (auth, database, storage)
- React Router v7
- MUI + Radix UI components
- Express + Razorpay (optional backend in `index.js` for payments)

## Project Structure
- `src/` – React app source (entry: `src/main.tsx`, root component: `src/app/App.tsx`)
- `public/` – Static assets
- `index.js` – Optional Express server for Razorpay payment endpoints (port 3001)
- `supabase/` and `supabase-*.sql` – Database schemas and migrations
- `scripts/` – DB inspection/cleanup utilities

## Replit Setup
- Workflow: `Start application` runs `npm run dev` and serves the Vite dev server on port 5000.
- `vite.config.ts` already binds host `0.0.0.0`, port `5000`, and sets `allowedHosts: true` so it works behind the Replit iframe proxy.
- The Vite dev server proxies `/api` to `http://localhost:3001` (the optional Razorpay backend). The backend is not started by default because it requires `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` secrets. Add these and start `node index.js` if you need payment endpoints.
- Supabase credentials are read from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`). The app gracefully disables auth/database features if they are missing.

## Deployment
- Configured as a Replit Static deployment.
- Build command: `npm run build`
- Public directory: `dist`
