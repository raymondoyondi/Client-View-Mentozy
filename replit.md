# Mentozy — Mentorship & Learning Platform

## Overview
Mentozy is a dual-sided mentorship and learning marketplace connecting students with mentors and organizations. Built with React + Vite + TypeScript, backed by Supabase.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite 6
- **Styling**: Tailwind CSS v4, Radix UI, Shadcn UI patterns
- **Routing**: React Router DOM v7
- **Backend/Auth/DB**: Supabase (PostgreSQL + Auth + Edge Functions)
- **State**: React Context API (AuthContext, OrganizationModeContext)
- **Other**: Framer Motion, React DnD, React Hook Form, Recharts, Sonner

## Running the App
```
npm run dev        # Dev server on port 5000
npm run build      # Production build (outputs to dist/)
```

## Architecture

### Organization Mode System (Coursera-style separation)
Users can belong to both a personal account and one or more organizations. The system has a clean two-environment model:

**Personal Mode** — Default. Shows personal courses, bookings, mentors, analytics.
**Organization Mode** — Activated via the toggle. Fully isolated org context.

#### Context: `src/context/OrganizationModeContext.tsx`
- Persists mode (`personal` | `organization`) in localStorage
- Tracks `activeOrganization` (id, name, role: student|teacher)
- Fetches user's org memberships from `org_students` and `org_teachers` tables

#### Mode Toggle: `src/app/components/dashboard/ModeToggle.tsx`
- Pill-shaped toggle (Personal ↔ Organization)
- Supports `compact` prop for embedding in the org banner
- Shows org selector dropdown when user belongs to multiple orgs

#### Dashboard Layout: `src/app/components/dashboard/DashboardLayout.tsx`
- In **org mode**: Shows a prominent indigo banner at the top with org name + role badge + "Switch to Personal" button
- In **personal mode**: Shows a clean minimal header with the toggle
- Sidebar shows an org badge card with org name and role label in org mode

### Dashboard Branching
- `StudentDashboardPage` — Detects org mode and renders `OrgStudentDashboard` instead of personal content
- `MentorDashboardPage` — Detects org mode and renders `OrgMentorDashboard` instead of personal content

### Org-Specific Dashboard Components
- `src/app/components/dashboard/OrgStudentDashboard.tsx` — Shows org-assigned courses, org sessions, org teachers, org announcements, progress within the org. No personal subscriptions.
- `src/app/components/dashboard/OrgMentorDashboard.tsx` — Shows org students, org sessions, org courses, announcements. No personal earnings or unrelated bookings.

## Key Pages
| Route | Component | Notes |
|-------|-----------|-------|
| `/student-dashboard` | StudentDashboardPage | Branches to OrgStudentDashboard in org mode |
| `/mentor-dashboard` | MentorDashboardPage | Branches to OrgMentorDashboard in org mode |
| `/org-dashboard` | OrgDashboardPage | For org admins/owners only |
| `/org-students` | OrgStudentsPage | Manage enrolled students |
| `/org-teachers` | OrgTeachersPage | Manage teaching staff |
| `/org-courses` | OrgCoursesPage | Manage org course catalogue |

## Supabase Setup
The app requires Supabase credentials as environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Without these, auth and database features are disabled (the app still loads, showing the public marketing pages).

## Deployment
Configured as a **static** deployment:
- Build: `npm run build`
- Public dir: `dist`
