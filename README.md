# Clyptus Monitoring System

A complete, modern, production-style web application for team and project management. The platform enables **Team Leads** to create and manage projects, onboard team members, assign tasks with priorities and deadlines, monitor real-time progress, communicate through 1-on-1 and group chats, review activity logs, and track overall project delivery with dynamic analytics.

---

## ⚡ Quick Start (Setup & Run Guide)

### Prerequisites
- **Python 3.11+** installed
- **Node.js 18+** & **npm 9+** installed

---

### Step 1: Setup & Start Backend (FastAPI)

Open your first terminal in the project directory:

```powershell
cd C:\Users\hemas\.gemini\antigravity\scratch\project-monitoring-system\backend

# 1. (Optional but recommended) Create & activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run database migrations
python -m alembic upgrade head

# 4. Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

* 🌐 **Backend API**: `http://localhost:8000`
* 📖 **Swagger API Docs**: `http://localhost:8000/docs`

---

### Step 2: Setup & Start Frontend (React + Vite)

Open a **second terminal**:

```powershell
cd C:\Users\hemas\.gemini\antigravity\scratch\project-monitoring-system\frontend

# 1. Install Node dependencies
npm install

# 2. Start Vite development server
npm run dev
```

* 🚀 **Web Application**: `http://localhost:5173`

---

### Step 3: Getting Started in App
1. Navigate to `http://localhost:5173`.
2. Click **"Register as Team Lead / Member"** on the login page.
3. Fill in your details, select **Team Lead** role, and submit.
4. You will be automatically logged into your new **Clyptus Monitoring System** workspace!

---

## 1. Zero Dummy Data Guarantee

This system strictly initializes with an **empty database**.
* No fake/mock users, projects, tasks, comments, messages, or activity logs.
* All dashboard statistics, progress percentages, and metrics are derived on-the-fly from actual database records via RESTful APIs.
* When data is absent, the application gracefully displays informative, clean empty states (e.g., *"No projects created yet."*, *"No team members yet."*, *"No tasks available."*, *"Not enough data for analytics."*).

---

## 2. Technology Stack

### Frontend
* **React 19** with **TypeScript**
* **Tailwind CSS v4** for clean modern light-theme styling
* **React Router v7** for single-page routing and protected routes
* **Axios** with global interceptors for Bearer JWT token handling
* **Lucide React** for modern, crisp iconography

### Backend
* **Python 3.11+**
* **FastAPI** for high-performance REST APIs under `/api/v1`
* **SQLAlchemy 2.0** ORM for database models, relationships, and queries
* **Pydantic v2** & **Pydantic Settings** for request/response validation and schemas
* **Alembic** for relational database migrations
* **JWT (python-jose)** & **Passlib (bcrypt)** for secure password hashing and token-based authentication
* **WebSockets** & REST polling for real-time and resilient messaging

### Database
* **PostgreSQL** (Production & Local)
* Native dialect abstraction allowing **SQLite** fallback for rapid local testing without external services

---

## 3. Architecture & Data Flow

```
User Action (Browser)
      │
      ▼
React Frontend (Tailwind UI + Axios Interceptors)
      │  HTTP REST / Bearer JWT (/api/v1) & WebSockets (/ws)
      ▼
FastAPI Application Layer (main.py + CORS + Auth Middleware)
      │
      ▼
API Routers (/api/v1/auth, /tasks, /projects, /users, /groups, /messages, etc.)
      │
      ▼
Service Layer (task_service, auth_service, project_service, chat_service, analytics)
      │
      ▼
SQLAlchemy ORM (Models & Relationships with cascade deletes & foreign keys)
      │
      ▼
PostgreSQL / SQLite Database
```

---

## 4. Role-Based Permissions

### Team Lead
* Register and login
* Create, view, edit, and delete projects
* Create team member accounts with custom roles and project assignments
* Activate or deactivate member accounts
* Create, update, assign, and delete tasks with priorities, estimates, and deadlines
* View organization-wide and project-specific progress percentages
* 1-on-1 direct chat with any team member
* Create groups, manage group membership, and post in group chats
* Access Team Lead Dashboard, System Activity Feed, Calendar, and Analytics

### Team Member
* Login and profile management
* "My Tasks" view showing only tasks assigned to the member
* Update task status (`TODO` ➔ `IN_PROGRESS` ➔ `REVIEW` ➔ `COMPLETED`)
* Add comments and upload file attachments to assigned tasks
* View personal completion progress and assigned project details
* 1-on-1 direct chat with the Team Lead
* Participate in assigned group chats
* Real-time notifications for task assignments and system events

---

## 5. Folder Structure

