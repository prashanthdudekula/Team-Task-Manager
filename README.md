# TeamFlow — Enterprise Grade Team Task Manager


>LIVE URL:https://magnificent-adaptation-production-22f4.up.railway.app

> A production-quality full-stack SaaS project management application built with React, Node.js, Prisma, and PostgreSQL.

---

## Features

- **JWT Authentication** — Secure login & registration with persistent sessions
- **Role-Based Access Control** — Admin & Member roles at both app and project level
- **Project Management** — Create, edit, delete, and manage projects with team members
- **Kanban Board** — Drag-and-drop task management with 4 columns (Todo, In Progress, Review, Done)
- **Analytics Dashboard** — Pie charts, bar charts, progress bars, and activity feed
- **Task Filtering** — Filter by status, priority, and assigned member
- **Responsive UI** — Mobile drawer, flexible grid layouts, and adaptive sidebar
- **Dark SaaS Design** — Polished dark theme with Tailwind CSS & Framer Motion animations
- **Toast Notifications** — Real-time feedback via Sonner
- **Global Search (⌘K)** — High-performance Command Palette to find anything instantly
- **Loading Skeletons** — Professional shimmer loading states

---

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router DOM v6
- TanStack Query (React Query)
- React Hook Form + Zod
- Framer Motion
- @hello-pangea/dnd (Drag & Drop)
- Recharts (Charts)
- Sonner (Toasts)
- Lucide React (Icons)
- Axios

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs
- Zod Validation

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database

---

### Backend Setup

```bash
cd server
cp .env.example .env
# Fill in your DATABASE_URL and JWT_SECRET in .env

npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

### Frontend Setup

```bash
cd client
cp .env.example .env
# Set VITE_API_URL to your backend URL (default: http://localhost:5000/api)

npm install
npm run dev
```

---

## Environment Variables

### Backend (`server/.env`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/teamflow"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Documentation

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login & get token |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks/project/:id` | Get project tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task / change status |
| DELETE | `/api/tasks/:id` | Delete task |

### Team
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/team/project/:id` | Get project members |
| POST | `/api/team/project/:id` | Add member |
| DELETE | `/api/team/project/:id/:userId` | Remove member |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard/stats` | Get analytics stats |

### Comments
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/comments` | Add comment to task |
| GET | `/api/comments/:taskId` | Get task comments |
| DELETE | `/api/comments/:id` | Delete comment |

### Search
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/search` | Global multi-category search |

---

## Deployment

### Railway (One-Click Deployment)
1. Create a new Railway project from your GitHub repo.
2. Railway will automatically detect the `railway.json` and `Procfile`.
3. Add a **PostgreSQL** plugin.
4. Set the **Root Directory** for your backend service to `/server` and frontend to `/client`.
5. Add your Environment Variables (see below).
6. Run `npx prisma db push` locally to sync the schema.

---

## Demo Credentials
```
Email: admin@teamflow.com
Password: password123
```
*(Create this user via the register page or seed script)*

---

## Project Structure

```
TeamFlow/
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/             # Axios API services
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # Modal, Badge, EmptyState, etc.
│   │   │   ├── dashboard/   # Stats cards, Activity feed
│   │   │   ├── forms/       # Task & Project forms
│   │   │   ├── kanban/      # Drag-and-drop Kanban board
│   │   │   └── layout/      # AppLayout, Sidebar, Navbar
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Route pages
│   │   ├── styles/          # Global CSS
│   │   └── types/           # TypeScript types
│   └── package.json
│
└── server/                  # Express backend
    ├── prisma/              # Prisma schema & migrations
    ├── src/
    │   ├── config/          # Database client
    │   ├── controllers/     # Route handlers
    │   ├── middleware/       # Auth & RBAC middleware
    │   ├── routes/          # Express routes
    │   ├── types/           # TypeScript types
    │   └── validators/      # Zod schemas

    └── package.json
```
