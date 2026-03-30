# Enterprise Platform — Nexus

## Overview

A full-stack enterprise SaaS demo platform called **Nexus** with:
- **LMS** — Courses, modules, lessons, progress tracking
- **Task Management** — Kanban board, priorities, comments
- **File Storage** — Upload/manage documents with folder structure
- **Automation Engine** — Rule-based event-driven automations
- **Admin Dashboard** — Analytics, user management, activity feed
- **Premium UI** — Loading screen, command palette (⌘K), dark mode, skeleton loaders

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/enterprise-platform)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)
- **Auth**: Custom token-based (Bearer token in localStorage)
- **Charts**: Recharts
- **State**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date formatting**: date-fns
- **Command palette**: cmdk

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Manager | manager@demo.com | manager123 |
| Employee | employee@demo.com | employee123 |

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express 5 API server (port 8080, serves /api)
│   └── enterprise-platform/ # React + Vite frontend (serves /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seed script
```

## Database Schema

Tables:
- `users` — Admin/Manager/Employee with role enum
- `courses` — LMS courses (draft/published/archived)
- `modules` — Course modules
- `lessons` — Module lessons with video URLs
- `progress` — User course progress tracking
- `enrollments` — User-course enrollments
- `tasks` — Task management (todo/in_progress/completed)
- `comments` — Task comments
- `files` — File metadata records
- `automations` — Rule-based automation rules
- `activity_logs` — Platform activity feed

## API Routes

All routes under `/api`:
- `POST /api/auth/login` — Login (returns user + Bearer token)
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user
- `GET/POST /api/users` — List/create users
- `GET/PUT/DELETE /api/users/:id` — Get/update/delete user
- `GET/POST /api/courses` — List/create courses
- `GET/PUT/DELETE /api/courses/:id` — Get/update/delete course
- `POST /api/courses/:id/enroll` — Enroll user
- `GET /api/courses/:id/progress` — Get course progress
- `GET/POST /api/courses/:courseId/modules` — Modules
- `GET/POST /api/modules/:moduleId/lessons` — Lessons
- `POST /api/lessons/:lessonId/complete` — Mark lesson complete
- `GET/POST /api/tasks` — List/create tasks
- `GET/PUT/DELETE /api/tasks/:id` — Task CRUD
- `GET/POST /api/tasks/:id/comments` — Task comments
- `GET/POST /api/files` — List/upload files
- `GET/DELETE /api/files/:id` — File CRUD
- `GET/POST /api/automations` — List/create automations
- `PUT/DELETE /api/automations/:id` — Update/delete automation
- `GET /api/activity` — Activity logs
- `GET /api/analytics/dashboard` — Dashboard stats

## Authentication

Token-based auth:
- Login returns a Bearer token stored in `localStorage` as `auth_token`
- `setAuthTokenGetter(() => localStorage.getItem('auth_token'))` configures the API client
- All authenticated routes require `Authorization: Bearer <token>` header

## Seeding

Run: `pnpm --filter @workspace/scripts run seed`

Seeds:
- 5 users (Admin, Manager, 3 Employees)
- 3 courses with modules/lessons
- 15 tasks across statuses
- 6 files
- 5 automations
- Activity logs

## Development

- Frontend dev: `pnpm --filter @workspace/enterprise-platform run dev`
- API dev: `pnpm --filter @workspace/api-server run dev`
- DB push: `pnpm --filter @workspace/db run push`
- Codegen: `pnpm --filter @workspace/api-spec run codegen`
- Seed: `pnpm --filter @workspace/scripts run seed`