```
project-monitoring-system/
├── README.md
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   │   └── daf93dd434a2_initial_schema_migration.py
│   │   └── env.py
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env
│   ├── uploads/
│   │   └── attachments/
│   ├── tests/
│   │   └── test_api.py
│   └── app/
│       ├── main.py
│       ├── core/
│       │   ├── config.py
│       │   ├── database.py
│       │   └── security.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── all_models.py
│       ├── schemas/
│       │   ├── activity.py
│       │   ├── analytics.py
│       │   ├── group.py
│       │   ├── message.py
│       │   ├── notification.py
│       │   ├── project.py
│       │   ├── task.py
│       │   └── user.py
│       ├── services/
│       │   ├── activity_service.py
│       │   ├── auth_service.py
│       │   ├── chat_service.py
│       │   ├── group_service.py
│       │   ├── notification_service.py
│       │   ├── project_service.py
│       │   ├── task_service.py
│       │   └── user_service.py
│       └── api/
│           └── v1/
│               ├── router.py
│               ├── auth.py
│               ├── users.py
│               ├── projects.py
│               ├── tasks.py
│               ├── groups.py
│               ├── messages.py
│               ├── notifications.py
│               ├── activity.py
│               ├── calendar.py
│               └── analytics.py
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── context/
        │   └── AuthContext.tsx
        ├── services/
        │   └── api.ts
        ├── types/
        │   └── index.ts
        ├── components/
        │   ├── common/
        │   │   ├── Badge.tsx
        │   │   ├── Button.tsx
        │   │   ├── EmptyState.tsx
        │   │   ├── ErrorBanner.tsx
        │   │   ├── Input.tsx
        │   │   ├── LoadingSpinner.tsx
        │   │   ├── Modal.tsx
        │   │   ├── ProgressBar.tsx
        │   │   ├── Select.tsx
        │   │   └── StatCard.tsx
        │   ├── layout/
        │   │   ├── Header.tsx
        │   │   ├── Layout.tsx
        │   │   └── Sidebar.tsx
        │   ├── projects/
        │   │   ├── ProjectCard.tsx
        │   │   └── ProjectModal.tsx
        │   ├── tasks/
        │   │   ├── TaskCard.tsx
        │   │   ├── TaskTable.tsx
        │   │   ├── TaskModal.tsx
        │   │   └── TaskCommentsModal.tsx
        │   ├── members/
        │   │   ├── MemberCard.tsx
        │   │   └── MemberModal.tsx
        │   └── chat/
        │       ├── ChatWindow.tsx
        │       └── GroupModal.tsx
        └── pages/
            ├── Login.tsx
            ├── Register.tsx
            ├── DashboardLead.tsx
            ├── DashboardMember.tsx
            ├── ProjectsPage.tsx
            ├── ProjectDetailPage.tsx
            ├── TasksPage.tsx
            ├── MyTasksPage.tsx
            ├── TeamMembersPage.tsx
            ├── GroupsPage.tsx
            ├── ChatPage.tsx
            ├── CalendarPage.tsx
            ├── AnalyticsPage.tsx
            ├── ActivityPage.tsx
            ├── NotificationsPage.tsx
            └── SettingsPage.tsx
```

---

## 6. Environment Setup

### Prerequisites
* **Python 3.11+** installed
* **Node.js 18+** & **npm 9+** installed
* **PostgreSQL** (Optional if using default SQLite configuration)

### Environment Variables
Configure `backend/.env` (based on `backend/.env.example`):

```env
# Database URL (PostgreSQL):
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/project_monitoring
# Or SQLite:
# DATABASE_URL=sqlite:///./project_monitoring.db

# JWT Security
JWT_SECRET_KEY=super-secret-project-monitoring-jwt-key-change-in-production-2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS Allowed Origins
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000"]
```

---

## 7. Database Migrations (Alembic)

Run migrations from the `backend/` directory:

```bash
# Apply migrations to head
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Rollback to base
alembic downgrade base
```

---

## 8. Running the Backend

```bash
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Run migrations
python -m alembic upgrade head

# 3. Start FastAPI server with live reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend server will run on `http://localhost:8000`.
* Interactive API Documentation (Swagger): `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`

---

## 9. Running the Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

The application interface will open at `http://localhost:5173`.

---

## 10. Running Automated Tests

Run backend tests using `pytest`:

```bash
cd backend
python -m pytest tests/ -v
```

All test cases verify:
1. Registration, JWT authentication, and `/api/v1/auth/me` endpoint
2. Clean empty states on fresh databases
3. Project creation, member assignment, and task creation
4. Task completion and dynamic recalculation of project/member progress
5. Automatic activity log generation and notifications for lead
6. Task attachment uploads, listing, and deletions
7. 1-to-1 chat and group messaging
8. Overdue task detection against real timestamps

---

## 11. Acceptance Criteria Verification

| Requirement | Status | Details |
|---|---|---|
| Zero Dummy Data | Verified | Initial database has 0 rows. Empty states handle empty states without mock numbers. |
| Role-Based Authorization | Verified | Team Lead vs Team Member enforcement on backend endpoints and sidebar. |
| Dynamic Progress Calculation | Verified | Completed / Total * 100 calculated from database queries. Displays "No tasks yet" when 0 tasks. |
| Task Lifecycle & Overdue Detection | Verified | TODO ➔ IN_PROGRESS ➔ REVIEW ➔ COMPLETED sets completed_at and logs activity. Overdue if due_date < now. |
| Task Attachments & Comments | Verified | Attachments can be uploaded, listed, and downloaded via multipart endpoints. |
| 1-on-1 & Group Chat | Verified | Direct messaging and group messaging with real-time polling / WebSocket support. |
| Calendar & Analytics | Verified | Calendar displays database deadlines; analytics renders dynamic metric distributions. |
