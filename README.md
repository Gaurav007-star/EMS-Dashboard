# Employee Management System (EMS)

A full-stack Employee Management System with role-based access control, organizational hierarchy tree, soft-delete with bin, live dashboard analytics, and ImageKit image uploads.

## Tech Stack

**Backend:** Node.js, Express.js, TypeScript, MongoDB (Mongoose)

**Client:** React, TypeScript, Tailwind CSS v4, Vite

**UI:** Shadcn UI components (14 primitives)

**Charts:** Recharts (via Shadcn ChartContainer)

**Uploads:** ImageKit (client-side direct upload)

---

## Features

### Core Functionality
- **Employee CRUD** — Create, read, update employees with field-level RBAC restrictions
- **Role-Based Access Control** — Three roles: Super Admin, HR Manager, Employee with enforced backend + frontend guards
- **Soft Delete with Bin** — Deleted employees go to a Bin section; restorable or permanently deletable
- **Org Hierarchy Tree** — Top-down org chart with expand/collapse, hover cards, and connector lines
- **Circular Reporting Prevention** — Rejects manager assignments that would create hierarchy loops
- **Employee ID Generation** — Auto-generated sequential IDs (EMP-XXXXX) with collision avoidance

### Dashboard
- **Real-time Stats** — Total, active, inactive, departments, and bin count
- **Workforce Status Donut** — Active vs. inactive breakdown via Recharts
- **Headcount by Department Bar Chart** — Visual department distribution
- **Recent Hires Table** — Latest 5 employees by joining date

### UI/UX
- **Light/Dark Theme** — CSS variable-based theming with localStorage persistence
- **Responsive Layout** — Collapsible sidebar on mobile, full sidebar on desktop
- **Live Bin Count Badge** — Sidebar badge updates in real-time after delete/restore
- **Predefined Department/Designation Selects** — Shared constants between form and filters
- **Pagination** — Server-side pagination with page numbers, ellipsis, and prev/next
- **Search & Filter** — Debounced search by name/email/ID, filter by department/role/status
- **Profile Image Upload** — ImageKit direct upload with preview
- **Confirmation Dialogs** — Shadcn Dialog for delete, restore, and permanent delete actions

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- MongoDB Atlas connection string (or local MongoDB)
- ImageKit account (optional, for profile image uploads)

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# ImageKit (optional)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

Run the backend:

```bash
npm run dev
```

The database is seeded automatically on first run with demo accounts (see credentials below).

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app is available at `http://localhost:5173`.

---

## Default Login Credentials

| Role | Identity | Password |
|------|----------|----------|
| Super Admin | `admin123` | `admin123` |
| HR Manager | `hr123` | `hr123` |
| Employee | `EMP-10001` | `password123` |

---

## Available Scripts

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build |
| `npm run seed` | Seed database with demo users |

### Frontend (`client/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login (email or employee ID) | Public |
| POST | `/api/auth/logout` | Logout, clear session | All |
| GET | `/api/auth/imagekit-auth` | ImageKit upload auth params | All |

### Employee Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/employees` | List employees (paginated, search, filter) | All |
| POST | `/api/employees` | Create employee | Super Admin, HR |
| GET | `/api/employees/:id` | Get employee details | Self, HR, Super Admin |
| PUT | `/api/employees/:id` | Update employee | Self (limited), HR, Super Admin |
| DELETE | `/api/employees/:id` | Soft delete (move to bin) | Super Admin |

### Bin (Soft-Deleted)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/employees/bin` | List soft-deleted employees | Super Admin, HR |
| POST | `/api/employees/:id/restore` | Restore from bin | Super Admin |
| DELETE | `/api/employees/:id/permanent` | Permanently delete | Super Admin |

### Dashboard

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/employees/stats` | Dashboard statistics | Super Admin, HR |

### Hierarchy

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/organization/tree` | Org hierarchy tree | All |
| GET | `/api/employees/:id/reportees` | Direct reports for employee | All |
| PATCH | `/api/employees/:id/manager` | Assign/reassign manager | Super Admin, HR |

---

## Query Parameters (GET /api/employees)

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name, email, or employee ID |
| `department` | string | Filter by department name |
| `role` | string | Filter by role (Super Admin, HR Manager, Employee) |
| `status` | string | Filter by status (Active, Inactive) |
| `sortBy` | string | Sort field (default: name) |
| `sortOrder` | string | `asc` or `desc` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 50) |

---

## Roles & Permissions

- **Super Admin** — Full access: create, read, update, soft delete, permanent delete, restore from bin, assign any role including Super Admin
- **HR Manager** — Create and edit employees, view dashboard and bin, assign managers. Cannot delete, cannot assign Super Admin role, cannot edit Super Admin profiles
- **Employee** — View own profile only. Self-edit limited to name, email, phone, profile image, and password

---

## Project Structure

```
genai/
├── backend/                  # Express + TypeScript API
│   └── src/
│       ├── config/           # DB, ImageKit config
│       ├── controllers/      # Route controllers (auth, employee)
│       ├── middleware/       # Auth, RBAC
│       ├── models/           # Mongoose schemas
│       ├── routes/           # API route declarations
│       ├── utils/            # Circular check, tree helpers
│       ├── seed.ts           # Database seeder
│       └── server.ts         # Entry point
└── client/                   # React + TypeScript SPA
    └── src/
        ├── components/       # UI components (Shadcn)
        │   ├── ui/           # 14 Shadcn primitives
        │   ├── Layout.tsx    # Sidebar + responsive shell
        │   ├── OrgTree.tsx   # Org chart component
        │   └── DashboardCharts.tsx  # Recharts visualizations
        ├── context/          # Auth context
        ├── lib/              # Constants, utilities
        ├── pages/            # Route views
        ├── services/         # Axios API calls
        └── App.tsx           # Route definitions
```

---

## Frontend Routes

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login | Public |
| `/` | Dashboard | Super Admin, HR |
| `/employees` | Employee Directory | Super Admin, HR |
| `/employees/:id` | Employee Profile | All |
| `/hierarchy` | Org Hierarchy | All |
| `/bin` | Bin (Soft Deleted) | Super Admin, HR |
