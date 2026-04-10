# Mentozy

A comprehensive educational and mentorship platform connecting students with industry experts. Serves as a dual-sided marketplace and learning management system (LMS).

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS v4 + Radix UI + Lucide React
- **Animations:** Framer Motion (motion)
- **Backend/Database:** Supabase (PostgreSQL, Auth, RLS, Storage)
- **Routing:** React Router DOM v7
- **Forms:** React Hook Form
- **Package Manager:** npm

## Project Layout

- `src/app/` - Core application (App.tsx router, components, pages)
- `src/context/` - React Context providers (AuthContext)
- `src/lib/` - API wrappers (supabase.ts), utilities
- `src/styles/` - Global CSS
- `supabase/` - DB migrations, edge functions, schema
- `public/` - Static assets

## Environment Variables

- `VITE_SUPABASE_URL` - Supabase project URL (shared)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (shared)

## Development

Run with: `npm run dev` on port 5000

## Deployment

Configured as a static site deployment:
- Build: `npm run build`
- Public dir: `dist`
